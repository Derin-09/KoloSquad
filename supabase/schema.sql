-- Supabase schema for KoloSquad MVP
-- Run this in your Supabase SQL editor before using the app

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles are automatically keyed by auth.uid()
create table if not exists profiles (
  id uuid primary key default auth.uid(),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Squads
create table if not exists squads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  target_amount numeric not null,
  goal_currency text not null default 'NGN',
  created_by uuid not null references profiles(id) on delete cascade,
  invite_code text unique not null,
  created_at timestamp with time zone default now()
);

-- Squad membership
create table if not exists squad_members (
  squad_id uuid not null references squads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamp with time zone default now(),
  primary key (squad_id, user_id)
);

-- Contributions
create table if not exists contributions (
  id uuid primary key default uuid_generate_v4(),
  squad_id uuid not null references squads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric not null,
  status text not null default 'pending', -- pending | success | failed
  reference text,
  created_at timestamp with time zone default now()
);

-- Badges
create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  squad_id uuid not null references squads(id) on delete cascade,
  type text not null, -- e.g. 'first_contribution'
  awarded_at timestamp with time zone default now()
);

-- Basic RLS
alter table profiles enable row level security;
alter table squads enable row level security;
alter table squad_members enable row level security;
alter table contributions enable row level security;
alter table badges enable row level security;

-- Policies (simplified for MVP; tighten for production)
-- Profiles: a user can select/update their own profile
create policy if not exists "select own profile" on profiles
  for select using (auth.uid() = id);
create policy if not exists "update own profile" on profiles
  for update using (auth.uid() = id);

-- Squads: members can select; creators can insert/update/delete
create policy if not exists "select squads for members" on squads
  for select using (
    exists (select 1 from squad_members sm where sm.squad_id = id and sm.user_id = auth.uid())
  );
create policy if not exists "insert squad" on squads
  for insert with check (created_by = auth.uid());
create policy if not exists "update own squad" on squads
  for update using (created_by = auth.uid());

-- Squad members: user can see their memberships; insert allowed for member self-join
create policy if not exists "select memberships" on squad_members
  for select using (user_id = auth.uid());
create policy if not exists "insert membership" on squad_members
  for insert with check (user_id = auth.uid());

-- Contributions: user can see/insert their own
create policy if not exists "select own contributions" on contributions
  for select using (user_id = auth.uid());
create policy if not exists "insert own contributions" on contributions
  for insert with check (user_id = auth.uid());

-- Badges: user can see their badges
create policy if not exists "select own badges" on badges
  for select using (user_id = auth.uid());
