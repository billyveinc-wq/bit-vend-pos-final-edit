-- Create promos table if it doesn't exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'promos'
  ) THEN
    CREATE TABLE public.promos (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_percent INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;

  -- Ensure columns exist with correct types
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='promos' AND column_name='discount_percent'
  ) THEN
    ALTER TABLE public.promos ADD COLUMN discount_percent INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='promos' AND column_name='expires_at'
  ) THEN
    ALTER TABLE public.promos ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days');
  END IF;

  -- Unique index on code (in case table existed without constraint)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='ux_promos_code'
  ) THEN
    CREATE UNIQUE INDEX ux_promos_code ON public.promos(code);
  END IF;
END $$;
