# Infobackground — Next.js migration

Production Next.js (App Router, TypeScript) rebuild of the original single-file
`index.html` landing page, migrated per a client Technical Requirements
Specification (`ceo promnt.docx` in the repo root) covering analytics, SEO,
security, and a Supabase + Telegram lead pipeline. The original static site
still lives at the repo root, untouched, until this is cut over.

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
2. Run `supabase/migrations/0001_leads.sql` in the SQL editor (or via
   `supabase db push` if you're using the CLI). It creates the `leads`
   table with RLS enabled and a default-deny policy — only the
   service_role key (server-side only, never shipped to the browser) can
   insert rows.
3. Copy the project URL + anon key + service_role key into your env vars.

### Setting up Telegram

1. Message [@BotFather](https://t.me/BotFather) on Telegram, run
   `/newbot`, and copy the token it gives you into `TELEGRAM_BOT_TOKEN`.
2. Send your new bot any message, then visit
   `https://api.telegram.org/bot<token>/getUpdates` and read the chat id
   out of the response into `TELEGRAM_CHAT_ID`.

### Deploying

1. Push this repo to GitHub.
2. Import it into Vercel, with **Root Directory set to `web/`**.
3. Add your env vars in the Vercel dashboard — **scope
   analytics IDs, `TELEGRAM_CHAT_ID`, and the Supabase project to the
   Production environment only.** Preview deploys sharing the same
   values will pollute real analytics data and spam the real Telegram
   chat with every PR's test submissions.
4. Deploy. No code changes are needed between environments — everything
   is env-var driven.

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
    sitemap.ts, robots.ts, manifest.ts, icon.svg, opengraph-image.jpg
    globals.css         verbatim port of the original site's CSS
  components/           one component per original section, + analytics/
  hooks/                useReveal, useTilt, useCounters, useSmoothAnchorScroll
  i18n/                 next-intl routing/navigation/request config
  lib/                  validators, supabase clients, telegram, rate limiting, analytics
messages/                ru.json / en.json / ua.json translation dictionaries
supabase/migrations/     SQL to run in your Supabase project
```
