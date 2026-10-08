insert into public.markets (id,name,district,state,latitude,longitude,modal_price,min_price,max_price,stability,trend,source)
values
('NLG-01','Nalgonda Local Mandi','Nalgonda','Telangana',17.05,79.27,22,18,27,0.88,0.018,'MandiMitra Demo Dataset'),
('NLG-02','Miryalaguda APMC','Nalgonda','Telangana',16.87,79.56,23,19,28,0.82,0.026,'MandiMitra Demo Dataset'),
('NLG-03','Suryapet Market','Suryapet','Telangana',17.14,79.62,24,20,30,0.76,0.041,'MandiMitra Demo Dataset'),
('NLG-04','Devarakonda Market','Nalgonda','Telangana',16.69,79.35,24.7,20,31,0.63,0.055,'MandiMitra Demo Dataset'),
('YAD-01','Yadadri Market','Yadadri Bhuvanagiri','Telangana',17.53,78.89,25.5,21,32,0.70,0.035,'MandiMitra Demo Dataset'),
('HYD-01','Bowenpally Wholesale Market','Hyderabad','Telangana',17.48,78.46,26,22,33,0.72,0.052,'MandiMitra Demo Dataset'),
('MED-01','Medak Market','Medak','Telangana',18.05,78.26,27.5,23,35,0.61,0.066,'MandiMitra Demo Dataset'),
('WAR-01','Warangal Market','Hanamkonda','Telangana',18.00,79.59,28,24,36,0.59,0.070,'MandiMitra Demo Dataset'),
('KRM-01','Karimnagar Market','Karimnagar','Telangana',18.44,79.13,28.4,24,36,0.74,0.033,'MandiMitra Demo Dataset')
on conflict (id) do update set modal_price=excluded.modal_price, updated_at=now();

insert into public.buyer_requirements (company_name,type,crop,quantity_kg,grade,offer_price,latitude,longitude,city,pickup_provided,required_by,payment_days,status)
values
('Deccan Fresh Foods','Food Processor','Tomato',5000,'A',29,17.39,78.48,'Hyderabad',true,'2026-10-12',3,'Open'),
('Urban Bowl Kitchens','Restaurant Group','Tomato',2500,'A',27,17.22,79.01,'Bhongir',false,'2026-10-11',2,'Open'),
('Nizam Agro Processing','Processing Unit','Tomato',8000,'B+',25.5,17.56,78.67,'Bhuvanagiri',true,'2026-10-14',5,'Open');

insert into public.price_history (crop,market_id,date,price) values
('Tomato','NLG-01','2026-09-25',21.2),
('Tomato','NLG-01','2026-09-26',21.5),
('Tomato','NLG-01','2026-09-27',21.8),
('Tomato','NLG-01','2026-09-28',22.1),
('Tomato','NLG-01','2026-09-29',21.7),
('Tomato','NLG-01','2026-09-30',22.2),
('Tomato','NLG-01','2026-10-01',22.4),
('Tomato','NLG-01','2026-10-02',22.0),
('Tomato','NLG-01','2026-10-03',22.5),
('Tomato','NLG-01','2026-10-04',22.7),
('Tomato','NLG-01','2026-10-05',22.4),
('Tomato','NLG-01','2026-10-06',23.0),
('Tomato','NLG-01','2026-10-07',22.8),
('Tomato','NLG-01','2026-10-08',23.0);
