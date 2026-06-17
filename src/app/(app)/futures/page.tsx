import { TopBar } from "@/components/layout/TopBar";
import { MarketCard } from "@/components/market/MarketCard";
import { Badge } from "@/components/ui";
import { getCurrentUser, getMarkets, getPortfolio } from "@/lib/data";

export default async function FuturesPage() {
  const [user, portfolio, futures] = await Promise.all([getCurrentUser(), getPortfolio(), getMarkets({ scope: "FUTURES" })]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Futures & Awards" subtitle="Season-long, multi-outcome markets" cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-4 px-4 py-5 md:px-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">League Champion</Badge>
          <Badge tone="brand">MVP</Badge>
          <Badge tone="brand">Leading Scorer</Badge>
          <Badge tone="muted">Multi-outcome · settles after the season</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {futures.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
