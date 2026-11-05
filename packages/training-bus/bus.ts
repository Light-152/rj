import Redis from "ioredis";
import {
  isSiteId,
  parseCommand,
  parseEvent,
  type ControlCommand,
  type SessionEvent,
} from "@training-simulator/bus/types";

export const EVENT_CHANNEL = "training:events";

export function controlChannel(siteId: string) {
  if (!isSiteId(siteId)) throw new Error("Invalid site ID");
  return `training:control:${encodeURIComponent(siteId)}`;
}

function connection() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is required for the training bus");
  const redis = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 5000,
    autoResubscribe: true,
    retryStrategy: (attempts) => Math.min(attempts * 250, 5000),
  });
  // Never log Redis error objects: they can contain connection credentials.
  redis.on("error", () =>
    console.error("Training Redis connection unavailable; retrying"),
  );
  void redis
    .connect()
    .catch(() =>
      console.error("Training Redis initial connection failed; retrying"),
    );
  return redis;
}

const globals = globalThis as typeof globalThis & { trainingPublisher?: Redis };
function publisher() {
  return (globals.trainingPublisher ??= connection());
}
export function createSubscriberConnection() {
  return connection();
}
export async function readyPublisher() {
  const redis = publisher();
  if (redis.status === "ready") return redis;
  await new Promise<void>((resolve, reject) => {
    const ready = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      redis.removeListener("ready", ready);
      reject(new Error("Training Redis unavailable"));
    }, 5000);
    redis.once("ready", ready);
  });
  return redis;
}

export async function publishEvent(event: SessionEvent) {
  const safe = parseEvent(event);
  return (await readyPublisher()).publish(EVENT_CHANNEL, JSON.stringify(safe));
}

export async function publishControlCommand(command: ControlCommand) {
  const safe = parseCommand(command);
  return (await readyPublisher()).publish(
    controlChannel(safe.siteId),
    JSON.stringify(safe),
  );
}

// Re-register on ready, including after reconnect. No offline command accumulation.
export function subscribeChannel(redis: Redis, channel: string) {
  const subscribe = () => {
    void redis
      .subscribe(channel)
      .catch(() =>
        console.error("Training subscription failed; retrying on reconnect"),
      );
  };
  redis.on("ready", subscribe);
  if (redis.status === "ready") subscribe();
}

export async function checkBusHealth() {
  return (await readyPublisher()).ping();
}
