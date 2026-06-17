import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card } from "@/components/ui";
import { MarketCard } from "@/components/market/MarketCard";
import { getCurrentUser, getGame, getMarkets, getPortfolio } from "@/lib/data";
import { DEMO_GAMES } from "@/lib/demo/data";
import { formatDateTime } from "@/lib/utils";

export function generateStaticParams() {
  return DEMO_GAMES.map((g) => ({ gameId: g.id }));
}

export default async function GameDetailPage({ params }: { params: { gameId: string } }) {
  const [user, portfolio, game] = await Promise.all([getCurrentUser(), getPortfolio(), getGame(params.gameId)]);
  if (!game) notFound();
  const markets = await getMarkets({ gameId: game.id });

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Game" subtitle={`${game.awayTeam.name} @ ${game.homeTeam.name}`} cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <TeamBlock name={game.awayTeam.name} abbr={game.awayTeam.abbreviation} color={game.awayTeam.homeColor} record={`${game.awayTeam.wins}-${game.awayTeam.losses}`} score={game.awayScore} />
            <div className="text-center">
              <div className="text-xs text-muted">{game.status === "final" ? "Final" : formatDateTime(game.startsAt)}</div>
              <div className="my-1 text-2xl font-bold text-muted">@</div>
              <Badge tone="muted">Wk {game.week} · {game.venue}</Badge>
            </div>
            <TeamBlock name={game.homeTeam.name} abbr={game.homeTeam.abbreviation} color={game.homeTeam.homeColor} record={`${game.homeTeam.wins}-${game.homeTeam.losses}`} score={game.homeScore} alignRight />
          </div>
        </Card>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white">Markets for this game</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>

        <div className="flex gap-3 text-xs text-muted">
          <Link href={`/teams/${game.awayTeam.id}`} className="text-brand hover:underline">{game.awayTeam.name} →</Link>
          <Link href={`/teams/${game.homeTeam.id}`} className="text-brand hover:underline">{game.homeTeam.name} →</Link>
        </div>
      </div>
    </div>
  );
}

function TeamBlock({ name, abbr, color, record, score, alignRight }: { name: string; abbr: string; color: string; record: string; score: number | null; alignRight?: boolean }) {
  return (
    <div className={`flex flex-1 items-center gap-3 ${alignRight ? "flex-row-reverse text-right" : ""}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: color }}>
        {abbr}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{name}</div>
        <div className="text-xs text-muted tabular">{record}{score != null ? ` · ${score} pts` : ""}</div>
      </div>
    </div>
  );
}
