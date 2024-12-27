-- Create support staff with proper error handling
DO $$
DECLARE
  new_auth_id uuid := gen_random_uuid();
  new_user_id uuid;
BEGIN
  -- Temporarily disable the user profile trigger
  DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON users;

  -- Check if support user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'support@mentalhealth.support'
  ) THEN
    -- Insert support staff into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      raw_user_meta_data,
      created_at,
      updated_at,
      email_confirmed_at,
      encrypted_password,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_auth_id,
      'authenticated',
      'authenticated',
      'support@mentalhealth.support',
      '{"role": "support"}'::jsonb,
      now(),
      now(),
      now(),
      crypt('Support123!@#', gen_salt('bf')),
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex'),
      'support@mentalhealth.support'
    );

    -- Create user record and store the ID
    INSERT INTO users (
      auth_id,
      role,
      full_name,
      created_at,
      updated_at,
      last_active
    ) VALUES (
      new_auth_id,
      'support',
      'Crisis Support Team',
      now(),
      now(),
      now()
    ) RETURNING id INTO new_user_id;

    -- Create user profile manually
    INSERT INTO user_profiles (
      user_id,
      location,
      preferences,
      health_history,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      jsonb_build_object(
        'country', 'Global',
        'city', 'Support Center',
        'timezone', 'UTC'
      ),
      jsonb_build_object(
        'communicationPreference', 'chat',
        'languagePreference', ARRAY['English'],
        'emergencyContactConsent', true,
        'therapistGenderPreference', 'any'
      ),
      jsonb_build_object(),
      now(),
      now()
    );
  END IF;

  -- Recreate the user profile trigger
  CREATE TRIGGER ensure_user_profile_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_profile();
END $$;