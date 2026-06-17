import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui";
import { getCurrentUser, getPortfolio, getTeams } from "@/lib/data";

export default async function TeamsPage() {
  const [user, portfolio, teams] = await Promise.all([getCurrentUser(), getPortfolio(), getTeams()]);

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Teams & Standings" subtitle="Records, divisions and rosters" cash={portfolio.cash} userName={user.displayName} />
      <div className="px-4 py-5 md:px-6">
        <Card>
          <CardHeader title="Standings" subtitle="Ranked by wins" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-medium">Team</th>
                  <th className="px-4 py-2 font-medium">Div</th>
                  <th className="px-4 py-2 text-right font-medium">W</th>
                  <th className="px-4 py-2 text-right font-medium">L</th>
                  <th className="px-4 py-2 text-right font-medium">PCT</th>
                  <th className="px-4 py-2 text-right font-medium">PF</th>
                  <th className="px-4 py-2 text-right font-medium">PA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {teams.map((t) => {
                  const pct = t.wins + t.losses > 0 ? (t.wins / (t.wins + t.losses)).toFixed(3).slice(1) : ".000";
                  return (
                    <tr key={t.id} className="hover:bg-ink-700">
                      <td className="px-4 py-2.5">
                        <Link href={`/teams/${t.id}`} className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ backgroundColor: t.homeColor }}>{t.abbreviation}</span>
                          <span className="font-medium text-slate-700">{t.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{t.division}</td>
                      <td className="px-4 py-2.5 text-right tabular text-body">{t.wins}</td>
                      <td className="px-4 py-2.5 text-right tabular text-slate-700">{t.losses}</td>
                      <td className="px-4 py-2.5 text-right tabular text-slate-700">{pct}</td>
                      <td className="px-4 py-2.5 text-right tabular text-muted">{t.pointsFor}</td>
                      <td className="px-4 py-2.5 text-right tabular text-muted">{t.pointsAgainst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
