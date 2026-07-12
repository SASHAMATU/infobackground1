import "server-only";

export interface TelegramLeadDetails {
  name: string;
  contact: string;
  service: string;
  task: string;
  budget: string;
  lang: string;
  createdAt: string;
}

function formatCreatedAt(iso: string) {
  // "2026-07-12T14:35:02.123Z" -> "2026-07-12 14:35 UTC"
  return `${iso.slice(0, 16).replace("T", " ")} UTC`;
}

/**
 * Sends a lead notification via the Telegram Bot API. No-op (returns
 * false) when TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID aren't configured —
 * callers should treat that as "channel unavailable", not an error.
 */
export async function sendTelegramLeadNotification(lead: TelegramLeadDetails) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const text = [
    "🚀 New Lead",
    "",
    `👤 Name: ${lead.name}`,
    "",
    `📞 Contact: ${lead.contact}`,
    "",
    `🌐 Website Type: ${lead.service}`,
    "",
    `📝 Task: ${lead.task}`,
    "",
    `💰 Budget: ${lead.budget || "—"}`,
    "",
    `🕒 ${formatCreatedAt(lead.createdAt)}`,
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.ok;
}
