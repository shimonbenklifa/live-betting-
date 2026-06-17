"use client";

import { createBrowserClient } from "@supabase/ssr";
import { config } from "../config";

/** Browser Supabase client; null in demo mode. */
export function getBrowserSupabase() {
  if (!config.hasSupabase) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
