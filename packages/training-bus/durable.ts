import { readyPublisher } from "@training-simulator/bus/bus";
import {
  isSiteId,
  parseCommand,
  parseEvent,
  type ControlCommand,
  type SessionEvent,
} from "@training-simulator/bus/types";

const SESSION_TTL = 86_400;
const EVENT_TTL_MS = SESSION_TTL * 1000;
const COMMAND_LIMIT = 128;

function prefix() {
  const namespace = process.env.TRAINING_REDIS_NAMESPACE ?? "training";
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(namespace))
    throw new Error("Invalid TRAINING_REDIS_NAMESPACE");
  // All keys in a transaction share a Redis Cluster hash slot.
  return `{${namespace}}:v2`;
}
function target(siteId: string, sessionId: string) {
  if (!isSiteId(siteId) || !/^[a-zA-Z0-9_-]{1,128}$/.test(sessionId))
    throw new Error("Invalid session target");
  return `${prefix()}:satellite:${encodeURIComponent(siteId)}:${sessionId}`;
}
function eventKey() {
  return `${prefix()}:events`;
}
function dueKey(siteId: string) {
  return `${target(siteId, "index")}:due`;
}

export type EventRecord = { id: string; event: SessionEvent };
export function eventRejectionCode(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "Invalid training alias") return "TRAINING_ALIAS_INVALID";
  if (message === "Invalid fields") return "EVENT_FIELDS_INVALID";
  if (message === "Invalid envelope") return "EVENT_ENVELOPE_INVALID";
  if (message === "Invalid request ID") return "EVENT_REQUEST_ID_INVALID";
  return "EVENT_FORMAT_INVALID";
}
type Stored<T> = { revision: number; state: T };
export type QueuedCommand = { command: ControlCommand; queuedAt: number };
export type Mutation<T, R> = {
  state: T;
  result: R;
  events: SessionEvent[];
  nextDue?: number;
};

// Commit state, consumed commands, deadline index, and safe telemetry atomically.
// A revision prevents concurrent polls from applying a command twice.
const commitScript = `
local current = redis.call('GET', KEYS[1])
if (current or '') ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
redis.call('LTRIM', KEYS[2], tonumber(ARGV[4]), -1)
if redis.call('LLEN', KEYS[2]) > 0 then
  redis.call('ZADD', KEYS[4], ARGV[8], ARGV[6])
elseif ARGV[5] == '' then
  redis.call('ZREM', KEYS[4], ARGV[6])
else
  redis.call('ZADD', KEYS[4], ARGV[5], ARGV[6])
end
for i = 9, #ARGV do
  redis.call('XADD', KEYS[3], '*', 'event', ARGV[i])
end
redis.call('XTRIM', KEYS[3], 'MINID', '~', ARGV[7])
return 1
`;

async function commit<T>(
  siteId: string,
  sessionId: string,
  expected: string,
  stored: Stored<T>,
  consumed: number,
  events: SessionEvent[],
  nextDue?: number,
) {
  const safe = events.map((event) => {
    const parsed = parseEvent(event);
    if (parsed.siteId !== siteId || parsed.sessionId !== sessionId)
      throw new Error("Invalid event target");
    return JSON.stringify(parsed);
  });
  const key = target(siteId, sessionId);
  return (
    Number(
      await (
        await readyPublisher()
      ).eval(
        commitScript,
        4,
        key,
        `${key}:commands`,
        eventKey(),
        dueKey(siteId),
        expected,
        JSON.stringify(stored),
        SESSION_TTL,
        consumed,
        nextDue ?? "",
        sessionId,
        `${Math.max(0, Date.now() - EVENT_TTL_MS)}-0`,
        Date.now(),
        ...safe,
      ),
    ) === 1
  );
}

export async function createStoredSession<T>(
  siteId: string,
  sessionId: string,
  state: T,
  events: SessionEvent[],
  nextDue: number,
) {
  if (
    !(await commit(
      siteId,
      sessionId,
      "",
      { revision: 0, state },
      0,
      events,
      nextDue,
    ))
  )
    throw new Error("Session already exists");
}

export async function loadStoredSession<T>(
  siteId: string,
  sessionId: string,
): Promise<T | undefined> {
  const raw = await (await readyPublisher()).get(target(siteId, sessionId));
  return raw ? (JSON.parse(raw) as Stored<T>).state : undefined;
}

