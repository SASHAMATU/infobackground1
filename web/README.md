# Infobackground — Next.js migration

Production Next.js (App Router, TypeScript) rebuild of the original single-file
`index.html` landing page, migrated per a client Technical Requirements
Specification (`ceo promnt.docx` in the repo root) covering analytics, SEO,
security, and a Supabase + Telegram lead pipeline. The original static site
still lives at the repo root as its own deployable artifact — but its
contact form now posts to `POST /api/lead` on *this* app (see below) rather
than having its own backend, so this app must be deployed for that form to
deliver leads.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to
`/ru` (the default locale). `/en` and `/ua` are the other two.

The site **builds and runs with zero environment variables set**. Without
Supabase + Telegram configured, the lead form still renders and validates,
but submissions can't be delivered anywhere (see below — this is the one
thing that's genuinely required, not optional).

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Every
variable is documented there with what it's for and whether it's required.

**Required for the lead form to actually deliver anything**: Supabase
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`) and Telegram (`TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`). The old n8n webhook has been retired — there's no
fallback if neither of these is configured.

Everything else (GTM, GA4, Meta Pixel, Clarity, Google Ads, TikTok Pixel,
Turnstile, Upstash) is optional and self-disables when unset.

### Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations in `supabase/migrations/` **in order** (`0001_leads.sql`
   then `0002_rename_service_to_site_type.sql`) in the SQL editor, or via
   `supabase db push` if you're using the CLI. Together they create the
   `leads` table (columns: `name`, `contact`, `site_type`, `task`, `budget`,
   `lang`, `source`, `idempotency_key`, `created_at`) with RLS enabled and
   a default-deny policy — only the service_role key (server-side only,
   never shipped to the browser) can insert rows.
3. Copy the project URL + anon key + service_role key into your env vars.

### Setting up Telegram

1. Message [@BotFather](https://t.me/BotFather) on Telegram, run
   `/newbot`, and copy the token it gives you into `TELEGRAM_BOT_TOKEN`.
2. Send your new bot any message, then visit
   `https://api.telegram.org/bot<token>/getUpdates` and read the chat id
   out of the response into `TELEGRAM_CHAT_ID`.

### `/api/lead` — the endpoint the static site calls

The root `index.html` has no backend of its own, so its contact form
`fetch()`s `POST /api/lead` on this app instead of running the Server
Action (Server Actions are an RSC-only protocol — a plain static page
can't invoke one directly). Both entry points write through the same
`deliverLead()` function in `src/lib/leadPipeline.ts`, so validation, the
`leads` table, and Telegram notifications are identical either way.

Because it's an unauthenticated, cross-origin, database-writing endpoint,
it's locked to an explicit origin allow-list (not a wildcard) via
`corsHeaders()` in `src/app/api/lead/route.ts`:

- Defaults to `https://infobackground.com`, `https://www.infobackground.com`,
  and `http://localhost:8000` / `http://127.0.0.1:8000` (for testing the
  static file locally via `python3 -m http.server 8000`).
- Override with the `LEAD_CORS_ORIGIN` env var (comma-separated) once the
  static site's real domain is finalized.
- Requests from a disallowed `Origin` get `403 origin_not_allowed`.

`index.html` points `LEAD_API_URL` at `https://infobackground.com/api/lead`
— i.e. this app is expected to be deployed on the same production domain
as the static site, making the real request same-origin (CORS only
actually matters for local testing, e.g. running the static file via
`python3 -m http.server 8000` against `next dev` on `localhost:3000`). If
the production domain ever changes, update `LEAD_API_URL` in `index.html`
to match.

### Deploying

1. Push this repo to GitHub.
2. Import it into Vercel, with **Root Directory set to `web/`**.
3. Add your env vars in the Vercel dashboard — **scope
   analytics IDs, `TELEGRAM_CHAT_ID`, `LEAD_CORS_ORIGIN`, and the Supabase
   project to the Production environment only.** Preview deploys sharing
   the same values will pollute real analytics data and spam the real
   Telegram chat with every PR's test submissions.
4. Deploy under the `infobackground.com` production domain so
   `LEAD_API_URL` in the root `index.html` (already set to
   `https://infobackground.com/api/lead`) resolves correctly — see
   previous section.

## What's still open

- **CSP is in `Content-Security-Policy-Report-Only` mode** (see
  `next.config.ts`). Watch the browser console / your reporting endpoint
  for violations across a real deploy before switching it to the
  enforcing `Content-Security-Policy` header. It currently allows
  `script-src 'unsafe-inline'` for the hand-rolled analytics snippets
  (Meta Pixel/Clarity/TikTok/Consent Mode) — tightening this to a
  nonce-based policy is a real upgrade but a separate piece of work
  (needs a `proxy.ts`-generated per-request nonce, which pushes affected
  routes toward dynamic rendering).
- **`/privacy` is a placeholder** — real policy content needs to come
  from whoever owns legal/compliance for this business, not be
  auto-generated. See the TODO in `src/app/[locale]/privacy/page.tsx`.
- **No cookie-consent banner UI** — only a Google Consent Mode v2
  default-denied signal ships. Add a real banner if EEA compliance
  requires visible consent UI for your traffic.
- **"Booking"/"appointment confirmed" events** (mentioned in the spec)
  are mapped to "lead form submitted successfully" — there's no
  calendar/scheduling feature on this site. Say the word if real
  booking is wanted; it's a genuinely separate feature.
- **In-memory rate limiting is dev-only.** Set `UPSTASH_REDIS_REST_URL`
  / `UPSTASH_REDIS_REST_TOKEN` for real distributed protection in
  production, and/or turn on Vercel's platform-level Firewall rules.

## Project structure

```
src/
  app/
    [locale]/          RU/EN/UA-scoped routes (layout, page, privacy, lead action)
    api/lead/          POST endpoint the static index.html form calls (CORS-gated)
    sitemap.ts, robots.ts, manifest.ts, icon.svg, opengraph-image.jpg
    globals.css         verbatim port of the original site's CSS
  components/           one component per original section, + analytics/
  hooks/                useReveal, useTilt, useCounters, useSmoothAnchorScroll
  i18n/                 next-intl routing/navigation/request config
  lib/                  validators, supabase clients, telegram, rate limiting, analytics,
                         leadPipeline (shared by the Server Action and /api/lead)
messages/                ru.json / en.json / ua.json translation dictionaries
supabase/migrations/     SQL to run in your Supabase project
```
