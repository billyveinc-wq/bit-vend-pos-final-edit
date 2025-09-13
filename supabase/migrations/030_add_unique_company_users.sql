-- Cleanup duplicate company_users rows, keeping the earliest per (company_id, user_id)
WITH duplicates AS (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY company_id, user_id ORDER BY id) AS rn
    FROM public.company_users
    WHERE deleted_at IS NULL OR deleted_at IS NULL -- keep active; include all rows
  ) t
  WHERE t.rn > 1
)
DELETE FROM public.company_users cu
USING duplicates d
WHERE cu.id = d.id;

-- Enforce uniqueness for active links only
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_users_active_unique
ON public.company_users(company_id, user_id)
WHERE deleted_at IS NULL;
