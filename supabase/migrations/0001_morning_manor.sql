/*
  # Initial Schema Setup for Mental Health Platform

  1. New Tables
    - users
      - Extended user profile information
    - therapists
      - Professional information and verification
    - appointments
      - Scheduling system
    - resources
      - Self-help materials and crisis information
    - crisis_reports
      - Crisis intervention tracking
    - content_moderation
      - Content moderation queue

  2. Security
    - Enable RLS on all tables
    - Set up role-based access policies
    - Implement age-appropriate content filtering
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('minor', 'adult', 'therapist', 'support', 'moderator', 'admin', 'super_admin');
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE crisis_priority AS ENUM ('low', 'medium', 'high', 'immediate');

-- Users table with extended profile
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id),
  role user_role NOT NULL DEFAULT 'adult',
  full_name text,
  date_of_birth date,
  emergency_contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Therapists profile
CREATE TABLE IF NOT EXISTS therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  license_number text NOT NULL,
  specializations text[],
  verification_status boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id),
  therapist_id uuid REFERENCES therapists(id),
  scheduled_for timestamptz NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  age_restricted boolean DEFAULT false,
  status content_status DEFAULT 'pending',
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crisis Reports
CREATE TABLE IF NOT EXISTS crisis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  priority crisis_priority NOT NULL,
  description text NOT NULL,
  handled_by uuid REFERENCES users(id),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Content Moderation
CREATE TABLE IF NOT EXISTS content_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  status content_status DEFAULT 'pending',
  moderator_id uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- Therapists can read their own profile
CREATE POLICY "Therapists can read own profile"
  ON therapists
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Clients can read approved resources
CREATE POLICY "Users can read approved resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND (
      NOT age_restricted OR
      auth.uid() IN (
        SELECT auth_id FROM users
        WHERE role != 'minor'
      )
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_crisis_reports_updated_at
  BEFORE UPDATE ON crisis_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_moderation_updated_at
  BEFORE UPDATE ON content_moderation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();