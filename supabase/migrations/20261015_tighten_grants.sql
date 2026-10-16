-- Tighten table privileges (approved by the user 2026-10-15). RLS policies are unchanged.
begin;
-- anon (not signed in) has no RLS policy on any table, so it needs no table privileges at all.
-- Crew app keeps working: it uses the crew_* RPC functions, whose EXECUTE grants are untouched.
revoke all on all tables in schema public from anon;
-- signed-in users keep SELECT/INSERT/UPDATE/DELETE (still limited by RLS); drop the extras RLS cannot limit.
revoke truncate, trigger, references, maintain on all tables in schema public from authenticated;
-- same for tables created later
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke truncate, trigger, references, maintain on tables from authenticated;
-- managers now include the 'admin' role (Carpenter already allows it)
create or replace function public.is_manager() returns boolean language sql stable set search_path to '' as $f$
 select exists (select 1 from public.staff_profiles p where p.id = (select auth.uid()) and p.active and p.role in ('owner','business_manager','admin'));
$f$;
commit;
