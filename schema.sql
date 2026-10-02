-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor → New query

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_seed text default 'guest',
  level int default 1,
  xp int default 0,
  tokens int default 100,
  skin text default 'default',
  wins int default 0,
  games_played int default 0,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create table if not exists public.match_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  room_code text,
  score int default 0,
  rank int default 1,
  players_count int default 1,
  played_at timestamptz default now()
);
alter table public.match_history enable row level security;
create policy "history_select" on public.match_history for select using (auth.uid() = user_id);
create policy "history_insert" on public.match_history for insert with check (auth.uid() = user_id);

-- Sauvegarde cloud de la progression (utilisée par auth.js : loadSave / pushSave)
-- Une ligne par compte ; l'upsert du client se base sur la clé primaire user_id.
create table if not exists public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.saves enable row level security;
drop policy if exists "saves_select" on public.saves;
create policy "saves_select" on public.saves for select using (auth.uid() = user_id);
drop policy if exists "saves_insert" on public.saves;
create policy "saves_insert" on public.saves for insert with check (auth.uid() = user_id);
drop policy if exists "saves_update" on public.saves;
create policy "saves_update" on public.saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
