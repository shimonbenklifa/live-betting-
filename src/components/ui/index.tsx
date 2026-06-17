import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-line bg-ink-800 shadow-card", className)}>{children}</div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div>
        <h3 className="text-sm font-semibold text-body">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type BadgeTone = "default" | "yes" | "no" | "warn" | "brand" | "muted";
const badgeTones: Record<BadgeTone, string> = {
  default: "bg-ink-600 text-slate-700 ring-1 ring-inset ring-line",
  yes: "bg-yes-50 text-yes ring-1 ring-inset ring-yes/20",
  no: "bg-no-50 text-no ring-1 ring-inset ring-no/20",
  warn: "bg-warn-50 text-warn ring-1 ring-inset ring-warn/20",
  brand: "bg-brand-50 text-brand ring-1 ring-inset ring-brand/20",
  muted: "bg-ink-700 text-muted ring-1 ring-inset ring-line"
};

export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-ink-800 px-4 py-3 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tabular text-body", tone)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function ProbabilityBar({ probability, label }: { probability: number; label?: string }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="w-full">
      {label && <div className="mb-1 flex justify-between text-xs text-muted"><span>{label}</span><span className="tabular">{pct}%</span></div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-600">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ButtonLink({ href, children, variant = "primary", className }: { href: string; children: ReactNode; variant?: "primary" | "ghost" | "outline"; className?: string }) {
  return (
    <Link href={href} className={cn(buttonClass(variant), className)}>
      {children}
    </Link>
  );
}

export function buttonClass(variant: "primary" | "ghost" | "outline" | "yes" | "no" = "primary") {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-600",
    ghost: "text-slate-700 hover:bg-ink-600",
    outline: "border border-line text-slate-700 hover:bg-ink-600",
    yes: "bg-yes/15 text-yes hover:bg-yes/25 border border-yes/30",
    no: "bg-no/15 text-no hover:bg-no/25 border border-no/30"
  };
  return cn(base, variants[variant]);
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-ink-800/50 px-6 py-10 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
