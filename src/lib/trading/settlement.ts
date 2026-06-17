/**
 * Market settlement.
 *
 * When an admin resolves a market to a winning outcome, every holder's shares
 * settle: winning shares at 100 credits each, losing shares at 0. Each winning
 * payout produces a MARKET_SETTLEMENT ledger entry; losing positions simply
 * realise their already-debited cost basis as a loss. Pure & deterministic.
 */

import { Position } from "./types";
import { postEntry, LedgerEntryDraft } from "./wallet";
import { settlementPayout } from "./engine";

export interface Holding {
  walletId: string;
  userId: string;
  position: Position;
  /** Current wallet balance before settlement, in credits. */
  walletBalance: number;
}

export interface SettlementLine {
  walletId: string;
  userId: string;
  outcomeId: string;
  isWinner: boolean;
  sharesSettled: number;
  payout: number;
  /** Final realized P&L delta booked to the position from this settlement. */
  realizedPnlDelta: number;
  newWalletBalance: number;
  /** Present only when payout > 0. */
  ledgerEntry?: LedgerEntryDraft;
}

export interface SettlementResult {
  marketId: string;
  winningOutcomeId: string;
  resolutionId: string;
  totalPayout: number;
  lines: SettlementLine[];
}

/**
 * Compute the full settlement for a market. Does not mutate inputs; the caller
 * persists the resulting balances, position closures and ledger entries inside
 * a single DB transaction alongside the market_resolution + audit log row.
 */
export function settleMarket(
  marketId: string,
  winningOutcomeId: string,
  resolutionId: string,
  holdings: Holding[]
): SettlementResult {
  const lines: SettlementLine[] = [];
  let totalPayout = 0;

  for (const h of holdings) {
    const isWinner = h.position.outcomeId === winningOutcomeId;
    const payout = settlementPayout(h.position, isWinner);
    const realizedPnlDelta = payout - h.position.costBasis;

    let newWalletBalance = h.walletBalance;
    let ledgerEntry: LedgerEntryDraft | undefined;

    if (payout > 0) {
      const posted = postEntry(h.walletId, h.walletBalance, payout, "MARKET_SETTLEMENT", {
        refMarketId: marketId,
        refResolutionId: resolutionId,
        memo: `Settlement of ${h.position.quantity} winning share(s)`
      });
      newWalletBalance = posted.balance;
      ledgerEntry = posted.entry;
      totalPayout += payout;
    }

    lines.push({
      walletId: h.walletId,
      userId: h.userId,
      outcomeId: h.position.outcomeId,
      isWinner,
      sharesSettled: h.position.quantity,
      payout,
      realizedPnlDelta,
      newWalletBalance,
      ledgerEntry
    });
  }

  return { marketId, winningOutcomeId, resolutionId, totalPayout, lines };
}
