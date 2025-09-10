-- Enable pgcrypto for potential encryption (optional; configure keys via server-side only)
create extension if not exists pgcrypto;

-- Master providers catalog
create table if not exists public.payment_providers (
  id bigserial primary key,
  provider_key text not null unique, -- e.g., 'mpesa', 'paypal', 'flutterwave'
  name text not null
);

-- Per-company (tenant) provider settings
create table if not exists public.payment_provider_settings (
  id bigserial primary key,
  company_id bigint not null references public.companies(id) on delete cascade,
  provider_key text not null references public.payment_providers(provider_key) on delete cascade,
  enabled boolean not null default false,
  credentials jsonb not null default '{}'::jsonb, -- store via secure server-side only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider_key)
);

-- Payment transactions captured via providers
create table if not exists public.payment_transactions (
  id bigserial primary key,
  company_id bigint not null references public.companies(id) on delete cascade,
  provider_key text not null references public.payment_providers(provider_key) on delete set null,
  external_id text,
  amount numeric(18,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending', -- pending|success|failed
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Audit logs for settings updates
create table if not exists public.payment_audit_logs (
  id bigserial primary key,
  company_id bigint not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- e.g., 'update_settings','enable_provider','test_connection'
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Seed initial providers
insert into public.payment_providers (provider_key, name)
values
  ('mpesa', 'M-Pesa (Daraja)'),
  ('paypal', 'PayPal'),
  ('flutterwave', 'Flutterwave')
on conflict (provider_key) do nothing;

-- Indexes
create index if not exists idx_payment_provider_settings_company on public.payment_provider_settings(company_id);
create index if not exists idx_payment_transactions_company on public.payment_transactions(company_id);
create index if not exists idx_payment_transactions_provider on public.payment_transactions(provider_key);
