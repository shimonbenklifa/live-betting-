import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { config } from "../config";

/**
 * Server-side Supabase client bound to the request's auth cookies. Returns null
 * in demo mode (no Supabase configured) so callers can fall back gracefully.
 */
export function getServerSupabase() {
  if (!config.hasSupabase) return null;
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — middleware refreshes the session.
          }
        }
      }
    }
  );
}
