import { Sidebar, MobileNav } from "@/components/layout/Nav";
import { config } from "@/lib/config";
import { getCurrentUser, getLeague, getPortfolio } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, league, portfolio] = await Promise.all([getCurrentUser(), getLeague(), getPortfolio()]);

  return (
    <div className="flex min-h-screen">
      <Sidebar appName={config.appName} />
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Pass shared context down via a thin provider-less pattern: pages read their own data. */}
        <div className="flex-1" data-user={user.displayName} data-cash={portfolio.cash} data-league={league.name}>
          {children}
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
