/**
 * LMSR (Logarithmic Market Scoring Rule) automated market maker.
 *
 * One unified pricing model serves binary (YES/NO), multiple-choice futures,
 * and ranked markets. Outcomes always partition the probability space, so
 * prices are guaranteed to sum to 1. This is the same family of market maker
 * used by real prediction markets and keeps the platform liquid even with thin
 * order flow — important for a small private league.
 *
 *   Cost function:   C(q) = b * ln( Σ exp(q_i / b) )
 *   Price (prob):    p_i  = exp(q_i / b) / Σ exp(q_j / b)
 *   Trade cost:      C(q + Δ) - C(q)
 *
 * All functions here are pure and side-effect free.
 */

import { MarketState, QuoteLine } from "./types";
import { probabilityToCents } from "../money";

/** Numerically stable log-sum-exp of q_i / b. */
function logSumExp(quantities: number[], b: number): number {
  if (b <= 0) throw new Error("Liquidity parameter b must be positive");
  const scaled = quantities.map((q) => q / b);
  const max = Math.max(...scaled);
  let sum = 0;
  for (const s of scaled) sum += Math.exp(s - max);
  return max + Math.log(sum);
}

/** LMSR cost function C(q) in credits. */
export function lmsrCost(quantities: number[], b: number): number {
  if (quantities.length === 0) return 0;
  return b * logSumExp(quantities, b);
}

/** Outcome probabilities (sum to 1), numerically stable via softmax. */
export function lmsrProbabilities(quantities: number[], b: number): number[] {
  if (b <= 0) throw new Error("Liquidity parameter b must be positive");
  if (quantities.length === 0) return [];
  const scaled = quantities.map((q) => q / b);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const total = exps.reduce((a, c) => a + c, 0);
  return exps.map((e) => e / total);
}

/**
 * Raw (fractional) credit cost to buy `shares` of outcome `index`.
 * Positive = cost to buy; for selling, pass a negative share count and negate.
 */
export function rawTradeCost(
  quantities: number[],
  b: number,
  index: number,
  shares: number
): number {
  const before = lmsrCost(quantities, b);
  const after = [...quantities];
  after[index] += shares;
  return lmsrCost(after, b) - before;
}

/** Current display quote lines for every outcome in a market. */
export function quoteMarket(market: MarketState): QuoteLine[] {
  const q = market.outcomes.map((o) => o.shares);
  const probs = lmsrProbabilities(q, market.liquidity);
  return market.outcomes.map((o, i) => ({
    outcomeId: o.outcomeId,
    probability: probs[i],
    priceCents: probabilityToCents(probs[i])
  }));
}

/**
 * Recommended liquidity parameter b for a market, derived from the credits the
 * market maker is willing to subsidise (max loss ≈ b * ln(nOutcomes)).
 */
export function liquidityForSubsidy(subsidyCredits: number, nOutcomes: number): number {
  if (nOutcomes < 2) throw new Error("A market needs at least two outcomes");
  return subsidyCredits / Math.log(nOutcomes);
}
