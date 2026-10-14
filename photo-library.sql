-- Absolute Garage Builders: shared garage photo library (audit-fix 2026-10-14)
-- Run once in the Supabase SQL editor. The estimator works without it: it then keeps
-- AI photos in a per-device library and shows "Shared library not set up yet".
create table if not exists public.garage_photo_library (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  created_by_name text,
  source text not null default 'ai',          -- 'ai' (generated) | 'upload'
  image_data text,                            -- compressed JPEG data URL (~900px, ~100-200 KB)
  image_url text,                             -- original URL when the image could not be re-encoded
  thumb_data text,                            -- small JPEG data URL for the picker grid
  spec_hash text,                             -- physical-spec hash (same specs => same photo)
  tags jsonb not null default '{}'::jsonb,    -- {size,width,depth,roof,reverse,siding,color,ohDoors,serviceDoor}
  deleted boolean not null default false
);
create index if not exists garage_photo_library_created_idx on public.garage_photo_library (created_at desc);
create index if not exists garage_photo_library_hash_idx on public.garage_photo_library (spec_hash);
alter table public.garage_photo_library enable row level security;

-- every signed-in staff member can see and add photos
drop policy if exists gpl_read on public.garage_photo_library;
create policy gpl_read on public.garage_photo_library for select to authenticated using (true);
drop policy if exists gpl_insert on public.garage_photo_library;
create policy gpl_insert on public.garage_photo_library for insert to authenticated with check (created_by = auth.uid());

-- only owners / business manager / admins can remove (soft-delete or hard delete) bad photos
drop policy if exists gpl_admin_update on public.garage_photo_library;
create policy gpl_admin_update on public.garage_photo_library for update to authenticated
  using (exists (select 1 from public.staff_profiles sp where sp.id = auth.uid() and sp.role in ('owner','business_manager','admin')));
drop policy if exists gpl_admin_delete on public.garage_photo_library;
create policy gpl_admin_delete on public.garage_photo_library for delete to authenticated
  using (exists (select 1 from public.staff_profiles sp where sp.id = auth.uid() and sp.role in ('owner','business_manager','admin')));
