-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  code TEXT NOT NULL UNIQUE,
  discount INT NOT NULL DEFAULT 0,
  influencer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_promotions table (links auth.users to promo_codes)
CREATE TABLE IF NOT EXISTS public.user_promotions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id BIGINT REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  discount INT,
  influencer_name TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add fallback columns to system_users table if present (safe no-op if table does not exist)
ALTER TABLE IF EXISTS public.system_users
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS influencer_name TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes (code);
CREATE INDEX IF NOT EXISTS idx_user_promotions_user_id ON public.user_promotions (user_id);
