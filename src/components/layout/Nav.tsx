"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/league", label: "League", icon: "◎" },
  { href: "/futures", label: "Futures", icon: "★" },
  { href: "/stats", label: "Stats", icon: "≡" },
  { href: "/teams", label: "Teams", icon: "⛨" },
  { href: "/portfolio", label: "Portfolio", icon: "❖" },
  { href: "/leaderboard", label: "Leaderboard", icon: "♛" },
  { href: "/admin", label: "Admin", icon: "⚙" }
];

export function Sidebar({ appName }: { appName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-ink-800 px-3 py-4 md:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">L</span>
        <span className="text-sm font-semibold text-white">{appName}</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-ink-600 text-white" : "text-muted hover:bg-ink-700 hover:text-gray-200"
              )}
            >
              <span className="w-4 text-center text-xs opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 rounded-lg border border-line bg-ink-700 px-3 py-2 text-[11px] leading-relaxed text-muted">
        <span className="font-medium text-warn">Play-money only.</span> No deposits, withdrawals, or cash payouts.
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t border-line bg-ink-800 py-2 md:hidden">
      {NAV.slice(0, 6).map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-0.5 px-2 text-[10px]", active ? "text-brand" : "text-muted")}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
