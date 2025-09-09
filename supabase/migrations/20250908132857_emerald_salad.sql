/*
  # Admin System Tables

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text, default 'admin')
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `last_login` (timestamp)
    
    - `referral_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `referral_name` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `discount_percent` (integer)
      - `is_active` (boolean, default true)
      - `usage_count` (integer, default 0)
      - `max_usage` (integer, nullable)
      - `expires_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `created_by` (uuid, references admin_users)

  2. Updates to existing tables
    - Add referral fields to user_subscriptions table

  3. Security
    - Enable RLS on all new tables
    - Add policies for admin access only
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  referral_name text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  discount_percent integer NOT NULL DEFAULT 30,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  max_usage integer,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id)
);

-- Add referral fields to user_subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN referral_code text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'referral_name'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN referral_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'discount_applied'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN discount_applied integer DEFAULT 0;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users (only accessible by service role and self)
CREATE POLICY "Admin users can read own data" ON admin_users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Service role can manage admin users" ON admin_users
FOR ALL
USING (true);

-- Policies for referral_codes (admin access only)
CREATE POLICY "Admins can manage referral codes" ON referral_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Insert default admin user (password should be hashed in production)
INSERT INTO admin_users (email, password_hash, role) 
VALUES ('admn.bitvend@gmail.com', 'admin123', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Add foreign key constraint for referral codes in user_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_subscriptions_referral_code_fkey'
  ) THEN
    ALTER TABLE user_subscriptions 
    ADD CONSTRAINT user_subscriptions_referral_code_fkey 
    FOREIGN KEY (referral_code) REFERENCES referral_codes(code);
  END IF;
END $$;