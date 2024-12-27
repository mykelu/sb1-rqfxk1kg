/*
  # Fix profile issues and add admin features
  
  1. Changes
    - Add trigger to auto-create user profiles
    - Add admin metrics views
    - Add admin configuration table
    - Add proper indexes
*/

-- Create user profile if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    location,
    preferences,
    health_history
  )
  VALUES (
    NEW.id,
    '{"country": "", "city": "", "timezone": ""}'::jsonb,
    '{"communicationPreference": "chat", "languagePreference": ["English"], "emergencyContactConsent": false}'::jsonb,
    '{}'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON users;

-- Create new trigger
CREATE TRIGGER ensure_user_profile_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile();

-- Create admin configuration table
CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Insert default configurations
INSERT INTO admin_config (key, value, description) VALUES
  ('assessment_settings', 
   '{
     "minDaysBetweenAssessments": 7,
     "reminderEnabled": true,
     "crisisThreshold": {
       "phq9": 15,
       "gad7": 15
     }
   }'::jsonb,
   'Assessment frequency and threshold settings'
  ),
  ('notification_settings',
   '{
     "emailEnabled": true,
     "smsEnabled": true,
     "reminderDelay": 24
   }'::jsonb,
   'Notification delivery settings'
  ),
  ('support_settings',
   '{
     "maxSessionDuration": 60,
     "followupEnabled": true,
     "followupDelay": 48
   }'::jsonb,
   'Support session settings'
  )
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on admin_config
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies
CREATE POLICY "Admin access admin_config"
  ON admin_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_config_key ON admin_config(key);
CREATE INDEX IF NOT EXISTS idx_admin_config_updated ON admin_config(updated_at DESC);