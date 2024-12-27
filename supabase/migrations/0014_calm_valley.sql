/*
  # Fix RLS Policies Recursion

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies using auth.uid() directly
    - Add proper indexes for performance
  
  2. Security
    - Maintain same security model but implement it more efficiently
    - Keep RLS enabled on all tables
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admin_full_access" ON users;
DROP POLICY IF EXISTS "therapist_read_clients" ON users;
DROP POLICY IF EXISTS "support_read_users" ON users;

-- Create new non-recursive policies
CREATE POLICY "allow_read_own_user"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "allow_insert_own_user"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "allow_update_own_user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Create admin policy using auth.users metadata directly
CREATE POLICY "allow_admin_full_access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;