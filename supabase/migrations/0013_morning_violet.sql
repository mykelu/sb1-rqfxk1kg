/*
  # Create Assessments Table

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (text, assessment type)
      - `answers` (jsonb, assessment answers)
      - `score` (integer, assessment score)
      - `interpretation` (text, assessment interpretation)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users, therapists, and staff
    - Add indexes for performance
*/

-- Create assessments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL,
  interpretation text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "users_read_own_assessments" ON assessments;
DROP POLICY IF EXISTS "users_create_own_assessments" ON assessments;
DROP POLICY IF EXISTS "therapist_read_client_assessments" ON assessments;
DROP POLICY IF EXISTS "staff_access_all_assessments" ON assessments;

-- Create policies
CREATE POLICY "users_read_own_assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "users_create_own_assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "therapist_read_client_assessments"
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

CREATE POLICY "staff_access_all_assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'support')
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_type ON assessments(type);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);