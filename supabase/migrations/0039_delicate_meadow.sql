/*
  # Add Therapist Tables

  1. New Tables
    - therapist_profiles: Store therapist information and credentials
    - therapist_reviews: Store client reviews and ratings
  
  2. Security
    - Enable RLS on both tables
    - Add indexes for performance
*/

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_therapist_profiles_user;
DROP INDEX IF EXISTS idx_therapist_reviews_therapist;
DROP INDEX IF EXISTS idx_therapist_reviews_reviewer;

-- Create therapist profiles table
CREATE TABLE IF NOT EXISTS therapist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  bio text,
  education text[],
  specializations text[],
  years_experience integer,
  languages text[],
  accepts_insurance boolean DEFAULT false,
  insurance_providers text[],
  session_rate numeric(10,2) NOT NULL,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create therapist reviews table
CREATE TABLE IF NOT EXISTS therapist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES users(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_user ON therapist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_therapist_reviews_therapist ON therapist_reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_reviews_reviewer ON therapist_reviews(reviewer_id);