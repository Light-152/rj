import { randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import {
  createStoredSession,
  updateStoredSession,
  dueSessions,
  forgetDueSession,
} from "@training-simulator/bus/durable";
import { isSiteId } from "./types";
import type { 
  ControlCommand, 
  EventDetails, 
  OtpMethod, 
  SessionEvent 
} from "./types";
export type Stage = 
| "login_pending" 
| "login_rejected" 
| "method" 
| "otp_entry" 
| "otp_pending" 
| "otp_rejected" 
| "ended";
export type Session = {
  sessionId: string;
  userId: string;              
  password?: string;           
  submittedCode?: string;      
  deadline: number;
  ended: boolean;
  stage: Stage;
  pendingUntil: number;
  loginRequestId: string;
  otpRequestId?: string;
  otpVerdict?: "valid" | "invalid" | "expired";
  method?: OtpMethod;
  code?: string;               // the *issued* training code (transient)
  codeDeadline?: number;
  endReason?: "success" | "abandoned" | "timeout";
  redirectPath?: string;
};

const pendingEvents = new WeakMap<Session, SessionEvent[]>();
export function siteId() {
  const value = process.env.TRAINING_SITE_ID?.trim();
  if (!isSiteId(value))
    throw new Error(
      "TRAINING_SITE_ID is required: use a site name of 1–128 characters without control characters",
    );
  return value;
}

function localTrainingPath(path: string, setting: string) {
  const destination = path.trim();
  if (destination.startsWith("/") && !destination.startsWith("//"))
    return destination;
  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    throw new Error(`${setting} must be a local path or an HTTP/HTTPS URL`);
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error(`${setting} must be a local path or an HTTP/HTTPS URL`);
  return url.href;
}

export function configuredRedirect() {
  return localTrainingPath(
    process.env.TRAINING_REDIRECT_PATH ?? "/training-complete",
    "TRAINING_REDIRECT_PATH",
  );
}

export function configuredOtpTimeoutRedirect() {
  return localTrainingPath(
    process.env.TRAINING_OTP_TIMEOUT_REDIRECT_PATH ?? configuredRedirect(),
    "TRAINING_OTP_TIMEOUT_REDIRECT_PATH",
  );
}
export function event(session: Session, details: EventDetails) {
  const events = pendingEvents.get(session) ?? [];
  events.push({
    ...details,
    sessionId: session.sessionId,
    siteId: siteId(),
    timestamp: new Date().toISOString(),
  });
  pendingEvents.set(session, events);
}
export function end(session: Session, reason: "success" | "abandoned" | "timeout") {
  if(session.ended) return;
  session.ended = true; session.stage = "ended"; session.endReason = reason;
  session.code = undefined;
  event(session, {type: "session_ended", reason});
}
export const APPROVAL_WAIT_MS = 90_000;

export function advanceSession(session: Session, now = Date.now()) {
  if(session.ended) return;
  if((session.stage === "login_pending" || session.stage === "otp_pending") && now >= session.pendingUntil && session.pendingUntil <= session.deadline) {
    const stage = session.stage === "login_pending" ? "login" : "otp";
    const requestId = stage === "login" ? session.loginRequestId : session.otpRequestId!;
    const result = stage === "login" || session.otpVerdict === "valid" ? "approved" : "rejected";
    event(session, {type: "approval_timed_out", stage, requestId, result});
    if(stage === "login") {
      session.stage = "method";
      event(session, {type: "login_decided", requestId, result: "approved"});
    } else {
      event(session, {type: "otp_decided", requestId, result});
      session.redirectPath = configuredOtpTimeoutRedirect();
        event(session, {
          type: "session_redirected",
          destination: "training_page",
        });

        end(session, result === "approved" ? "success" : "abandoned");
    }
  }
  if(!session.ended && session.deadline <= now) end(session, "timeout");
}
export function applyControl(session: Session, command: ControlCommand, now = Date.now()) {
  if(command.siteId !== siteId()) return false;
  // const session = state.sessions.get(command.sessionId);
  if (command.sessionId !== session.sessionId) return false;
  const reject = (reason: "wrong_stage" | "stale_request" | "invalid_verdict") => {
    event(session, {type: "control_rejected", command: command.type, reason}); return false;
  };
  advanceSession(session, now);
  if(session.ended) return reject("wrong_stage");
  switch(command.type) {
    case "approve_login": case "reject_login": {
      if(command.requestId !== session.loginRequestId) return reject("stale_request");
      if(session.stage !== "login_pending") return reject("wrong_stage");
      const result = command.type === "approve_login" ? "approved" : "rejected";
      session.stage = result === "approved" ? "method" : "login_rejected";
      event(session, {type: "login_decided", requestId: command.requestId, result});
      if(result === "rejected") event(session, {type: "login_failed", reason: "instructor_rejected"});
      break;
    }
    case "approve_otp": case "reject_otp": {
      if(command.requestId !== session.otpRequestId) return reject("stale_request");
      if(session.stage !== "otp_pending") return reject("wrong_stage");
      if(command.type === "approve_otp" && session.otpVerdict !== "valid") return reject("invalid_verdict");
      const result = command.type === "approve_otp" ? "approved" : "rejected";
      session.code = undefined;
      event(session, {type: "otp_decided", requestId: command.requestId, result});
      if(result === "approved") { session.redirectPath = configuredRedirect(); end(session, "success"); } else session.stage = "otp_rejected";
      break;
    }
    case "force_otp_retry":
      if(!["otp_entry", "otp_pending", "otp_rejected"].includes(session.stage)) return reject("wrong_stage");
      if(session.stage === "otp_pending" && session.otpRequestId) event(session, {type: "otp_decided", requestId: session.otpRequestId, result: "rejected"});
      session.code = undefined; session.stage = "otp_rejected"; break;
    case "mark_login_failed":
      session.code = undefined; session.method = undefined; session.stage = "login_rejected";
      event(session, {type: "login_failed", reason: "instructor_rejected"}); break;
    case "mark_session_failed": end(session, "abandoned"); break;
    case "extend_session":
      session.deadline += command.seconds * 1000;
      event(session, {type: "session_extended", seconds: command.seconds}); break;
    case "redirect_session":
      session.redirectPath = configuredRedirect();
      event(session, {type: "session_redirected", destination: "training_page"});
      end(session, "abandoned"); break;
  }
  return true;
}
export function ensureExample() {
  siteId();
  configuredRedirect();
  configuredOtpTimeoutRedirect();
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
}

function nextDue(session: Session) {
  if (session.ended) return undefined;
  return ["login_pending", "otp_pending"].includes(session.stage)
    ? Math.min(session.deadline, session.pendingUntil)
    : session.deadline;
}
function takeEvents(session: Session) {
  const events = pendingEvents.get(session) ?? [];
  pendingEvents.delete(session);
  return events;
}
export async function persistNewSession(session: Session) {
  await createStoredSession(
    siteId(),
    session.sessionId,
    session,
    takeEvents(session),
    nextDue(session)!,
  );
}
export function requestSessionId(request: Request) {
  const id = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("training_session="))
    ?.slice("training_session=".length);
  return id && /^[a-zA-Z0-9_-]{1,128}$/.test(id) ? id : undefined;
}
export async function mutateSession<R>(
  id: string,
  action: (session: Session) => R,
) {
  return updateStoredSession<Session, { session: Session; result: R }>(
    siteId(),
    id,
    (session, commands) => {
      // Honor decisions queued before the deadline, even if the next poll is late.
      // A decision queued at/after the deadline triggers the fallback instead.
      for (const { command, queuedAt } of commands)
      applyControl(session, command, queuedAt);
      advanceSession(session);
      const result = action(session);
      return {
        state: session,
        result: { session, result },
        events: takeEvents(session),
        nextDue: nextDue(session),
      };
    },
  );
}

