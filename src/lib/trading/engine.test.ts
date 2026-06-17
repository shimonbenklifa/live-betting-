import { describe, it, expect } from "vitest";
import {
  quoteBuy,
  quoteSell,
  applyBuy,
  applySell,
  unrealizedPnl,
  settlementPayout,
  emptyPosition
} from "./engine";
import { MarketState } from "./types";

function market(yes = 0, no = 0, b = 100): MarketState {
  return {
    marketId: "m1",
    kind: "BINARY",
    liquidity: b,
    outcomes: [
      { outcomeId: "YES", shares: yes },
      { outcomeId: "NO", shares: no }
    ]
  };
}

describe("trade quoting", () => {
  it("charges whole credits rounded up on a buy", () => {
    const q = quoteBuy(market(), "YES", 10);
    expect(Number.isInteger(q.cash)).toBe(true);
    expect(q.cash).toBeGreaterThan(0);
    expect(q.side).toBe("BUY");
    expect(q.pricesAfter.find((l) => l.outcomeId === "YES")!.priceCents).toBeGreaterThan(50);
  });

  it("rejects zero and non-integer share counts", () => {
    expect(() => quoteBuy(market(), "YES", 0)).toThrow();
    expect(() => quoteBuy(market(), "YES", 1.5)).toThrow();
    expect(() => quoteBuy(market(), "YES", -3)).toThrow();
  });

  it("rejects unknown outcomes", () => {
    expect(() => quoteBuy(market(), "MAYBE", 5)).toThrow(/Unknown outcome/);
  });

  it("pays out whole credits rounded down on a sell", () => {
    const q = quoteSell(market(500, 0), "YES", 10);
    expect(Number.isInteger(q.cash)).toBe(true);
    expect(q.cash).toBeGreaterThanOrEqual(0);
  });
});

describe("position accounting", () => {
  it("accumulates quantity and cost basis on buys", () => {
    let pos = emptyPosition("YES");
    pos = applyBuy(pos, 10, 520);
    pos = applyBuy(pos, 5, 280);
    expect(pos.quantity).toBe(15);
    expect(pos.costBasis).toBe(800);
    expect(pos.realizedPnl).toBe(0);
  });

  it("realises P&L proportionally on a sell", () => {
    let pos = emptyPosition("YES");
    pos = applyBuy(pos, 100, 5000); // avg cost 50/share
    pos = applySell(pos, 40, 2800); // sold at 70/share -> +800 realized
    expect(pos.quantity).toBe(60);
    expect(pos.costBasis).toBe(3000); // 60 * 50
    expect(pos.realizedPnl).toBe(800);
  });

  it("never allows selling more than held", () => {
    let pos = applyBuy(emptyPosition("YES"), 5, 250);
    expect(() => applySell(pos, 10, 600)).toThrow(/no shorting/);
  });

  it("computes mark-to-market unrealized P&L", () => {
    let pos = applyBuy(emptyPosition("YES"), 100, 5000); // cost 5000
    // At 65c, market value = 100 * 65 / 100 = 6500 -> +1500 unrealized
    expect(unrealizedPnl(pos, 65)).toBe(1500);
  });
});

describe("settlement payout", () => {
  it("pays 100 per winning share and 0 for losers", () => {
    const pos = applyBuy(emptyPosition("YES"), 30, 1500);
    expect(settlementPayout(pos, true)).toBe(3000);
    expect(settlementPayout(pos, false)).toBe(0);
  });
});
