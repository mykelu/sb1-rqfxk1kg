/*
  # Fix RLS policies to prevent infinite recursion

  1. Changes
    - Drop existing problematic policies
    - Create new policies with proper access control
    - Add helper functions for role checks
    - Fix infinite recursion in user table policies
  
  2. Security
    - Maintain data isolation
    - Ensure proper access control
    - Prevent unauthorized access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;
DROP POLICY IF EXISTS "Users can manage own record" ON users;
DROP POLICY IF EXISTS "Staff can manage all users" ON users;
DROP POLICY IF EXISTS "Therapists can view client records" ON users;
DROP POLICY IF EXISTS "Users can create own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Create helper function for role checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Basic policies for user table
CREATE POLICY "enable_auth_users_select" ON users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid() OR is_admin());

CREATE POLICY "enable_auth_users_insert" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "enable_auth_users_update" ON users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid() OR is_admin())
  WITH CHECK (auth_id = auth.uid() OR is_admin());

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);