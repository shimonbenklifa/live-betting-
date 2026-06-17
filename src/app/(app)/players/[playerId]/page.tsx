import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader, Stat } from "@/components/ui";
import { getCurrentUser, getPlayer, getPortfolio } from "@/lib/data";

export default async function PlayerPage({ params }: { params: { playerId: string } }) {
  const [user, portfolio, player] = await Promise.all([getCurrentUser(), getPortfolio(), getPlayer(params.playerId)]);
  if (!player) notFound();
  const s = player.stats;

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title={`${player.firstName} ${player.lastName}`} subtitle={`${player.position} · #${player.jerseyNumber}`} cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-600 text-xl font-bold text-white">{player.jerseyNumber}</div>
          <div>
            <h1 className="text-xl font-semibold text-white">{player.firstName} {player.lastName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Link href={`/teams/${player.teamId}`} className="text-sm text-brand hover:underline">{player.teamName}</Link>
              <Badge tone="muted">{player.position}</Badge>
              <Badge tone={player.status === "active" ? "yes" : "warn"}>{player.status}</Badge>
            </div>
          </div>
        </Card>

        <CardHeader title="Season stats" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="PPG" value={s.points} />
          <Stat label="APG" value={s.assists} />
          <Stat label="RPG" value={s.rebounds} />
          <Stat label="SPG" value={s.steals} />
          <Stat label="BPG" value={s.blocks} />
          <Stat label="GP" value={s.gamesPlayed} />
        </div>
      </div>
    </div>
  );
}
