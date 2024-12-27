/*
  # Add user profile trigger and fix assessment relations
  
  1. Changes
    - Add trigger to auto-create user profiles
    - Update assessment foreign key to use auth.users
    - Add missing indexes
*/

-- Create trigger function for auto-creating user profiles
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, location, preferences, health_history)
  VALUES (
    NEW.id,
    '{"country": "", "city": "", "timezone": ""}'::jsonb,
    '{"communicationPreference": "chat", "languagePreference": ["English"]}'::jsonb,
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);