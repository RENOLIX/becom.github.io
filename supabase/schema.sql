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

create policy "public products read" on public.products for select using (true);
create policy "temporary products management" on public.products for all using (true) with check (true);
create policy "temporary admin users management" on public.admin_users for all using (true) with check (true);

-- Remplacer les politiques temporaires par des règles basées sur Supabase Auth avant la production finale.
