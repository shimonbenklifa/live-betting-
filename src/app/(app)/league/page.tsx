import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader } from "@/components/ui";
import { MarketCard } from "@/components/market/MarketCard";
import { getCurrentUser, getGames, getLeague, getMarkets, getPortfolio } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function LeagueHomePage() {
  const [user, league, portfolio, games, gameMarkets, futures] = await Promise.all([
    getCurrentUser(),
    getLeague(),
    getPortfolio(),
    getGames(),
    getMarkets({ scope: "GAME" }),
    getMarkets({ scope: "FUTURES" })
  ]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title={league.name} subtitle={league.description} cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <Card>
          <CardHeader title="Schedule" subtitle={`${games.length} games`} />
          <div className="divide-y divide-line">
            {games.map((g) => (
              <Link key={g.id} href={`/games/${g.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-ink-700">
                <div className="flex items-center gap-3">
                  <div className="w-16 text-xs text-muted">Wk {g.week}</div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {g.awayTeam.name} <span className="text-muted">@</span> {g.homeTeam.name}
                    </div>
                    <div className="text-xs text-muted">{formatDateTime(g.startsAt)} · {g.venue}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.status === "final" ? (
                    <Badge tone="muted">Final {g.awayScore}-{g.homeScore}</Badge>
                  ) : (
                    <Badge tone={g.status === "live" ? "no" : "default"}>{g.status}</Badge>
                  )}
                  <Badge tone="brand">{g.marketCount} mkts</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white">Game markets</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gameMarkets.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Futures markets</h2>
            <Link href="/futures" className="text-xs text-brand hover:underline">All futures →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {futures.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
