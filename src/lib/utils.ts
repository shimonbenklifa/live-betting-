import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const day = 86_400_000;
  const hr = 3_600_000;
  if (abs >= day) return `${diff < 0 ? "-" : ""}${Math.round(abs / day)}d`;
  if (abs >= hr) return `${diff < 0 ? "-" : ""}${Math.round(abs / hr)}h`;
  return `${diff < 0 ? "-" : ""}${Math.max(1, Math.round(abs / 60000))}m`;
}

export function pnlColor(value: number): string {
  if (value > 0) return "text-yes";
  if (value < 0) return "text-no";
  return "text-muted";
}

export function signed(value: number): string {
  const s = new Intl.NumberFormat("en-US").format(Math.abs(Math.round(value)));
  return value < 0 ? `-${s}` : `+${s}`;
}
