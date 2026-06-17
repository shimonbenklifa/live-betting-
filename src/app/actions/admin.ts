"use server";

import { isDemoMode } from "@/lib/config";
import { DEMO_USER } from "@/lib/demo/data";
import { resolveMarketInDb } from "@/lib/trading/resolveService";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Resolve a market to a winning outcome (admin only). */
export async function resolveMarket(input: {
  marketId: string;
  winningOutcomeId: string;
  note?: string;
}): Promise<ActionResult> {
  if (!input.winningOutcomeId) return { ok: false, message: "Select a winning outcome." };

  if (isDemoMode) {
    return {
      ok: true,
      message:
        "Demo: market would resolve — winning shares settle at 100 credits, losing shares at 0, " +
        "each payout writes a ledger entry, and the action is recorded in the audit log. " +
        "Connect a database to persist resolution."
    };
  }

  try {
    const res = await resolveMarketInDb({
      marketId: input.marketId,
      winningOutcomeId: input.winningOutcomeId,
      actorId: DEMO_USER.id,
      note: input.note
    });
    return { ok: true, message: `Resolved. Paid ${res.totalPayout.toLocaleString()} credits to ${res.winners} winner(s).` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Resolution failed." };
  }
}

/** Create a market (binary / multiple-choice / ranked). Admin only. */
export async function createMarket(input: {
  title: string;
  kind: "BINARY" | "MULTI" | "RANKED";
  scope: "GAME" | "FUTURES";
  outcomes: string[];
  closesAt: string;
}): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, message: "Market title is required." };
  const outcomes = input.outcomes.map((o) => o.trim()).filter(Boolean);
  if (outcomes.length < 2) return { ok: false, message: "A market needs at least two outcomes." };
  if (input.kind === "BINARY" && outcomes.length !== 2) {
    return { ok: false, message: "Binary markets must have exactly two outcomes (e.g. YES / NO)." };
  }
  if (!input.closesAt) return { ok: false, message: "Set a close time." };

  if (isDemoMode) {
    return { ok: true, message: `Demo: "${input.title}" (${input.kind}, ${outcomes.length} outcomes) would be created and logged. Connect a database to persist.` };
  }
  return { ok: false, message: "Market creation requires the database-backed admin service." };
}

/** Adjust a member's play-credit balance. Reason is required. */
export async function adjustBalance(input: {
  userId: string;
  delta: number;
  reason: string;
}): Promise<ActionResult> {
  if (!input.reason?.trim()) return { ok: false, message: "A reason is required for any balance adjustment." };
  if (!Number.isInteger(input.delta) || input.delta === 0) return { ok: false, message: "Enter a non-zero whole-credit amount." };

  if (isDemoMode) {
    return {
      ok: true,
      message: `Demo: would ${input.delta > 0 ? "credit" : "debit"} ${Math.abs(input.delta).toLocaleString()} credits with an ADMIN_ADJUSTMENT ledger entry and audit record.`
    };
  }
  // Production path mirrors resolveMarketInDb: postEntry + ledger + audit in a tx.
  return { ok: false, message: "Balance adjustment requires the database-backed admin service." };
}
