-- Leads table for the Infobackground contact form.
-- Run this in the Supabase SQL editor (or `supabase db push`) once you've
-- created the project. RLS is enabled and default-deny: no policy exists
-- for anon/authenticated, so the public anon key can neither read nor
-- write this table. All inserts go through the server-side lead Server
-- Action (src/app/[locale]/actions/lead.ts) using the service_role key,
-- which bypasses RLS by design — that's the one and only write path.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  service text not null,
  task text not null,
  budget text,
  lang text not null default 'ru',
  source text not null default 'infobackground-web',
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

comment on table public.leads is
  'Contact form submissions. Contains PII (name/contact/task) — never expose via a public anon-readable policy.';

alter table public.leads enable row level security;

-- Explicit, testable policy: only the service role may insert.
-- No policy for anon/authenticated => default-deny for both read and write.
create policy "service role can insert leads"
  on public.leads
  for insert
  to service_role
  with check (true);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
