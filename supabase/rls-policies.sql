-- =============================================================================
-- Row-Level Security policies for the League Prediction Market.
--
-- Run AFTER `prisma db push` / `prisma migrate` has created the tables.
-- Supabase exposes the authenticated user id via auth.uid(). The app's `users`
-- table mirrors auth.users, so users.id == auth.uid().
--
-- Principles enforced here:
--   * A user can only read data for leagues they are a member of.
--   * A user can only read/modify their OWN wallet, ledger, orders, positions.
--   * Only league ADMIN/OWNER members may create/resolve markets, adjust
--     balances, run imports, and read the audit log.
--   * Inserts into financial tables (ledger, trades, resolutions) are performed
--     by server code using the service role, which bypasses RLS — clients are
--     never trusted to write balances directly.
-- =============================================================================

-- ---- helper functions -------------------------------------------------------

create or replace function public.is_league_member(p_league uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.league_members m
    where m."leagueId" = p_league and m."userId" = auth.uid()
  );
$$;

create or replace function public.is_league_admin(p_league uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.league_members m
    where m."leagueId" = p_league
      and m."userId" = auth.uid()
      and m.role in ('ADMIN', 'OWNER')
  );
$$;

-- ---- enable RLS -------------------------------------------------------------

alter table public.users               enable row level security;
alter table public.leagues             enable row level security;
alter table public.league_members      enable row level security;
alter table public.teams               enable row level security;
alter table public.players             enable row level security;
alter table public.games               enable row level security;
alter table public.markets             enable row level security;
alter table public.outcomes            enable row level security;
alter table public.wallets             enable row level security;
alter table public.ledger_entries      enable row level security;
alter table public.orders              enable row level security;
alter table public.trades              enable row level security;
alter table public.positions           enable row level security;
alter table public.market_resolutions  enable row level security;
alter table public.admin_audit_log     enable row level security;
alter table public.import_batches      enable row level security;
alter table public.import_rows         enable row level security;
alter table public.player_season_stats enable row level security;
alter table public.team_season_stats   enable row level security;
alter table public.standings_snapshots enable row level security;
alter table public.stat_leaderboards   enable row level security;
alter table public.awards              enable row level security;
alter table public.award_candidates    enable row level security;

-- ---- users ------------------------------------------------------------------

create policy "users read self" on public.users
  for select using (id = auth.uid());
create policy "users update self" on public.users
  for update using (id = auth.uid());

-- ---- leagues & membership ---------------------------------------------------

create policy "leagues readable by members" on public.leagues
  for select using (public.is_league_member(id));

create policy "members read own league memberships" on public.league_members
  for select using ("userId" = auth.uid() or public.is_league_admin("leagueId"));

-- ---- league-scoped read tables (members only) -------------------------------

create policy "teams readable by members" on public.teams
  for select using (public.is_league_member("leagueId"));
create policy "players readable by members" on public.players
  for select using (public.is_league_member("leagueId"));
create policy "games readable by members" on public.games
  for select using (public.is_league_member("leagueId"));
create policy "markets readable by members" on public.markets
  for select using (public.is_league_member("leagueId"));
create policy "standings readable by members" on public.standings_snapshots
  for select using (public.is_league_member("leagueId"));
create policy "leaderboards readable by members" on public.stat_leaderboards
  for select using (public.is_league_member("leagueId"));
create policy "awards readable by members" on public.awards
  for select using (public.is_league_member("leagueId"));

-- outcomes inherit visibility from their market
create policy "outcomes readable by members" on public.outcomes
  for select using (exists (
    select 1 from public.markets mk
    where mk.id = outcomes."marketId" and public.is_league_member(mk."leagueId")
  ));

-- ---- wallets / ledger: strictly the owner -----------------------------------

create policy "wallet owner read" on public.wallets
  for select using ("userId" = auth.uid() or public.is_league_admin("leagueId"));

create policy "ledger owner read" on public.ledger_entries
  for select using (exists (
    select 1 from public.wallets w
    where w.id = ledger_entries."walletId"
      and (w."userId" = auth.uid() or public.is_league_admin(w."leagueId"))
  ));

-- ---- orders / trades / positions: owner-only read ---------------------------

create policy "orders owner read" on public.orders
  for select using ("userId" = auth.uid());
create policy "trades owner read" on public.trades
  for select using ("userId" = auth.uid());
create policy "positions owner read" on public.positions
  for select using ("userId" = auth.uid());

-- ---- admin-only read tables -------------------------------------------------

create policy "audit log admin read" on public.admin_audit_log
  for select using (public.is_league_admin("leagueId"));
create policy "imports admin read" on public.import_batches
  for select using (public.is_league_admin("leagueId"));
create policy "import rows admin read" on public.import_rows
  for select using (exists (
    select 1 from public.import_batches b
    where b.id = import_rows."batchId" and public.is_league_admin(b."leagueId")
  ));

-- NOTE: No client INSERT/UPDATE/DELETE policies are defined for financial
-- tables. All writes go through trusted server code using the service-role key
-- (which bypasses RLS). This guarantees balances can never be mutated directly
-- by a client, only by the validated server trading/settlement engine.
