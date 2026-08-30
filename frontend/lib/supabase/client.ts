import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail fast during initialization if variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined."
  );
}

/**
 * Supabase Browser Client
 * 
 * Used for communicating with Supabase services (auth, storage, database)
 * directly from Client Components in the Next.js 15 App Router.
 * Uses a single browser-side client instance.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== 'undefined') {
  (window as typeof globalThis & { supabaseClient?: typeof supabase }).supabaseClient = supabase;
}
