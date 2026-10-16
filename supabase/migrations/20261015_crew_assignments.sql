-- Crew assignments: notes, attachments, custom ("Other") stages, ZIP, and assign permission (additive only)
alter table public.jobs add column if not exists zip text;

create or replace function public.agb_can_assign_crew() returns boolean language sql stable security definer set search_path to 'public' as $f$
  select exists(select 1 from staff_profiles p where p.id=auth.uid() and p.active and lower(p.username) in ('ramsey','randy','sam'));
$f$;
revoke all on function public.agb_can_assign_crew() from public, anon;
grant execute on function public.agb_can_assign_crew() to authenticated;

create table if not exists public.crew_assignments(
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  stage text not null check (length(trim(stage)) between 1 and 80),
  is_custom boolean not null default false,
  crew text,
  sched_date date,
  show_up_time time,
  notes text check (notes is null or length(notes)<=4000),
  document_ids uuid[] not null default '{}',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, stage)
);
alter table public.crew_assignments enable row level security;
revoke all on public.crew_assignments from anon;
grant select, insert, update, delete on public.crew_assignments to authenticated;
drop policy if exists ca_select on public.crew_assignments;
create policy ca_select on public.crew_assignments for select to authenticated using (
  (select public.is_manager()) or (select public.agb_can_assign_crew())
  or exists(select 1 from public.jobs j where j.id=job_id and j.salesman_username=(select public.my_username())));
drop policy if exists ca_insert on public.crew_assignments;
create policy ca_insert on public.crew_assignments for insert to authenticated with check ((select public.agb_can_assign_crew()));
drop policy if exists ca_update on public.crew_assignments;
create policy ca_update on public.crew_assignments for update to authenticated using ((select public.agb_can_assign_crew())) with check ((select public.agb_can_assign_crew()));
drop policy if exists ca_delete on public.crew_assignments;
create policy ca_delete on public.crew_assignments for delete to authenticated using ((select public.agb_can_assign_crew()));

-- Only Ramsey, Randy and Sam may change crew names / show-up times on jobs (signed-in users; server jobs unaffected)
create or replace function public.agb_guard_crew_cols() returns trigger language plpgsql security definer set search_path to 'public' as $f$
begin
  if auth.uid() is null or public.agb_can_assign_crew() then return new; end if;
  if (new.demo_crew is distinct from old.demo_crew) or (new.concrete_crew is distinct from old.concrete_crew)
     or (new.carpentry_crew is distinct from old.carpentry_crew) or (new.electric_crew is distinct from old.electric_crew)
     or (new.demo_time is distinct from old.demo_time) or (new.concrete_time is distinct from old.concrete_time)
     or (new.carpentry_time is distinct from old.carpentry_time) or (new.electric_time is distinct from old.electric_time) then
    raise exception 'Only Ramsey, Randy or Sam can assign crews' using errcode='42501';
  end if;
  return new;
end $f$;
create or replace function public.agb_guard_crew_cols_ins() returns trigger language plpgsql security definer set search_path to 'public' as $f$
begin
  if auth.uid() is null or public.agb_can_assign_crew() then return new; end if;
  if coalesce(new.demo_crew,'')||coalesce(new.concrete_crew,'')||coalesce(new.carpentry_crew,'')||coalesce(new.electric_crew,'')<>''
     or new.demo_time is not null or new.concrete_time is not null or new.carpentry_time is not null or new.electric_time is not null then
    raise exception 'Only Ramsey, Randy or Sam can assign crews' using errcode='42501';
  end if;
  return new;
end $f$;
drop trigger if exists agb_guard_crew_cols on public.jobs;
create trigger agb_guard_crew_cols before update on public.jobs for each row execute function public.agb_guard_crew_cols();
drop trigger if exists agb_guard_crew_cols_ins on public.jobs;
create trigger agb_guard_crew_cols_ins before insert on public.jobs for each row execute function public.agb_guard_crew_cols_ins();
revoke all on function public.agb_guard_crew_cols() from public, anon, authenticated;
revoke all on function public.agb_guard_crew_cols_ins() from public, anon, authenticated;

-- PIN check shared by crew RPCs (same lockout rules as crew_schedule)
create or replace function public.agb_crew_pin_ok(p_crew text, p_pin text) returns text language plpgsql security definer set search_path to 'public','extensions' as $f$
declare c crew_pins;
begin
  select * into c from crew_pins where crew_key=lower(trim(p_crew));
  if not found then return null; end if;
  if c.locked_until is not null and c.locked_until>now() then return null; end if;
  if c.pin_hash <> crypt(coalesce(p_pin,''),c.pin_hash) then
    update crew_pins set failed_count=case when failed_count+1>=5 then 0 else failed_count+1 end,
      locked_until=case when failed_count+1>=5 then now()+interval '15 minutes' else locked_until end where crew_key=c.crew_key;
    return null;
  end if;
  update crew_pins set failed_count=0 where crew_key=c.crew_key and failed_count<>0;
  return c.crew_key;
