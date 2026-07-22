import { createClient, SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let hasWarnedMissingEnv = false;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Support both legacy and current Supabase public key env names.
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!hasWarnedMissingEnv) {
      hasWarnedMissingEnv = true;
      console.warn("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    }
    return null;
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}