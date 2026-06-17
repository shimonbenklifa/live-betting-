/**
 * Client-safe demo "actions". On the static GitHub Pages build there is no
 * server, so these run entirely in the browser using the SAME pure trading
 * engine the server uses. The database-backed equivalents live in
 * `src/lib/trading/service.ts` and `resolveService.ts` for a server deployment.
 */

import { quote } from "../trading/engine";
import { RAW_MARKET_STATES } from "./data";

export interface DemoResult {
  ok: boolean;
  message: string;
}

export function previewTrade(input: {
  marketId: string;
  outcomeId: string;
  side: "BUY" | "SELL";
  shares: number;
}): DemoResult {
  const shares = Math.trunc(Number(input.shares));
  if (!shares || shares <= 0) return { ok: false, message: "Enter a whole number of shares greater than zero." };
  const state = RAW_MARKET_STATES[input.marketId];
  if (!state) return { ok: false, message: "Unknown market." };
  try {
    const q = quote(state, input.outcomeId, input.side, shares);
    return {
      ok: true,
      message:
        `Demo fill: ${input.side} ${shares} share(s) @ ~${q.avgPriceCents.toFixed(1)}¢ ` +
        `for ${q.cash.toLocaleString()} credits. (Connect a database to persist trades.)`
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Trade failed." };
  }
}

export function previewResolve(input: { winningOutcomeId: string }): DemoResult {
  if (!input.winningOutcomeId) return { ok: false, message: "Select a winning outcome." };
  return {
    ok: true,
    message:
      "Demo: market would resolve — winning shares settle at 100 credits, losing shares at 0, " +
      "each payout writes a ledger entry, and the action is recorded in the audit log. " +
      "Connect a database to persist resolution."
  };
}

export function previewCreateMarket(input: {
  title: string;
  kind: "BINARY" | "MULTI" | "RANKED";
  outcomes: string[];
}): DemoResult {
  if (!input.title.trim()) return { ok: false, message: "Market title is required." };
  const outcomes = input.outcomes.map((o) => o.trim()).filter(Boolean);
  if (outcomes.length < 2) return { ok: false, message: "A market needs at least two outcomes." };
  if (input.kind === "BINARY" && outcomes.length !== 2) {
    return { ok: false, message: "Binary markets must have exactly two outcomes (e.g. YES / NO)." };
  }
  return { ok: true, message: `Demo: "${input.title}" (${input.kind}, ${outcomes.length} outcomes) would be created and logged. Connect a database to persist.` };
}

export function previewAdjustBalance(input: { delta: number; reason: string }): DemoResult {
  if (!input.reason?.trim()) return { ok: false, message: "A reason is required for any balance adjustment." };
  const delta = Math.trunc(input.delta);
  if (!delta) return { ok: false, message: "Enter a non-zero whole-credit amount." };
  return {
    ok: true,
    message: `Demo: would ${delta > 0 ? "credit" : "debit"} ${Math.abs(delta).toLocaleString()} credits with an ADMIN_ADJUSTMENT ledger entry and audit record.`
  };
}