end $f$;
revoke all on function public.agb_crew_pin_ok(text,text) from public, anon, authenticated;

-- Storage path for one attachment, only if it is attached to an assignment of this crew (called by the crew-file edge function with the service key)
create or replace function public.crew_doc_path(p_crew text, p_pin text, p_doc uuid) returns text language plpgsql security definer set search_path to 'public' as $f$
declare k text; p text;
begin
  k := agb_crew_pin_ok(p_crew,p_pin); if k is null then return null; end if;
  select d.storage_path into p from crew_assignments a join jobs j on j.id=a.job_id join job_documents d on d.id=p_doc and d.job_id=a.job_id
   where p_doc = any(a.document_ids) and j.deleted_at is null
     and lower(trim(coalesce(case a.stage when 'Demo' then j.demo_crew when 'Concrete' then j.concrete_crew when 'Carpentry' then j.carpentry_crew when 'Electric' then j.electric_crew else a.crew end,'')))=k
   limit 1;
  return p;
end $f$;
revoke all on function public.crew_doc_path(text,text,uuid) from public, anon, authenticated;
grant execute on function public.crew_doc_path(text,text,uuid) to service_role;

-- crew_schedule: + show-up time, ZIP, notes, attachments (names only), and custom "Other" stages
create or replace function public.crew_schedule(p_crew text, p_pin text, p_week_start date) returns jsonb
 language plpgsql security definer set search_path to 'public','extensions' as $function$
declare k text; nm text; ws date := p_week_start - ((extract(isodow from p_week_start)::int)-1); we date; out jsonb;
begin
  we := ws + 6;
  if not exists(select 1 from crew_pins where crew_key=lower(trim(p_crew))) then return jsonb_build_object('ok',false,'error','bad_pin'); end if;
  if exists(select 1 from crew_pins where crew_key=lower(trim(p_crew)) and locked_until is not null and locked_until>now()) then return jsonb_build_object('ok',false,'error','locked'); end if;
  k := agb_crew_pin_ok(p_crew,p_pin);
  if k is null then
    if exists(select 1 from crew_pins where crew_key=lower(trim(p_crew)) and locked_until is not null and locked_until>now()) then return jsonb_build_object('ok',false,'error','locked'); end if;
    return jsonb_build_object('ok',false,'error','bad_pin');
  end if;
  select crew_name into nm from crew_pins where crew_key=k;
  with s(stage,dcol,ccol,tcol) as (values('Demo','scheduled_demo','demo_crew','demo_time'),('Concrete','concrete_scheduled','concrete_crew','concrete_time'),
                                    ('Carpentry','carpentry_scheduled','carpentry_crew','carpentry_time'),('Electric','electric_date','electric_crew','electric_time')),
  base as (
    select j.id as job_id, s.stage, nullif(left(to_jsonb(j)->>s.dcol,10),'')::date as d, nullif(left(to_jsonb(j)->>s.tcol,5),'') as t
    from jobs j cross join s
    where j.deleted_at is null and j.completed_date is null and lower(trim(coalesce(to_jsonb(j)->>s.ccol,'')))=k
    union all
    select a.job_id, a.stage, a.sched_date, nullif(left(a.show_up_time::text,5),'')
    from crew_assignments a join jobs j on j.id=a.job_id
    where a.is_custom and j.deleted_at is null and j.completed_date is null and lower(trim(coalesce(a.crew,'')))=k
  ),
  x as (
    select b.stage, b.d, b.t, j.customer, j.address, j.city, j.zip, j.garage_size, to_jsonb(j)->>'roof_type' as job_roof, j.demolition_required,
      (select jsonb_build_object('roof_type',e.roof_type,'wall_height',e.wall_height,'siding',e.siding,'garage_size',e.garage_size)
         from estimate_history e where coalesce(e.siding,'')<>'PLAN SET' and j.address is not null and lower(trim(e.address))=lower(trim(j.address))
         order by e.created_at desc limit 1) as est,
      ca.notes,
      (select coalesce(jsonb_agg(jsonb_build_object('id',dd.id,'name',dd.file_name,'type',dd.document_type) order by dd.created_at),'[]'::jsonb)
         from job_documents dd where ca.document_ids is not null and dd.id = any(ca.document_ids) and dd.job_id=j.id) as docs
    from base b join jobs j on j.id=b.job_id
    left join crew_assignments ca on ca.job_id=b.job_id and ca.stage=b.stage
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'stage',stage,'date',d,'show_up_time',t,'customer',customer,'address',address,'city',city,'zip',zip,
      'garage_size',coalesce(nullif(garage_size,''),est->>'garage_size'),
      'roof_type',coalesce(nullif(job_roof,''),est->>'roof_type'),
      'wall_height',est->>'wall_height','siding',est->>'siding','demolition_required',demolition_required,
      'notes',notes,'attachments',docs)
    order by d, t nulls last, stage),'[]'::jsonb) into out
  from x where d between ws and we;
  return jsonb_build_object('ok',true,'crew',nm,'week_start',ws,'jobs',out);
end $function$;
