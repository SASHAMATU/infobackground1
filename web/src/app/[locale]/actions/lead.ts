"use server";

import { headers } from "next/headers";
import { deliverLead } from "@/lib/leadPipeline";
import { checkLeadRateLimit } from "@/lib/rateLimit";
import { validateLead, type LeadField } from "@/lib/validators";

export interface LeadActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<LeadField, boolean>>;
}

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

  const { supabaseOk, telegramOk, configured } = await deliverLead(payload, {
    idempotencyKey,
    source: "infobackground-web",
  });

  if (!configured) {
    return { status: "error", message: "not_configured" };
  }

  if (!supabaseOk && !telegramOk) {
    return { status: "error", message: "delivery_failed" };
  }

  return { status: "success" };
}
