/**
 * Built-in demo dataset. Powers the app when no database is configured, so the
 * product is fully explorable on first launch (and in the chat). All numbers
 * are internally consistent: market prices are derived from outcome share
 * inventories via the same LMSR engine used in production.
 */

import { quoteMarket } from "../trading/pricing";
import { MarketState } from "../trading/types";
import {
  CurrentUser,
  GameVM,
  LeagueVM,
  MarketVM,
  PlayerVM,
  TeamVM
} from "../data/types";

export const DEMO_USER: CurrentUser = {
  id: "user-you",
  email: "you@league.demo",
  displayName: "You",
  isAdmin: true
};

export const DEMO_LEAGUE: LeagueVM = {
  id: "league-rec",
  name: "Eastside Rec Hoops",
  slug: "eastside-rec-hoops",
  season: "2026",
  description: "A private men's recreational basketball league — play-money prediction markets.",
  startingCredits: 10000,
  realMoneyEnabled: false,
  memberCount: 24
};

interface RawTeam {
  id: string;
  name: string;
  abbr: string;
  division: string;
  captain: string;
  color: string;
  wins: number;
  losses: number;
  pf: number;
  pa: number;
}

const RAW_TEAMS: RawTeam[] = [
  { id: "t-bal", name: "Ballers", abbr: "BAL", division: "East", captain: "Marcus Reed", color: "#2563eb", wins: 9, losses: 2, pf: 1012, pa: 880 },
  { id: "t-hwk", name: "Night Hawks", abbr: "HWK", division: "East", captain: "Dre Coleman", color: "#7c3aed", wins: 8, losses: 3, pf: 990, pa: 905 },
  { id: "t-shk", name: "Sharks", abbr: "SHK", division: "East", captain: "Tomas Vela", color: "#0891b2", wins: 6, losses: 5, pf: 940, pa: 928 },
  { id: "t-ttn", name: "Titans", abbr: "TTN", division: "West", captain: "Will Boateng", color: "#16a34a", wins: 7, losses: 4, pf: 968, pa: 919 },
  { id: "t-wlv", name: "Wolves", abbr: "WLV", division: "West", captain: "Sam Park", color: "#dc2626", wins: 5, losses: 6, pf: 902, pa: 950 },
  { id: "t-kng", name: "Kings", abbr: "KNG", division: "West", captain: "Andre Silva", color: "#f59e0b", wins: 3, losses: 8, pf: 861, pa: 1001 }
];

export const DEMO_TEAMS: TeamVM[] = RAW_TEAMS.map((t) => ({
  id: t.id,
  name: t.name,
  abbreviation: t.abbr,
  division: t.division,
  captainName: t.captain,
  homeColor: t.color,
  wins: t.wins,
  losses: t.losses,
  pointsFor: t.pf,
  pointsAgainst: t.pa
}));

const teamById = (id: string) => DEMO_TEAMS.find((t) => t.id === id)!;

const FIRST = ["Marcus", "Dre", "Tomas", "Will", "Sam", "Andre", "Jaylen", "Kofi", "Diego", "Noah", "Eli", "Ravi"];
const LAST = ["Reed", "Coleman", "Vela", "Boateng", "Park", "Silva", "Hughes", "Mensah", "Torres", "Bennett", "Frost", "Patel"];
const POS = ["G", "G", "F", "F", "C"];

