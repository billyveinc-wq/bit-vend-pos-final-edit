-- Ensure deleting a company removes dependent rows to avoid FK violations
BEGIN;

-- income_categories -> companies ON DELETE CASCADE
ALTER TABLE IF EXISTS public.income_categories
  DROP CONSTRAINT IF EXISTS income_categories_company_id_fkey;
ALTER TABLE IF EXISTS public.income_categories
  ADD CONSTRAINT income_categories_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- purchases -> companies ON DELETE CASCADE
ALTER TABLE IF EXISTS public.purchases
  DROP CONSTRAINT IF EXISTS purchases_company_id_fkey;
ALTER TABLE IF EXISTS public.purchases
  ADD CONSTRAINT purchases_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- stock_ins -> companies ON DELETE CASCADE
ALTER TABLE IF EXISTS public.stock_ins
  DROP CONSTRAINT IF EXISTS stock_ins_company_id_fkey;
ALTER TABLE IF EXISTS public.stock_ins
  ADD CONSTRAINT stock_ins_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- stock_outs -> companies ON DELETE CASCADE
ALTER TABLE IF EXISTS public.stock_outs
  DROP CONSTRAINT IF EXISTS stock_outs_company_id_fkey;
ALTER TABLE IF EXISTS public.stock_outs
  ADD CONSTRAINT stock_outs_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- stock_returns -> companies ON DELETE CASCADE
ALTER TABLE IF EXISTS public.stock_returns
  DROP CONSTRAINT IF EXISTS stock_returns_company_id_fkey;
ALTER TABLE IF EXISTS public.stock_returns
  ADD CONSTRAINT stock_returns_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

COMMIT;
