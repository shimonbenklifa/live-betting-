import { describe, it, expect } from "vitest";
import {
  postEntry,
  InsufficientFundsError,
  balanceFromLedger,
  assertLedgerConsistent
} from "./wallet";

describe("wallet ledger", () => {
  it("credits a signup grant and records before/after", () => {
    const r = postEntry("w1", 0, 10000, "SIGNUP_GRANT");
    expect(r.balance).toBe(10000);
    expect(r.entry.balanceBefore).toBe(0);
    expect(r.entry.balanceAfter).toBe(10000);
    expect(r.entry.delta).toBe(10000);
  });

  it("debits a buy and lowers the balance", () => {
    const r = postEntry("w1", 10000, -520, "TRADE_BUY", { refTradeId: "t1" });
    expect(r.balance).toBe(9480);
    expect(r.entry.refTradeId).toBe("t1");
  });

  it("never allows the balance to go negative", () => {
    expect(() => postEntry("w1", 100, -101, "TRADE_BUY")).toThrow(InsufficientFundsError);
  });

  it("requires a memo for admin adjustments", () => {
    expect(() => postEntry("w1", 100, 50, "ADMIN_ADJUSTMENT")).toThrow(/reason\/memo/);
    const ok = postEntry("w1", 100, 50, "ADMIN_ADJUSTMENT", { memo: "Correcting seed error" });
    expect(ok.balance).toBe(150);
  });

  it("rejects non-integer balances and deltas", () => {
    expect(() => postEntry("w1", 100.5, 10, "REFUND")).toThrow();
    expect(() => postEntry("w1", 100, 10.5, "REFUND")).toThrow();
  });

  it("reconstructs balance from the ledger", () => {
    const entries = [{ delta: 10000 }, { delta: -520 }, { delta: 3000 }, { delta: -200 }];
    expect(balanceFromLedger(entries)).toBe(12280);
  });

  it("validates a consistent running ledger and rejects a tampered one", () => {
    const a = postEntry("w1", 0, 10000, "SIGNUP_GRANT");
    const b = postEntry("w1", a.balance, -520, "TRADE_BUY");
    const c = postEntry("w1", b.balance, 3000, "MARKET_SETTLEMENT");
    expect(assertLedgerConsistent([a.entry, b.entry, c.entry])).toBe(true);

    const tampered = { ...c.entry, balanceAfter: c.entry.balanceAfter + 1000 };
    expect(() => assertLedgerConsistent([a.entry, b.entry, tampered])).toThrow();
  });
});
