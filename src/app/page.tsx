import Link from "next/link";
import { config } from "@/lib/config";
import { buttonClass, Badge } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(37,99,235,0.10),transparent)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">L</span>
            <span className="text-sm font-semibold text-body">{config.appName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonClass("ghost")}>Log in</Link>
            <Link href="/dashboard" className={buttonClass("primary")}>Enter demo</Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <Badge tone="warn" className="mb-5">Play-money · Private league · Compliance-first</Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-body md:text-6xl">
            Prediction markets for your rec league.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base text-muted md:text-lg">
            Trade YES/NO and multi-outcome markets on games, awards, and championships with play
            credits. See implied probabilities, track P&amp;L, and climb the leaderboard — Kalshi-style,
            built for a private men&apos;s recreational league.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={buttonClass("primary")}>Explore the demo league →</Link>
            <Link href="/futures" className={buttonClass("outline")}>View futures markets</Link>
          </div>

          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["LMSR", "AMM pricing"],
              ["100%", "Auditable ledger"],
              ["0", "Real-money risk"],
              ["RLS", "Per-league access"]
            ].map(([big, small]) => (
              <div key={small} className="rounded-xl border border-line bg-ink-800 px-4 py-4 shadow-card">
                <div className="text-2xl font-semibold text-brand">{big}</div>
                <div className="mt-1 text-xs text-muted">{small}</div>
              </div>
            ))}
          </div>
        </main>

        <footer className="border-t border-line py-5 text-center text-xs text-muted">
          No deposits, withdrawals, or cash payouts. Real-money functionality is disabled by default and
          gated behind legal/compliance review.
        </footer>
      </div>
    </div>
  );
}
