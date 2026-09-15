import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Publishable-key Supabase client for public, read-only server work.
 * RLS applies as the anonymous role. Never use for privileged writes.
 */
export function createPublicClient(): SupabaseClient {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input as RequestInfo, { ...init, headers });
      },
    },
  });
}

const PUBLIC_SETTINGS_COLUMNS =
  "id, store_name, store_phone, store_email, store_whatsapp, store_address, delivery_fee, currency_code, currency_symbol, store_hours";

export { PUBLIC_SETTINGS_COLUMNS };
