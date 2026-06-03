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
