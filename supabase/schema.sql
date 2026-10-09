-- Mandi Mitra Schema with Verified Daily Mandi Price Management System
-- Run in Supabase SQL editor.

create extension if not exists pgcrypto;

-- 1. MARKETS
create table if not exists public.markets (
  id text primary key,
  name text not null,
  district text not null,
  state text not null,
  latitude double precision not null,
  longitude double precision not null,
  modal_price numeric(10,2) not null default 0,
  min_price numeric(10,2) default 0,
  max_price numeric(10,2) default 0,
  stability numeric(5,4) default 0.7,
  trend numeric(8,5) default 0,
  source text default 'Mandi Mitra Cache',
  reporting_enabled boolean default true,
  updated_at timestamptz default now()
);

-- 2. USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  phone text,
  password_hash text not null,
  role text not null check (role in ('farmer', 'official', 'admin')),
  account_status text not null default 'active' check (account_status in ('active', 'pending', 'suspended')),
  email_verified boolean default false,
  phone_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. OFFICIAL PROFILES
create table if not exists public.official_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_name text not null,
  official_id_reference text not null,
  assigned_market_ids jsonb not null default '[]'::jsonb,
  verification_status text not null default 'PENDING_VERIFICATION' check (verification_status in ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  verification_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. COMMODITIES
create table if not exists public.commodities (
  id uuid primary key default gen_random_uuid(),
  commodity_name text not null,
  variety text default 'Common',
  grade text default 'Grade A',
  canonical_unit text default '₹/Quintal',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. DAILY COMMODITY PRICES (PRICE SUBMISSIONS & PUBLISHED RECORDS)
create table if not exists public.commodity_prices (
  id uuid primary key default gen_random_uuid(),
  market_id text not null,
  market_name text not null,
  district text not null,
  state text not null default 'Telangana',
  commodity_name text not null,
  variety text default 'Common',
  grade text default 'Grade A',
  reporting_date date not null,
  min_price numeric(10,2) not null check (min_price >= 0),
  max_price numeric(10,2) not null check (max_price >= min_price),
  modal_price numeric(10,2) not null check (modal_price >= min_price and modal_price <= max_price),
  unit text not null default '₹/Quintal',
  arrival_quantity numeric(12,2) default 0,
  source_type text not null default 'VERIFIED_MARKET_SUBMISSION' check (source_type in ('VERIFIED_MARKET_SUBMISSION', 'GOVERNMENT_API', 'ADMIN_ENTERED')),
  source_reference text,
  remarks text,
  submitted_by uuid references public.users(id),
  submitted_by_name text,
  approved_by uuid references public.users(id),
  status text not null default 'PENDING_REVIEW' check (status in ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'NEEDS_CORRECTION')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. PRICE AUDIT LOGS
create table if not exists public.price_audit_logs (
  id uuid primary key default gen_random_uuid(),
  price_record_id uuid not null,
  actor_user_id uuid references public.users(id),
  actor_name text not null,
  action text not null,
  previous_values jsonb,
  new_values jsonb,
  reason text,
  created_at timestamptz default now()
);

-- 7. REVIEW LOGS
create table if not exists public.review_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null,
  reviewer_id uuid references public.users(id),
  reviewer_name text not null,
  action text not null,
  comments text,
  previous_status text,
  new_status text,
  created_at timestamptz default now()
);

-- 8. EXISTING TABLES PRESERVED
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  market_id text references public.markets(id) on delete cascade,
  date date not null,
  price numeric(10,2) not null,
  source text default 'Mandi Mitra Cache'
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

-- INDEXES
create index if not exists idx_commodity_prices_search on public.commodity_prices(commodity_name, market_id, reporting_date, status);
create index if not exists idx_commodity_prices_published on public.commodity_prices(status, reporting_date desc);
create index if not exists idx_official_profiles_user on public.official_profiles(user_id);
create index if not exists idx_price_audit_logs_record on public.price_audit_logs(price_record_id);

-- ROW LEVEL SECURITY (RLS)
alter table public.markets enable row level security;
alter table public.users enable row level security;
alter table public.official_profiles enable row level security;
alter table public.commodities enable row level security;
alter table public.commodity_prices enable row level security;
alter table public.price_audit_logs enable row level security;
alter table public.review_logs enable row level security;
alter table public.price_history enable row level security;
alter table public.buyer_requirements enable row level security;
alter table public.farmers enable row level security;
alter table public.harvests enable row level security;

-- POLICIES
drop policy if exists markets_all on public.markets;
create policy markets_all on public.markets for all to anon, authenticated using (true) with check (true);

drop policy if exists commodities_all on public.commodities;
create policy commodities_all on public.commodities for all to anon, authenticated using (true) with check (true);

drop policy if exists commodity_prices_all on public.commodity_prices;
create policy commodity_prices_all on public.commodity_prices for all to anon, authenticated using (true) with check (true);

drop policy if exists buyer_requirements_all on public.buyer_requirements;
create policy buyer_requirements_all on public.buyer_requirements for all to anon, authenticated using (true) with check (true);

drop policy if exists price_history_all on public.price_history;
create policy price_history_all on public.price_history for all to anon, authenticated using (true) with check (true);

drop policy if exists users_all on public.users;
create policy users_all on public.users for all to anon, authenticated using (true) with check (true);

drop policy if exists official_profiles_all on public.official_profiles;
create policy official_profiles_all on public.official_profiles for all to anon, authenticated using (true) with check (true);

drop policy if exists price_audit_logs_all on public.price_audit_logs;
create policy price_audit_logs_all on public.price_audit_logs for all to anon, authenticated using (true) with check (true);

drop policy if exists review_logs_all on public.review_logs;
create policy review_logs_all on public.review_logs for all to anon, authenticated using (true) with check (true);

drop policy if exists farmers_all on public.farmers;
create policy farmers_all on public.farmers for all to anon, authenticated using (true) with check (true);

drop policy if exists harvests_all on public.harvests;
create policy harvests_all on public.harvests for all to anon, authenticated using (true) with check (true);
