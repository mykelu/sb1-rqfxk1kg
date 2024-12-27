/*
  # Add user profile fields

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `location` (jsonb for structured location data)
      - `pronouns` (text)
      - `birth_date` (date)
      - `preferences` (jsonb for mental health preferences)
      - `health_history` (jsonb for medical history)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to manage their own profiles
    - Add policies for therapists to view their clients' profiles
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  pronouns text,
  birth_date date,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  health_history jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profiles
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Therapists can view their clients' profiles
CREATE POLICY "Therapists can view client profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = user_profiles.user_id
    )
  );