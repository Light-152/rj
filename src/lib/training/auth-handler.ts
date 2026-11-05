import { handleTrainingSession } from "./session-handler";
import { ensureExample, sessionFromRequest } from "./example-server";

export async function authAction(
  request: Request,
  action: "start" | "method" | "submit" | "resend"
) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();

    if (action === "start") {
      // Permissive: require userId + password. Extra keys allowed.
      if (typeof body.userId !== "string" || typeof body.password !== "string") throw new Error();
    } else if (action === "method") {
      // Permissive: require method to be "sms" | "email". Extra keys allowed.
      if (typeof body.method !== "string") throw new Error();
      if (body.method !== "sms" && body.method !== "email") throw new Error();
    } else if (action === "submit") {
      // Permissive: require a 6-digit otp. Extra keys allowed.
      if (typeof body.otp !== "string") throw new Error();
      if (!/^\d{6}$/.test(body.otp)) throw new Error();
    } else {
      // resend — if your client sends extras here too, loosen this as well
      if (Object.keys(body).length !== 0) throw new Error();
    }
  } catch (e) {
    console.error("[authAction] invalid body", action, e);
    return Response.json({ error: "Invalid training request" }, { status: 400 });
  }

  const payload =
    action === "method" ? { action, method: body.method } :
    action === "submit" ? { action, code: body.otp } :
    action === "start"  ? { action, userId: body.userId, password: body.password } :
                          { action };

  return handleTrainingSession(
    new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(payload),
    })
  );
}

export async function authSnapshot(request: Request) {
  try { 
    ensureExample(); 
    const session = await sessionFromRequest(request);
    if (!session) return Response.json({ error: "Please sign in again." }, { status: 409 });
    return Response.json(
      {
        sessionId: session.sessionId,
        userId: session.userId,
        password: session.password,
        method: session.method,
        trainingCode: session.stage === "otp_entry" ? session.code : undefined,
        stage: session.stage,
        endReason: session.endReason,
        redirectPath: session.redirectPath,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } 
  catch {
    console.error(
      "Training snapshot storage unavailable; retrying on next poll",
    );
    return Response.json(
      { error: "Training service unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}