export const DEMO_PLAYERS: PlayerVM[] = [];
let pIdx = 0;
for (const team of DEMO_TEAMS) {
  for (let i = 0; i < 5; i++) {
    const seed = pIdx;
    const points = 22 - i * 2.5 + (seed % 4);
    DEMO_PLAYERS.push({
      id: `p-${team.abbreviation.toLowerCase()}-${i}`,
      firstName: FIRST[seed % FIRST.length],
      lastName: LAST[(seed * 7) % LAST.length],
      teamId: team.id,
      teamName: team.name,
      jerseyNumber: (seed * 3 + 4) % 40,
      position: POS[i],
      status: i === 4 && team.id === "t-kng" ? "injured" : "active",
      stats: {
        points: Math.round(points * 10) / 10,
        assists: Math.round((6 - i + (seed % 3)) * 10) / 10,
        rebounds: Math.round((4 + i + (seed % 4)) * 10) / 10,
        steals: Math.round((1.5 + (seed % 2)) * 10) / 10,
        blocks: Math.round((0.6 + (i === 4 ? 1.4 : 0)) * 10) / 10,
        gamesPlayed: 11
      }
    });
    pIdx++;
  }
}

function isoIn(days: number, hour = 19): string {
  const d = new Date("2026-06-17T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 30, 0, 0);
  return d.toISOString();
}

interface RawGame {
  id: string;
  home: string;
  away: string;
  day: number;
  week: number;
  venue: string;
  status: "scheduled" | "live" | "final";
  hs?: number;
  as?: number;
}

const RAW_GAMES: RawGame[] = [
  { id: "g-1", home: "t-bal", away: "t-hwk", day: 1, week: 12, venue: "Eastside Gym A", status: "scheduled" },
  { id: "g-2", home: "t-shk", away: "t-ttn", day: 1, week: 12, venue: "Eastside Gym B", status: "scheduled" },
  { id: "g-3", home: "t-wlv", away: "t-kng", day: 2, week: 12, venue: "Eastside Gym A", status: "scheduled" },
  { id: "g-4", home: "t-bal", away: "t-ttn", day: 4, week: 13, venue: "Eastside Gym A", status: "scheduled" },
  { id: "g-5", home: "t-hwk", away: "t-shk", day: -3, week: 11, venue: "Eastside Gym B", status: "final", hs: 88, as: 81 }
];

export const DEMO_GAMES: GameVM[] = RAW_GAMES.map((g) => ({
  id: g.id,
  homeTeam: teamById(g.home),
  awayTeam: teamById(g.away),
  startsAt: isoIn(g.day),
  venue: g.venue,
  week: g.week,
  status: g.status,
  homeScore: g.hs ?? null,
  awayScore: g.as ?? null,
  marketCount: 0
}));

// --- Markets -----------------------------------------------------------------

interface RawMarket {
  id: string;
  title: string;
  description: string;
  scope: "GAME" | "FUTURES";
  kind: "BINARY" | "MULTI" | "RANKED";
  futureType: string | null;
  gameId: string | null;
  liquidity: number;
  closesDay: number;
  status: string;
  outcomes: { id: string; label: string; shares: number }[];
}

const RAW_MARKETS: RawMarket[] = [
  {
    id: "m-g1-ml",
    title: "Ballers to beat Night Hawks",
    description: "Resolves YES if the Ballers win the Week 12 matchup.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 250, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1-yes", label: "YES", shares: 180 },
      { id: "o-g1-no", label: "NO", shares: 60 }
    ]
  },
  {
    id: "m-g1-spread",
    title: "Ballers win by 5+",
    description: "Resolves YES if the Ballers win by 5 or more points.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 200, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1s-yes", label: "YES", shares: 90 },
      { id: "o-g1s-no", label: "NO", shares: 120 }
    ]
  },
  {
    id: "m-g1-total",
    title: "Over/Under 165.5 total points",
    description: "Combined final score over or under 165.5.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 200, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1t-over", label: "OVER", shares: 110 },
      { id: "o-g1t-under", label: "UNDER", shares: 100 }
    ]
  },
  {
    id: "m-g1-pts",
    title: "Marcus Reed scores 20+ points",
    description: "Resolves YES if Marcus Reed records 20 or more points.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 150, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1p-yes", label: "YES", shares: 140 },
      { id: "o-g1p-no", label: "NO", shares: 70 }
    ]
  },
  {
    id: "m-g2-ml",
    title: "Sharks to beat Titans",
    description: "Resolves YES if the Sharks win.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-2", liquidity: 200, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g2-yes", label: "YES", shares: 70 },
      { id: "o-g2-no", label: "NO", shares: 110 }
    ]
  },
  // --- Futures ---
  {
    id: "m-champ",
    title: "League Champion 2026",
    description: "Which team wins the Eastside Rec Hoops championship?",
    scope: "FUTURES", kind: "MULTI", futureType: "LEAGUE_CHAMPION", gameId: null, liquidity: 400, closesDay: 30, status: "open",
    outcomes: [
      { id: "o-ch-bal", label: "Ballers", shares: 320 },
      { id: "o-ch-hwk", label: "Night Hawks", shares: 240 },
      { id: "o-ch-ttn", label: "Titans", shares: 180 },
      { id: "o-ch-shk", label: "Sharks", shares: 120 },
      { id: "o-ch-wlv", label: "Wolves", shares: 70 },
      { id: "o-ch-kng", label: "Kings", shares: 30 }
    ]
  },
  {
    id: "m-mvp",
    title: "Regular Season MVP",
    description: "Which player is named regular-season MVP?",
    scope: "FUTURES", kind: "MULTI", futureType: "REGULAR_SEASON_MVP", gameId: null, liquidity: 350, closesDay: 25, status: "open",
    outcomes: [
      { id: "o-mvp-reed", label: "Marcus Reed (BAL)", shares: 260 },
      { id: "o-mvp-cole", label: "Dre Coleman (HWK)", shares: 210 },
      { id: "o-mvp-vela", label: "Tomas Vela (SHK)", shares: 140 },
      { id: "o-mvp-boat", label: "Will Boateng (TTN)", shares: 120 }
    ]
  },
  {
    id: "m-scorer",
    title: "Leading Scorer",
    description: "Player with the highest points-per-game at season end.",
    scope: "FUTURES", kind: "MULTI", futureType: "LEADING_SCORER", gameId: null, liquidity: 300, closesDay: 25, status: "open",
    outcomes: [
      { id: "o-ls-reed", label: "Marcus Reed (BAL)", shares: 230 },
      { id: "o-ls-cole", label: "Dre Coleman (HWK)", shares: 190 },
      { id: "o-ls-vela", label: "Tomas Vela (SHK)", shares: 150 }
    ]
  }
];

