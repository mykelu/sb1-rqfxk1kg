/*
  # Add Therapist Profiles and Reviews

  1. New Tables
    - therapist_profiles: Stores therapist information and ratings
    - therapist_reviews: Stores user reviews for therapists
  
  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing profiles
    - Add policies for reviews
*/

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS therapist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  bio text,
  specializations text[],
  is_verified boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS therapist_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES therapist_profiles(id) NOT NULL,
  reviewer_id uuid REFERENCES users(id) NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view verified therapist profiles" ON therapist_profiles;
DROP POLICY IF EXISTS "Therapists can manage own profile" ON therapist_profiles;
DROP POLICY IF EXISTS "Users can view reviews" ON therapist_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON therapist_reviews;

-- Create policies
CREATE POLICY "Anyone can view verified therapist profiles"
  ON therapist_profiles FOR SELECT
  TO authenticated
  USING (is_verified = true);

CREATE POLICY "Therapists can manage own profile"
  ON therapist_profiles FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'therapist'));

CREATE POLICY "Users can view reviews"
  ON therapist_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON therapist_reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));