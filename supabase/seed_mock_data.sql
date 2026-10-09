-- ============================================================================
-- MANDI MITRA / RYTHUMITRA: MOCK SEED DATA SCRIPT
-- ============================================================================
-- Run this in Supabase Project -> SQL Editor -> Run
-- This populates:
--  1. 12 Telangana APMC Wholesale Mandis
--  2. 10 Essential Commodities
--  3. 4 Demo User Accounts (Admin, Officials, Farmer)
--  4. Official Verification Profiles
--  5. Verified Published Daily Prices
--  6. 8 Agribusiness Direct Buyers
--  7. 15 Historical Price Trend Records
--  8. Audit Review Log
-- ============================================================================

-- 1. MARKETS (Telangana Agricultural Wholesale APMC Markets)
insert into public.markets (id, name, district, state, latitude, longitude, modal_price, min_price, max_price, stability, trend, source)
values
('TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 17.48, 78.46, 26.00, 22.00, 33.00, 0.72, 0.052, 'RythuMitra APMC Cache'),
('TS-Warangal Market', 'Warangal Market', 'Hanamkonda', 'Telangana', 18.00, 79.59, 28.00, 24.00, 36.00, 0.59, 0.070, 'RythuMitra APMC Cache'),
('TS-Gudimalkapur Market', 'Gudimalkapur Market', 'Hyderabad', 'Telangana', 17.39, 78.45, 25.50, 21.00, 31.00, 0.75, 0.040, 'RythuMitra APMC Cache'),
('TS-Khammam Market', 'Khammam Market', 'Khammam', 'Telangana', 17.25, 80.15, 27.00, 23.00, 34.00, 0.68, 0.048, 'RythuMitra APMC Cache'),
('TS-Nalgonda Market', 'Nalgonda Market', 'Nalgonda', 'Telangana', 17.05, 79.27, 22.00, 18.00, 27.00, 0.88, 0.018, 'RythuMitra APMC Cache'),
('TS-Suryapet Market', 'Suryapet Market', 'Suryapet', 'Telangana', 17.14, 79.62, 24.00, 20.00, 30.00, 0.76, 0.041, 'RythuMitra APMC Cache'),
('TS-Miryalaguda Market', 'Miryalaguda Market', 'Nalgonda', 'Telangana', 16.87, 79.56, 23.00, 19.00, 28.00, 0.82, 0.025, 'RythuMitra APMC Cache'),
('TS-Nizamabad Market', 'Nizamabad Market', 'Nizamabad', 'Telangana', 18.67, 78.10, 25.00, 21.00, 30.00, 0.70, 0.035, 'RythuMitra APMC Cache'),
('TS-Karimnagar Market', 'Karimnagar Market', 'Karimnagar', 'Telangana', 18.44, 79.13, 26.50, 22.50, 32.00, 0.73, 0.039, 'RythuMitra APMC Cache'),
('TS-Mahabubnagar Market', 'Badepally Market', 'Mahabubnagar', 'Telangana', 16.74, 78.00, 24.50, 20.50, 29.50, 0.80, 0.022, 'RythuMitra APMC Cache'),
('TS-Siddipet Market', 'Siddipet Market', 'Siddipet', 'Telangana', 18.10, 78.85, 25.00, 21.00, 31.00, 0.74, 0.031, 'RythuMitra APMC Cache'),
('TS-Adilabad Market', 'Adilabad Market', 'Adilabad', 'Telangana', 19.66, 78.53, 23.50, 19.50, 28.50, 0.78, 0.020, 'RythuMitra APMC Cache')
on conflict (id) do update set
  modal_price = excluded.modal_price,
  min_price = excluded.min_price,
  max_price = excluded.max_price,
  updated_at = now();

-- 2. COMMODITIES
insert into public.commodities (id, commodity_name, variety, grade, canonical_unit, active)
values
('c0000000-0000-0000-0000-000000000001', 'Tomato', 'Hybrid / Local', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000002', 'Onion', 'Nashik / Local', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000003', 'Chilli Green', 'G4 Hot / Teja', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000004', 'Potato', 'Jyoti / Local', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000005', 'Cotton', 'Medium Staple', 'FAQ', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000006', 'Paddy', 'BPT 5204 (Sona Masoori)', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000007', 'Turmeric', 'Finger Yellow', 'Standard', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000008', 'Bengal Gram', 'Desi', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000009', 'Maize', 'Yellow', 'FAQ', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000010', 'Red Gram', 'Maruti / Local', 'Grade A', '₹/Quintal', true)
on conflict (id) do nothing;

-- 3. USERS (Demo Accounts)
-- Admin: admin@mandimitra.gov.in -> Password: Admin@123
-- Bowenpally Official: official@bowenpally.mandi.gov.in -> Password: Official@123
-- Warangal Official: official@warangal.mandi.gov.in -> Password: Official@123
-- Farmer: farmer@rythumitra.org -> Password: Farmer@123
insert into public.users (id, full_name, email, phone, password_hash, role, account_status, email_verified, phone_verified)
values
('a0000001-0000-0000-0000-000000000001', 'Dr. Rameshwar Rao (APMC Director)', 'admin@mandimitra.gov.in', '+91 98480 12345', 'ea67f3566d0db5615cb432381de0196d:362137c9666c185d2c7a4aa9f4ab0c69d0de668bc6839d3d5a148b6f7fdbda6e1ed4f96bb207dc44377cb96841b5240f02db9b1dc0de4ad619b3762ea3e098ee', 'admin', 'active', true, true),
('a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham (Bowenpally APMC)', 'official@bowenpally.mandi.gov.in', '+91 98480 23456', 'c0b0566bf2c4d493354f28673406a06d:d2bd0b7dfc0ed2f6d15224e10d26c6e49eb8ddad7cab7c268f26e912449199e4330ea42e4d28f7073028daa2aafb343b885179206c9e1b25e5a142846fafbd7e', 'official', 'active', true, true),
('a0000001-0000-0000-0000-000000000003', 'Smt. Lakshmi Devi (Warangal Yard)', 'official@warangal.mandi.gov.in', '+91 98480 34567', 'c0b0566bf2c4d493354f28673406a06d:d2bd0b7dfc0ed2f6d15224e10d26c6e49eb8ddad7cab7c268f26e912449199e4330ea42e4d28f7073028daa2aafb343b885179206c9e1b25e5a142846fafbd7e', 'official', 'active', true, true),
('a0000001-0000-0000-0000-000000000004', 'Anji Reddy (Rythu Sangham)', 'farmer@rythumitra.org', '+91 98480 45678', '66069132e55363f35139bd828d7d2d18:29e2b35abcf183939e0821c375742dbe793db7d3d3111ce7a1c1b35802c93ac58bd4b939e68efd2e18bd8eb7bc33ca9cb277f754482979e78f791f3e127cc206', 'farmer', 'active', true, true)
on conflict (email) do update set
  password_hash = excluded.password_hash,
  account_status = excluded.account_status;

-- 4. OFFICIAL PROFILES
insert into public.official_profiles (id, user_id, organization_name, official_id_reference, assigned_market_ids, verification_status, reviewed_by, verification_notes)
values
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'Bowenpally Agricultural Market Committee (APMC)', 'TS-APMC-HYD-2024-88', '["TS-Bowenpally Market", "TS-Gudimalkapur Market"]'::jsonb, 'APPROVED', 'a0000001-0000-0000-0000-000000000001', 'Official appointment verified by state agricultural directorate.'),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003', 'Warangal Agricultural Market Committee', 'TS-APMC-WAR-2025-14', '["TS-Warangal Market"]'::jsonb, 'APPROVED', 'a0000001-0000-0000-0000-000000000001', 'Identity credential verified. Mandi Secretary authorization active.')
on conflict (id) do nothing;

-- 5. VERIFIED PUBLISHED DAILY COMMODITY PRICES
insert into public.commodity_prices (id, market_id, market_name, district, state, commodity_name, variety, grade, reporting_date, min_price, max_price, modal_price, unit, arrival_quantity, source_type, source_reference, remarks, submitted_by, submitted_by_name, approved_by, status, published_at)
values
('d0000000-0000-0000-0000-000000000001', 'TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 'Tomato', 'Hybrid', 'Grade A', current_date, 2200, 2800, 2600, '₹/Quintal', 180, 'VERIFIED_MARKET_SUBMISSION', 'APMC Daily Ledger #102', 'High morning arrivals from Shamshabad & Medchal belt. Heavy retail buyer demand.', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000002', 'TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 'Onion', 'Local Medium', 'Grade A', current_date, 1900, 2400, 2200, '₹/Quintal', 240, 'VERIFIED_MARKET_SUBMISSION', 'APMC Daily Ledger #103', 'Consistent arrivals, modal price holding steady.', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000003', 'TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 'Chilli Green', 'Teja / G4', 'Grade A', current_date, 3800, 4600, 4200, '₹/Quintal', 95, 'VERIFIED_MARKET_SUBMISSION', 'APMC Daily Auction Sheet #89', 'Export grade lots cleared quickly in morning auction.', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000004', 'TS-Warangal Market', 'Warangal Market', 'Hanamkonda', 'Telangana', 'Tomato', 'Local Hybrid', 'Grade A', current_date, 2400, 3100, 2800, '₹/Quintal', 120, 'VERIFIED_MARKET_SUBMISSION', 'Warangal APMC Auction #44', 'Steady demand from northern districts.', 'a0000001-0000-0000-0000-000000000003', 'Smt. Lakshmi Devi', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000005', 'TS-Warangal Market', 'Warangal Market', 'Hanamkonda', 'Telangana', 'Cotton', 'Medium Staple', 'FAQ', current_date, 6800, 7500, 7200, '₹/Quintal', 410, 'VERIFIED_MARKET_SUBMISSION', 'Warangal APMC Cotton Yard #12', 'CCI procurement and private trade active.', 'a0000001-0000-0000-0000-000000000003', 'Smt. Lakshmi Devi', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000006', 'TS-Gudimalkapur Market', 'Gudimalkapur Market', 'Hyderabad', 'Telangana', 'Tomato', 'Desi Local', 'Grade A', current_date, 2150, 2750, 2550, '₹/Quintal', 160, 'VERIFIED_MARKET_SUBMISSION', 'Gudimalkapur Daily Register #55', 'Wholesale lots cleared by city retailers.', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000007', 'TS-Khammam Market', 'Khammam Market', 'Khammam', 'Telangana', 'Chilli Green', 'Teja Hot', 'Grade A', current_date, 3900, 4700, 4300, '₹/Quintal', 210, 'VERIFIED_MARKET_SUBMISSION', 'Khammam Yard Ledger #88', 'Heavy arrivals from coastal bordering mandals.', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now())
on conflict (id) do nothing;

-- 6. BUYER REQUIREMENTS (Direct Agribusiness, Food Processors & Retail Hubs)
insert into public.buyer_requirements (company_name, type, crop, quantity_kg, grade, offer_price, latitude, longitude, city, pickup_provided, required_by, payment_days, status)
values
('Deccan Fresh Foods', 'Food Processor', 'Tomato', 5000, 'A', 29.00, 17.39, 78.48, 'Hyderabad', true, current_date + interval '3 days', 3, 'Open'),
('Urban Bowl Kitchens', 'Restaurant Group', 'Tomato', 2500, 'A', 27.00, 17.22, 79.01, 'Bhongir', false, current_date + interval '2 days', 2, 'Open'),
('Nizam Agro Processing', 'Processing Unit', 'Tomato', 8000, 'B+', 25.50, 17.56, 78.67, 'Bhuvanagiri', true, current_date + interval '5 days', 5, 'Open'),
('Telangana Mega Food Park', 'Export Aggregator', 'Tomato', 12000, 'A+', 30.00, 17.68, 77.61, 'Zaheerabad', true, current_date + interval '4 days', 3, 'Open'),
('ITC Agri Business Division', 'Food Processor', 'Chilli Green', 10000, 'A', 46.00, 17.25, 80.15, 'Khammam', true, current_date + interval '7 days', 2, 'Open'),
('BigBasket Sourcing Hub', 'E-Commerce Retailer', 'Onion', 6000, 'A', 24.00, 17.07, 78.20, 'Shadnagar', true, current_date + interval '3 days', 1, 'Open'),
('Reliance Retail Fresh Hub', 'Retail Chain', 'Potato', 7500, 'A', 23.00, 17.62, 78.48, 'Medchal', true, current_date + interval '4 days', 2, 'Open'),
('Warangal Spices & Exports', 'Spice Processor', 'Chilli Green', 4000, 'A', 45.00, 18.00, 79.59, 'Warangal', true, current_date + interval '5 days', 3, 'Open')
on conflict do nothing;

-- 7. PRICE HISTORY (For Analytics & Market Trend Charts)
insert into public.price_history (crop, market_id, date, price, source)
values
('Tomato', 'TS-Bowenpally Market', current_date - interval '14 days', 22.50, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date - interval '12 days', 23.00, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date - interval '10 days', 23.80, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date - interval '8 days', 24.20, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date - interval '6 days', 24.90, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date - interval '4 days', 25.50, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date - interval '2 days', 25.80, 'APMC Official'),
('Tomato', 'TS-Bowenpally Market', current_date, 26.00, 'APMC Official'),

('Onion', 'TS-Bowenpally Market', current_date - interval '14 days', 20.00, 'APMC Official'),
('Onion', 'TS-Bowenpally Market', current_date - interval '10 days', 20.50, 'APMC Official'),
('Onion', 'TS-Bowenpally Market', current_date - interval '6 days', 21.20, 'APMC Official'),
('Onion', 'TS-Bowenpally Market', current_date - interval '2 days', 21.80, 'APMC Official'),
('Onion', 'TS-Bowenpally Market', current_date, 22.00, 'APMC Official'),

('Chilli Green', 'TS-Bowenpally Market', current_date - interval '14 days', 38.00, 'APMC Official'),
('Chilli Green', 'TS-Bowenpally Market', current_date - interval '10 days', 39.50, 'APMC Official'),
('Chilli Green', 'TS-Bowenpally Market', current_date - interval '6 days', 40.80, 'APMC Official'),
('Chilli Green', 'TS-Bowenpally Market', current_date - interval '2 days', 41.50, 'APMC Official'),
('Chilli Green', 'TS-Bowenpally Market', current_date, 42.00, 'APMC Official'),

('Cotton', 'TS-Warangal Market', current_date - interval '14 days', 69.00, 'APMC Official'),
('Cotton', 'TS-Warangal Market', current_date - interval '10 days', 70.20, 'APMC Official'),
('Cotton', 'TS-Warangal Market', current_date - interval '6 days', 71.00, 'APMC Official'),
('Cotton', 'TS-Warangal Market', current_date - interval '2 days', 71.80, 'APMC Official'),
('Cotton', 'TS-Warangal Market', current_date, 72.00, 'APMC Official')
on conflict do nothing;

-- 8. INITIAL AUDIT LOGS
insert into public.price_audit_logs (id, price_record_id, actor_user_id, actor_name, action, previous_values, new_values, reason)
values
('e0000001-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Dr. Rameshwar Rao (APMC Director)', 'APPROVE_AND_PUBLISH', '{"status": "PENDING_REVIEW"}'::jsonb, '{"status": "PUBLISHED", "modalPrice": 2600}'::jsonb, 'Verified against official APMC Bowenpally daily arrival register.')
on conflict (id) do nothing;
