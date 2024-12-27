/*
  # Fix user table policies

  1. Changes
    - Add policy for authenticated users to create their own user record
    - Add policy for users to update their own record
    - Add policy for staff to manage all user records
    - Add policy for therapists to view their clients' records
*/

-- Allow authenticated users to create their own user record
CREATE POLICY "Users can create own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Allow users to update their own record
CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Allow staff to manage all user records
CREATE POLICY "Staff can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'support')
    )
  );

-- Allow therapists to view their clients' records
CREATE POLICY "Therapists can view client records"
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