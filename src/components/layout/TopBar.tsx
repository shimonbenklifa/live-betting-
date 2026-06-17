import { formatCredits } from "@/lib/money";
import { Badge } from "@/components/ui";

export function TopBar({ title, subtitle, cash, userName }: { title: string; subtitle?: string; cash: number; userName: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-ink-900/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-white md:text-lg">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-[10px] uppercase tracking-wide text-muted">Credits</div>
          <div className="tabular text-sm font-semibold text-yes">{formatCredits(cash)}</div>
        </div>
        <Badge tone="muted">DEMO</Badge>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-600 text-xs font-medium text-white">
          {userName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
