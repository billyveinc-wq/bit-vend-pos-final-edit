-- Generic app settings table keyed by company
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES public.companies(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, key)
);

CREATE INDEX IF NOT EXISTS idx_app_settings_company_id ON public.app_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);
