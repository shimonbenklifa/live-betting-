import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { ResolveForm } from "@/components/admin/ResolveForm";
import { getCurrentUser, getMarkets, getPortfolio } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function ResolvePage() {
  const [user, portfolio, markets] = await Promise.all([getCurrentUser(), getPortfolio(), getMarkets()]);
  const openMarkets = markets.filter((m) => m.status === "open");

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Market Resolution" subtitle="Settle markets — winners 100¢, losers 0¢, fully audited" cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-4 px-4 py-5 md:px-6">
        <Card className="border-warn/30 bg-warn/5 p-4 text-xs text-warn">
          Resolving a market is irreversible: it credits every winning position, books realized P&amp;L, writes a
          settlement ledger entry per winner, and logs the action. Make sure stats are locked and the result is final.
        </Card>

        {openMarkets.length === 0 ? (
          <EmptyState title="No open markets to resolve" />
        ) : (
          openMarkets.map((m) => (
            <Card key={m.id}>
              <CardHeader
                title={m.title}
                subtitle={`${m.scope === "FUTURES" ? "Futures" : m.gameLabel} · closes ${formatDateTime(m.closesAt)}`}
                action={<Badge tone="default">{m.kind}</Badge>}
              />
              <ResolveForm market={m} />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
