import { describe, it, expect } from "vitest";
import { settleMarket, Holding } from "./settlement";
import { applyBuy, emptyPosition } from "./engine";

function holding(walletId: string, userId: string, outcomeId: string, shares: number, cost: number, balance: number): Holding {
  return {
    walletId,
    userId,
    position: applyBuy(emptyPosition(outcomeId), shares, cost),
    walletBalance: balance
  };
}

describe("market settlement", () => {
  it("pays winners 100/share and credits their wallet", () => {
    const holdings = [
      holding("w1", "u1", "YES", 30, 1500, 8000), // winner
      holding("w2", "u2", "NO", 50, 2500, 5000) // loser
    ];
    const result = settleMarket("m1", "YES", "res1", holdings);

    const winner = result.lines.find((l) => l.userId === "u1")!;
    const loser = result.lines.find((l) => l.userId === "u2")!;

    expect(winner.isWinner).toBe(true);
    expect(winner.payout).toBe(3000);
    expect(winner.newWalletBalance).toBe(11000);
    expect(winner.realizedPnlDelta).toBe(1500); // 3000 - 1500 cost
    expect(winner.ledgerEntry?.reason).toBe("MARKET_SETTLEMENT");

    expect(loser.isWinner).toBe(false);
    expect(loser.payout).toBe(0);
    expect(loser.newWalletBalance).toBe(5000); // unchanged
    expect(loser.realizedPnlDelta).toBe(-2500); // lost full basis
    expect(loser.ledgerEntry).toBeUndefined();

    expect(result.totalPayout).toBe(3000);
  });

  it("links settlement ledger entries to the market and resolution", () => {
    const result = settleMarket("mX", "A", "resX", [holding("w1", "u1", "A", 10, 600, 1000)]);
    const entry = result.lines[0].ledgerEntry!;
    expect(entry.refMarketId).toBe("mX");
    expect(entry.refResolutionId).toBe("resX");
  });

  it("conserves credits: total paid out equals winners' shares * 100", () => {
    const holdings = [
      holding("w1", "u1", "OVER", 12, 700, 2000),
      holding("w2", "u2", "OVER", 8, 500, 2000),
      holding("w3", "u3", "UNDER", 40, 1900, 2000)
    ];
    const result = settleMarket("m2", "OVER", "res2", holdings);
    expect(result.totalPayout).toBe((12 + 8) * 100);
  });
});
