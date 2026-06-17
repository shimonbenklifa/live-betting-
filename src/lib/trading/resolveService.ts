/**
 * Admin market resolution against the database. Loads every holder's position,
 * runs the pure `settleMarket`, then atomically: credits winners (with ledger
 * entries), closes positions, marks the winning outcome, flips the market to
 * resolved, writes a MarketResolution and an AdminAuditLog row. Serializable.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { settleMarket, Holding } from "./settlement";

export interface ResolveRequest {
  marketId: string;
  winningOutcomeId: string;
  actorId: string;
  note?: string;
}

export async function resolveMarketInDb(req: ResolveRequest) {
  return prisma.$transaction(
    async (tx) => {
      const market = await tx.market.findUniqueOrThrow({
        where: { id: req.marketId },
        include: { outcomes: true }
      });
      if (market.status === "resolved") throw new Error("Market is already resolved");
      if (!market.outcomes.some((o) => o.id === req.winningOutcomeId)) {
        throw new Error("Winning outcome does not belong to this market");
      }

      const positions = await tx.position.findMany({
        where: { marketId: market.id, quantity: { gt: 0 } }
      });
      const wallets = await tx.wallet.findMany({
        where: { leagueId: market.leagueId, userId: { in: positions.map((p) => p.userId) } }
      });
      const walletByUser = new Map(wallets.map((w) => [w.userId, w]));

      const resolution = await tx.marketResolution.create({
        data: {
          marketId: market.id,
          winningOutcomeId: req.winningOutcomeId,
          resolvedById: req.actorId,
          note: req.note
        }
      });

      const holdings: Holding[] = positions.map((p) => {
        const w = walletByUser.get(p.userId)!;
        return {
          walletId: w.id,
          userId: p.userId,
          walletBalance: w.balance,
          position: { outcomeId: p.outcomeId, quantity: p.quantity, costBasis: p.costBasis, realizedPnl: p.realizedPnl }
        };
      });

      const result = settleMarket(market.id, req.winningOutcomeId, resolution.id, holdings);

      for (const line of result.lines) {
        if (line.ledgerEntry) {
          await tx.ledgerEntry.create({ data: line.ledgerEntry });
          await tx.wallet.update({ where: { id: line.walletId }, data: { balance: line.newWalletBalance } });
        }
        await tx.position.updateMany({
          where: { userId: line.userId, outcomeId: line.outcomeId },
          data: { realizedPnl: { increment: line.realizedPnlDelta }, quantity: 0, costBasis: 0 }
        });
      }

      await tx.outcome.update({ where: { id: req.winningOutcomeId }, data: { isWinner: true } });
      await tx.market.update({ where: { id: market.id }, data: { status: "resolved" } });
      await tx.marketResolution.update({ where: { id: resolution.id }, data: { totalPayout: result.totalPayout } });

      await tx.adminAuditLog.create({
        data: {
          leagueId: market.leagueId,
          actorId: req.actorId,
          action: "RESOLVE_MARKET",
          entityType: "Market",
          entityId: market.id,
          detail: {
            title: market.title,
            winningOutcomeId: req.winningOutcomeId,
            totalPayout: result.totalPayout,
            winners: result.lines.filter((l) => l.isWinner).length,
            note: req.note ?? null
          } as Prisma.InputJsonValue
        }
      });

      return { totalPayout: result.totalPayout, winners: result.lines.filter((l) => l.payout > 0).length };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}
