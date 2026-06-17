/**
 * Money / credit primitives.
 *
 * All play-credit balances are stored and computed as **integer credits**.
 * There is no floating-point money in the ledger — every balance mutation is a
 * whole-credit delta. Pricing math (LMSR) is done in floating point and then
 * converted to integer credit charges at the trade boundary, always rounding in
 * favour of the house/market maker so balances can never be over-credited.
 */

/** Settlement value of a single winning share, in credits. */
export const SHARE_SETTLEMENT_VALUE = 100;

/** Minimum / maximum displayable price for an outcome, in cents (probability%). */
export const MIN_PRICE_CENTS = 1;
export const MAX_PRICE_CENTS = 99;

/** Round a fractional credit amount that the user must PAY: always round up. */
export function roundCostUp(amount: number): number {
  if (!Number.isFinite(amount)) throw new Error("Cost is not finite");
  // Guard against -0 and tiny negative FP noise.
  if (amount <= 0) return 0;
  return Math.ceil(amount - 1e-9);
}

/** Round a fractional credit amount that the user RECEIVES: always round down. */
export function roundProceedsDown(amount: number): number {
  if (!Number.isFinite(amount)) throw new Error("Proceeds are not finite");
  if (amount <= 0) return 0;
  return Math.floor(amount + 1e-9);
}

/** Assert a value is a non-negative integer count of credits or shares. */
export function assertWholeNonNegative(value: number, label = "value"): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer (got ${value})`);
  }
}

/** Format integer credits for display, e.g. 12345 -> "12,345". */
export function formatCredits(credits: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(credits));
}

/** Convert an internal probability (0..1) to a clamped display price in cents. */
export function probabilityToCents(probability: number): number {
  const cents = Math.round(probability * 100);
  return Math.min(MAX_PRICE_CENTS, Math.max(MIN_PRICE_CENTS, cents));
}
