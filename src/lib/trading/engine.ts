/**
 * Trading engine: turns price math into validated, integer-credit trades and
 * position/P&L mutations. Pure functions — the persistence layer is responsible
 * for atomically writing the results (order, trade, position, wallet, ledger).
 */

import { MarketState, Position, Side, TradeQuote } from "./types";
import { quoteMarket, rawTradeCost } from "./pricing";
import {
  roundCostUp,
  roundProceedsDown,
  assertWholeNonNegative,
  probabilityToCents,
  SHARE_SETTLEMENT_VALUE
} from "../money";

function outcomeIndex(market: MarketState, outcomeId: string): number {
  const idx = market.outcomes.findIndex((o) => o.outcomeId === outcomeId);
  if (idx < 0) throw new Error(`Unknown outcome ${outcomeId} in market ${market.marketId}`);
  return idx;
}

/** Apply a share delta to a market's inventory, returning a new MarketState. */
function withSharesDelta(market: MarketState, index: number, delta: number): MarketState {
  const outcomes = market.outcomes.map((o, i) =>
    i === index ? { ...o, shares: o.shares + delta } : { ...o }
  );
  return { ...market, outcomes };
}

/** Quote a BUY of `shares` of an outcome. Cash is whole credits, rounded up. */
export function quoteBuy(market: MarketState, outcomeId: string, shares: number): TradeQuote {
  assertWholeNonNegative(shares, "shares");
  if (shares === 0) throw new Error("Trade size must be at least 1 share");
  const idx = outcomeIndex(market, outcomeId);
  const q = market.outcomes.map((o) => o.shares);
  const cash = roundCostUp(rawTradeCost(q, market.liquidity, idx, shares));
  const after = withSharesDelta(market, idx, shares);
  return {
    marketId: market.marketId,
    outcomeId,
    side: "BUY",
    shares,
    cash,
    avgPriceCents: Math.round((cash / shares) * 100) / 100,
    pricesAfter: quoteMarket(after)
  };
}

/** Quote a SELL of `shares`. Cash is whole credits received, rounded down. */
export function quoteSell(market: MarketState, outcomeId: string, shares: number): TradeQuote {
  assertWholeNonNegative(shares, "shares");
  if (shares === 0) throw new Error("Trade size must be at least 1 share");
  const idx = outcomeIndex(market, outcomeId);
  const q = market.outcomes.map((o) => o.shares);
  // Selling removes shares from MM inventory; cost of -shares is negative → proceeds.
  const proceeds = roundProceedsDown(-rawTradeCost(q, market.liquidity, idx, -shares));
  const after = withSharesDelta(market, idx, -shares);
  return {
    marketId: market.marketId,
    outcomeId,
    side: "SELL",
    shares,
    cash: proceeds,
    avgPriceCents: Math.round((proceeds / shares) * 100) / 100,
    pricesAfter: quoteMarket(after)
  };
}

export function quote(market: MarketState, outcomeId: string, side: Side, shares: number): TradeQuote {
  return side === "BUY" ? quoteBuy(market, outcomeId, shares) : quoteSell(market, outcomeId, shares);
}

/** Apply executed BUY cash to a position (increases quantity & cost basis). */
export function applyBuy(position: Position, shares: number, cash: number): Position {
  assertWholeNonNegative(shares, "shares");
  assertWholeNonNegative(cash, "cash");
  return {
    ...position,
    quantity: position.quantity + shares,
    costBasis: position.costBasis + cash
  };
}

/**
 * Apply an executed SELL to a position. Realized P&L is the proceeds minus the
 * average cost basis of the shares sold. Cost basis is reduced proportionally.
 */
export function applySell(position: Position, shares: number, cash: number): Position {
  assertWholeNonNegative(shares, "shares");
  assertWholeNonNegative(cash, "cash");
  if (shares > position.quantity) {
    throw new Error("Cannot sell more shares than held (no shorting)");
  }
  const avgCost = position.quantity === 0 ? 0 : position.costBasis / position.quantity;
  const basisSold = Math.round(avgCost * shares);
  return {
    outcomeId: position.outcomeId,
    quantity: position.quantity - shares,
    costBasis: position.costBasis - basisSold,
    realizedPnl: position.realizedPnl + (cash - basisSold)
  };
}

/**
 * Mark-to-market unrealized P&L for a position at a given price (in cents).
 * A share settles at 100 credits and `priceCents` is its implied probability%,
 * so the current value of one share is exactly `priceCents` credits.
 */
export function unrealizedPnl(position: Position, priceCents: number): number {
  const marketValue = position.quantity * priceCents;
  return marketValue - position.costBasis;
}

/** Settlement payout (in credits) for a position when an outcome resolves. */
export function settlementPayout(position: Position, isWinningOutcome: boolean): number {
  return isWinningOutcome ? position.quantity * SHARE_SETTLEMENT_VALUE : 0;
}

/** Convenience: an empty position for an outcome. */
export function emptyPosition(outcomeId: string): Position {
  return { outcomeId, quantity: 0, costBasis: 0, realizedPnl: 0 };
}

/** Current per-outcome price in cents for display alongside positions. */
export function outcomePriceCents(market: MarketState, outcomeId: string): number {
  const line = quoteMarket(market).find((l) => l.outcomeId === outcomeId);
  return line ? line.priceCents : probabilityToCents(0);
}
