/*
  # Fix RLS Policies

  1. Changes
    - Drop all existing policies
    - Add simplified user policies
    - Add admin policies
    - Add therapist policies
    - Add support staff policies
    - Add indexes for performance
  
  2. Security
    - Users can only access their own data
    - Admins can access all data
    - Therapists can access their clients' data
    - Support staff can access necessary data
*/

-- Drop all existing policies
DO $$ 
BEGIN
  -- Users table policies
  DROP POLICY IF EXISTS "users_read_own" ON users;
  DROP POLICY IF EXISTS "users_insert_own" ON users;
  DROP POLICY IF EXISTS "users_update_own" ON users;
  DROP POLICY IF EXISTS "admin_read_all" ON users;
  DROP POLICY IF EXISTS "admin_write_all" ON users;
  
  -- Assessment notifications policies
  DROP POLICY IF EXISTS "Users can view own notifications" ON assessment_notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON assessment_notifications;
  DROP POLICY IF EXISTS "Therapists can create client notifications" ON assessment_notifications;
END $$;

-- Basic user policies
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

-- Admin policies
CREATE POLICY "admin_full_access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Therapist policies
CREATE POLICY "therapist_read_clients"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = users.id
    )
  );

-- Support staff policies
CREATE POLICY "support_read_users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'support'
    )
  );

-- Assessment notification policies
CREATE POLICY "user_read_own_notifications"
  ON assessment_notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "user_update_own_notifications"
  ON assessment_notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "therapist_manage_client_notifications"
  ON assessment_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = assessment_notifications.user_id
    )
  );

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_notifications ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_assessment_notifications_user_id ON assessment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_notifications_status ON assessment_notifications(status);