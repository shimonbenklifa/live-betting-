/**
 * Wallet & ledger logic.
 *
 * Invariant: a wallet balance is ALWAYS the sum of its ledger entries, and can
 * never go negative. Every credit movement (grant, trade, settlement, admin
 * adjustment) MUST flow through `postEntry`, which validates the invariant and
 * returns the new balance plus a fully-formed, append-only ledger entry. The
 * persistence layer writes the entry and the new balance in one transaction.
 */

export type LedgerReason =
  | "SIGNUP_GRANT"
  | "TRADE_BUY"
  | "TRADE_SELL"
  | "MARKET_SETTLEMENT"
  | "ADMIN_ADJUSTMENT"
  | "REFUND";

export interface LedgerEntryDraft {
  walletId: string;
  reason: LedgerReason;
  /** Signed credit movement: positive = credit, negative = debit. */
  delta: number;
  balanceBefore: number;
  balanceAfter: number;
  /** Free-text justification — REQUIRED for admin adjustments. */
  memo?: string;
  /** Optional links for the audit trail. */
  refTradeId?: string;
  refMarketId?: string;
  refResolutionId?: string;
}

export interface PostResult {
  balance: number;
  entry: LedgerEntryDraft;
}

export class InsufficientFundsError extends Error {
  constructor(public readonly balance: number, public readonly required: number) {
    super(`Insufficient funds: balance ${balance} < required ${required}`);
    this.name = "InsufficientFundsError";
  }
}

/**
 * Post a signed delta to a wallet. Throws `InsufficientFundsError` if the entry
 * would drive the balance negative — there are no overdrafts on this platform.
 */
export function postEntry(
  walletId: string,
  balance: number,
  delta: number,
  reason: LedgerReason,
  opts: {
    memo?: string;
    refTradeId?: string;
    refMarketId?: string;
    refResolutionId?: string;
  } = {}
): PostResult {
  if (!Number.isInteger(balance) || balance < 0) {
    throw new Error("Balance must be a non-negative integer");
  }
  if (!Number.isInteger(delta)) {
    throw new Error("Ledger delta must be an integer number of credits");
  }
  if (reason === "ADMIN_ADJUSTMENT" && !opts.memo?.trim()) {
    throw new Error("Admin adjustments require a non-empty reason/memo");
  }
  const balanceAfter = balance + delta;
  if (balanceAfter < 0) {
    throw new InsufficientFundsError(balance, -delta);
  }
  return {
    balance: balanceAfter,
    entry: {
      walletId,
      reason,
      delta,
      balanceBefore: balance,
      balanceAfter,
      memo: opts.memo,
      refTradeId: opts.refTradeId,
      refMarketId: opts.refMarketId,
      refResolutionId: opts.refResolutionId
    }
  };
}

export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost;
}

/** Recompute a balance from an ordered list of ledger entries (audit check). */
export function balanceFromLedger(entries: Pick<LedgerEntryDraft, "delta">[]): number {
  return entries.reduce((acc, e) => acc + e.delta, 0);
}

/**
 * Verify a ledger is internally consistent: monotonic running balance, no
 * negative point, and balanceAfter matches the running sum. Returns true or
 * throws with the first inconsistency found (used by the admin audit tooling).
 */
export function assertLedgerConsistent(entries: LedgerEntryDraft[]): true {
  let running = 0;
  entries.forEach((e, i) => {
    if (e.balanceBefore !== running) {
      throw new Error(`Ledger entry ${i}: balanceBefore ${e.balanceBefore} != running ${running}`);
    }
    running += e.delta;
    if (running < 0) throw new Error(`Ledger entry ${i}: balance went negative (${running})`);
    if (e.balanceAfter !== running) {
      throw new Error(`Ledger entry ${i}: balanceAfter ${e.balanceAfter} != running ${running}`);
    }
  });
  return true;
}
