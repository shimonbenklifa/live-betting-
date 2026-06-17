/** Centralised runtime configuration & compliance flags. */

export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "League Markets",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /** When false, the app serves the built-in demo dataset (read-only). */
  hasDatabase: Boolean(process.env.DATABASE_URL),
  hasSupabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  /**
   * Real-money functionality is disabled by default and must remain so until a
   * documented legal/compliance review explicitly flips this. The trading
   * engine is play-money regardless; this flag only ever gates future work.
   */
  realMoneyEnabled: process.env.ENABLE_REAL_MONEY === "true",
  defaultStartingCredits: Number(process.env.DEFAULT_STARTING_CREDITS ?? "10000")
} as const;

export const isDemoMode = !config.hasDatabase;
