-- Add status and deleted_at columns to system_users (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'system_users' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.system_users ADD COLUMN status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'system_users' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.system_users ADD COLUMN deleted_at timestamptz NULL;
  END IF;

  -- Optional index for status filtering
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_system_users_status'
  ) THEN
    CREATE INDEX idx_system_users_status ON public.system_users(status);
  END IF;
END$$;
