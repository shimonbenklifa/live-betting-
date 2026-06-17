"use client";

import { useState, useTransition } from "react";
import { MarketVM } from "@/lib/data/types";
import { buttonClass } from "@/components/ui";
import { resolveMarket } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export function ResolveForm({ market }: { market: MarketVM }) {
  const [winner, setWinner] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function submit() {
    setResult(null);
    start(async () => {
      const res = await resolveMarket({ marketId: market.id, winningOutcomeId: winner, note });
      setResult(res);
    });
  }

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-xs text-muted">Winning outcome</label>
          <select value={winner} onChange={(e) => setWinner(e.target.value)} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white">
            <option value="">Select…</option>
            {market.outcomes.map((o) => (
              <option key={o.id} value={o.id}>{o.label} ({o.priceCents}¢)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Final 88-81" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white" />
        </div>
        <button onClick={submit} disabled={pending || !winner} className={cn(buttonClass("primary"))}>
          {pending ? "Resolving…" : "Resolve"}
        </button>
      </div>
      {result && (
        <p className={cn("rounded-lg px-3 py-2 text-xs", result.ok ? "bg-yes/10 text-yes" : "bg-no/10 text-no")}>{result.message}</p>
      )}
    </div>
  );
}
