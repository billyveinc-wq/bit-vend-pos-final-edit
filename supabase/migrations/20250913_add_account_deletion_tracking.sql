-- Add account deletion tracking with 30-day retention period
DO $$
BEGIN
  -- Create account_deletions table to track deletion requests
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'account_deletions'
  ) THEN
    CREATE TABLE public.account_deletions (
      id bigserial PRIMARY KEY,
      user_id uuid NOT NULL,
      email text NOT NULL,
      deleted_at timestamptz NOT NULL DEFAULT now(),
      scheduled_cleanup_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
      cleanup_completed boolean NOT NULL DEFAULT false,
      cleanup_completed_at timestamptz NULL,
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    
    -- Index for efficient cleanup queries
    CREATE INDEX idx_account_deletions_cleanup ON public.account_deletions(scheduled_cleanup_at, cleanup_completed) 
    WHERE cleanup_completed = false;
    
    -- Index for user lookup
    CREATE INDEX idx_account_deletions_user_id ON public.account_deletions(user_id);
  END IF;

  -- Add deletion tracking to other user-related tables
  DO $INNER$
  DECLARE
    table_name text;
    tables_to_update text[] := ARRAY['user_subscriptions', 'user_promotions', 'company_users'];
  BEGIN
    FOREACH table_name IN ARRAY tables_to_update
    LOOP
      -- Add deleted_at column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = table_name AND column_name = 'deleted_at'
      ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN deleted_at timestamptz NULL', table_name);
      END IF;
      
      -- Add deletion_id to reference the account_deletions record
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = table_name AND column_name = 'deletion_id'
      ) THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN deletion_id bigint REFERENCES public.account_deletions(id)', table_name);
      END IF;
      
      -- Create indexes for soft-deleted records
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = format('idx_%s_deleted_at', table_name)
      ) THEN
        EXECUTE format('CREATE INDEX idx_%s_deleted_at ON public.%I(deleted_at) WHERE deleted_at IS NOT NULL', table_name, table_name);
      END IF;
    END LOOP;
  END$INNER$;

  -- Create function to soft delete a user account
  CREATE OR REPLACE FUNCTION public.soft_delete_user_account(target_user_id uuid, target_email text DEFAULT NULL)
  RETURNS bigint AS $FUNC$
  DECLARE
    deletion_record_id bigint;
    user_email text;
  BEGIN
    -- Get user email if not provided
    IF target_email IS NULL THEN
      SELECT email INTO user_email 
      FROM auth.users 
      WHERE id = target_user_id;
      
      IF user_email IS NULL THEN
        -- Try system_users table
        SELECT email INTO user_email 
        FROM public.system_users 
        WHERE id = target_user_id::text;
      END IF;
      
      IF user_email IS NULL THEN
        user_email := 'unknown@deleted.user';
      END IF;
    ELSE
      user_email := target_email;
    END IF;

    -- Create deletion tracking record
    INSERT INTO public.account_deletions (user_id, email, metadata)
    VALUES (target_user_id, user_email, jsonb_build_object('deletion_method', 'soft_delete'))
    RETURNING id INTO deletion_record_id;

    -- Soft delete user data by updating deleted_at timestamp
    UPDATE public.system_users 
    SET status = 'deleted', deleted_at = now() 
    WHERE id = target_user_id::text;

    UPDATE public.user_subscriptions 
    SET deleted_at = now(), deletion_id = deletion_record_id 
    WHERE user_id = target_user_id;

    UPDATE public.user_promotions 
    SET deleted_at = now(), deletion_id = deletion_record_id 
    WHERE user_id = target_user_id;

    UPDATE public.company_users 
    SET deleted_at = now(), deletion_id = deletion_record_id 
    WHERE user_id = target_user_id;

    -- Note: We don't delete the auth user immediately to preserve the account for 30 days
    -- The cleanup function will handle auth user deletion after the retention period

    RETURN deletion_record_id;
  END;
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create function to permanently delete expired accounts
  CREATE OR REPLACE FUNCTION public.cleanup_expired_account_deletions()
  RETURNS integer AS $FUNC$
  DECLARE
    expired_deletion RECORD;
    cleanup_count integer := 0;
  BEGIN
    -- Process expired deletions
    FOR expired_deletion IN
      SELECT id, user_id, email 
      FROM public.account_deletions 
      WHERE scheduled_cleanup_at <= now() 
        AND cleanup_completed = false
      ORDER BY scheduled_cleanup_at ASC
      LIMIT 100  -- Process in batches to avoid long transactions
    LOOP
      BEGIN
        -- Hard delete all user data
        DELETE FROM public.user_subscriptions WHERE deletion_id = expired_deletion.id;
        DELETE FROM public.user_promotions WHERE deletion_id = expired_deletion.id;
        DELETE FROM public.company_users WHERE deletion_id = expired_deletion.id;
        DELETE FROM public.system_users WHERE id = expired_deletion.user_id::text;

        -- Note: Auth user deletion should be handled by the admin server with service role
        -- as it requires elevated permissions
        
        -- Mark cleanup as completed
        UPDATE public.account_deletions 
        SET cleanup_completed = true, cleanup_completed_at = now()
        WHERE id = expired_deletion.id;
        
        cleanup_count := cleanup_count + 1;
        
      EXCEPTION WHEN OTHERS THEN
        -- Log error but continue with other deletions
        INSERT INTO public.account_deletions (user_id, email, metadata)
        VALUES (
          expired_deletion.user_id, 
          expired_deletion.email, 
          jsonb_build_object('cleanup_error', SQLERRM, 'original_deletion_id', expired_deletion.id)
        );
      END;
    END LOOP;
    
    RETURN cleanup_count;
  END;
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create function to get account deletion status
  CREATE OR REPLACE FUNCTION public.get_account_deletion_status(target_user_id uuid)
  RETURNS jsonb AS $FUNC$
  DECLARE
    deletion_info RECORD;
  BEGIN
    SELECT 
      id,
      deleted_at,
      scheduled_cleanup_at,
      cleanup_completed,
      (scheduled_cleanup_at - now()) as time_remaining
    INTO deletion_info
    FROM public.account_deletions 
    WHERE user_id = target_user_id 
      AND cleanup_completed = false
    ORDER BY deleted_at DESC 
    LIMIT 1;
    
    IF deletion_info IS NULL THEN
      RETURN jsonb_build_object(
        'is_deleted', false,
        'deletion_id', null,
        'deleted_at', null,
        'scheduled_cleanup_at', null,
        'days_remaining', null
      );
    END IF;
    
    RETURN jsonb_build_object(
      'is_deleted', true,
      'deletion_id', deletion_info.id,
      'deleted_at', deletion_info.deleted_at,
      'scheduled_cleanup_at', deletion_info.scheduled_cleanup_at,
      'days_remaining', EXTRACT(days FROM deletion_info.time_remaining),
      'cleanup_completed', deletion_info.cleanup_completed
    );
  END;
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

END$$;

-- Create a view for active (non-deleted) users
CREATE OR REPLACE VIEW public.active_system_users AS
SELECT * FROM public.system_users 
WHERE status != 'deleted' AND deleted_at IS NULL;

-- Create a view for active subscriptions  
CREATE OR REPLACE VIEW public.active_user_subscriptions AS
SELECT * FROM public.user_subscriptions 
WHERE deleted_at IS NULL;

-- Create a view for active company users
CREATE OR REPLACE VIEW public.active_company_users AS
SELECT * FROM public.company_users 
WHERE deleted_at IS NULL;

-- Grant necessary permissions
GRANT SELECT ON public.account_deletions TO authenticated;
GRANT SELECT ON public.active_system_users TO authenticated;
GRANT SELECT ON public.active_user_subscriptions TO authenticated;
GRANT SELECT ON public.active_company_users TO authenticated;
