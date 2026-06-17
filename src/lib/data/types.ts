/** View-model types shared by the data layer and the UI. */

import { MarketKind, MarketScope } from "@prisma/client";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export interface LeagueVM {
  id: string;
  name: string;
  slug: string;
  season: string;
  description: string;
  startingCredits: number;
  realMoneyEnabled: boolean;
  memberCount: number;
}

export interface TeamVM {
  id: string;
  name: string;
  abbreviation: string;
  division: string;
  captainName: string;
  homeColor: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface PlayerVM {
  id: string;
  firstName: string;
  lastName: string;
  teamId: string;
  teamName: string;
  jerseyNumber: number | null;
  position: string;
  status: string;
  stats: { points: number; assists: number; rebounds: number; steals: number; blocks: number; gamesPlayed: number };
}

export interface OutcomeVM {
  id: string;
  label: string;
  shares: number;
  priceCents: number;
  probability: number;
  isWinner: boolean;
}

export interface MarketVM {
  id: string;
  title: string;
  description: string;
  scope: MarketScope;
  kind: MarketKind;
  futureType: string | null;
  status: string;
  liquidity: number;
  closesAt: string;
  gameId: string | null;
  gameLabel: string | null;
  outcomes: OutcomeVM[];
  volume: number;
}

export interface GameVM {
  id: string;
  homeTeam: TeamVM;
  awayTeam: TeamVM;
  startsAt: string;
  venue: string;
  week: number;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  marketCount: number;
}

export interface PositionVM {
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeLabel: string;
  quantity: number;
  costBasis: number;
  avgCostCents: number;
  priceCents: number;
  marketValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface PortfolioVM {
  cash: number;
  positionsValue: number;
  totalValue: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  positions: PositionVM[];
  trades: TradeVM[];
}

export interface TradeVM {
  id: string;
  marketTitle: string;
  outcomeLabel: string;
  side: "BUY" | "SELL";
  shares: number;
  priceCents: number;
  cash: number;
  createdAt: string;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  totalValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  tradeCount: number;
}

export interface StatLeaderboardVM {
  category: string;
  locked: boolean;
  entries: { rank: number; playerId: string; playerName: string; teamName: string; value: number }[];
}

export interface AuditEntryVM {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  detail: Record<string, unknown>;
  createdAt: string;
}

export interface ImportBatchVM {
  id: string;
  type: string;
  filename: string;
  status: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  committedRows: number;
  createdAt: string;
}
