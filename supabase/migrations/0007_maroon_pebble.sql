/*
  # Update Assessment Policies

  1. Security
    - Add policy for staff to view all assessments
    - Add policy for therapists to view client assessments
*/

-- Add policy for staff to view all assessments
CREATE POLICY "Staff can access all assessments"
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

-- Add policy for therapists to view their clients' assessments
CREATE POLICY "Therapists can access client assessments"
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