import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, Stat, Badge, ButtonLink, EmptyState } from "@/components/ui";
import { MarketCard } from "@/components/market/MarketCard";
import { getCurrentUser, getGames, getLeaderboard, getLeague, getMarkets, getPortfolio } from "@/lib/data";
import { formatCredits } from "@/lib/money";
import { cn, formatDateTime, pnlColor, signed } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, league, portfolio, games, markets, leaderboard] = await Promise.all([
    getCurrentUser(),
    getLeague(),
    getPortfolio(),
    getGames(),
    getMarkets(),
    getLeaderboard()
  ]);

  const upcoming = games.filter((g) => g.status !== "final").slice(0, 4);
  const featured = markets.slice(0, 6);
  const myRank = leaderboard.find((r) => r.displayName === "You")?.rank ?? "—";

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Dashboard" subtitle={`${league.name} · Season ${league.season}`} cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Portfolio Value" value={formatCredits(portfolio.totalValue)} sub={`${formatCredits(portfolio.cash)} cash`} />
          <Stat label="Unrealized P&L" value={signed(portfolio.totalUnrealizedPnl)} tone={pnlColor(portfolio.totalUnrealizedPnl)} />
          <Stat label="Realized P&L" value={signed(portfolio.totalRealizedPnl)} tone={pnlColor(portfolio.totalRealizedPnl)} />
          <Stat label="League Rank" value={`#${myRank}`} sub={`of ${league.memberCount} members`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-body">Featured markets</h2>
              <Link href="/league" className="text-xs text-brand hover:underline">View all →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {featured.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Upcoming games" action={<ButtonLink href="/league" variant="ghost" className="text-xs">All</ButtonLink>} />
              <div className="divide-y divide-line">
                {upcoming.length === 0 && <div className="p-4"><EmptyState title="No upcoming games" /></div>}
                {upcoming.map((g) => (
                  <Link key={g.id} href={`/games/${g.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-ink-700">
                    <div>
                      <div className="text-sm font-medium text-body">{g.awayTeam.abbreviation} @ {g.homeTeam.abbreviation}</div>
                      <div className="text-xs text-muted">{formatDateTime(g.startsAt)} · {g.venue}</div>
                    </div>
                    <Badge tone="muted">{g.marketCount} mkts</Badge>
                  </Link>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Leaderboard" action={<ButtonLink href="/leaderboard" variant="ghost" className="text-xs">Full</ButtonLink>} />
              <div className="divide-y divide-line">
                {leaderboard.slice(0, 5).map((r) => (
                  <div key={r.userId} className={cn("flex items-center justify-between px-4 py-2.5", r.displayName === "You" && "bg-brand/5")}>
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs text-muted">{r.rank}</span>
                      <span className="text-sm text-slate-700">{r.displayName}</span>
                    </div>
                    <span className="tabular text-sm font-medium text-body">{formatCredits(r.totalValue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
