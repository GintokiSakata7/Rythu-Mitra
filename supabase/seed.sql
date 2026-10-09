-- Mandi Mitra Seed Data
-- Seeds Markets, Commodities, Users, Official Profiles, and Verified Daily Prices.

insert into public.markets (id,name,district,state,latitude,longitude,modal_price,min_price,max_price,stability,trend,source)
values
('TS-Bowenpally Market','Bowenpally Market','Hyderabad','Telangana',17.48,78.46,26,22,33,0.72,0.052,'RythuMitra APMC Cache'),
('TS-Warangal Market','Warangal Market','Hanamkonda','Telangana',18.00,79.59,28,24,36,0.59,0.070,'RythuMitra APMC Cache'),
('TS-Gudimalkapur Market','Gudimalkapur Market','Hyderabad','Telangana',17.39,78.45,25.5,21,31,0.75,0.040,'RythuMitra APMC Cache'),
('TS-Khammam Market','Khammam Market','Khammam','Telangana',17.25,80.15,27,23,34,0.68,0.048,'RythuMitra APMC Cache'),
('TS-Nalgonda Market','Nalgonda Market','Nalgonda','Telangana',17.05,79.27,22,18,27,0.88,0.018,'RythuMitra APMC Cache'),
('TS-Suryapet Market','Suryapet Market','Suryapet','Telangana',17.14,79.62,24,20,30,0.76,0.041,'RythuMitra APMC Cache'),
('TS-Nizamabad Market','Nizamabad Market','Nizamabad','Telangana',18.67,78.10,25,21,30,0.70,0.035,'RythuMitra APMC Cache')
on conflict (id) do update set modal_price=excluded.modal_price, updated_at=now();

-- 1. COMMODITIES
insert into public.commodities (id, commodity_name, variety, grade, canonical_unit, active)
values
('c0000000-0000-0000-0000-000000000001', 'Tomato', 'Hybrid / Local', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000002', 'Onion', 'Nashik / Local', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000003', 'Chilli Green', 'G4 Hot', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000004', 'Cotton', 'Medium Staple', 'FAQ', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000005', 'Paddy', 'BPT 5204 (Sona Masoori)', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000006', 'Turmeric', 'Finger Yellow', 'Standard', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000007', 'Bengal Gram', 'Desi', 'Grade A', '₹/Quintal', true),
('c0000000-0000-0000-0000-000000000008', 'Maize', 'Yellow', 'FAQ', '₹/Quintal', true)
on conflict (id) do nothing;

-- 2. USERS (Admin, Verified Official, Pending Official, Farmer)
insert into public.users (id, full_name, email, phone, password_hash, role, account_status, email_verified, phone_verified)
values
('a0000001-0000-0000-0000-000000000001', 'Dr. Rameshwar Rao (APMC Director)', 'admin@mandimitra.gov.in', '+91 98480 12345', 'ea67f3566d0db5615cb432381de0196d:362137c9666c185d2c7a4aa9f4ab0c69d0de668bc6839d3d5a148b6f7fdbda6e1ed4f96bb207dc44377cb96841b5240f02db9b1dc0de4ad619b3762ea3e098ee', 'admin', 'active', true, true),
('a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham (Bowenpally APMC)', 'official@bowenpally.mandi.gov.in', '+91 98480 23456', 'c0b0566bf2c4d493354f28673406a06d:d2bd0b7dfc0ed2f6d15224e10d26c6e49eb8ddad7cab7c268f26e912449199e4330ea42e4d28f7073028daa2aafb343b885179206c9e1b25e5a142846fafbd7e', 'official', 'active', true, true),
('a0000001-0000-0000-0000-000000000003', 'Smt. Lakshmi Devi (Warangal Yard)', 'official@warangal.mandi.gov.in', '+91 98480 34567', 'c0b0566bf2c4d493354f28673406a06d:d2bd0b7dfc0ed2f6d15224e10d26c6e49eb8ddad7cab7c268f26e912449199e4330ea42e4d28f7073028daa2aafb343b885179206c9e1b25e5a142846fafbd7e', 'official', 'active', true, true),
('a0000001-0000-0000-0000-000000000004', 'Anji Reddy (Rythu Sangham)', 'farmer@rythumitra.org', '+91 98480 45678', '66069132e55363f35139bd828d7d2d18:29e2b35abcf183939e0821c375742dbe793db7d3d3111ce7a1c1b35802c93ac58bd4b939e68efd2e18bd8eb7bc33ca9cb277f754482979e78f791f3e127cc206', 'farmer', 'active', true, true)
on conflict (email) do update set password_hash = excluded.password_hash;

-- 3. OFFICIAL PROFILES
insert into public.official_profiles (id, user_id, organization_name, official_id_reference, assigned_market_ids, verification_status, reviewed_by, verification_notes)
values
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'Bowenpally APMC Committee', 'TS-APMC-HYD-2024-88', '["TS-Bowenpally Market"]'::jsonb, 'APPROVED', 'a0000001-0000-0000-0000-000000000001', 'Official appointment verified by state directorate.'),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000003', 'Warangal Agricultural Market Yard', 'TS-APMC-WAR-2025-14', '["TS-Warangal Market"]'::jsonb, 'PENDING_VERIFICATION', null, 'Awaiting administrative identity check.')
on conflict (id) do nothing;

-- 4. VERIFIED PUBLISHED COMMODITY PRICES
insert into public.commodity_prices (id, market_id, market_name, district, state, commodity_name, variety, grade, reporting_date, min_price, max_price, modal_price, unit, arrival_quantity, source_type, source_reference, remarks, submitted_by, submitted_by_name, approved_by, status, published_at)
values
('d0000000-0000-0000-0000-000000000001', 'TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 'Tomato', 'Hybrid', 'Grade A', current_date, 2200, 2800, 2600, '₹/Quintal', 180, 'VERIFIED_MARKET_SUBMISSION', 'APMC Daily Ledger #102', 'Morning arrivals heavy from Shamshabad belt', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000002', 'TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 'Onion', 'Local Medium', 'Grade A', current_date, 1900, 2400, 2200, '₹/Quintal', 240, 'VERIFIED_MARKET_SUBMISSION', 'APMC Daily Ledger #103', 'Modal price holding steady', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now()),
('d0000000-0000-0000-0000-000000000003', 'TS-Bowenpally Market', 'Bowenpally Market', 'Hyderabad', 'Telangana', 'Chilli Green', 'Teja / G4', 'Grade A', current_date, 3800, 4600, 4200, '₹/Quintal', 95, 'VERIFIED_MARKET_SUBMISSION', 'APMC Daily Auction Sheet #89', 'Export grade lots cleared fast', 'a0000001-0000-0000-0000-000000000002', 'Sri K. Venkatesham', 'a0000001-0000-0000-0000-000000000001', 'PUBLISHED', now())
on conflict (id) do nothing;

-- 5. BUYER REQUIREMENTS
insert into public.buyer_requirements (company_name,type,crop,quantity_kg,grade,offer_price,latitude,longitude,city,pickup_provided,required_by,payment_days,status)
values
('Deccan Fresh Foods','Food Processor','Tomato',5000,'A',29,17.39,78.48,'Hyderabad',true,'2026-10-12',3,'Open'),
('Urban Bowl Kitchens','Restaurant Group','Tomato',2500,'A',27,17.22,79.01,'Bhongir',false,'2026-10-11',2,'Open'),
('Nizam Agro Processing','Processing Unit','Tomato',8000,'B+',25.5,17.56,78.67,'Bhuvanagiri',true,'2026-10-14',5,'Open')
on conflict do nothing;
