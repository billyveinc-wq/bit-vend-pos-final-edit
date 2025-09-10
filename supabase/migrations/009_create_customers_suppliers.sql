-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  customer_type TEXT NOT NULL DEFAULT 'individual',
  total_purchases NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_purchase DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_active ON public.customers (is_active);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (name);

-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  total_purchases NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_purchase DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers (is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers (name);
