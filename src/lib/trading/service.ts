/**
 * Server-side trade execution & settlement service.
 *
 * This is where the pure engine meets the database. Every mutation runs inside
 * a single serializable transaction so balances, positions, market inventory,
 * orders/trades and the ledger move together atomically. The client never sets
 * a price or a balance — the server recomputes everything from authoritative
 * state.
 *
 * Only invoked when DATABASE_URL is configured. In demo mode the server action
 * returns a simulated receipt computed by the same `quote()` function.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { quote } from "./engine";
import { MarketState } from "./types";
import { InsufficientFundsError, postEntry } from "./wallet";

export interface TradeRequest {
  userId: string;
  leagueId: string;
  marketId: string;
  outcomeId: string;
  side: "BUY" | "SELL";
  shares: number;
}

export interface TradeReceipt {
  orderId: string;
  side: "BUY" | "SELL";
  shares: number;
  cash: number;
  avgPriceCents: number;
  newBalance: number;
}

export async function executeTrade(req: TradeRequest): Promise<TradeReceipt> {
  if (!Number.isInteger(req.shares) || req.shares <= 0) {
    throw new Error("Trade size must be a positive whole number of shares");
  }

  return prisma.$transaction(
    async (tx) => {
      const market = await tx.market.findUniqueOrThrow({
        where: { id: req.marketId },
        include: { outcomes: { orderBy: { sortOrder: "asc" } } }
      });

      if (market.status !== "open") throw new Error("Market is not open for trading");
      if (market.closesAt.getTime() <= Date.now()) throw new Error("Market has closed");

      const state: MarketState = {
        marketId: market.id,
        kind: market.kind,
        liquidity: market.liquidity,
        outcomes: market.outcomes.map((o) => ({ outcomeId: o.id, shares: o.shares }))
      };

      const q = quote(state, req.outcomeId, req.side, req.shares);

      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { leagueId_userId: { leagueId: req.leagueId, userId: req.userId } }
      });

      const position = await tx.position.findUnique({
        where: { userId_outcomeId: { userId: req.userId, outcomeId: req.outcomeId } }
      });

      if (req.side === "SELL" && (position?.quantity ?? 0) < req.shares) {
        throw new Error("Cannot sell more shares than held (no shorting)");
      }

      // 1) Wallet + ledger
      const delta = req.side === "BUY" ? -q.cash : q.cash;
      const posted = postEntry(
        wallet.id,
        wallet.balance,
        delta,
        req.side === "BUY" ? "TRADE_BUY" : "TRADE_SELL",
        { refMarketId: market.id }
      );

      // 2) Order + trade
      const order = await tx.order.create({
        data: {
          marketId: market.id,
          outcomeId: req.outcomeId,
          userId: req.userId,
          side: req.side,
          shares: req.shares,
          avgPriceCents: q.avgPriceCents,
          cash: q.cash,
          status: "filled"
        }
      });
      await tx.trade.create({
        data: {
          orderId: order.id,
          marketId: market.id,
          outcomeId: req.outcomeId,
          userId: req.userId,
          side: req.side,
          shares: req.shares,
          cash: q.cash,
          priceCents: q.avgPriceCents
        }
      });

      // 3) Ledger + wallet balance
      await tx.ledgerEntry.create({ data: { ...posted.entry, refTradeId: order.id } });
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: posted.balance } });

      // 4) Market inventory (LMSR q_i)
      const inventoryDelta = req.side === "BUY" ? req.shares : -req.shares;
      await tx.outcome.update({
        where: { id: req.outcomeId },
        data: { shares: { increment: inventoryDelta } }
      });

      // 5) Position with cost-basis / realized P&L
      if (req.side === "BUY") {
        await tx.position.upsert({
          where: { userId_outcomeId: { userId: req.userId, outcomeId: req.outcomeId } },
          create: {
            marketId: market.id,
            outcomeId: req.outcomeId,
            userId: req.userId,
            quantity: req.shares,
            costBasis: q.cash
          },
          update: { quantity: { increment: req.shares }, costBasis: { increment: q.cash } }
        });
      } else {
        const pos = position!;
        const avgCost = pos.quantity === 0 ? 0 : pos.costBasis / pos.quantity;
        const basisSold = Math.round(avgCost * req.shares);
        await tx.position.update({
          where: { userId_outcomeId: { userId: req.userId, outcomeId: req.outcomeId } },
          data: {
            quantity: { decrement: req.shares },
            costBasis: { decrement: basisSold },
            realizedPnl: { increment: q.cash - basisSold }
          }
        });
      }

      return {
        orderId: order.id,
        side: req.side,
        shares: req.shares,
        cash: q.cash,
        avgPriceCents: q.avgPriceCents,
        newBalance: posted.balance
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  ).catch((err) => {
    if (err instanceof InsufficientFundsError) throw new Error("Insufficient credits for this trade");
    throw err;
  });
}
