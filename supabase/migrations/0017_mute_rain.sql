/*
  # Fix Assessments Table and Policies

  1. Changes
    - Update assessments table structure
    - Add proper RLS policies
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Drop and recreate assessments table
DROP TABLE IF EXISTS assessments;

CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL,
  interpretation text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_type ON assessments(type);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();