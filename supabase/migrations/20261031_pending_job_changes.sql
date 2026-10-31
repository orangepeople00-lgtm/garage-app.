-- 2026-10-31 (owner-approved): voice/dashboard pending queue. Salesmen's new jobs and edit requests wait here until
-- Randy/Sam (is_manager(): owner/business_manager/admin) approve or reject. Nothing here changes jobs by itself.
create table if not exists public.pending_job_changes (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('new_job','edit')),
  job_id uuid null references public.jobs(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  requested_by uuid not null default auth.uid(),
  salesman_username text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  check (kind = 'new_job' or job_id is not null)
);
create index if not exists pending_job_changes_status_idx on public.pending_job_changes(status, created_at desc);
create index if not exists pending_job_changes_salesman_idx on public.pending_job_changes(salesman_username);
alter table public.pending_job_changes enable row level security;
revoke all on public.pending_job_changes from anon;
grant select, insert, update on public.pending_job_changes to authenticated;

create policy "pjc salesman insert own" on public.pending_job_changes for insert to authenticated
  with check (
    requested_by = (select auth.uid())
    and salesman_username = (select public.my_username())
    and status = 'pending' and reviewed_by is null and reviewed_at is null
    and (kind = 'new_job' or exists (select 1 from public.jobs j where j.id = job_id and j.salesman_username = (select public.my_username())))
  );
create policy "pjc salesman read own" on public.pending_job_changes for select to authenticated
  using (salesman_username = (select public.my_username()));
create policy "pjc managers read all" on public.pending_job_changes for select to authenticated
  using ((select public.is_manager()));
create policy "pjc managers update all" on public.pending_job_changes for update to authenticated
  using ((select public.is_manager())) with check ((select public.is_manager()));
