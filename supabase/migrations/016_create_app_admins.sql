-- Create a whitelist table for admin panel access
create table if not exists public.app_admins (
  id bigserial primary key,
  email text not null unique,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Optional: seed the primary super admin email
insert into public.app_admins (email)
  values ('admin.bitvend@gmail.com')
  on conflict (email) do nothing;
