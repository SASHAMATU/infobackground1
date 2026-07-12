import { NextResponse, type NextRequest } from "next/server";
import { deliverLead } from "@/lib/leadPipeline";
import { checkLeadRateLimit } from "@/lib/rateLimit";
import { validateLead } from "@/lib/validators";

// Public, cross-origin write endpoint for the static index.html contact
// form (the Next.js app's own form goes through the Server Action in
// app/[locale]/actions/lead.ts instead — this route exists only for the
// legacy static site). Locked to an explicit origin allow-list since it's
// an unauthenticated endpoint that writes to the database and pages
// Telegram; a wildcard `Access-Control-Allow-Origin` would let any site
// on the internet submit fake leads.
const DEFAULT_ORIGINS = [
  "https://infobackground.com",
  "https://www.infobackground.com",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

const ALLOWED_ORIGINS = (process.env.LEAD_CORS_ORIGIN ?? DEFAULT_ORIGINS.join(","))
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  // Browsers enforce CORS client-side using this header, but a non-browser
  // caller wouldn't be stopped by it — reject disallowed origins outright
  // rather than relying solely on the header being honored.
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ ok: false, error: "origin_not_allowed" }, { status: 403, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400, headers });
  }

  // Honeypot (optional — the static form doesn't currently render this
  // field, but the API accepts it so one can be added without a backend
  // change). Real users never fill it; pretend success for bots that do.
  const honeypot = String(body.company_website ?? "");
  if (honeypot.trim() !== "") {
    return NextResponse.json({ ok: true }, { headers });
  }

  const payload = {
    name: String(body.name ?? "").trim(),
    contact: String(body.contact ?? "").trim(),
    service: String(body.service ?? ""),
    task: String(body.task ?? "").trim(),
    budget: String(body.budget ?? "").trim(),
    lang: String(body.lang ?? "ru"),
  };

  const { ok, errors } = validateLead(payload);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "validation_failed", fields: errors }, { status: 422, headers });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const allowed = await checkLeadRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429, headers });
  }

  const idempotencyKey = String(body.idempotencyKey ?? "");
  const { supabaseOk, telegramOk, configured } = await deliverLead(payload, {
    idempotencyKey,
    source: "infobackground1-landing",
  });

  if (!configured) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503, headers });
  }
  if (!supabaseOk && !telegramOk) {
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502, headers });
  }

  return NextResponse.json({ ok: true }, { headers });
}
