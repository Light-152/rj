import { NextResponse } from "next/server";

export const demoCookie = "demo-auth-stage";

export function demoResponse(message: string, stage?: string, status = 200) {
  const response = NextResponse.json({ ok: status === 200, message }, { status });
  response.headers.set("Cache-Control", "no-store");
  if (stage) {
    response.cookies.set(demoCookie, stage, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth",
      maxAge: stage === "complete" ? 0 : 600,
    });
  }
  return response;
}

export async function readDemoBody(request: Request): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => null);
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? body as Record<string, unknown>
    : {};
}
