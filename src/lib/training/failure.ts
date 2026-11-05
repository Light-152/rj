export type FailureStage =
  | "configuration"
  | "previous_session"
  | "create_session"
  | "persist_session"
  | "update_session";

// Classify internally; never return or log the raw error, URL, or request body.
export function trainingFailureCode(error: unknown, stage: FailureStage) {
  const message = error instanceof Error ? error.message : "";
  if (/is not a function/.test(message))
    return "TRAINING_IMPLEMENTATION_MISMATCH";
  if (
    stage === "configuration" ||
    /TRAINING_SITE_ID|TRAINING_REDIRECT_PATH|TRAINING_OTP_TIMEOUT_REDIRECT_PATH|TRAINING_REDIS_NAMESPACE|REDIS_URL is required/.test(
      message,
    )
  )
    return "TRAINING_CONFIGURATION_INVALID";
  if (/Invalid URL|Invalid protocol|Invalid port/i.test(message))
    return "REDIS_URL_INVALID";
  if (/\b(NOAUTH|WRONGPASS|NOPERM|READONLY)\b/i.test(message))
    return "REDIS_ACCESS_DENIED";
  if (
    /unknown command|not supported|unsupported|not allowed.*script/i.test(
      message,
    )
  )
    return "REDIS_COMMAND_UNSUPPORTED";
  if (
    /Invalid fields|Invalid training alias|Invalid event target|Invalid envelope/.test(
      message,
    )
  )
    return "TRAINING_EVENT_INVALID";
  if (
    /\b(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|ECONNRESET|EPIPE)\b|Training Redis unavailable|Command timed out|Connection is closed/i.test(
      message,
    )
  )
    return "REDIS_UNAVAILABLE";
  return `TRAINING_${stage.toUpperCase()}_FAILED`;
}

// Return only an allowlisted variable name, never the original error text/value.
export function trainingConfigurationSetting(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return [
    "TRAINING_SITE_ID",
    "TRAINING_REDIRECT_PATH",
    "TRAINING_OTP_TIMEOUT_REDIRECT_PATH",
    "TRAINING_REDIS_NAMESPACE",
    "REDIS_URL",
  ].find(
    (setting) =>
      message.startsWith(`${setting} `) || message === `Invalid ${setting}`,
  );
}
