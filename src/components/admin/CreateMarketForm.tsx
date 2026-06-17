"use client";

import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui";
import { createMarket } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export function CreateMarketForm() {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"BINARY" | "MULTI" | "RANKED">("BINARY");
  const [scope, setScope] = useState<"GAME" | "FUTURES">("GAME");
  const [outcomes, setOutcomes] = useState("YES\nNO");
  const [closesAt, setClosesAt] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function submit() {
    setResult(null);
    start(async () => {
      const res = await createMarket({ title, kind, scope, outcomes: outcomes.split("\n"), closesAt });
      setResult(res);
      if (res.ok) setTitle("");
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-muted">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Titans win by 5+" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Kind</label>
          <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white">
            <option value="BINARY">Binary (YES/NO)</option>
            <option value="MULTI">Multiple choice</option>
            <option value="RANKED">Ranked result</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Scope</label>
          <select value={scope} onChange={(e) => setScope(e.target.value as typeof scope)} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white">
            <option value="GAME">Game</option>
            <option value="FUTURES">Futures</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Closes at</label>
          <input type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Outcomes (one per line)</label>
        <textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={4} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white font-mono" />
      </div>
      <button onClick={submit} disabled={pending} className={buttonClass("primary")}>{pending ? "Creating…" : "Create market"}</button>
      {result && <p className={cn("rounded-lg px-3 py-2 text-xs", result.ok ? "bg-yes/10 text-yes" : "bg-no/10 text-no")}>{result.message}</p>}
    </div>
  );
}
