import { createClient } from "@supabase/supabase-js";

/**
 * Browser client (anon key). Only used if you add client-side reads later —
 * the lead form itself never writes directly from the browser (see
 * app/[locale]/actions/lead.ts). Returns null when Supabase isn't configured
 * so the rest of the app can render without it.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
