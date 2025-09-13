-- Income table
CREATE TABLE IF NOT EXISTS public.income (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_income_date ON public.income (date);
CREATE INDEX IF NOT EXISTS idx_income_category ON public.income (category);
