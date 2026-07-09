import "server-only";

export interface TelegramLeadDetails {
  name: string;
  contact: string;
  service: string;
  task: string;
  budget: string;
  lang: string;
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
    "🆕 Новая заявка — Infobackground",
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Формат: ${lead.service}`,
    `Задача: ${lead.task}`,
    lead.budget ? `Бюджет: ${lead.budget}` : null,
    `Язык: ${lead.lang}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.ok;
}
