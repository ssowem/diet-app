import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
};

let cachedClient: SupabaseClient | undefined;

export function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function getSupabaseClient(): SupabaseClient | undefined {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    return undefined;
  }

  if (!cachedClient) {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return cachedClient;
}
