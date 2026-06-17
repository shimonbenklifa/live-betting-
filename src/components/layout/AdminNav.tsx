"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "▦" },
  { href: "/admin/import", label: "Bulk Import", icon: "⤴" },
  { href: "/admin/markets", label: "Create Market", icon: "＋" },
  { href: "/admin/resolve", label: "Resolve Markets", icon: "✓" },
  { href: "/admin/balances", label: "Adjust Balances", icon: "±" }
];

export function AdminSidebar({ appName }: { appName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 px-3 py-4 text-slate-300 md:flex">
      <Link href="/admin" className="mb-1 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">L</span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">{appName}</div>
          <div className="text-[10px] uppercase tracking-wide text-brand">Admin Portal</div>
        </div>
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              <span className="w-4 text-center text-xs opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
      >
        ← Member Portal
      </Link>
      <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        <span className="font-medium text-warn">Restricted.</span> Admin actions are audited. Play-money only.
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t border-slate-800 bg-slate-900 py-2 text-slate-300 md:hidden">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-0.5 px-2 text-[10px]", active ? "text-white" : "text-slate-500")}>
            <span className="text-base">{item.icon}</span>
            {item.label.split(" ")[0]}
          </Link>
        );
      })}
      <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-2 text-[10px] text-slate-500">
        <span className="text-base">←</span>
        Member
      </Link>
    </nav>
  );
}
