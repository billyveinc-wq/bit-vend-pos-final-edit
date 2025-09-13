-- Create locations/branches table
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  manager TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  currency TEXT,
  tax_region TEXT,
  is_active BOOLEAN DEFAULT true,
  is_main BOOLEAN DEFAULT false,
  notes TEXT,
  company_id BIGINT REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_company_id ON public.locations(company_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_code ON public.locations(code);
