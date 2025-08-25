-- Postgres schema for demo (Supabase)
-- Sales table designed for city/year/month aggregations
create table if not exists public.sales (
  id bigserial primary key,
  city text not null,
  category text default 'Motor',
  sale_date date not null,
  amount numeric(12,2) not null
);

-- Helpful index
create index if not exists sales_city_date_idx on public.sales (city, sale_date);
