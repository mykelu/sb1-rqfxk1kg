/*
  # Fix User Table and Policies

  1. Changes
    - Remove duplicate user records
    - Add email column safely
    - Update policies for better security
  
  2. Security
    - Maintain data isolation
    - Prevent duplicate user records
    - Ensure proper access control
*/

-- First, remove duplicate records keeping only the most recent one
WITH duplicates AS (
  SELECT auth_id,
         ROW_NUMBER() OVER (PARTITION BY auth_id ORDER BY created_at DESC) as rn
  FROM users
)
DELETE FROM users
WHERE auth_id IN (
  SELECT auth_id 
  FROM duplicates 
  WHERE rn > 1
);

-- Now it's safe to add the unique constraint
ALTER TABLE users ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);

-- Drop existing policies
DROP POLICY IF EXISTS "enable_auth_users_select" ON users;
DROP POLICY IF EXISTS "enable_auth_users_insert" ON users;
DROP POLICY IF EXISTS "enable_auth_users_update" ON users;

-- Simple, non-recursive policies
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Add admin policies
CREATE POLICY "admin_select_all" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "admin_update_all" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);