# League Markets — Private Sports League Prediction Market

A production-oriented, **play-money** prediction market for a private men's
recreational sports league. Kalshi / Polymarket-style UX (market cards, order
ticket, implied probabilities, portfolio, leaderboard) built for private league
use — **not** a real-money gambling product.

> ⚠️ **Compliance first.** This platform is play-money only. There are no
> deposits, withdrawals, or cash payouts, and no real-money wagering mechanics.
> Real-money functionality is **disabled by default** and intentionally gated
> behind a documented legal/compliance review (`ENABLE_REAL_MONEY`, off by
> default). Do not enable it without that review.

## Live demo

A static export of the app is deployed to GitHub Pages and runs fully in the
browser in demo mode:

**▶️ https://shimonbenklifa.github.io/live-betting-/**

(Deployed by `.github/workflows/pages.yml` on every push.)

## Highlights

- **Trading engine** — a single LMSR (Logarithmic Market Scoring Rule) market
  maker prices **binary** (YES/NO), **multiple-choice**, and **ranked** markets.
  Prices always sum to 1 and display as 1–99¢ implied probabilities.
- **Auditable money** — all balances are **integer credits**; every movement is
  an append-only ledger entry; balances can never go negative; the wallet
  balance always equals the sum of its ledger.
- **Game + futures markets** — moneylines, spreads, totals, player props, plus
  season-long futures (champion, MVP, leading scorer, awards, …).
- **Institutional-grade bulk import** — CSV/XLSX upload, field mapping,
  row-level validation, duplicate detection, preview, commit, rollback, audit
  log, and downloadable templates.
- **Admin console** — create markets, resolve markets with full audit trail,
  adjust balances (reason required), run imports.
- **Security** — Supabase Row-Level Security so members only see their own
  league, owners-only writes for financial tables, all trades validated
  server-side.
- **Runs out of the box** — with no database configured the app serves a rich,
  internally-consistent **demo league** so you can explore everything
  immediately.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (auth + Postgres
+ RLS) · Prisma ORM · Server Actions · Vitest.

## Quick start (demo mode)

```bash
npm install
npm run dev        # http://localhost:3000  → "Enter demo"
npm test           # 36 unit tests: pricing, engine, wallet, settlement, import
```

No `.env` needed for demo mode — the app detects the absence of `DATABASE_URL`
and serves the built-in demo dataset.

## Full setup (with Supabase / Postgres)

```bash
cp .env.example .env          # fill in DATABASE_URL, DIRECT_URL, Supabase keys
npm install
npm run db:generate           # prisma generate
npm run db:push               # create tables (or: npm run db:migrate)
psql "$DIRECT_URL" -f supabase/rls-policies.sql   # apply Row-Level Security
npm run db:seed               # provision the demo league in your database
npm run dev
```

### Environment variables

See [`.env.example`](./.env.example). Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Postgres (pooled / direct for migrations). Unset ⇒ demo mode. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; trusted writes that bypass RLS. |
| `ENABLE_REAL_MONEY` | **Leave `false`.** Compliance gate, off by default. |
| `DEFAULT_STARTING_CREDITS` | Play-credit grant for new members. |

## Architecture

```
src/
  lib/
    trading/            # ── the engine (pure, unit-tested) ──
      pricing.ts        #   LMSR cost / probabilities / quotes
      engine.ts         #   buy/sell quotes, position & P&L accounting
      wallet.ts         #   ledger entries, no-negative-balance invariant
      settlement.ts     #   resolve markets -> winner payouts + ledger
      service.ts        #   DB transaction: execute a trade atomically
      resolveService.ts #   DB transaction: resolve & settle a market
    import/             # ── bulk import (pure, unit-tested) ──
      templates.ts      #   canonical field defs + CSV templates
      validate.ts       #   field mapping, coercion, dup detection, reports
      parse.ts          #   CSV + XLSX parsing
    data/               #   read-side view models for the UI
    demo/               #   built-in demo dataset
    supabase/, prisma.ts, money.ts, config.ts
  components/           # ui/, layout/, market/, admin/
  app/
    (app)/              # authenticated shell: dashboard, league, markets,
                        # games, portfolio, leaderboard, futures, stats,
                        # teams, players, admin (+ import, resolve, markets,
                        # balances)
prisma/schema.prisma    # full Postgres schema (all models)
supabase/rls-policies.sql
```

### Build targets

- **Server (default):** `npm run build` / `npm start` — full SSR; the
  DB-backed write services (`src/lib/trading/service.ts`,
  `resolveService.ts`) execute trades & resolutions in serializable
  transactions.
- **Static (GitHub Pages):** `GITHUB_PAGES=true npm run build` → `out/`. The UI
  runs entirely client-side in demo mode (the LMSR pricing engine is pure, so
  quotes and previews are computed in the browser).

### Why one `Market` model for games *and* futures?

Futures are simply markets with `scope = FUTURES` and 2+ outcomes
(`MULTI`/`RANKED`). Sharing one `Market`/`Outcome`/`Order`/`Trade`/`Position`
model gives a **single, auditable settlement path** and avoids duplicated
trading logic — the right call for correctness and maintainability.

## Trading mechanics

- New members receive `DEFAULT_STARTING_CREDITS` play credits (a `SIGNUP_GRANT`
  ledger entry).
- Each market is priced by LMSR. **Price (cents) ≈ implied probability.**
- Buying debits credits and adds to your position cost basis; selling credits
  proceeds and realizes P&L proportionally. No shorting; no negative balances.
- **No trades after a market's close time.**
- On resolution, **winning shares settle at 100 credits**, losing shares at 0.
  Every winner payout writes a `MARKET_SETTLEMENT` ledger entry, and the
  resolution writes a `market_resolutions` row + an `admin_audit_log` entry.

## Data models

`users · leagues · league_members · teams · players · games · markets ·
outcomes · orders · trades · positions · wallets · ledger_entries ·
market_resolutions · admin_audit_log · import_batches · import_rows ·
player_season_stats · team_season_stats · awards · award_candidates ·
standings_snapshots · stat_leaderboards`

(Futures markets & outcomes are represented by `markets`/`outcomes` with
`scope = FUTURES`; awards reference the futures market they trade.)

## Security model

- **RLS** (`supabase/rls-policies.sql`): members read only their own league;
  wallets/ledger/orders/positions are owner-scoped; audit log & imports are
  admin-only.
- **No client write policies** on financial tables — all balance/trade/
  settlement writes go through trusted server code (service role) that
  re-validates against authoritative state. Client-supplied prices/balances are
  never trusted.
- Admin financial-like actions (resolve, adjust balance, import) require
  admin/owner role and are recorded in the audit log; balance adjustments
  require a reason.

## Testing

```bash
npm test
```

Covers the money-critical core: LMSR pricing invariants & numerical stability,
buy/sell quoting & rounding, position cost-basis / realized & unrealized P&L,
the wallet ledger (no-negative-balance, admin-reason requirement, ledger
consistency), market settlement (winner payout, credit conservation, ledger
links), and bulk-import validation (mapping, coercion, duplicate detection).

## Roadmap to production

The read layer currently serves the demo dataset; swapping each reader in
`src/lib/data` to a Prisma query (one query boundary each) wires the UI to the
seeded database. The DB-backed write paths (`src/lib/trading/service.ts`,
`resolveService.ts`) implement atomic trade execution and settlement; wiring
them behind server actions (replacing the client-side demo previews in
`src/lib/demo/actions.ts`) is the production trading path once `DATABASE_URL`
is configured.
