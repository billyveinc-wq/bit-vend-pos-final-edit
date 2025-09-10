create extension if not exists pgcrypto;

-- Core billing tables (multi-tenant via company_id)
create table if not exists public.billing_plans (
  id bigserial primary key,
  business_id bigint null references public.companies(id) on delete cascade,
  name text not null,
  sku text not null,
  price bigint not null check (price >= 0), -- minor units (e.g., cents)
  currency text not null default 'USD',
  interval text not null check (interval in ('month','year')),
  trial_days integer not null default 0 check (trial_days >= 0),
  description text,
  metered boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_billing_plans_sku_business on public.billing_plans(sku, business_id);
create index if not exists idx_billing_plans_business on public.billing_plans(business_id);

create table if not exists public.subscriptions (
  id bigserial primary key,
  business_id bigint not null references public.companies(id) on delete cascade,
  plan_id bigint null references public.billing_plans(id) on delete set null,
  status text not null check (status in ('active','past_due','canceled','trialing','pending')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz null,
  next_billing_date timestamptz null,
  cancel_at_period_end boolean not null default false,
  provider text null, -- 'stripe'|'flutterwave'|'paypal'|'mpesa'
  provider_customer_id text null,
  provider_subscription_id text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_business on public.subscriptions(business_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

create table if not exists public.invoices (
  id bigserial primary key,
  business_id bigint not null references public.companies(id) on delete cascade,
  subscription_id bigint null references public.subscriptions(id) on delete set null,
  amount bigint not null check (amount >= 0), -- minor units
  currency text not null default 'USD',
  status text not null check (status in ('draft','paid','failed','open','void')) default 'open',
  due_date timestamptz null,
  pdf_url text null,
  external_reference text null,
  line_items jsonb not null default '[]'::jsonb,
  tax_amount bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_invoices_business on public.invoices(business_id);
create index if not exists idx_invoices_status on public.invoices(status);

create table if not exists public.payments (
  id bigserial primary key,
  business_id bigint not null references public.companies(id) on delete cascade,
  invoice_id bigint null references public.invoices(id) on delete set null,
  provider text not null check (provider in ('flutterwave','paypal','stripe','mpesa')),
  provider_payment_id text null,
  amount bigint not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null check (status in ('pending','succeeded','failed','refunded','received')) default 'pending',
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_business on public.payments(business_id);
create index if not exists idx_payments_provider on public.payments(provider);
create index if not exists idx_payments_invoice on public.payments(invoice_id);

create table if not exists public.billing_settings (
  business_id bigint primary key references public.companies(id) on delete cascade,
  default_provider_id text null,
  billing_email text null,
  tax_rate numeric(5,2) not null default 0,
  billing_address jsonb not null default '{}'::jsonb,
  currency_preference text not null default 'USD',
  payment_method_preference text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  code text primary key,
  discount_type text not null check (discount_type in ('percent','fixed')),
  amount_off bigint not null check (amount_off >= 0),
  active boolean not null default true,
  expires_at timestamptz null,
  usage_limit integer null,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_records (
  id bigserial primary key,
  subscription_id bigint not null references public.subscriptions(id) on delete cascade,
  metric text not null,
  quantity numeric(18,6) not null default 0,
  timestamp timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_usage_records_subscription on public.usage_records(subscription_id);
create index if not exists idx_usage_records_metric on public.usage_records(metric);

-- helper to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger trg_billing_plans_u
before update on public.billing_plans
for each row execute function public.set_updated_at();

create trigger trg_subscriptions_u
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger trg_invoices_u
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger trg_payments_u
before update on public.payments
for each row execute function public.set_updated_at();

create trigger trg_billing_settings_u
before update on public.billing_settings
for each row execute function public.set_updated_at();

-- minimal policies (open for now; tighten later with company_users linkage if RLS is enabled)
-- RLS optional: uncomment to enable row-level security patterns using company_users
-- alter table public.billing_plans enable row level security;
-- alter table public.subscriptions enable row level security;
-- alter table public.invoices enable row level security;
-- alter table public.payments enable row level security;
-- alter table public.billing_settings enable row level security;
-- create policy "company members can read billing" on public.billing_plans for select using (
--   business_id is null or exists (
--     select 1 from public.company_users cu where cu.company_id = billing_plans.business_id and cu.user_id = auth.uid()
--   )
-- );
