import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui";
import { CreateMarketForm } from "@/components/admin/CreateMarketForm";
import { getCurrentUser, getPortfolio } from "@/lib/data";

export default async function CreateMarketPage() {
  const [user, portfolio] = await Promise.all([getCurrentUser(), getPortfolio()]);
  return (
    <div className="pb-16 md:pb-0">
      <TopBar title="Create Market" subtitle="Binary, multiple-choice and ranked markets" cash={portfolio.cash} userName={user.displayName} />
      <div className="px-4 py-5 md:px-6">
        <Card className="max-w-2xl">
          <CardHeader title="New market" subtitle="Prices are seeded by the LMSR market maker on creation" />
          <div className="p-4"><CreateMarketForm /></div>
        </Card>
      </div>
    </div>
  );
}
