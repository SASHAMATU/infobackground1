import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service_role key. Never import this from
 * a Client Component — the `server-only` import throws a build error if
 * you try. RLS on the `leads` table denies anon/authenticated entirely
 * (see supabase/migrations/0001_leads.sql), so this is the only path
 * that can write leads.
 *
 * Returns null when Supabase isn't configured; callers must handle that
 * (the lead action reports a clear error rather than crashing).
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
