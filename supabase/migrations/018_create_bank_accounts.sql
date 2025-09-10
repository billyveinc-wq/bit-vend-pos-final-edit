create table if not exists public.bank_accounts (
  id bigserial primary key,
  company_id bigint not null references public.companies(id) on delete cascade,
  account_name text not null,
  account_number text not null,
  bank_name text not null,
  account_type text not null check (account_type in ('checking','savings','business','credit')),
  balance numeric(18,2) not null default 0,
  currency text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_bank_accounts_company on public.bank_accounts(company_id);
