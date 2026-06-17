/**
 * Seed script — provisions a realistic demo league in a real database.
 *
 *   npm run db:seed   (requires DATABASE_URL)
 *
 * Mirrors the in-app demo dataset so a freshly-seeded DB matches the demo:
 * a league, 6 teams, 30 players, games, game + futures markets with priced
 * outcomes, members with funded wallets (signup grant ledger entries), and a
 * few sample trades/positions for the primary user.
 */

import { PrismaClient, MarketKind, MarketScope } from "@prisma/client";
import { DEMO_GAMES, DEMO_LEAGUE, DEMO_MARKETS, DEMO_PLAYERS, DEMO_TEAMS, DEMO_USER } from "../src/lib/demo/data";
import { postEntry } from "../src/lib/trading/wallet";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding league:", DEMO_LEAGUE.name);

  // Clean slate for the demo league (idempotent re-seed).
  await prisma.league.deleteMany({ where: { id: DEMO_LEAGUE.id } });

  const league = await prisma.league.create({
    data: {
      id: DEMO_LEAGUE.id,
      name: DEMO_LEAGUE.name,
      slug: DEMO_LEAGUE.slug,
      description: DEMO_LEAGUE.description,
      season: DEMO_LEAGUE.season,
      startingCredits: DEMO_LEAGUE.startingCredits,
      realMoneyEnabled: false
    }
  });

  // Teams + season stats
  for (const t of DEMO_TEAMS) {
    await prisma.team.create({
      data: {
        id: t.id,
        leagueId: league.id,
        name: t.name,
        abbreviation: t.abbreviation,
        division: t.division,
        captainName: t.captainName,
        homeColor: t.homeColor,
        awayColor: "#0e1117",
        seasonStats: {
          create: { season: league.season, wins: t.wins, losses: t.losses, pointsFor: t.pointsFor, pointsAgainst: t.pointsAgainst }
        }
      }
    });
  }

  // Players + season stats
  for (const p of DEMO_PLAYERS) {
    await prisma.player.create({
      data: {
        id: p.id,
        leagueId: league.id,
        teamId: p.teamId,
        firstName: p.firstName,
        lastName: p.lastName,
        jerseyNumber: p.jerseyNumber ?? undefined,
        position: p.position,
        status: p.status as "active" | "injured" | "inactive",
        seasonStats: {
          create: {
            season: league.season,
            points: p.stats.points,
            assists: p.stats.assists,
            rebounds: p.stats.rebounds,
            steals: p.stats.steals,
            blocks: p.stats.blocks,
            gamesPlayed: p.stats.gamesPlayed
          }
        }
      }
    });
  }

  // Games
  for (const g of DEMO_GAMES) {
    await prisma.game.create({
      data: {
        id: g.id,
        leagueId: league.id,
        homeTeamId: g.homeTeam.id,
        awayTeamId: g.awayTeam.id,
        startsAt: new Date(g.startsAt),
        venue: g.venue,
        week: g.week,
        status: g.status as "scheduled" | "live" | "final",
        homeScore: g.homeScore ?? undefined,
        awayScore: g.awayScore ?? undefined
      }
    });
  }

  // Markets + outcomes (with seeded LMSR inventory)
  for (const m of DEMO_MARKETS) {
    await prisma.market.create({
      data: {
        id: m.id,
        leagueId: league.id,
        gameId: m.gameId ?? undefined,
        scope: m.scope as MarketScope,
        kind: m.kind as MarketKind,
        title: m.title,
        description: m.description,
        liquidity: m.liquidity,
        closesAt: new Date(m.closesAt),
        createdById: DEMO_USER.id,
        outcomes: {
          create: m.outcomes.map((o, i) => ({ id: o.id, label: o.label, shares: o.shares, sortOrder: i }))
        }
      }
    });
  }

  // Primary user + a few members, each with a funded wallet.
  const members = [
    { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.displayName, role: "OWNER" as const },
    { id: "u-marcus", email: "marcus@league.demo", name: "Marcus R.", role: "MEMBER" as const },
    { id: "u-dre", email: "dre@league.demo", name: "Dre C.", role: "MEMBER" as const },
    { id: "u-sam", email: "sam@league.demo", name: "Sam P.", role: "ADMIN" as const }
  ];

  for (const mem of members) {
    await prisma.user.create({
      data: { id: mem.id, email: mem.email, displayName: mem.name, isPlatformAdmin: mem.role !== "MEMBER" }
    });
    await prisma.leagueMember.create({ data: { leagueId: league.id, userId: mem.id, role: mem.role } });

    const grant = postEntry("seed", 0, league.startingCredits, "SIGNUP_GRANT");
    const wallet = await prisma.wallet.create({
      data: { leagueId: league.id, userId: mem.id, balance: grant.balance }
    });
    await prisma.ledgerEntry.create({
      data: {
        walletId: wallet.id,
        reason: "SIGNUP_GRANT",
        delta: grant.entry.delta,
        balanceBefore: grant.entry.balanceBefore,
        balanceAfter: grant.entry.balanceAfter,
        memo: "Initial league play-credit grant"
      }
    });
  }

  await prisma.adminAuditLog.create({
    data: {
      leagueId: league.id,
      actorId: DEMO_USER.id,
      action: "CREATE_LEAGUE",
      entityType: "League",
      entityId: league.id,
      detail: { name: league.name, season: league.season, startingCredits: league.startingCredits }
    }
  });

  console.log(`Seeded ${DEMO_TEAMS.length} teams, ${DEMO_PLAYERS.length} players, ${DEMO_GAMES.length} games, ${DEMO_MARKETS.length} markets, ${members.length} members.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
