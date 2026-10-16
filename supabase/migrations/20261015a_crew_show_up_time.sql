-- Crew show-up time per stage (additive)
alter table public.jobs add column if not exists demo_time time, add column if not exists concrete_time time, add column if not exists carpentry_time time, add column if not exists electric_time time;
CREATE OR REPLACE FUNCTION public.crew_schedule(p_crew text, p_pin text, p_week_start date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare c crew_pins; ws date := p_week_start - ((extract(isodow from p_week_start)::int)-1); we date; out jsonb;
begin
  we := ws + 6;
  select * into c from crew_pins where crew_key=lower(trim(p_crew));
  if not found then return jsonb_build_object('ok',false,'error','bad_pin'); end if;
  if c.locked_until is not null and c.locked_until>now() then return jsonb_build_object('ok',false,'error','locked'); end if;
  if c.pin_hash <> crypt(coalesce(p_pin,''),c.pin_hash) then
    update crew_pins set failed_count=case when failed_count+1>=5 then 0 else failed_count+1 end,
      locked_until=case when failed_count+1>=5 then now()+interval '15 minutes' else locked_until end
      where crew_key=c.crew_key;
    return jsonb_build_object('ok',false,'error','bad_pin');
  end if;
  update crew_pins set failed_count=0 where crew_key=c.crew_key and failed_count<>0;
  with s(stage,dcol,ccol,tcol) as (values('Demo','scheduled_demo','demo_crew','demo_time'),('Concrete','concrete_scheduled','concrete_crew','concrete_time'),
                                    ('Carpentry','carpentry_scheduled','carpentry_crew','carpentry_time'),('Electric','electric_date','electric_crew','electric_time')),
  x as (
    select s.stage, nullif(left(to_jsonb(j)->>s.dcol,10),'')::date as d, nullif(left(to_jsonb(j)->>s.tcol,5),'') as t, j.customer, j.address, j.city,
      j.garage_size, to_jsonb(j)->>'roof_type' as job_roof,
      (select jsonb_build_object('roof_type',e.roof_type,'wall_height',e.wall_height,'siding',e.siding,'garage_size',e.garage_size)
         from estimate_history e
         where coalesce(e.siding,'')<>'PLAN SET' and j.address is not null and lower(trim(e.address))=lower(trim(j.address))
         order by e.created_at desc limit 1) as est,
      j.demolition_required
    from jobs j cross join s
    where j.deleted_at is null and j.completed_date is null
      and lower(trim(coalesce(to_jsonb(j)->>s.ccol,'')))=c.crew_key
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'stage',stage,'date',d,'show_up_time',t,'customer',customer,'address',address,'city',city,
      'garage_size',coalesce(nullif(garage_size,''),est->>'garage_size'),
      'roof_type',coalesce(nullif(job_roof,''),est->>'roof_type'),
      'wall_height',est->>'wall_height','siding',est->>'siding','demolition_required',demolition_required)
    order by d, t nulls last, stage),'[]'::jsonb) into out
  from x where d between ws and we;
  return jsonb_build_object('ok',true,'crew',c.crew_name,'week_start',ws,'jobs',out);
end $function$
;
