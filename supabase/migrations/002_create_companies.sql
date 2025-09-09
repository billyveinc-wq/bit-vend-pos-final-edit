-- Create companies table and company_user relationships
CREATE TABLE IF NOT EXISTS public.companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  plan_id TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_users (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add company_id to system_users fallback table if present
ALTER TABLE IF EXISTS public.system_users
  ADD COLUMN IF NOT EXISTS company_id BIGINT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies (name);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users (company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users (user_id);
