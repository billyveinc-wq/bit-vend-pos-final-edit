-- Create system_users table if it does not exist and populate it from auth.users
CREATE TABLE IF NOT EXISTS public.system_users (
  id UUID PRIMARY KEY,
  email TEXT,
  user_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  promo_code TEXT,
  influencer_name TEXT,
  company_id BIGINT
);

-- Populate system_users from auth.users (safe insert, skip existing ids)
INSERT INTO public.system_users (id, email, user_metadata, created_at, last_sign_in_at)
SELECT u.id, u.email, COALESCE(u.user_metadata, u.raw_user_meta_data) AS user_metadata, u.created_at, u.last_sign_in_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.system_users s WHERE s.id = u.id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_system_users_email ON public.system_users (email);
CREATE INDEX IF NOT EXISTS idx_system_users_company_id ON public.system_users (company_id);
