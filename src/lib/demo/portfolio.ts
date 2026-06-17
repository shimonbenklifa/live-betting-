/** Demo portfolio, trade history, leaderboard, stats, audit & imports. */

import { DEMO_MARKETS, DEMO_PLAYERS, DEMO_TEAMS } from "./data";
import {
  AuditEntryVM,
  ImportBatchVM,
  LeaderboardRow,
  PortfolioVM,
  PositionVM,
  StatLeaderboardVM,
  TradeVM
} from "../data/types";

const marketById = (id: string) => DEMO_MARKETS.find((m) => m.id === id)!;
function outcome(marketId: string, outcomeId: string) {
  const m = marketById(marketId);
  return { market: m, outcome: m.outcomes.find((o) => o.id === outcomeId)! };
}

interface RawPos {
  marketId: string;
  outcomeId: string;
  quantity: number;
  costBasis: number;
  realizedPnl: number;
}

const RAW_POSITIONS: RawPos[] = [
  { marketId: "m-g1-ml", outcomeId: "o-g1-yes", quantity: 120, costBasis: 7800, realizedPnl: 0 },
  { marketId: "m-champ", outcomeId: "o-ch-5tr", quantity: 80, costBasis: 2960, realizedPnl: 0 },
  { marketId: "m-mvp", outcomeId: "o-mvp-homnick", quantity: 60, costBasis: 1860, realizedPnl: 420 },
  { marketId: "m-g1-total", outcomeId: "o-g1t-over", quantity: 40, costBasis: 2080, realizedPnl: 0 }
];

function buildPositions(): PositionVM[] {
  return RAW_POSITIONS.map((p) => {
    const { market, outcome: o } = outcome(p.marketId, p.outcomeId);
    const marketValue = p.quantity * o.priceCents;
    return {
      marketId: p.marketId,
      marketTitle: market.title,
      outcomeId: p.outcomeId,
      outcomeLabel: o.label,
      quantity: p.quantity,
      costBasis: p.costBasis,
      avgCostCents: Math.round((p.costBasis / p.quantity) * 10) / 10,
      priceCents: o.priceCents,
      marketValue,
      unrealizedPnl: marketValue - p.costBasis,
      realizedPnl: p.realizedPnl
    };
  });
}

const DEMO_TRADES: TradeVM[] = [
  { id: "tr-1", marketTitle: "5T Restoration to beat Crown Home Care", outcomeLabel: "YES", side: "BUY", shares: 120, priceCents: 65, cash: 7800, createdAt: "2026-06-15T18:02:00Z" },
  { id: "tr-2", marketTitle: "League Champion — Season 3", outcomeLabel: "5T Restoration", side: "BUY", shares: 80, priceCents: 37, cash: 2960, createdAt: "2026-06-14T20:15:00Z" },
  { id: "tr-3", marketTitle: "Regular Season MVP", outcomeLabel: "Chaim Homnick (5TR)", side: "BUY", shares: 100, priceCents: 24, cash: 2400, createdAt: "2026-06-12T19:40:00Z" },
  { id: "tr-4", marketTitle: "Regular Season MVP", outcomeLabel: "Chaim Homnick (5TR)", side: "SELL", shares: 40, priceCents: 31, cash: 1240, createdAt: "2026-06-13T21:05:00Z" },
  { id: "tr-5", marketTitle: "Over/Under 165.5 total points", outcomeLabel: "OVER", side: "BUY", shares: 40, priceCents: 52, cash: 2080, createdAt: "2026-06-16T17:22:00Z" }
];

export function demoPortfolio(): PortfolioVM {
  const positions = buildPositions();
  const positionsValue = positions.reduce((a, p) => a + p.marketValue, 0);
  const cash = 4860;
  return {
    cash,
    positionsValue,
    totalValue: cash + positionsValue,
    totalUnrealizedPnl: positions.reduce((a, p) => a + p.unrealizedPnl, 0),
    totalRealizedPnl: positions.reduce((a, p) => a + p.realizedPnl, 0),
    positions,
    trades: DEMO_TRADES
  };
}

const NAMES = ["Chaim Homnick", "Daniel Goldfarb", "Jeremy Tabak", "Ari Schwartz", "You", "Yitzi Gross", "Mo Feintuch", "Rich Hochhauser", "Jesse Slone", "Yehuda Zin"];

export function demoLeaderboard(): LeaderboardRow[] {
  const rows = NAMES.map((name, i) => {
    const base = 13800 - i * 540 + (i % 3) * 220;
    const realized = 3800 - i * 360;
    const unreal = 1400 - i * 180;
    return {
      rank: 0,
      userId: `u-${i}`,
      displayName: name,
      totalValue: base,
      realizedPnl: realized,
      unrealizedPnl: unreal,
      tradeCount: 42 - i * 3
    };
  });
  rows.sort((a, b) => b.totalValue - a.totalValue);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

export function demoStatLeaderboards(): StatLeaderboardVM[] {
  const build = (category: string, key: "points" | "assists" | "rebounds", locked = false): StatLeaderboardVM => {
    const sorted = [...DEMO_PLAYERS].sort((a, b) => b.stats[key] - a.stats[key]).slice(0, 8);
    return {
      category,
      locked,
      entries: sorted.map((p, i) => ({
        rank: i + 1,
        playerId: p.id,
        playerName: `${p.firstName} ${p.lastName}`,
        teamName: p.teamName,
        value: p.stats[key]
      }))
    };
  };
  return [build("Points Per Game", "points"), build("Assists", "assists"), build("Rebounds", "rebounds")];
}

export function demoAuditLog(): AuditEntryVM[] {
  return [
    { id: "a-1", actor: "You", action: "CREATE_MARKET", entityType: "Market", detail: { title: "5T Restoration to beat Crown Home Care" }, createdAt: "2026-06-15T17:00:00Z" },
    { id: "a-2", actor: "You", action: "IMPORT_COMMIT", entityType: "ImportBatch", detail: { type: "rosters", rows: 84 }, createdAt: "2026-06-14T12:30:00Z" },
    { id: "a-3", actor: "You", action: "ADJUST_BALANCE", entityType: "Wallet", detail: { user: "Yehuda Zin", delta: 500, reason: "Welcome bonus correction" }, createdAt: "2026-06-13T09:10:00Z" },
    { id: "a-4", actor: "You", action: "RESOLVE_MARKET", entityType: "Market", detail: { title: "Zlotowitz Law vs JWorks (Wk 11)", winner: "JWorks", payout: 4200 }, createdAt: "2026-06-11T22:45:00Z" }
  ];
}

export function demoImportBatches(): ImportBatchVM[] {
  return [
    { id: "ib-1", type: "teams", filename: "teams.csv", status: "committed", totalRows: 12, validRows: 12, errorRows: 0, committedRows: 12, createdAt: "2026-06-14T12:10:00Z" },
    { id: "ib-2", type: "rosters", filename: "season3_rosters.xlsx", status: "committed", totalRows: 84, validRows: 84, errorRows: 0, committedRows: 84, createdAt: "2026-06-14T12:30:00Z" },
    { id: "ib-3", type: "games", filename: "schedule.csv", status: "previewed", totalRows: 22, validRows: 21, errorRows: 1, committedRows: 0, createdAt: "2026-06-16T08:05:00Z" }
  ];
}

export const DEMO_TEAMS_EXPORT = DEMO_TEAMS;
