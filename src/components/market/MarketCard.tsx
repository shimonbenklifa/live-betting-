import Link from "next/link";
import { MarketVM } from "@/lib/data/types";
import { Badge, Card } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export function MarketCard({ market }: { market: MarketVM }) {
  const sorted = [...market.outcomes].sort((a, b) => b.priceCents - a.priceCents);
  const isBinary = market.kind === "BINARY";

  return (
    <Link href={`/markets/${market.id}`} className="group block">
      <Card className="h-full p-4 transition-colors group-hover:border-brand/40">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="mb-1 flex items-center gap-2">
              {market.scope === "FUTURES" ? (
                <Badge tone="brand">FUTURES</Badge>
              ) : (
                <Badge tone="muted">{market.gameLabel}</Badge>
              )}
              {market.status !== "open" && <Badge tone="warn">{market.status}</Badge>}
            </div>
            <h3 className="text-sm font-semibold leading-snug text-white">{market.title}</h3>
          </div>
        </div>

        {isBinary ? (
          <div className="grid grid-cols-2 gap-2">
            {sorted.map((o) => (
              <div
                key={o.id}
                className={`rounded-lg border px-3 py-2 ${
                  o.label === "YES" || o.label === "OVER"
                    ? "border-yes/30 bg-yes/10"
                    : "border-no/30 bg-no/10"
                }`}
              >
                <div className="text-[11px] font-medium text-muted">{o.label}</div>
                <div className="tabular text-lg font-semibold text-white">{o.priceCents}¢</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {sorted.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-gray-200">{o.label}</span>
                <span className="tabular font-semibold text-white">{o.priceCents}¢</span>
              </div>
            ))}
            {sorted.length > 3 && <div className="text-xs text-muted">+{sorted.length - 3} more outcomes</div>}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[11px] text-muted">
          <span className="tabular">Vol {market.volume.toLocaleString()}</span>
          <span>Closes {formatDateTime(market.closesAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
