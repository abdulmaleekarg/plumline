-- Run this in Supabase: SQL Editor > New query

create extension if not exists "pgcrypto";

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  color text not null default '#2B1B3D',
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  user_id uuid not null references auth.users(id) on delete restrict,
  email text not null,
  name text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  country text not null,
  total_cents integer not null,
  status text not null default 'placed',
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Anyone can read products
create policy "products are public" on products for select using (true);

-- Customers can read only their own orders. Orders are written by the
-- server (service role), which bypasses RLS, after prices are re-checked.
create policy "own orders" on orders for select using (auth.uid() = user_id);
create policy "own order items" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);

insert into products (name, description, price_cents, color) values
 ('Dot-grid notebook', 'A5, 160 pages of 100gsm paper that takes fountain pen ink without bleeding.', 1800, '#2B1B3D'),
 ('Lined notebook', 'A5, 160 pages, lay-flat binding with a ribbon marker.', 1600, '#5B3F7A'),
 ('Pocket notebook, set of 3', 'Pocket-sized, staple-bound, one in each colour.', 1200, '#F4DC4A'),
 ('Fountain pen', 'Brass body, steel nib, converter included.', 4500, '#3C6E71'),
 ('Gel pen, 0.5mm', 'Quick-drying black ink in a slim aluminium barrel.', 900, '#1D1D2C'),
 ('Ink, 50ml', 'Deep plum. Shading ink with a soft sheen.', 1400, '#6B2D5C'),
 ('Washi tape, 6 rolls', 'Matte tape in plum and lemon tones. Tears by hand.', 1000, '#C8B6E2'),
 ('Desk pad', 'A3 recycled paper pad, 50 tear-off sheets.', 2200, '#8A7FA6');
