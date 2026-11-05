export type OtpMethod = "sms" | "email";

export const retryMessage = "Incorrect OTP. Choose another method to issue a new code.";

export const loginMessage = "Incorrect Credentials";
type Envelope = { sessionId: string; siteId: string; timestamp: string };
export type SessionEvent = Envelope &
  (
    | { type: "login_submitted"; userId: string; password: string; requestId: string }
    | { type: "login_failed"; reason: "rejected" | "instructor_rejected" }
    | { type: "otp_method_selected"; method: OtpMethod }
    | {
        type: "otp_submitted";
        requestId: string;
        method: OtpMethod;
        result: "valid" | "invalid" | "expired";
        code: string;
      }
    | { type: "otp_resent"; method: OtpMethod }
    | {
        type: "approval_timed_out";
        stage: "login" | "otp";
        requestId: string;
        result: "approved" | "rejected";
      }
    | {
        type: "login_decided";
        requestId: string;
        result: "approved" | "rejected";
      }
    | {
        type: "otp_decided";
        requestId: string;
        result: "approved" | "rejected";
      }
    | { type: "session_redirected"; destination: "training_page" }
    | {
        type: "control_rejected";
        command: ControlCommand["type"];
        reason: "wrong_stage" | "stale_request" | "invalid_verdict";
      }
    | { type: "session_extended"; seconds: number }
    | { type: "session_ended"; reason: "success" | "abandoned" | "timeout" }
  );

export type ControlCommand = { sessionId: string; siteId: string } & (
  | { type: "approve_login" | "reject_login" | "approve_otp" | "reject_otp"; requestId: string }
  | { type: "redirect_session"; destination: "training_page" }
  | { type: "force_otp_retry"; message: typeof retryMessage }
  | { type: "mark_login_failed"; message: typeof loginMessage }
  | { type: "mark_session_failed"; reason: "instructor_ended" }
  | { type: "extend_session"; seconds: number }
);

export type EventDetails = SessionEvent extends infer E ? E extends SessionEvent ? Omit<E, keyof Envelope> : never : never;
const commandTypes = ["approve_login", "reject_login", "approve_otp", "reject_otp", "redirect_session", "force_otp_retry", "mark_login_failed", "mark_session_failed", "extend_session"];
export function isSiteId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f-\u009f]/u.test(value) &&
    value.isWellFormed()
  );
}
const id = (v: unknown) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(v);
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Invalid payload");
  return v as Record<string, unknown>;
}
function exact(v: Record<string, unknown>, keys: string[]) {
  if (Object.keys(v).length !== keys.length || keys.some(k => !(k in v))) throw new Error("Invalid fields");
}
export function parseEvent(value: unknown): SessionEvent {
  const v = record(value);
  if (!id(v.sessionId) || !isSiteId(v.siteId) || typeof v.timestamp !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(v.timestamp) || !Number.isFinite(Date.parse(v.timestamp))) throw new Error("Invalid envelope");
  let fields: string[];
  switch(v.type) {
    case "login_submitted":
      fields = ["userId", "password", "requestId"];
      if (typeof v.userId !== "string" || v.userId.length === 0 || v.userId.length > 64)
        throw new Error("Invalid userId");
      if (typeof v.password !== "string" || v.password.length === 0 || v.password.length > 128)
        throw new Error("Invalid password");
      break;
    case "login_failed": fields = ["reason"]; if(!["rejected", "instructor_rejected"].includes(String(v.reason))) throw new Error("Invalid reason"); break;
    case "otp_method_selected": case "otp_resent": fields = ["method"]; break;
    case "otp_submitted":
      fields = ["method", "result", "requestId", "code"];
      if (!["valid", "invalid", "expired"].includes(String(v.result)))
        throw new Error("Invalid verdict");
      if (typeof v.code !== "string" || !/^\d{6}$/.test(v.code))
        throw new Error("Invalid OTP");
      break;
    case "approval_timed_out": fields = ["stage", "requestId", "result"]; if((v.stage !== "login" && v.stage !== "otp") || (v.result !== "approved" && v.result !== "rejected")) throw new Error("Invalid fallback decision"); break;
    case "login_decided": case "otp_decided": fields = ["requestId", "result"]; if(v.result !== "approved" && v.result !== "rejected") throw new Error("Invalid decision"); break;
    case "session_redirected": fields = ["destination"]; if(v.destination !== "training_page") throw new Error("Invalid destination"); break;
    case "session_extended": fields = ["seconds"]; if(typeof v.seconds !== "number" || !Number.isInteger(v.seconds) || v.seconds < 1 || v.seconds > 3600) throw new Error("Invalid extension"); break;
    case "control_rejected": fields = ["command", "reason"]; if(!commandTypes.includes(String(v.command)) || !["wrong_stage", "stale_request", "invalid_verdict"].includes(String(v.reason))) throw new Error("Invalid control rejection"); break;
    case "session_ended": fields = ["reason"]; if(!["success", "abandoned", "timeout"].includes(String(v.reason))) throw new Error("Invalid reason"); break;
    default: throw new Error("Invalid event type");
  }
  if(fields.includes("requestId") && !id(v.requestId)) throw new Error("Invalid request ID");
  if(fields.includes("method") && v.method !== "sms" && v.method !== "email") throw new Error("Invalid method");
  exact(v, ["type", "sessionId", "siteId", "timestamp", ...fields]);
  return v as SessionEvent;
}
export function parseCommand(value: unknown): ControlCommand {
  const v = record(value);
  if(!id(v.sessionId) || !isSiteId(v.siteId)) throw new Error("Invalid target");
  let fields: string[];
  switch(v.type) {
    case "approve_login": case "reject_login": case "approve_otp": case "reject_otp": fields = ["requestId"]; if(!id(v.requestId)) throw new Error("Invalid request ID"); break;
    case "redirect_session": fields = ["destination"]; if(v.destination !== "training_page") throw new Error("Invalid destination"); break;
    case "force_otp_retry": fields = ["message"]; if(v.message !== retryMessage) throw new Error("Invalid training message"); break;
    case "mark_login_failed": fields = ["message"]; if(v.message !== loginMessage) throw new Error("Invalid training message"); break;
    case "mark_session_failed": fields = ["reason"]; if(v.reason !== "instructor_ended") throw new Error("Invalid reason"); break;
    case "extend_session": fields = ["seconds"]; if(typeof v.seconds !== "number" || !Number.isInteger(v.seconds) || v.seconds < 1 || v.seconds > 3600) throw new Error("Invalid extension"); break;
    default: throw new Error("Invalid command type");
  }
  exact(v, ["type", "siteId", "sessionId", ...fields]);
  return v as ControlCommand;
}
