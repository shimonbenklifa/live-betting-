import Link from "next/link";
import { config } from "@/lib/config";
import { buttonClass, Card } from "@/components/ui";

/**
 * Login screen. With Supabase configured this posts to the Supabase auth flow;
 * in demo mode it links straight into the league so the product is explorable.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-base font-bold text-body">L</span>
          <span className="text-base font-semibold text-body">{config.appName}</span>
        </Link>
        <Card className="p-6">
          <h1 className="text-lg font-semibold text-body">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Access your private league&apos;s prediction markets.</p>

          <form className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Email</label>
              <input type="email" placeholder="you@league.demo" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Password</label>
              <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body" />
            </div>
            <Link href="/dashboard" className={`${buttonClass("primary")} w-full`}>
              Continue
            </Link>
          </form>

          {!config.hasSupabase && (
            <p className="mt-4 rounded-lg bg-warn/10 px-3 py-2 text-[11px] text-warn">
              Demo mode: Supabase auth isn&apos;t configured, so any details continue into the demo league.
            </p>
          )}
        </Card>
        <p className="mt-4 text-center text-xs text-muted">
          New to the league? Ask an admin for an invite.
        </p>
      </div>
    </div>
  );
}
