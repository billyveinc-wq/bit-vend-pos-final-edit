-- Ensure user_subscriptions table and required columns/constraints exist without destructive changes
DO $$
BEGIN
  -- Create table if not exists (will be skipped if table already exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_subscriptions'
  ) THEN
    CREATE TABLE public.user_subscriptions (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      plan_id VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NULL
    );
  END IF;

  -- status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='status'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
  END IF;

  -- started_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='started_at'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN started_at TIMESTAMPTZ;
  END IF;
  -- Ensure NOT NULL and default
  PERFORM 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='started_at' AND is_nullable='NO';
  IF NOT FOUND THEN
    -- Backfill nulls with now() before enforcing NOT NULL
    UPDATE public.user_subscriptions SET started_at = COALESCE(started_at, now());
    ALTER TABLE public.user_subscriptions ALTER COLUMN started_at SET DEFAULT now();
    ALTER TABLE public.user_subscriptions ALTER COLUMN started_at SET NOT NULL;
  END IF;

  -- expires_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='expires_at'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN expires_at TIMESTAMPTZ NULL;
  END IF;

  -- plan_id to varchar(50) if currently wider text (no-op if already varchar)
  BEGIN
    ALTER TABLE public.user_subscriptions ALTER COLUMN plan_id TYPE VARCHAR(50);
  EXCEPTION WHEN others THEN
    -- ignore if incompatible; existing type remains
    NULL;
  END;

  -- Unique index on user_id for upsert behavior used by app
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='ux_user_subscriptions_user_id'
  ) THEN
    CREATE UNIQUE INDEX ux_user_subscriptions_user_id ON public.user_subscriptions(user_id);
  END IF;
END $$;
