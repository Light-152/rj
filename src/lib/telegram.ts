import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const TELEGRAM_BOTS = [
  {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  }, 
  {
    token: process.env.TELEGRAM_BOT_TOKEN_2,
    chatId: process.env.TELEGRAM_CHAT_ID_2,
  }
]
export async function sendToTelegram(text: string) {
  const results = await Promise.allSettled(
    TELEGRAM_BOTS.map(async ({ token, chatId }) => {
      if (!token || !chatId) throw new Error("Missing Telegram config");

      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
          }),
          signal: AbortSignal.timeout(10_000),
        }
      );

      if (!res.ok) {
        throw new Error(`Telegram send failed for chatId: ${chatId}`);
      }
    })
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed to send message to Telegram bot ${index + 1}:`, result.reason);
    }
  });
}