export async function updateStoredSession<T, R>(
  siteId: string,
  sessionId: string,
  mutate: (state: T, commands: QueuedCommand[]) => Mutation<T, R>,
): Promise<R | undefined> {
  const redis = await readyPublisher();
  const key = target(siteId, sessionId);
  for (let attempt = 0; attempt < 8; attempt++) {
    const raw = await redis.get(key);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as Stored<T>;
    const commands = (
      await redis.lrange(`${key}:commands`, 0, COMMAND_LIMIT - 1)
    ).map((value): QueuedCommand => {
      const queued = JSON.parse(value);
      if (!Number.isSafeInteger(queued.queuedAt) || queued.queuedAt < 0)
        throw new Error("Invalid command timestamp");
      return {
        command: parseCommand(queued.command),
        queuedAt: queued.queuedAt,
      };
    });
    if (
      commands.some(
        ({ command }) =>
          command.siteId !== siteId || command.sessionId !== sessionId,
      )
    )
      throw new Error("Invalid stored command target");
    const mutation = mutate(stored.state, commands);
    const changed =
      JSON.stringify(mutation.state) !==
      JSON.stringify((JSON.parse(raw) as Stored<T>).state);
    if (!changed && !commands.length && !mutation.events.length)
      return mutation.result;
    if (
      await commit(
        siteId,
        sessionId,
        raw,
        { revision: stored.revision + 1, state: mutation.state },
        commands.length,
        mutation.events,
        mutation.nextDue,
      )
    )
      return mutation.result;
  }
  throw new Error("Session busy; retry the request");
}

const queueScript = `
if redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
local stored = cjson.decode(redis.call('GET', KEYS[1]))
if stored.state.ended then return -1 end
if redis.call('LLEN', KEYS[2]) >= tonumber(ARGV[2]) then return -2 end
redis.call('RPUSH', KEYS[2], cjson.encode({command=cjson.decode(ARGV[1]), queuedAt=tonumber(ARGV[4])}))
redis.call('EXPIRE', KEYS[2], ARGV[3])
redis.call('ZADD', KEYS[3], 'LT', ARGV[4], ARGV[5])
return 1
`;

export async function enqueueControlCommand(
  value: ControlCommand,
): Promise<"queued" | "missing" | "ended" | "full"> {
  const command = parseCommand(value);
  const key = target(command.siteId, command.sessionId);
  const result = Number(
    await (
      await readyPublisher()
    ).eval(
      queueScript,
      3,
      key,
      `${key}:commands`,
      dueKey(command.siteId),
      JSON.stringify(command),
      COMMAND_LIMIT,
      SESSION_TTL,
      Date.now(),
      command.sessionId,
    ),
  );
  return result === 1
    ? "queued"
    : result === 0
      ? "missing"
      : result === -1
        ? "ended"
        : "full";
}

export async function readEventRecords(cursor = "0-0") {
  if (!/^\d{1,20}-\d{1,20}$/.test(cursor))
    throw new Error("Invalid event cursor");
  const redis = await readyPublisher();
  const rows = await redis.xrange(eventKey(), `(${cursor}`, "+", "COUNT", 200);
  const records: EventRecord[] = [];
  const rejected: { id: string; code: string }[] = [];
  let nextCursor = cursor;
  for (const [id, fields] of rows) {
    nextCursor = id;
    try {
      const index = fields.indexOf("event");
      if (index < 0) throw new Error("Invalid record");
      records.push({ id, event: parseEvent(JSON.parse(fields[index + 1])) });
    } catch (error) {
      const code = eventRejectionCode(error);
      rejected.push({ id, code });
      console.error("Invalid training event discarded", { id, code });
    }
  }
  return { records, rejected, cursor: nextCursor, hasMore: rows.length === 200 };
}

export async function dueSessions(siteId: string) {
  return (await readyPublisher()).zrangebyscore(
    dueKey(siteId),
    "-inf",
    Date.now(),
    "LIMIT",
    0,
    25,
  );
}
export async function forgetDueSession(siteId: string, sessionId: string) {
  return (await readyPublisher()).zrem(dueKey(siteId), sessionId);
}
