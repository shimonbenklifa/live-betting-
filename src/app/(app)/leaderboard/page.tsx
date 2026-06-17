import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui";
import { getCurrentUser, getLeaderboard, getLeague, getPortfolio } from "@/lib/data";
import { formatCredits } from "@/lib/money";
import { cn, pnlColor, signed } from "@/lib/utils";

export default async function LeaderboardPage() {
  const [user, league, portfolio, rows] = await Promise.all([
    getCurrentUser(),
    getLeague(),
    getPortfolio(),
    getLeaderboard()
  ]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Leaderboard" subtitle={`${league.name} · Season ${league.season}`} cash={portfolio.cash} userName={user.displayName} />
      <div className="px-4 py-5 md:px-6">
        <Card>
          <CardHeader title="Standings" subtitle="Ranked by total portfolio value (cash + positions)" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Member</th>
                  <th className="px-4 py-2 text-right font-medium">Total Value</th>
                  <th className="px-4 py-2 text-right font-medium">Realized</th>
                  <th className="px-4 py-2 text-right font-medium">Unrealized</th>
                  <th className="px-4 py-2 text-right font-medium">Trades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.userId} className={cn("hover:bg-ink-700", r.displayName === "You" && "bg-brand/5")}>
                    <td className="px-4 py-2.5">
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        r.rank === 1 ? "bg-warn/20 text-warn" : r.rank <= 3 ? "bg-ink-600 text-body" : "text-muted")}>
                        {r.rank}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{r.displayName}</td>
                    <td className="px-4 py-2.5 text-right tabular font-semibold text-body">{formatCredits(r.totalValue)}</td>
                    <td className={cn("px-4 py-2.5 text-right tabular", pnlColor(r.realizedPnl))}>{signed(r.realizedPnl)}</td>
                    <td className={cn("px-4 py-2.5 text-right tabular", pnlColor(r.unrealizedPnl))}>{signed(r.unrealizedPnl)}</td>
                    <td className="px-4 py-2.5 text-right tabular text-muted">{r.tradeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
