alter table if exists public.billing_settings
  add column if not exists payout_account_id bigint null references public.bank_accounts(id) on delete set null;
