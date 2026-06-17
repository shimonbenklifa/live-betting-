import { AdminSidebar, AdminMobileNav } from "@/components/layout/AdminNav";
import { config } from "@/lib/config";
import { getCurrentUser } from "@/lib/data";
import { Card } from "@/components/ui";
import Link from "next/link";
import { buttonClass } from "@/components/ui";

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Server-side role guard. Only league admins/owners reach the admin portal.
  if (!user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900 px-6">
        <Card className="max-w-sm p-6 text-center">
          <h1 className="text-lg font-semibold text-body">Admins only</h1>
          <p className="mt-1 text-sm text-muted">
            The Admin Portal is restricted to league administrators. Head back to the member experience.
          </p>
          <Link href="/dashboard" className={`${buttonClass("primary")} mt-4 w-full`}>
            Go to Member Portal
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar appName={config.appName} />
      <div className="flex min-h-screen flex-1 flex-col bg-ink-900">
        <div className="flex-1">{children}</div>
        <AdminMobileNav />
      </div>
    </div>
  );
}
