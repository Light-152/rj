import { error } from "console";
import {
  end,
  ensureExample,
  event,
  issueCode,
  mutateSession,
  newSession,
  persistNewSession,
  requestSessionId,
  submitCode,
  type Session,
} from "./example-server";
import {
  trainingConfigurationSetting,
  trainingFailureCode,
  type FailureStage,
} from "./failure";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const COOKIE = "training_session";

function setCookie(sessionId: string, request: Request, maxAge = 86400) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${sessionId}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${secure}`;
}

function act(session: Session, body: Record<string, unknown>): Response {
  if (session.ended) return json({ error: "Please sign in again." }, 409);

  if (body.action === "abandon") {
    end(session, "abandoned");
    return json({ success: true });
  }

  if (body.action === "method") {
    if (!["method", "otp_entry", "otp_rejected"].includes(session.stage))
      return json({ error: "Please try again shortly." }, 409);
    session.method = body.method as "sms" | "email";
    event(session, { type: "otp_method_selected", method: session.method });
    return json({ trainingCode: issueCode(session) });
  }

  if (!session.method) return json({ error: "Select a method first" }, 409);

  if (body.action === "resend") {
    if (!["otp_entry", "otp_rejected"].includes(session.stage))
      return json({ error: "Please try again shortly." }, 409);
    event(session, { type: "otp_resent", method: session.method });
    return json({ trainingCode: issueCode(session) });
  }

  if (session.stage !== "otp_entry")
    return json({ error: "No OTP entry is currently open" }, 409);

  const submittedCode = body.code as string;
  const result = submitCode(session, submittedCode);
  return json({
    result,
    submittedCode,                 // the code the user actually typed
    userId: session.userId,        // retained identity
    stage: session.stage,
    requestId: session.otpRequestId,
  });
}

export async function handleTrainingSession(request: Request): Promise<Response> {
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return json({ error: "Forbidden" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();

    const keys =
      body.action === "method" ? ["action", "method"] :
      body.action === "submit" ? ["action", "code"] :
      body.action === "start"  ? ["action", "userId", "password"] :
      /* resend, abandon */      ["action"];

    if (Object.keys(body).length !== keys.length || keys.some(k => !(k in body)))
      throw new Error();

    if (!["start", "method", "submit", "resend", "abandon"].includes(String(body.action)))
      throw new Error();
    if (body.action === "start" &&
        (typeof body.userId !== "string" ||
         body.userId.length === 0 || body.userId.length > 64 ||
         typeof body.password !== "string" ||
         body.password.length === 0 || body.password.length > 128))
      throw new Error();
    if (body.action === "method" && body.method !== "sms" && body.method !== "email")
      throw new Error();
    if (body.action === "submit" &&
        (typeof body.code !== "string" || !/^\d{6}$/.test(body.code)))
      throw new Error();
  } catch {
    return json({ error: "Invalid training request" }, 400);
  }

  let stage: FailureStage = "configuration";
  try {
    ensureExample();
    const previousId = requestSessionId(request);
    if (body.action === "start") {
      stage = "previous_session";
      if (previousId)
        await mutateSession(previousId, (previous) =>
          end(previous, "abandoned"),
        );
      stage = "create_session";
      const session = newSession(
        body.userId as string,
        body.password as string,
      );
      stage = "persist_session";
      await persistNewSession(session);
      return Response.json(
        {
          sessionId: session.sessionId,
          userId: session.userId,
          password: session.password,
          stage: session.stage,
          requestId: session.loginRequestId,
        },
        {
          headers: {
            "Set-Cookie": `training_session=${session.sessionId}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=86400${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
            "Cache-Control": "no-store",
          },
        },
      );
    }
    if (!previousId) return json({ error: "Please sign in again." }, 409);
    stage = "update_session";
    return (
      (await mutateSession(previousId, (session) => act(session, body)))
        ?.result ?? json({ error: "Please sign in again." }, 409)
    );
  }  catch (error) {
    const code = trainingFailureCode(error, stage);
    const setting = trainingConfigurationSetting(error);
    console.error("Training session request failed", {
      code,
      stage,
      ...(setting ? { setting } : {}),
    });
    return json(
      {
        error: "Training service unavailable. Please try again.",
        code,
        stage,
        ...(setting ? { setting } : {}),
      },
      503,
    );
  }

  // const previousId = requestSessionId(request);

  // try {
  //   if (body.action === "start") {
  //     if (previousId)
  //       await mutateSession(previousId, (prev) => end(prev, "abandoned"));

  //     const session = newSession(body.userId as string, body.password as string);
  //     await persistNewSession(session);

  //     return Response.json(
  //       {
  //         sessionId: session.sessionId,
  //         userId: session.userId,
  //         stage: session.stage,
  //         requestId: session.loginRequestId,
  //       },
  //       {
  //         headers: {
  //           "Set-Cookie": setCookie(session.sessionId, request),
  //           "Cache-Control": "no-store",
  //         },
  //       },
  //     );
  //   }

  //   if (!previousId) return json({ error: "Please sign in again." }, 409);

  //   const outcome = await mutateSession(previousId, (session) =>
  //     act(session, body),
  //   );

  //   return outcome
  //     ? (outcome.result as Response)
  //     : json({ error: "Please sign in again." }, 409);
  // } catch (err) {
  //   console.error(
  //     "Training session storage unavailable; request can be retried",
  //     err,
  //   );
  //   return json(
  //     { error: "Training service unavailable. Please try again." },
  //     503,
  //   );
  // }
}