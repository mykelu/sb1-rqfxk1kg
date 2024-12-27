/*
  # Update Assessment Policies

  1. Changes
    - Add policy for therapists to view client assessments
    - Add policy for staff to view all assessments

  Note: The assessments table and basic user policies already exist from previous migrations.
*/

-- Add policy for therapists to view their clients' assessments
CREATE POLICY "Therapists can view client assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = assessments.user_id
    )
  );

-- Add policy for staff to view all assessments
CREATE POLICY "Staff can view all assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'support')
    )
  );