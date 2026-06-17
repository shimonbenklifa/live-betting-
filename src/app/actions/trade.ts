"use server";

import { isDemoMode } from "@/lib/config";
import { quote } from "@/lib/trading/engine";
import { RAW_MARKET_STATES, DEMO_LEAGUE, DEMO_USER } from "@/lib/demo/data";
import { executeTrade } from "@/lib/trading/service";

export interface TradeActionResult {
  ok: boolean;
  message: string;
  receipt?: {
    side: "BUY" | "SELL";
    shares: number;
    cash: number;
    avgPriceCents: number;
  };
}

/**
 * Submit a trade. Validates entirely server-side. In demo mode it returns a
 * simulated fill (no persistence); with a database it runs the atomic
 * `executeTrade` transaction.
 */
export async function submitTrade(input: {
  marketId: string;
  outcomeId: string;
  side: "BUY" | "SELL";
  shares: number;
}): Promise<TradeActionResult> {
  const shares = Math.trunc(Number(input.shares));
  if (!shares || shares <= 0) {
    return { ok: false, message: "Enter a whole number of shares greater than zero." };
  }
  if (input.side !== "BUY" && input.side !== "SELL") {
    return { ok: false, message: "Invalid order side." };
  }

  try {
    if (isDemoMode) {
      const state = RAW_MARKET_STATES[input.marketId];
      if (!state) return { ok: false, message: "Unknown market." };
      const q = quote(state, input.outcomeId, input.side, shares);
      return {
        ok: true,
        message:
          `Demo fill: ${input.side} ${shares} share(s) @ ~${q.avgPriceCents.toFixed(1)}¢ ` +
          `for ${q.cash.toLocaleString()} credits. (Connect a database to persist trades.)`,
        receipt: { side: input.side, shares, cash: q.cash, avgPriceCents: q.avgPriceCents }
      };
    }

    const receipt = await executeTrade({
      userId: DEMO_USER.id,
      leagueId: DEMO_LEAGUE.id,
      marketId: input.marketId,
      outcomeId: input.outcomeId,
      side: input.side,
      shares
    });
    return {
      ok: true,
      message: `Filled ${receipt.side} ${receipt.shares} @ ${receipt.avgPriceCents.toFixed(1)}¢. New balance ${receipt.newBalance.toLocaleString()}.`,
      receipt: {
        side: receipt.side,
        shares: receipt.shares,
        cash: receipt.cash,
        avgPriceCents: receipt.avgPriceCents
      }
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Trade failed." };
  }
}
