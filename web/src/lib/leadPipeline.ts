import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendTelegramLeadNotification } from "@/lib/telegram";

const SUPABASE_UNIQUE_VIOLATION = "23505";

export interface LeadPayload {
  name: string;
  contact: string;
  service: string;
  task: string;
  budget: string;
  lang: string;
}

export interface DeliverLeadResult {
  supabaseOk: boolean;
  telegramOk: boolean;
  /** False when neither Supabase nor Telegram has any credentials set. */
  configured: boolean;
}

/**
 * Single write path for a validated lead: insert into Supabase and notify
 * Telegram in parallel, independently of each other (requirement: a
 * Telegram failure must never stop the lead from being saved, and vice
 * versa). Shared by the Server Action (the Next.js app's own form) and
 * the `/api/lead` Route Handler (the static index.html form) so both
 * entry points write to the same table with identical rules.
 */
export async function deliverLead(
  payload: LeadPayload,
  { idempotencyKey, source }: { idempotencyKey: string; source: string }
): Promise<DeliverLeadResult> {
  // Generated once and shared by both writes so the Telegram notification
  // always matches the row's timestamp, even though the two run in
  // parallel and either one can fail independently of the other.
  const createdAt = new Date().toISOString();

  const supabase = getSupabaseServerClient();
  const results = await Promise.allSettled([
    supabase
      ? supabase.from("leads").insert({
          name: payload.name,
          contact: payload.contact,
          site_type: payload.service,
          task: payload.task,
          budget: payload.budget || null,
          lang: payload.lang,
          source,
          idempotency_key: idempotencyKey || null,
          created_at: createdAt,
        })
      : Promise.resolve({ error: null }),
    sendTelegramLeadNotification({ ...payload, createdAt }),
  ]);

  const [supabaseResult, telegramResult] = results;

  let supabaseOk = !supabase; // if not configured, don't block success on it
  if (supabaseResult.status === "fulfilled") {
    const value = supabaseResult.value as { error: { code?: string } | null };
    if (!value.error) {
      supabaseOk = true;
    } else if (value.error.code === SUPABASE_UNIQUE_VIOLATION) {
      // Duplicate submission (retry after a network hiccup, double-click
      // that slipped past the client guard) — treat as success, not error.
      supabaseOk = true;
    } else {
      console.error("Supabase lead insert failed:", value.error);
    }
  } else {
    console.error("Supabase lead insert threw:", supabaseResult.reason);
  }

  const telegramOk = telegramResult.status === "fulfilled" && telegramResult.value === true;
  if (telegramResult.status === "rejected") {
    console.error("Telegram notification threw:", telegramResult.reason);
  }

  return {
    supabaseOk,
    telegramOk,
    configured: !!supabase || !!process.env.TELEGRAM_BOT_TOKEN,
  };
}