function priced(m: RawMarket): MarketVM {
  const state: MarketState = {
    marketId: m.id,
    kind: m.kind,
    liquidity: m.liquidity,
    outcomes: m.outcomes.map((o) => ({ outcomeId: o.id, shares: o.shares }))
  };
  const lines = quoteMarket(state);
  const game = m.gameId ? DEMO_GAMES.find((g) => g.id === m.gameId) : null;
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    scope: m.scope,
    kind: m.kind,
    futureType: m.futureType,
    status: m.status,
    liquidity: m.liquidity,
    closesAt: isoIn(m.closesDay),
    gameId: m.gameId,
    gameLabel: game ? `${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}` : null,
    volume: m.outcomes.reduce((a, o) => a + o.shares, 0),
    outcomes: m.outcomes.map((o, i) => ({
      id: o.id,
      label: o.label,
      shares: o.shares,
      priceCents: lines[i].priceCents,
      probability: lines[i].probability,
      isWinner: false
    }))
  };
}

export const DEMO_MARKETS: MarketVM[] = RAW_MARKETS.map(priced);

// attach market counts to games
for (const g of DEMO_GAMES) {
  g.marketCount = DEMO_MARKETS.filter((m) => m.gameId === g.id).length;
}

export const RAW_MARKET_STATES: Record<string, MarketState> = Object.fromEntries(
  RAW_MARKETS.map((m) => [
    m.id,
    { marketId: m.id, kind: m.kind, liquidity: m.liquidity, outcomes: m.outcomes.map((o) => ({ outcomeId: o.id, shares: o.shares })) }
  ])
);