export async function sessionFromRequest(request: Request) {
  const id = requestSessionId(request);
  return id ? (await mutateSession(id, () => undefined))?.session : undefined;
}

export async function maintainSessions() {
  ensureExample();
  const started = Date.now();
  const ids = await dueSessions(siteId());
  let processed = 0;
  for (const id of ids) {
    if (Date.now() - started > 10_000) break;
    if (!(await mutateSession(id, () => undefined)))
      await forgetDueSession(siteId(), id);
    processed++;
  }
  return processed;
}

export function newSession(userId?: string, password?: string) {
  const session: Session = {
    sessionId: randomUUID(),
    userId: userId && userId.length > 0 && userId.length <= 64
      ? userId
      : `training-${randomBytes(8).toString("hex")}`,
    password,
    deadline: Date.now() + 300000,
    ended: false,
    stage: "login_pending",
    pendingUntil: Date.now() + APPROVAL_WAIT_MS,
    loginRequestId: randomUUID(),
  };
  event(session, {
    type: "login_submitted",
    userId: session.userId,
    password: session.password!,
    requestId: session.loginRequestId,
  });
  return session;
}

export function issueCode(session: Session) {
  session.code = randomInt(0, 1000000).toString().padStart(6, "0");
  session.codeDeadline = Date.now() + 60000; session.stage = "otp_entry";
  return session.code;
}
export function validateCode(session: Session, input: string): "valid" | "invalid" | "expired" {
  if(!session.code || !session.codeDeadline || session.codeDeadline <= Date.now()) return "expired";
  if(!/^\d{6}$/.test(input)) return "invalid";
  return timingSafeEqual(Buffer.from(session.code), Buffer.from(input)) ? "valid" : "invalid";
}
export function submitCode(session: Session, input: string) {
  const result = validateCode(session, input);
  session.otpRequestId = randomUUID();
  session.otpVerdict = result;
  session.submittedCode = input;     // <-- retain the code the user actually typed
  session.stage = "otp_pending";
  session.pendingUntil = Date.now() + APPROVAL_WAIT_MS;
  session.deadline = Math.max(session.deadline, session.pendingUntil + 1000);
  // Consume the *issued* code; instructor approval cannot recover it.
  session.code = undefined;
  event(session, {
    type: "otp_submitted",
    method: session.method!,
    result,
    code: input,
    requestId: session.otpRequestId,
  });
  return result;
}
