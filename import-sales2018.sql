-- AGB import of 2018 sales (completed past jobs) from sales2018.xlsx. Safe to run more than once.
-- 184 address rows in the sheet -> 3 new jobs after dedupe (1 in-file duplicate, 180 already in the My Maps import).
-- Run in Supabase > SQL Editor. No exact dates in the sheet: dates null, year kept as hidden tag [AGB-YEAR:2018].
-- UNDO: delete from public.jobs where notes like '%AGB-IMPORT:sales2018-2026-10-15%';
begin;
alter table public.jobs add column if not exists roof_type text;
insert into public.jobs (customer,address,city,salesman_username,sold_date,garage_size,completed_date,latitude,longitude,notes,
  permit_status,demolition_required,demo_status,concrete_status,carpentry_status,electric_status,extras_required,extras_status,
  inspection_status,final_payment,deposit_status,hold_status,price,deposit,priority,created_by)
select v.customer,v.address,v.city,v.salesman,v.d,v.gs,v.d,v.lat,v.lng,v.notes,
  'N/A',false,'N/A','N/A','Garage Built','Not Included',false,'N/A','Passed','Paid','Received',false,0,0,'Normal',
  coalesce((select id from public.staff_profiles where lower(username)='ramsey' limit 1),auth.uid())
from (values
('Milan Drobniak','0N480 Farwell St','Wheaton','unassigned',null::date,null,41.881609184368,-88.117623611578,'[AGB-IMPORT:sales2018-2026-10-15]
[AGB-YEAR:2018]'),
('Eduardo Rodriguez','3916 W 61st Street','Chicago','unassigned',null::date,null,41.782379527221,-87.721132042534,'[AGB-IMPORT:sales2018-2026-10-15]
[AGB-YEAR:2018]'),
('Davis Schaefer','6307 W Huntington','Chicago','unassigned',null::date,null,41.993316865069,-87.785167177661,'[AGB-IMPORT:sales2018-2026-10-15]
[AGB-YEAR:2018]')
) as v(customer,address,city,salesman,d,gs,lat,lng,notes)
where not exists (select 1 from public.jobs j where j.notes like '%AGB-IMPORT:sales2018-2026-10-15%' and j.customer=v.customer and j.address=v.address)
-- skip if the job is already in the DB: same house number + street word and same last name, or a pin within ~30 m
and not exists (select 1 from public.jobs j where
  ( split_part(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(lower(coalesce(j.address,'')),'united states|\m(il|illinois)\M|\m\d{5}(-\d{4})?\M','','g'),'[^a-z0-9 ]',' ','g'),'\m(street)\M','st','g'),'\m(avenue)\M','ave','g'),'\s+',' ','g'),' ',1)=split_part(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(lower(coalesce(v.address,'')),'united states|\m(il|illinois)\M|\m\d{5}(-\d{4})?\M','','g'),'[^a-z0-9 ]',' ','g'),'\m(street)\M','st','g'),'\m(avenue)\M','ave','g'),'\s+',' ','g'),' ',1)
    and position(split_part(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(lower(coalesce(v.address,'')),'united states|\m(il|illinois)\M|\m\d{5}(-\d{4})?\M','','g'),'[^a-z0-9 ]',' ','g'),'\m(street)\M','st','g'),'\m(avenue)\M','ave','g'),'\s+',' ','g'),'^\S+ ([nsew] )?',''),' ',1) in regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(lower(coalesce(j.address,'')),'united states|\m(il|illinois)\M|\m\d{5}(-\d{4})?\M','','g'),'[^a-z0-9 ]',' ','g'),'\m(street)\M','st','g'),'\m(avenue)\M','ave','g'),'\s+',' ','g'))>0
    and lower(regexp_replace(trim(j.customer),'^.*\s',''))=lower(regexp_replace(trim(v.customer),'^.*\s','')) )
  or (j.latitude is not null and abs(j.latitude-v.lat)<0.00027 and abs(j.longitude-v.lng)<0.00036));
-- Roof style from the spec text (only where the text states it; most specific first)
update public.jobs set roof_type = case
  when notes ~* '\mrev(erse|\.)?\s*gable' then 'Reverse Gable'
  when notes ~* '\mdutch\s*gable' then 'Dutch Gable'
  when notes ~* '\mdutch\s*hip' then 'Dutch Hip'
  when notes ~* '\mdutch\M' then 'Dutch'
  when notes ~* '\mgambrel\M' then 'Gambrel'
  when notes ~* '\mgable\M' then 'Gable'
  when notes ~* '\mhip\M' then 'Hip' end
where notes like '%[AGB-IMPORT:%' and roof_type is null
  and notes ~* '\m(rev(erse|\.)?\s*gable|dutch|gambrel|gable|hip)\M';
-- Dates: completed_date mirrors sold_date for imported rows (year-only rows stay null)
update public.jobs set completed_date = sold_date where notes like '%[AGB-IMPORT:%' and completed_date is null and sold_date is not null;
commit;
-- Check: select count(*) from public.jobs where notes like '%AGB-IMPORT:sales2018-2026-10-15%';  -- expect 3 (or fewer if the DB check skipped one)
