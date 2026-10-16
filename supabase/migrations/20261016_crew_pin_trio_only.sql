-- Only signed-in, active ramsey / randy / sam may set or change a crew PIN (same check as the crew-assign guard).
create or replace function public.set_crew_pin(p_crew text, p_pin text) returns jsonb language plpgsql security definer set search_path to 'public','extensions' as $function$
begin
  if auth.uid() is null or not public.agb_can_assign_crew() then return jsonb_build_object('ok',false,'error','not_allowed'); end if;
  if coalesce(trim(p_crew),'')='' or p_pin !~ '^\d{4}$' then return jsonb_build_object('ok',false,'error','bad_input'); end if;
  insert into crew_pins(crew_key,crew_name,pin_hash,failed_count,locked_until,updated_at,updated_by)
  values(lower(trim(p_crew)),trim(p_crew),crypt(p_pin,gen_salt('bf')),0,null,now(),auth.uid())
  on conflict(crew_key) do update set crew_name=excluded.crew_name,pin_hash=excluded.pin_hash,failed_count=0,locked_until=null,updated_at=now(),updated_by=auth.uid();
  return jsonb_build_object('ok',true);
end $function$;
revoke all on function public.set_crew_pin(text,text) from public, anon;
grant execute on function public.set_crew_pin(text,text) to authenticated;
-- crew_pins itself: no direct table access for app roles
revoke all on public.crew_pins from anon, authenticated;
