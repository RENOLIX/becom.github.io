create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  age text not null,
  price integer not null check (price >= 0),
  old_price integer,
  rating numeric(2,1) not null default 5,
  reviews integer not null default 0,
  badge text,
  color text not null default '#e8f1fb',
  image_url text,
  sprite integer not null default 0,
  stock integer not null default 0,
  description text not null default '',
  skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'employe')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public products read" on public.products;
drop policy if exists "temporary products management" on public.products;
drop policy if exists "temporary admin users management" on public.admin_users;
drop policy if exists "authenticated products management" on public.products;
drop policy if exists "authenticated users read" on public.admin_users;
drop policy if exists "admin users management" on public.admin_users;

create policy "public products read" on public.products for select using (true);
create policy "authenticated products management" on public.products for all to authenticated using (true) with check (true);
create policy "authenticated users read" on public.admin_users for select to authenticated using (true);
create policy "admin users management" on public.admin_users for all to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public product images read" on storage.objects;
drop policy if exists "authenticated product images insert" on storage.objects;
drop policy if exists "authenticated product images update" on storage.objects;
drop policy if exists "authenticated product images delete" on storage.objects;
create policy "public product images read" on storage.objects for select using (bucket_id = 'product-images');
create policy "authenticated product images insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "authenticated product images update" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "authenticated product images delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

-- Promote and register the initial account after it is created in Supabase Auth.
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"role":"admin","name":"Administrateur BECOM"}'::jsonb
where email = 'admin@becom.store';

insert into public.admin_users (id, name, email, role, active)
select id, 'Administrateur BECOM', email, 'admin', true
from auth.users
where email = 'admin@becom.store'
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  active = excluded.active;
