-- =============================================
-- MUNDIAL PORRAS — Schema para Supabase
-- Pega esto en el SQL Editor de Supabase
-- =============================================

-- JUGADORES
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  avatar text not null default '⚽',
  created_at timestamptz default now()
);

-- JORNADAS
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_time timestamptz not null,
  closed boolean default false,
  results_entered boolean default false,
  created_at timestamptz default now()
);

-- PARTIDOS (dentro de cada jornada)
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  home_team text not null,
  away_team text not null,
  home_score integer,
  away_score integer,
  played boolean default false,
  position integer default 0
);

-- PORRAS
create table if not exists bets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  round_id uuid references rounds(id) on delete cascade,
  home_bet integer not null,
  away_bet integer not null,
  created_at timestamptz default now(),
  unique(player_id, match_id)
);

-- POLÍTICA DE ACCESO PÚBLICO (sin auth, todos pueden leer/escribir)
alter table players enable row level security;
alter table rounds enable row level security;
alter table matches enable row level security;
alter table bets enable row level security;

create policy "public read players" on players for select using (true);
create policy "public insert players" on players for insert with check (true);
create policy "public delete players" on players for delete using (true);

create policy "public read rounds" on rounds for select using (true);
create policy "public insert rounds" on rounds for insert with check (true);
create policy "public update rounds" on rounds for update using (true);
create policy "public delete rounds" on rounds for delete using (true);

create policy "public read matches" on matches for select using (true);
create policy "public insert matches" on matches for insert with check (true);
create policy "public update matches" on matches for update using (true);
create policy "public delete matches" on matches for delete using (true);

create policy "public read bets" on bets for select using (true);
create policy "public insert bets" on bets for insert with check (true);
create policy "public delete bets" on bets for delete using (true);
