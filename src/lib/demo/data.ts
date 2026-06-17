/**
 * Built-in dataset for Draft League Season 3. Powers the app in demo mode (no
 * database) so the product is fully explorable. Teams and rosters are the real
 * Season 3 draft; games, markets and futures are derived so prices stay
 * internally consistent via the same LMSR engine used in production.
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
  id: "league-draft",
  name: "Draft League",
  slug: "draft-league",
  season: "3",
  description: "Draft League Season 3 — a private men's recreational basketball league. Play-money prediction markets.",
  startingCredits: 10000,
  realMoneyEnabled: false,
  memberCount: 84
};

interface RawTeam {
  id: string;
  name: string;
  abbr: string;
  division: string;
  color: string;
  wins: number;
  losses: number;
  pf: number;
  pa: number;
}

const RAW_TEAMS: RawTeam[] = [
  { id: "t-5tr", name: "5T Restoration", abbr: "5TR", division: "East", color: "#2563eb", wins: 9, losses: 2, pf: 1012, pa: 880 },
  { id: "t-chc", name: "Crown Home Care", abbr: "CHC", division: "East", color: "#7c3aed", wins: 8, losses: 3, pf: 990, pa: 905 },
  { id: "t-gmi", name: "GMI Marketing", abbr: "GMI", division: "East", color: "#0891b2", wins: 7, losses: 4, pf: 968, pa: 919 },
  { id: "t-prp", name: "Premium Pergola", abbr: "PRP", division: "East", color: "#16a34a", wins: 6, losses: 5, pf: 940, pa: 928 },
  { id: "t-shk", name: "Car Sharks", abbr: "SHK", division: "East", color: "#db2777", wins: 7, losses: 4, pf: 958, pa: 921 },
  { id: "t-oxf", name: "Oxfordshire", abbr: "OXF", division: "East", color: "#ea580c", wins: 5, losses: 6, pf: 902, pa: 940 },
  { id: "t-chs", name: "Cheese Store", abbr: "CHS", division: "West", color: "#ca8a04", wins: 8, losses: 3, pf: 985, pa: 902 },
  { id: "t-apt", name: "Advantage PT", abbr: "APT", division: "West", color: "#0d9488", wins: 6, losses: 5, pf: 933, pa: 930 },
  { id: "t-lcl", name: "LI Criminal Law", abbr: "LCL", division: "West", color: "#4f46e5", wins: 4, losses: 7, pf: 889, pa: 961 },
  { id: "t-tel", name: "Teller Insurance", abbr: "TEL", division: "West", color: "#dc2626", wins: 5, losses: 6, pf: 915, pa: 944 },
  { id: "t-zlw", name: "Zlotowitz Law", abbr: "ZLW", division: "West", color: "#9333ea", wins: 3, losses: 8, pf: 861, pa: 1001 },
  { id: "t-jwk", name: "JWorks", abbr: "JWK", division: "West", color: "#059669", wins: 6, losses: 5, pf: 944, pa: 932 }
];

// [firstName, lastName, isCaptain?]
type RosterEntry = [string, string, boolean?];

const ROSTERS: Record<string, { captain: string; players: RosterEntry[] }> = {
  "t-5tr": { captain: "Chaim Homnick", players: [["Chaim", "Homnick", true], ["Yonah", "Samson"], ["Shalom", "Prager"], ["Avraham", "Young"], ["Dovi", "Breuer"], ["Dylan", "Kaufman"], ["Dov", "Greenbaum"]] },
  "t-chc": { captain: "Jeremy Tabak", players: [["Jeremy", "Tabak", true], ["Danny", "Fried"], ["Gavriel", "Majeski"], ["Elias", "Davis"], ["Chaim", "Portal"], ["Issac", "Rosen"], ["Elan", "Tanen"]] },
  "t-gmi": { captain: "Yitzi Gross", players: [["Yitzi", "Gross", true], ["Avrumi", "Gutfreund"], ["Mef", ""], ["Nosson", "Stein"], ["Michael", "Schik"], ["Efraim", "Graber"], ["Uri", "Bryks"]] },
  "t-prp": { captain: "Michael Esquenazi", players: [["Michael", "Esquenazi", true], ["Ariel", "Melool"], ["Abi", "Liff"], ["Yitzi", "Kessler"], ["Jake", "Abramowitz"], ["Yosef", "Leff"], ["Tuvia", "Blisko"]] },
  "t-shk": { captain: "Ari Schwartz", players: [["Ari", "Schwartz", true], ["Aryeh", "Fuchs"], ["Steven", "Millstein"], ["Moshe", "Bobker"], ["Avi", "Zipsner"], ["Evan", "Weinstein"], ["Eli", "Whiskey"]] },
  "t-oxf": { captain: "Yaakov Dvir", players: [["Yaakov", "Dvir", true], ["Haim", "Taboly"], ["Elazar", "Sauber"], ["Mitch", "Pisarz"], ["Shimon", "Shoshan"], ["Shimon", "Deri"], ["Zach", "Sumner"]] },
  "t-chs": { captain: "Daniel Goldfarb", players: [["Daniel", "Goldfarb", true], ["David", "Cohen"], ["Michael", "Tsor"], ["Hayden", "Klein"], ["Jake", "Birn"], ["Eli", "Zidele"], ["Naftali", "Bach"]] },
  "t-apt": { captain: "Mo Feintuch", players: [["Mo", "Feintuch", true], ["Mattis", "Zamir"], ["Dan", "Vapne"], ["Adam", "Huttel"], ["Mendy", "Hecht"], ["Jacob", "Khafizov"], ["Daniel", "Greenbaum"]] },
  "t-lcl": { captain: "Rich Hochhauser", players: [["Rich", "Hochhauser", true], ["Sam", "Klein"], ["Yehuda", "Lisker"], ["Avner", "Baruch"], ["Eric", "Lifshitz"], ["Raphi", "Basalely"], ["Max", "Joseph"]] },
  "t-tel": { captain: "Jesse Slone", players: [["Jesse", "Slone", true], ["Aaron", "Neuman"], ["Effie", "Hoffman"], ["Zevi", "Bachrach"], ["Shlomo", "Reich"], ["Ari", "Beslky"], ["Simcha", "Schick"]] },
  "t-zlw": { captain: "Shmuel Englander", players: [["Shmuel", "Englander", true], ["Sender", "Ehrman"], ["Eliyahu", "Klein"], ["Avi", "Newman"], ["Shaya", "Lazar"], ["Shimmy", "Epstein"], ["Shimon", "Ohana"]] },
  "t-jwk": { captain: "Yehuda Zin", players: [["Yehuda", "Zin", true], ["Shimon", "Benklifa"], ["Zevi", "Litwin"], ["Sruli", "Botwinick"], ["Shimi", "Schiffer"], ["Pesach", "Bixon"], ["Yisroel", "Rubin"]] }
};

export const DEMO_TEAMS: TeamVM[] = RAW_TEAMS.map((t) => ({
  id: t.id,
  name: t.name,
  abbreviation: t.abbr,
  division: t.division,
  captainName: ROSTERS[t.id].captain,
  homeColor: t.color,
  wins: t.wins,
  losses: t.losses,
  pointsFor: t.pf,
  pointsAgainst: t.pa
}));

const teamById = (id: string) => DEMO_TEAMS.find((t) => t.id === id)!;
const POS = ["G", "G", "F", "F", "C", "G", "F"];

export const DEMO_PLAYERS: PlayerVM[] = [];
RAW_TEAMS.forEach((team, teamIdx) => {
  ROSTERS[team.id].players.forEach((entry, i) => {
    const [first, last, isCaptain] = entry;
    const seed = teamIdx * 7 + i;
    // Captains and top-of-roster players score more; deterministic + plausible.
    const points = Math.max(4, Math.round((isCaptain ? 21 : 19 - i * 2.1 + (seed % 4)) * 10) / 10);
    DEMO_PLAYERS.push({
      id: `p-${team.abbr.toLowerCase()}-${i}`,
      firstName: first,
      lastName: last,
      teamId: team.id,
      teamName: team.name,
      jerseyNumber: (seed * 3 + 4) % 40,
      position: POS[i % POS.length],
      status: "active",
      stats: {
        points,
        assists: Math.round((6 - i + (seed % 3)) * 10) / 10,
        rebounds: Math.round((4 + (i % 5) + (seed % 4)) * 10) / 10,
        steals: Math.round((1.4 + (seed % 2) * 0.6) * 10) / 10,
        blocks: Math.round((0.5 + (i % 3) * 0.4) * 10) / 10,
        gamesPlayed: 11
      }
    });
  });
});

const playerName = (teamId: string, idx: number) => {
  const [f, l] = ROSTERS[teamId].players[idx];
  return l ? `${f} ${l}` : f;
};

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
  { id: "g-1", home: "t-5tr", away: "t-chc", day: 1, week: 12, venue: "Main Gym", status: "scheduled" },
  { id: "g-2", home: "t-gmi", away: "t-prp", day: 1, week: 12, venue: "Court B", status: "scheduled" },
  { id: "g-3", home: "t-shk", away: "t-oxf", day: 2, week: 12, venue: "Main Gym", status: "scheduled" },
  { id: "g-4", home: "t-chs", away: "t-apt", day: 2, week: 12, venue: "Court B", status: "scheduled" },
  { id: "g-5", home: "t-lcl", away: "t-tel", day: 4, week: 13, venue: "Main Gym", status: "scheduled" },
  { id: "g-6", home: "t-zlw", away: "t-jwk", day: -3, week: 11, venue: "Court B", status: "final", hs: 81, as: 88 }
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

const captainProp = playerName("t-5tr", 0); // Chaim Homnick

const RAW_MARKETS: RawMarket[] = [
  {
    id: "m-g1-ml",
    title: "5T Restoration to beat Crown Home Care",
    description: "Resolves YES if 5T Restoration wins the Week 12 matchup.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 250, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1-yes", label: "YES", shares: 175 },
      { id: "o-g1-no", label: "NO", shares: 70 }
    ]
  },
  {
    id: "m-g1-spread",
    title: "5T Restoration wins by 5+",
    description: "Resolves YES if 5T Restoration wins by 5 or more points.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 200, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1s-yes", label: "YES", shares: 95 },
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
    title: `${captainProp} scores 20+ points`,
    description: `Resolves YES if ${captainProp} records 20 or more points.`,
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-1", liquidity: 150, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g1p-yes", label: "YES", shares: 135 },
      { id: "o-g1p-no", label: "NO", shares: 75 }
    ]
  },
  {
    id: "m-g2-ml",
    title: "GMI Marketing to beat Premium Pergola",
    description: "Resolves YES if GMI Marketing wins.",
    scope: "GAME", kind: "BINARY", futureType: null, gameId: "g-2", liquidity: 200, closesDay: 1, status: "open",
    outcomes: [
      { id: "o-g2-yes", label: "YES", shares: 105 },
      { id: "o-g2-no", label: "NO", shares: 95 }
    ]
  },
  // --- Futures ---
  {
    id: "m-champ",
    title: "League Champion — Season 3",
    description: "Which team wins the Draft League Season 3 championship?",
    scope: "FUTURES", kind: "MULTI", futureType: "LEAGUE_CHAMPION", gameId: null, liquidity: 600, closesDay: 30, status: "open",
    outcomes: [
      { id: "o-ch-5tr", label: "5T Restoration", shares: 340 },
      { id: "o-ch-chs", label: "Cheese Store", shares: 300 },
      { id: "o-ch-chc", label: "Crown Home Care", shares: 260 },
      { id: "o-ch-shk", label: "Car Sharks", shares: 230 },
      { id: "o-ch-gmi", label: "GMI Marketing", shares: 200 },
      { id: "o-ch-jwk", label: "JWorks", shares: 160 },
      { id: "o-ch-prp", label: "Premium Pergola", shares: 150 },
      { id: "o-ch-apt", label: "Advantage PT", shares: 130 },
      { id: "o-ch-tel", label: "Teller Insurance", shares: 110 },
      { id: "o-ch-oxf", label: "Oxfordshire", shares: 90 },
      { id: "o-ch-lcl", label: "LI Criminal Law", shares: 60 },
      { id: "o-ch-zlw", label: "Zlotowitz Law", shares: 40 }
    ]
  },
  {
    id: "m-mvp",
    title: "Regular Season MVP",
    description: "Which player is named regular-season MVP?",
    scope: "FUTURES", kind: "MULTI", futureType: "REGULAR_SEASON_MVP", gameId: null, liquidity: 400, closesDay: 25, status: "open",
    outcomes: [
      { id: "o-mvp-homnick", label: "Chaim Homnick (5TR)", shares: 260 },
      { id: "o-mvp-gross", label: "Yitzi Gross (GMI)", shares: 210 },
      { id: "o-mvp-tabak", label: "Jeremy Tabak (CHC)", shares: 150 },
      { id: "o-mvp-schwartz", label: "Ari Schwartz (SHK)", shares: 130 },
      { id: "o-mvp-goldfarb", label: "Daniel Goldfarb (CHS)", shares: 110 }
    ]
  },
  {
    id: "m-scorer",
    title: "Leading Scorer",
    description: "Player with the highest points-per-game at season end.",
    scope: "FUTURES", kind: "MULTI", futureType: "LEADING_SCORER", gameId: null, liquidity: 350, closesDay: 25, status: "open",
    outcomes: [
      { id: "o-ls-homnick", label: "Chaim Homnick (5TR)", shares: 230 },
      { id: "o-ls-gross", label: "Yitzi Gross (GMI)", shares: 190 },
      { id: "o-ls-schwartz", label: "Ari Schwartz (SHK)", shares: 150 },
      { id: "o-ls-feintuch", label: "Mo Feintuch (APT)", shares: 120 }
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

for (const g of DEMO_GAMES) {
  g.marketCount = DEMO_MARKETS.filter((m) => m.gameId === g.id).length;
}

export const RAW_MARKET_STATES: Record<string, MarketState> = Object.fromEntries(
  RAW_MARKETS.map((m) => [
    m.id,
    { marketId: m.id, kind: m.kind, liquidity: m.liquidity, outcomes: m.outcomes.map((o) => ({ outcomeId: o.id, shares: o.shares })) }
  ])
);
