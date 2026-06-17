/** Shared domain types for the trading engine (DB-agnostic). */

export type MarketKind = "BINARY" | "MULTI" | "RANKED";

export type Side = "BUY" | "SELL";

/** A market outcome as the engine sees it: an id and its current share inventory. */
export interface OutcomeState {
  outcomeId: string;
  /** Net shares the market maker has sold to users for this outcome (q_i). */
  shares: number;
}

/** Minimal market shape the pricing/engine functions operate on. */
export interface MarketState {
  marketId: string;
  kind: MarketKind;
  /** LMSR liquidity parameter b. Higher b = deeper liquidity, less price impact. */
  liquidity: number;
  outcomes: OutcomeState[];
}

/** A user's position in a single outcome. */
export interface Position {
  outcomeId: string;
  /** Net shares held (>= 0; this platform does not allow shorting). */
  quantity: number;
  /** Total credits paid to acquire the currently-held shares (cost basis). */
  costBasis: number;
  /** Realized P&L in credits accumulated from prior sells/settlements. */
  realizedPnl: number;
}

export interface QuoteLine {
  outcomeId: string;
  /** Internal probability 0..1. */
  probability: number;
  /** Display price in cents (1..99). */
  priceCents: number;
}

export interface TradeQuote {
  marketId: string;
  outcomeId: string;
  side: Side;
  shares: number;
  /** Whole credits the user pays (BUY) or receives (SELL). */
  cash: number;
  /** Average price per share in cents. */
  avgPriceCents: number;
  /** Outcome prices AFTER the trade executes. */
  pricesAfter: QuoteLine[];
}
