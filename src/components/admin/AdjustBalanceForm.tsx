"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui";
import { previewAdjustBalance } from "@/lib/demo/actions";
import { cn } from "@/lib/utils";

export function AdjustBalanceForm({ members }: { members: { userId: string; displayName: string }[] }) {
  const [userId, setUserId] = useState(members[0]?.userId ?? "");
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function submit() {
    const res = previewAdjustBalance({ delta: Math.trunc(delta), reason });
    setResult(res);
    if (res.ok) setReason("");
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Member</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white">
            {members.map((m) => <option key={m.userId} value={m.userId}>{m.displayName}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Amount (+ credit / − debit)</label>
          <input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white tabular" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Reason (required)</label>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Correcting duplicate signup grant" className="w-full rounded-lg border border-line bg-ink-700 px-3 py-2 text-sm text-white" />
      </div>
      <button onClick={submit} className={buttonClass("primary")}>Post adjustment</button>
      {result && <p className={cn("rounded-lg px-3 py-2 text-xs", result.ok ? "bg-yes/10 text-yes" : "bg-no/10 text-no")}>{result.message}</p>}
    </div>
  );
}
