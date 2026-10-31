-- PROPOSAL ONLY — NOT APPLIED. Needs owner approval before running.
-- Today: RLS on public.jobs already allows INSERT/UPDATE/DELETE only for is_manager() (owner/business_manager/admin),
-- so a salesman cannot write ANY jobs column directly; salesmen go through job_requests / pending_job_changes.
-- Crew columns are additionally guarded by trigger agb_guard_crew_cols (usernames ramsey/randy/sam only).
-- No DB change is required for the salesman lock. Only if salesmen are ever given direct UPDATE on jobs, add this guard:
create or replace function public.agb_guard_salesman_basics() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_manager() then return new; end if;
  if (to_jsonb(new) - array['customer','salesman_username','sold_date','address','city','zip','phone','price','deposit','hold_status','garage_size','updated_at'])
     is distinct from (to_jsonb(old) - array['customer','salesman_username','sold_date','address','city','zip','phone','price','deposit','hold_status','garage_size','updated_at']) then
    raise exception 'Only Randy or Sam can change these job details' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger agb_guard_salesman_basics before update on public.jobs
  for each row execute function public.agb_guard_salesman_basics();
