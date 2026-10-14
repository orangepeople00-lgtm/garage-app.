-- Jobs Map: lets every logged-in user see all job pins (no price, profit, or notes).
-- Paste into Supabase > SQL Editor and click Run. Safe to run more than once.
create or replace function public.agb_map_jobs()
returns setof json
language sql security definer set search_path = public stable as $$
  select json_build_object(
    'id', j.id, 'customer', j.customer, 'address', j.address, 'city', j.city,
    'salesman_username', j.salesman_username, 'garage_size', j.garage_size,
    'hold_status', j.hold_status, 'completed_date', j.completed_date,
    'inspection_status', j.inspection_status, 'final_payment', j.final_payment,
    'permit_status', j.permit_status, 'demolition_required', j.demolition_required,
    'demo_status', j.demo_status, 'concrete_status', j.concrete_status,
    'carpentry_status', j.carpentry_status, 'electric_status', j.electric_status,
    'extras_required', j.extras_required, 'extras_status', j.extras_status,
    'deleted_at', j.deleted_at)
  from jobs j where j.deleted_at is null;
$$;
revoke all on function public.agb_map_jobs() from public, anon;
grant execute on function public.agb_map_jobs() to authenticated;
