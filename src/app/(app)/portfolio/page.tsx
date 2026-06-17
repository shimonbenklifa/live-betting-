import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, Stat, Badge, EmptyState } from "@/components/ui";
import { getCurrentUser, getPortfolio } from "@/lib/data";
import { formatCredits } from "@/lib/money";
import { cn, formatDateTime, pnlColor, signed } from "@/lib/utils";

export default async function PortfolioPage() {
  const [user, portfolio] = await Promise.all([getCurrentUser(), getPortfolio()]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Portfolio" subtitle="Positions, P&L and trade history" cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Total Value" value={formatCredits(portfolio.totalValue)} />
          <Stat label="Cash" value={formatCredits(portfolio.cash)} />
          <Stat label="Positions Value" value={formatCredits(portfolio.positionsValue)} />
          <Stat label="Total P&L" value={signed(portfolio.totalUnrealizedPnl + portfolio.totalRealizedPnl)} tone={pnlColor(portfolio.totalUnrealizedPnl + portfolio.totalRealizedPnl)} />
        </section>

        <Card>
          <CardHeader title="Open positions" subtitle={`${portfolio.positions.length} positions`} />
          {portfolio.positions.length === 0 ? (
            <div className="p-4"><EmptyState title="No open positions" hint="Buy shares in a market to get started." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted">
                  <tr className="border-b border-line">
                    <th className="px-4 py-2 font-medium">Market</th>
                    <th className="px-4 py-2 font-medium">Outcome</th>
                    <th className="px-4 py-2 text-right font-medium">Qty</th>
                    <th className="px-4 py-2 text-right font-medium">Avg</th>
                    <th className="px-4 py-2 text-right font-medium">Price</th>
                    <th className="px-4 py-2 text-right font-medium">Value</th>
                    <th className="px-4 py-2 text-right font-medium">Unrealized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {portfolio.positions.map((p) => (
                    <tr key={p.outcomeId} className="hover:bg-ink-700">
                      <td className="px-4 py-2.5">
                        <Link href={`/markets/${p.marketId}`} className="text-gray-200 hover:text-white">{p.marketTitle}</Link>
                      </td>
                      <td className="px-4 py-2.5"><Badge tone="muted">{p.outcomeLabel}</Badge></td>
                      <td className="px-4 py-2.5 text-right tabular text-gray-200">{p.quantity}</td>
                      <td className="px-4 py-2.5 text-right tabular text-muted">{p.avgCostCents}¢</td>
                      <td className="px-4 py-2.5 text-right tabular text-white">{p.priceCents}¢</td>
                      <td className="px-4 py-2.5 text-right tabular text-white">{formatCredits(p.marketValue)}</td>
                      <td className={cn("px-4 py-2.5 text-right tabular font-medium", pnlColor(p.unrealizedPnl))}>{signed(p.unrealizedPnl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Trade history" subtitle={`${portfolio.trades.length} trades`} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">Market</th>
                  <th className="px-4 py-2 font-medium">Outcome</th>
                  <th className="px-4 py-2 font-medium">Side</th>
                  <th className="px-4 py-2 text-right font-medium">Shares</th>
                  <th className="px-4 py-2 text-right font-medium">Price</th>
                  <th className="px-4 py-2 text-right font-medium">Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {portfolio.trades.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-700">
                    <td className="px-4 py-2.5 text-muted">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-2.5 text-gray-200">{t.marketTitle}</td>
                    <td className="px-4 py-2.5 text-gray-200">{t.outcomeLabel}</td>
                    <td className="px-4 py-2.5"><Badge tone={t.side === "BUY" ? "yes" : "no"}>{t.side}</Badge></td>
                    <td className="px-4 py-2.5 text-right tabular text-gray-200">{t.shares}</td>
                    <td className="px-4 py-2.5 text-right tabular text-gray-200">{t.priceCents}¢</td>
                    <td className="px-4 py-2.5 text-right tabular text-white">{formatCredits(t.cash)}</td>
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
