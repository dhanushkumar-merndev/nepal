create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,
  description text,
  logo_url text,
  image_url text,
  stock_status text default 'In Stock',
  is_best_seller boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  duration text,
  real_price numeric not null,
  offer_price numeric,
  actual_price numeric default 0,
  features jsonb default '[]'::jsonb,
  stock_status text default 'In Stock',
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text,
  phone text not null,
  payment_method text,
  note text,
  cart_items jsonb not null,
  total_amount numeric default 0,
  whatsapp_sent boolean default false,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_avatar_url text,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table admin_users enable row level security;
alter table products enable row level security;
alter table plans enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table settings enable row level security;

create policy "Public can read active products" on products for select using (is_active = true);
create policy "Public can read active plans" on plans for select using (is_active = true);
create policy "Public can read approved reviews" on reviews for select using (status = 'approved');
create policy "Authenticated users can insert own pending reviews" on reviews for insert to authenticated
with check (auth.uid() = user_id and status = 'pending');
create policy "Users can read own reviews" on reviews for select to authenticated using (auth.uid() = user_id);
create policy "Public can insert orders" on orders for insert with check (true);
create policy "Admins can read own admin user" on admin_users for select to authenticated using (id = auth.uid());

create policy "Admins can manage products" on products for all to authenticated
using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins can manage plans" on plans for all to authenticated
using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins can manage orders" on orders for all to authenticated
using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins can manage reviews" on reviews for all to authenticated
using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));

create policy "Admins can manage settings" on settings for all to authenticated
using (exists (select 1 from admin_users where admin_users.id = auth.uid()))
with check (exists (select 1 from admin_users where admin_users.id = auth.uid()));
