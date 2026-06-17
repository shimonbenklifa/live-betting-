import Link from "next/link";
import { MarketVM } from "@/lib/data/types";
import { Badge, Card } from "@/components/ui";
import { Sparkline } from "@/components/charts/PriceChart";
import { priceHistory, SERIES_COLORS } from "@/lib/demo/history";
import { formatDateTime } from "@/lib/utils";

export function MarketCard({ market }: { market: MarketVM }) {
  const sorted = [...market.outcomes].sort((a, b) => b.priceCents - a.priceCents);
  const isBinary = market.kind === "BINARY";
  const leader = sorted[0];

  return (
    <Link href={`/markets/${market.id}`} className="group block">
      <Card className="flex h-full flex-col p-4 transition-shadow hover:shadow-pop">
        <div className="mb-3 flex items-center gap-2">
          {market.scope === "FUTURES" ? <Badge tone="brand">FUTURES</Badge> : <Badge tone="muted">{market.gameLabel}</Badge>}
          {market.status !== "open" && <Badge tone="warn">{market.status}</Badge>}
        </div>
        <h3 className="mb-3 text-[15px] font-semibold leading-snug text-body">{market.title}</h3>

        {isBinary ? (
          <div className="grid grid-cols-2 gap-2">
            {sorted.map((o) => {
              const positive = o.label === "YES" || o.label === "OVER";
              return (
                <div
                  key={o.id}
                  className={`rounded-lg border px-3 py-2 ${positive ? "border-yes/25 bg-yes-50" : "border-no/25 bg-no-50"}`}
                >
                  <div className={`text-[11px] font-semibold uppercase ${positive ? "text-yes" : "text-no"}`}>{o.label}</div>
                  <div className="tabular text-xl font-semibold text-body">{o.priceCents}¢</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.slice(0, 3).map((o, i) => (
              <div key={o.id} className="text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-slate-700">{o.label}</span>
                  <span className="tabular font-semibold text-body">{o.priceCents}¢</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-600">
                  <div className="h-full rounded-full" style={{ width: `${o.priceCents}%`, backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                </div>
              </div>
            ))}
            {sorted.length > 3 && <div className="text-xs text-muted">+{sorted.length - 3} more outcomes</div>}
          </div>
        )}

        {/* Trend sparkline of the leading outcome */}
        <div className="mt-3 -mx-1">
          <Sparkline points={priceHistory(leader.id, leader.priceCents)} color={SERIES_COLORS[0]} width={320} height={40} />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-2 text-[11px] text-muted">
          <span className="tabular">Vol {market.volume.toLocaleString()}</span>
          <span>Closes {formatDateTime(market.closesAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
