/*
  # Fix RLS Policies Recursion

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies using JWT claims
    - Add proper indexes for performance
  
  2. Security
    - Maintain same security model but implement it more efficiently
    - Keep RLS enabled on all tables
*/

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "allow_read_own_user" ON users;
DROP POLICY IF EXISTS "allow_insert_own_user" ON users;
DROP POLICY IF EXISTS "allow_update_own_user" ON users;
DROP POLICY IF EXISTS "allow_admin_full_access" ON users;

-- Create new simplified policies using JWT claims
CREATE POLICY "users_read_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Admin policy using JWT claims
CREATE POLICY "admin_full_access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      current_setting('request.jwt.claims', true)::json->>'role',
      'user'
    ) IN ('admin', 'super_admin')
  );

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;