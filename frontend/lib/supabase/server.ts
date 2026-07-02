import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a server-side Supabase Client
 * 
 * Used for communicating with Supabase from Server Components, 
 * Server Actions, and Route Handlers. It automatically handles 
 * reading and writing session tokens to cookies.
 * 
 * NOTE: The cookies() API is asynchronous in Next.js 15, so this 
 * helper function must be awaited.
 */
export async function createClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail fast during initialization if variables are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if user sessions are refreshed via middleware.
        }
      },
    },
  });
}
