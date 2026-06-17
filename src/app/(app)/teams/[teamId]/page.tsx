import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader, Stat } from "@/components/ui";
import { getCurrentUser, getGames, getPortfolio, getRoster, getTeam } from "@/lib/data";
import { DEMO_TEAMS } from "@/lib/demo/data";
import { formatDateTime } from "@/lib/utils";

export function generateStaticParams() {
  return DEMO_TEAMS.map((t) => ({ teamId: t.id }));
}

export default async function TeamPage({ params }: { params: { teamId: string } }) {
  const [user, portfolio, team] = await Promise.all([getCurrentUser(), getPortfolio(), getTeam(params.teamId)]);
  if (!team) notFound();
  const [roster, games] = await Promise.all([getRoster(team.id), getGames()]);
  const teamGames = games.filter((g) => g.homeTeam.id === team.id || g.awayTeam.id === team.id);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title={team.name} subtitle={`${team.division} Division · Captain ${team.captainName}`} cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Record" value={`${team.wins}-${team.losses}`} />
          <Stat label="Points For" value={team.pointsFor} />
          <Stat label="Points Against" value={team.pointsAgainst} />
          <Stat label="Differential" value={(team.pointsFor - team.pointsAgainst > 0 ? "+" : "") + (team.pointsFor - team.pointsAgainst)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Roster" subtitle={`${roster.length} players`} />
            <div className="divide-y divide-line">
              {roster.map((p) => (
                <Link key={p.id} href={`/players/${p.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-ink-700">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center tabular text-sm text-muted">#{p.jerseyNumber}</span>
                    <span className="text-sm font-medium text-gray-200">{p.firstName} {p.lastName}</span>
                    <Badge tone="muted">{p.position}</Badge>
                    {p.status !== "active" && <Badge tone="warn">{p.status}</Badge>}
                  </div>
                  <span className="tabular text-sm text-white">{p.stats.points} ppg</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Schedule" />
            <div className="divide-y divide-line">
              {teamGames.map((g) => (
                <Link key={g.id} href={`/games/${g.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-ink-700">
                  <span className="text-sm text-gray-200">{g.awayTeam.abbreviation} @ {g.homeTeam.abbreviation}</span>
                  <span className="text-xs text-muted">{g.status === "final" ? `Final ${g.awayScore}-${g.homeScore}` : formatDateTime(g.startsAt)}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
