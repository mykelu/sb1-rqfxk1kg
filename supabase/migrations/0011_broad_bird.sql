/*
  # Fix User Table Policies

  1. Changes
    - Drop existing policies safely
    - Add simplified RLS policies
    - Add performance indexes
  
  2. Security
    - Users can only access their own data
    - Admins can access all data
    - Prevent recursive policy issues
*/

-- Drop existing policies one by one
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Users can manage own record" ON users;
DROP POLICY IF EXISTS "Staff can manage all users" ON users;
DROP POLICY IF EXISTS "Therapists can view client records" ON users;
DROP POLICY IF EXISTS "Users can create own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "enable_auth_users_select" ON users;
DROP POLICY IF EXISTS "enable_auth_users_insert" ON users;
DROP POLICY IF EXISTS "enable_auth_users_update" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admin_select_all" ON users;
DROP POLICY IF EXISTS "admin_update_all" ON users;

-- Create basic user policies
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

-- Create admin policies using auth.users metadata
CREATE POLICY "admin_read_all"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role' = 'admin'
           OR raw_user_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "admin_write_all"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role' = 'admin'
           OR raw_user_meta_data->>'role' = 'super_admin')
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;