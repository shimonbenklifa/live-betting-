import { describe, it, expect } from "vitest";
import {
  lmsrCost,
  lmsrProbabilities,
  rawTradeCost,
  quoteMarket,
  liquidityForSubsidy
} from "./pricing";
import { MarketState } from "./types";

function binaryMarket(yes = 0, no = 0, b = 100): MarketState {
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

describe("LMSR pricing", () => {
  it("starts a fresh binary market at 50/50", () => {
    const probs = lmsrProbabilities([0, 0], 100);
    expect(probs[0]).toBeCloseTo(0.5, 10);
    expect(probs[1]).toBeCloseTo(0.5, 10);
  });

  it("always produces probabilities that sum to 1", () => {
    const probs = lmsrProbabilities([120, 30, 5, 80], 50);
    const sum = probs.reduce((a, c) => a + c, 0);
    expect(sum).toBeCloseTo(1, 10);
    probs.forEach((p) => expect(p).toBeGreaterThan(0));
  });

  it("raises an outcome's probability when its shares increase", () => {
    const before = lmsrProbabilities([0, 0], 100)[0];
    const after = lmsrProbabilities([200, 0], 100)[0];
    expect(after).toBeGreaterThan(before);
  });

  it("buying costs more than the naive linear price (convex cost curve)", () => {
    const small = rawTradeCost([0, 0], 100, 0, 10);
    const large = rawTradeCost([0, 0], 100, 0, 100);
    // Average price for the larger order must be higher (price impact).
    expect(large / 100).toBeGreaterThan(small / 10);
  });

  it("is numerically stable for large share counts (no Infinity)", () => {
    const cost = lmsrCost([100000, 0], 100);
    expect(Number.isFinite(cost)).toBe(true);
    const probs = lmsrProbabilities([100000, 0], 100);
    expect(probs[0]).toBeCloseTo(1, 6);
  });

  it("clamps display prices to 1..99 cents", () => {
    const lines = quoteMarket(binaryMarket(100000, 0));
    expect(lines[0].priceCents).toBeLessThanOrEqual(99);
    expect(lines[1].priceCents).toBeGreaterThanOrEqual(1);
  });

  it("bounds the market maker's max subsidy via liquidityForSubsidy", () => {
    const b = liquidityForSubsidy(1000, 2);
    // Worst-case LMSR loss is b * ln(n). Reversing should recover the subsidy.
    expect(b * Math.log(2)).toBeCloseTo(1000, 6);
  });

  it("buying then selling the same size never profits the trader (spread/rounding)", () => {
    const buy = rawTradeCost([0, 0], 100, 0, 50);
    const sell = -rawTradeCost([50, 0], 100, 0, -50);
    // Round-trip on a static book returns at most what was paid.
    expect(sell).toBeLessThanOrEqual(buy + 1e-9);
  });
});
