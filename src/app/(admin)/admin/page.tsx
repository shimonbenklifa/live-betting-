import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, CardHeader } from "@/components/ui";
import { getAuditLog, getCurrentUser, getMarkets, getPortfolio } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

const TOOLS = [
  { href: "/admin/import", title: "Bulk Import Center", desc: "Upload teams, rosters, schedule, stats via CSV/XLSX", icon: "⤴" },
  { href: "/admin/resolve", title: "Market Resolution", desc: "Resolve markets & award futures with audit trail", icon: "✓" },
  { href: "/admin/markets", title: "Create Market", desc: "Binary, multiple-choice and ranked markets", icon: "＋" },
  { href: "/admin/balances", title: "Adjust Balances", desc: "Credit adjustments require a reason", icon: "±" }
];

export default async function AdminPage() {
  const [user, portfolio, audit, markets] = await Promise.all([
    getCurrentUser(),
    getPortfolio(),
    getAuditLog(),
    getMarkets()
  ]);

  if (!user.isAdmin) {
    return (
      <div>
        <TopBar title="Admin" cash={portfolio.cash} userName={user.displayName} />
        <div className="p-6"><Card className="p-6 text-sm text-muted">You don&apos;t have admin access to this league.</Card></div>
      </div>
    );
  }

  const openMarkets = markets.filter((m) => m.status === "open").length;

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Admin Console" subtitle="League setup, markets, settlement & audit" cash={portfolio.cash} userName={user.displayName} />
      <div className="space-y-6 px-4 py-5 md:px-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="group">
              <Card className="h-full p-4 transition-colors group-hover:border-brand/40">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">{t.icon}</div>
                <div className="text-sm font-semibold text-body">{t.title}</div>
                <div className="mt-1 text-xs text-muted">{t.desc}</div>
              </Card>
            </Link>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4"><div className="text-xs uppercase text-muted">Open markets</div><div className="mt-1 text-2xl font-semibold text-body tabular">{openMarkets}</div></Card>
          <Card className="p-4"><div className="text-xs uppercase text-muted">Total markets</div><div className="mt-1 text-2xl font-semibold text-body tabular">{markets.length}</div></Card>
          <Card className="p-4"><div className="text-xs uppercase text-muted">Compliance</div><div className="mt-1 text-sm font-semibold text-warn">Real money disabled</div></Card>
        </section>

        <Card>
          <CardHeader title="Admin audit log" subtitle="Every financial-like action is recorded" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">Actor</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {audit.map((a) => (
                  <tr key={a.id} className="hover:bg-ink-700">
                    <td className="px-4 py-2.5 text-muted">{formatDateTime(a.createdAt)}</td>
                    <td className="px-4 py-2.5 text-slate-700">{a.actor}</td>
                    <td className="px-4 py-2.5"><Badge tone="brand">{a.action}</Badge></td>
                    <td className="px-4 py-2.5 text-xs text-muted">{JSON.stringify(a.detail)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
