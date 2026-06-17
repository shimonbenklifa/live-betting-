import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader, ProbabilityBar } from "@/components/ui";
import { OrderTicket } from "@/components/market/OrderTicket";
import { getCurrentUser, getMarket, getPortfolio } from "@/lib/data";
import { DEMO_MARKETS } from "@/lib/demo/data";
import { formatDateTime } from "@/lib/utils";

export function generateStaticParams() {
  return DEMO_MARKETS.map((m) => ({ marketId: m.id }));
}

export default async function MarketDetailPage({ params }: { params: { marketId: string } }) {
  const [user, portfolio, market] = await Promise.all([getCurrentUser(), getPortfolio(), getMarket(params.marketId)]);
  if (!market) notFound();

  const sorted = [...market.outcomes].sort((a, b) => b.priceCents - a.priceCents);
  const myPositions = portfolio.positions.filter((p) => p.marketId === market.id);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Market" subtitle={market.title} cash={portfolio.cash} userName={user.displayName} />
      <div className="grid gap-6 px-4 py-5 md:px-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {market.scope === "FUTURES" ? <Badge tone="brand">FUTURES</Badge> : <Badge tone="muted">{market.gameLabel}</Badge>}
              <Badge tone="default">{market.kind}</Badge>
              <Badge tone={market.status === "open" ? "yes" : "warn"}>{market.status}</Badge>
            </div>
            <h1 className="text-xl font-semibold text-white">{market.title}</h1>
            <p className="mt-1 text-sm text-muted">{market.description}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
              <span>Closes {formatDateTime(market.closesAt)}</span>
              <span className="tabular">Volume {market.volume.toLocaleString()} shares</span>
              <span className="tabular">Liquidity b={market.liquidity}</span>
              {market.gameId && <Link href={`/games/${market.gameId}`} className="text-brand hover:underline">View game →</Link>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Outcomes" subtitle="Price in cents ≈ implied probability" />
            <div className="divide-y divide-line">
              {sorted.map((o) => (
                <div key={o.id} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{o.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted tabular">{Math.round(o.probability * 100)}%</span>
                      <span className="tabular text-base font-semibold text-white">{o.priceCents}¢</span>
                    </div>
                  </div>
                  <ProbabilityBar probability={o.probability} />
                </div>
              ))}
            </div>
          </Card>

          {myPositions.length > 0 && (
            <Card>
              <CardHeader title="Your position" />
              <div className="divide-y divide-line">
                {myPositions.map((p) => (
                  <div key={p.outcomeId} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-200">{p.outcomeLabel}</span>
                    <div className="flex items-center gap-5 tabular">
                      <span className="text-muted">{p.quantity} sh @ {p.avgCostCents}¢</span>
                      <span className={p.unrealizedPnl >= 0 ? "text-yes" : "text-no"}>
                        {p.unrealizedPnl >= 0 ? "+" : ""}{p.unrealizedPnl.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <OrderTicket market={market} />
        </div>
      </div>
    </div>
  );
}
