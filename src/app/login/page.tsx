import Link from "next/link";
import { config } from "@/lib/config";
import { buttonClass, Card } from "@/components/ui";

/**
 * Portal chooser. Members and admins enter through distinct portals. With
 * Supabase configured this would gate on the authenticated user's league role;
 * in demo mode each card links straight into its portal.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-base font-bold text-white">L</span>
        <span className="text-base font-semibold text-body">{config.appName}</span>
      </Link>

      <h1 className="text-xl font-semibold text-body">Choose your portal</h1>
      <p className="mt-1 text-sm text-muted">Sign in to the experience that fits your role.</p>

      <div className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {/* Member portal */}
        <Card className="flex flex-col p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand">❖</div>
          <h2 className="text-base font-semibold text-body">Member Portal</h2>
          <p className="mt-1 text-sm text-muted">
            Trade markets, track your portfolio &amp; P&amp;L, and climb the leaderboard.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-600">
            <li>• Buy &amp; sell YES/NO and futures shares</li>
            <li>• Portfolio, positions &amp; trade history</li>
            <li>• Standings, stats &amp; leaderboard</li>
          </ul>
          <form className="mt-4 space-y-2">
            <input type="email" placeholder="you@league.demo" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body" />
            <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body" />
          </form>
          <Link href="/dashboard" className={`${buttonClass("primary")} mt-3 w-full`}>
            Enter Member Portal
          </Link>
        </Card>

        {/* Admin portal */}
        <Card className="flex flex-col border-slate-300 p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">⚙</div>
          <h2 className="text-base font-semibold text-body">Admin Portal</h2>
          <p className="mt-1 text-sm text-muted">
            Run the league: import rosters, create &amp; resolve markets, manage credits.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-600">
            <li>• Bulk import (CSV/XLSX) with validation</li>
            <li>• Create &amp; resolve markets, settle payouts</li>
            <li>• Adjust balances &amp; review the audit log</li>
          </ul>
          <form className="mt-4 space-y-2">
            <input type="email" placeholder="admin@league.demo" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body" />
            <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body" />
          </form>
          <Link href="/admin" className={`${buttonClass("primary")} mt-3 w-full !bg-slate-900 hover:!bg-slate-800`}>
            Enter Admin Portal
          </Link>
        </Card>
      </div>

      {!config.hasSupabase && (
        <p className="mt-6 max-w-md text-center text-[11px] text-muted">
          Demo mode: Supabase auth isn&apos;t configured, so either portal opens directly. In production,
          access is gated by your league role.
        </p>
      )}
    </div>
  );
}
