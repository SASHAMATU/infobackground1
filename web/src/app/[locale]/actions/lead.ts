"use server";

import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendTelegramLeadNotification } from "@/lib/telegram";
import { checkLeadRateLimit } from "@/lib/rateLimit";
import { validateLead, type LeadField } from "@/lib/validators";

export interface LeadActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<LeadField, boolean>>;
}

const SUPABASE_UNIQUE_VIOLATION = "23505";

export async function submitLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  // Honeypot: real users never fill this (it's visually hidden). Bots
  // that blindly fill every field trip it — pretend success so they
  // don't learn to avoid the field next time.
  const honeypot = String(formData.get("company_website") ?? "");
  if (honeypot.trim() !== "") {
    return { status: "success" };
  }

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    contact: String(formData.get("contact") ?? "").trim(),
    service: String(formData.get("service") ?? ""),
    task: String(formData.get("task") ?? "").trim(),
    budget: String(formData.get("budget") ?? "").trim(),
    lang: String(formData.get("lang") ?? "ru"),
  };
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");

  const { ok, errors } = validateLead(payload);
  if (!ok) {
    return { status: "error", fieldErrors: errors };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const allowed = await checkLeadRateLimit(ip);
  if (!allowed) {
    return { status: "error", message: "rate_limited" };
  }

  const supabase = getSupabaseServerClient();
  const results = await Promise.allSettled([
    supabase
      ? supabase.from("leads").insert({
          name: payload.name,
          contact: payload.contact,
          service: payload.service,
          task: payload.task,
          budget: payload.budget || null,
          lang: payload.lang,
          source: "infobackground-web",
          idempotency_key: idempotencyKey || null,
        })
      : Promise.resolve({ error: null, skipped: true }),
    sendTelegramLeadNotification(payload),
  ]);

  const [supabaseResult] = results;
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

  const telegramResult = results[1];
  const telegramOk = telegramResult.status === "fulfilled" && telegramResult.value === true;
  if (telegramResult.status === "rejected") {
    console.error("Telegram notification threw:", telegramResult.reason);
  }

  if (!supabase && !process.env.TELEGRAM_BOT_TOKEN) {
    return {
      status: "error",
      message: "not_configured",
    };
  }

  if (!supabaseOk && !telegramOk) {
    return { status: "error", message: "delivery_failed" };
  }

  return { status: "success" };
}
