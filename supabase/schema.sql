-- RythuMitra schema
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.markets (
  id text primary key,
  name text not null,
  district text not null,
  state text not null,
  latitude double precision not null,
  longitude double precision not null,
  modal_price numeric(10,2) not null,
  min_price numeric(10,2) default 0,
  max_price numeric(10,2) default 0,
  stability numeric(5,4) default 0.7,
  trend numeric(8,5) default 0,
  source text default 'RythuMitra cache',
  updated_at timestamptz default now()
);

create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  market_id text references public.markets(id) on delete cascade,
  date date not null,
  price numeric(10,2) not null,
  source text default 'RythuMitra cache'
);

create table if not exists public.buyer_requirements (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  type text not null,
  crop text not null,
  quantity_kg numeric(14,2) not null,
  grade text,
  offer_price numeric(10,2) not null,
  latitude double precision not null,
  longitude double precision not null,
  city text,
  pickup_provided boolean default false,
  required_by date,
  payment_days integer default 3,
  status text default 'Open',
  created_at timestamptz default now()
);

create table if not exists public.farmers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  latitude double precision,
  longitude double precision,
  location_text text,
  has_transport boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.harvests (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.farmers(id) on delete cascade,
  crop text not null,
  quantity_kg numeric(14,2) not null,
  grade text,
  perishability text default 'high',
  created_at timestamptz default now()
);

alter table public.markets enable row level security;
alter table public.price_history enable row level security;
alter table public.buyer_requirements enable row level security;
alter table public.farmers enable row level security;
alter table public.harvests enable row level security;

-- Demo-friendly read policies. For production, replace these with authenticated role policies.
drop policy if exists markets_public_read on public.markets;
create policy markets_public_read on public.markets for select to anon, authenticated using (true);

drop policy if exists prices_public_read on public.price_history;
create policy prices_public_read on public.price_history for select to anon, authenticated using (true);

drop policy if exists buyers_public_read on public.buyer_requirements;
create policy buyers_public_read on public.buyer_requirements for select to anon, authenticated using (status = 'Open');

-- The server uses service_role, so normal browser clients do not need write access.
