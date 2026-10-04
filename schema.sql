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

-- Achats de jetons (Stripe). Les lignes sont écrites uniquement côté serveur
-- (fonctions Edge payments / stripe-webhook, clé service) ; le client lit les siennes
-- et les encaisse une seule fois via claim_coin_purchases().
create table if not exists public.coin_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_session_id text not null unique,
  pack_id text not null,
  coins int not null check (coins > 0),
  amount_cents int not null,
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending', 'paid')),
  credited boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists coin_purchases_user_idx on public.coin_purchases (user_id);
alter table public.coin_purchases enable row level security;
create policy "coin_purchases_select" on public.coin_purchases for select using ((select auth.uid()) = user_id);

-- Encaisse les achats payés pas encore crédités ; renvoie le total de jetons.
create or replace function public.claim_coin_purchases()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare total int;
begin
  with claimed as (
    update public.coin_purchases set credited = true
    where user_id = (select auth.uid()) and status = 'paid' and not credited
    returning coins
  )
  select coalesce(sum(coins), 0)::int into total from claimed;
  return total;
end;
$$;
revoke all on function public.claim_coin_purchases() from public, anon;
grant execute on function public.claim_coin_purchases() to authenticated;

-- Pass de saison Or (0,99 €) : ligne pack_id = 'pass', encaissée à part
-- (claim_coin_purchases ignore désormais les lignes 'pass').
create or replace function public.claim_pass_purchases()
returns int language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  with claimed as (
    update public.coin_purchases set credited = true
    where user_id = (select auth.uid()) and status = 'paid' and not credited and pack_id = 'pass'
    returning 1
  )
  select count(*)::int into n from claimed;
  return n;
end;
$$;
revoke all on function public.claim_pass_purchases() from public, anon;
grant execute on function public.claim_pass_purchases() to authenticated;
