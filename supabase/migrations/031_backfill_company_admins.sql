-- Ensure 'admin' role exists
INSERT INTO public.roles(name, description)
SELECT 'admin', 'Administrator'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'admin');

-- Assign 'admin' role to the first member (by created_at) of each company
WITH first_members AS (
  SELECT DISTINCT ON (company_id) company_id, user_id
  FROM public.company_users
  WHERE deleted_at IS NULL
  ORDER BY company_id, created_at ASC, id ASC
), admin_role AS (
  SELECT id AS role_id FROM public.roles WHERE name = 'admin'
)
INSERT INTO public.user_roles(user_id, role_id)
SELECT fm.user_id, ar.role_id
FROM first_members fm
CROSS JOIN admin_role ar
ON CONFLICT (user_id, role_id) DO NOTHING;
