import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getCurrentUser, getPortfolio, getStatLeaderboards } from "@/lib/data";

export default async function StatsPage() {
  const [user, portfolio, boards] = await Promise.all([getCurrentUser(), getPortfolio(), getStatLeaderboards()]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Stat Leaders" subtitle="League leaders by category" cash={portfolio.cash} userName={user.displayName} />
      <div className="grid gap-4 px-4 py-5 md:grid-cols-2 md:px-6 lg:grid-cols-3">
        {boards.map((b) => (
          <Card key={b.category}>
            <CardHeader title={b.category} action={b.locked ? <Badge tone="warn">Locked</Badge> : <Badge tone="muted">Live</Badge>} />
            <div className="divide-y divide-line">
              {b.entries.map((e) => (
                <div key={e.playerId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-4 text-center text-xs text-muted">{e.rank}</span>
                    <div>
                      <Link href={`/players/${e.playerId}`} className="font-medium text-slate-700 hover:text-body">{e.playerName}</Link>
                      <div className="text-xs text-muted">{e.teamName}</div>
                    </div>
                  </div>
                  <span className="tabular font-semibold text-body">{e.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
