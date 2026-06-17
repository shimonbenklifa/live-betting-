import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui";
import { AdjustBalanceForm } from "@/components/admin/AdjustBalanceForm";
import { getCurrentUser, getLeaderboard, getPortfolio } from "@/lib/data";

export default async function BalancesPage() {
  const [user, portfolio, board] = await Promise.all([getCurrentUser(), getPortfolio(), getLeaderboard()]);
  const members = board.map((r) => ({ userId: r.userId, displayName: r.displayName }));

  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Adjust Balances" subtitle="Manual credit adjustments — reason required & audited" cash={portfolio.cash} userName={user.displayName} />
      <div className="px-4 py-5 md:px-6">
        <Card className="max-w-2xl">
          <CardHeader title="Play-credit adjustment" subtitle="Posts an ADMIN_ADJUSTMENT ledger entry and an audit-log record" />
          <div className="p-4"><AdjustBalanceForm members={members} /></div>
        </Card>
      </div>
    </div>
  );
}
