"use client";

import { useMemo, useState } from "react";
import { MarketVM } from "@/lib/data/types";
import { MarketState } from "@/lib/trading/types";
import { quote } from "@/lib/trading/engine";
import { buttonClass } from "@/components/ui";
import { previewTrade } from "@/lib/demo/actions";
import { cn } from "@/lib/utils";

/**
 * Trading ticket. Live quote preview is computed client-side with the SAME pure
 * LMSR engine the server uses, so what the user sees matches the server fill
 * (the server re-validates and is authoritative).
 */
export function OrderTicket({ market }: { market: MarketVM }) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [outcomeId, setOutcomeId] = useState(market.outcomes[0]?.id ?? "");
  const [shares, setShares] = useState(10);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const state: MarketState = useMemo(
    () => ({
      marketId: market.id,
      kind: market.kind,
      liquidity: market.liquidity,
      outcomes: market.outcomes.map((o) => ({ outcomeId: o.id, shares: o.shares }))
    }),
    [market]
  );

  const preview = useMemo(() => {
    if (!outcomeId || !shares || shares <= 0) return null;
    try {
      return quote(state, outcomeId, side, Math.trunc(shares));
    } catch {
      return null;
    }
  }, [state, outcomeId, side, shares]);

  const closed = market.status !== "open" || new Date(market.closesAt).getTime() <= Date.now();

  function onSubmit() {
    const res = previewTrade({ marketId: market.id, outcomeId, side, shares: Math.trunc(shares) });
    setResult({ ok: res.ok, message: res.message });
  }

  const selected = market.outcomes.find((o) => o.id === outcomeId);

  return (
    <div className="rounded-xl border border-line bg-ink-800 p-4">
      <div className="mb-3 text-sm font-semibold text-body">Order ticket</div>

      {/* Side toggle */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-ink-700 p-1">
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium transition-colors",
              side === s ? (s === "BUY" ? "bg-yes/20 text-yes" : "bg-no/20 text-no") : "text-muted"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Outcome selector */}
      <label className="mb-1 block text-xs text-muted">Outcome</label>
      <select
        value={outcomeId}
        onChange={(e) => setOutcomeId(e.target.value)}
        className="mb-3 w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body"
      >
        {market.outcomes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label} — {o.priceCents}¢
          </option>
        ))}
      </select>

      {/* Shares */}
      <label className="mb-1 block text-xs text-muted">Shares</label>
      <div className="mb-3 flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={shares}
          onChange={(e) => setShares(Math.max(0, Math.trunc(Number(e.target.value))))}
          className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-body tabular"
        />
        {[10, 25, 100].map((n) => (
          <button key={n} onClick={() => setShares(n)} className="rounded-md bg-ink-600 px-2 py-2 text-xs text-slate-700 hover:bg-ink-500">
            {n}
          </button>
        ))}
      </div>

      {/* Quote */}
      <div className="mb-3 space-y-1.5 rounded-lg border border-line bg-ink-900 px-3 py-2.5 text-sm">
        <Row label="Current price" value={`${selected?.priceCents ?? "—"}¢`} />
        <Row label="Avg fill price" value={preview ? `${preview.avgPriceCents.toFixed(1)}¢` : "—"} />
        <Row
          label={side === "BUY" ? "Est. cost" : "Est. proceeds"}
          value={preview ? `${preview.cash.toLocaleString()} cr` : "—"}
          strong
        />
        <Row label="Max payout if wins" value={preview ? `${(Math.trunc(shares) * 100).toLocaleString()} cr` : "—"} />
      </div>

      <button
        onClick={onSubmit}
        disabled={closed || !preview}
        className={cn(buttonClass(side === "BUY" ? "yes" : "no"), "w-full")}
      >
        {closed ? "Market closed" : `${side} ${Math.trunc(shares) || 0} shares`}
      </button>

      {result && (
        <p className={cn("mt-3 rounded-lg px-3 py-2 text-xs", result.ok ? "bg-yes/10 text-yes" : "bg-no/10 text-no")}>
          {result.message}
        </p>
      )}

      <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
        Play credits only. Winning shares settle at 100 credits; losing shares at 0.
      </p>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={cn("tabular", strong ? "font-semibold text-body" : "text-slate-700")}>{value}</span>
    </div>
  );
}
