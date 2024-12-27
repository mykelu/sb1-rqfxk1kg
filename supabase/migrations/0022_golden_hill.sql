/*
  # Fix User Profile Issues
  
  1. Changes
    - Add trigger to auto-create user profile on user creation
    - Add default values for required fields
    - Fix user_id reference to use auth.uid()
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON users;
DROP FUNCTION IF EXISTS ensure_user_profile CASCADE;

-- Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    location,
    preferences,
    health_history,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    jsonb_build_object(
      'country', '',
      'city', '',
      'timezone', 'UTC'
    ),
    jsonb_build_object(
      'communicationPreference', 'chat',
      'languagePreference', ARRAY['English'],
      'emergencyContactConsent', false,
      'therapistGenderPreference', 'any'
    ),
    jsonb_build_object(
      'medications', ARRAY[]::jsonb[],
      'diagnoses', ARRAY[]::jsonb[],
      'allergies', ARRAY[]::text[]
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER ensure_user_profile_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile();

-- Update existing users without profiles
INSERT INTO user_profiles (
  user_id,
  location,
  preferences,
  health_history,
  created_at,
  updated_at
)
SELECT 
  id,
  jsonb_build_object(
    'country', '',
    'city', '',
    'timezone', 'UTC'
  ),
  jsonb_build_object(
    'communicationPreference', 'chat',
    'languagePreference', ARRAY['English'],
    'emergencyContactConsent', false,
    'therapistGenderPreference', 'any'
  ),
  jsonb_build_object(
    'medications', ARRAY[]::jsonb[],
    'diagnoses', ARRAY[]::jsonb[],
    'allergies', ARRAY[]::text[]
  ),
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = u.id
);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );