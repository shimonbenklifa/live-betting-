/**
 * Read-side data access used by Server Components.
 *
 * In this first release the read layer serves the built-in demo dataset so the
 * product is fully explorable without infrastructure. When DATABASE_URL is set,
 * the seed script populates a real Postgres/Supabase instance and the trading
 * server actions persist against Prisma; swapping these readers to Prisma
 * queries is the production path (each function is a single query boundary).
 */

import { isDemoMode } from "../config";
import {
  DEMO_GAMES,
  DEMO_LEAGUE,
  DEMO_MARKETS,
  DEMO_PLAYERS,
  DEMO_TEAMS,
  DEMO_USER
} from "../demo/data";
import {
  demoAuditLog,
  demoImportBatches,
  demoLeaderboard,
  demoPortfolio,
  demoStatLeaderboards
} from "../demo/portfolio";
import { CurrentUser, GameVM, LeagueVM, MarketVM, PlayerVM, TeamVM } from "./types";

export async function getCurrentUser(): Promise<CurrentUser> {
  // Production: resolve from Supabase session + users table.
  return DEMO_USER;
}

export async function getLeague(): Promise<LeagueVM> {
  return DEMO_LEAGUE;
}

export async function getTeams(): Promise<TeamVM[]> {
  return [...DEMO_TEAMS].sort((a, b) => b.wins - a.wins);
}

export async function getTeam(teamId: string): Promise<TeamVM | null> {
  return DEMO_TEAMS.find((t) => t.id === teamId) ?? null;
}

export async function getPlayers(): Promise<PlayerVM[]> {
  return DEMO_PLAYERS;
}

export async function getPlayer(playerId: string): Promise<PlayerVM | null> {
  return DEMO_PLAYERS.find((p) => p.id === playerId) ?? null;
}

export async function getRoster(teamId: string): Promise<PlayerVM[]> {
  return DEMO_PLAYERS.filter((p) => p.teamId === teamId);
}

export async function getGames(): Promise<GameVM[]> {
  return [...DEMO_GAMES].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getGame(gameId: string): Promise<GameVM | null> {
  return DEMO_GAMES.find((g) => g.id === gameId) ?? null;
}

export async function getMarkets(opts?: { scope?: "GAME" | "FUTURES"; gameId?: string }): Promise<MarketVM[]> {
  let markets = DEMO_MARKETS;
  if (opts?.scope) markets = markets.filter((m) => m.scope === opts.scope);
  if (opts?.gameId) markets = markets.filter((m) => m.gameId === opts.gameId);
  return markets;
}

export async function getMarket(marketId: string): Promise<MarketVM | null> {
  return DEMO_MARKETS.find((m) => m.id === marketId) ?? null;
}

export async function getPortfolio() {
  return demoPortfolio();
}

export async function getLeaderboard() {
  return demoLeaderboard();
}

export async function getStatLeaderboards() {
  return demoStatLeaderboards();
}

export async function getAuditLog() {
  return demoAuditLog();
}

export async function getImportBatches() {
  return demoImportBatches();
}

export const demoMode = isDemoMode;
