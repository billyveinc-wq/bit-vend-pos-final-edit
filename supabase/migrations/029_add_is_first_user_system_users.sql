-- Add is_first_user flag to system_users and backfill the earliest user
BEGIN;

ALTER TABLE IF EXISTS public.system_users
  ADD COLUMN IF NOT EXISTS is_first_user BOOLEAN DEFAULT FALSE;

-- Backfill: mark the earliest created system_user as first user
WITH earliest AS (
  SELECT id FROM public.system_users ORDER BY created_at ASC LIMIT 1
)
UPDATE public.system_users SET is_first_user = TRUE WHERE id IN (SELECT id FROM earliest);

COMMIT;
