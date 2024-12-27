/*
  # Add superadmin user

  1. Creates a new superadmin user
    - Username: mykelu
    - Role: super_admin
    
  2. Security
    - Password is hashed using Supabase Auth
    - User record is created with proper role
*/

-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON users;

-- Insert into auth.users table
DO $$
DECLARE
  new_auth_id uuid := gen_random_uuid();
BEGIN
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
    'mykelu',
    '{"role": "super_admin"}'::jsonb,
    now(),
    now(),
    now(),
    crypt('p2ssw0rd+', gen_salt('bf')),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    'mykelu'
  );

  -- Create user record
  INSERT INTO users (
    auth_id,
    role,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    new_auth_id,
    'super_admin',
    'MykelU Admin',
    now(),
    now()
  );
END $$;

-- Recreate the trigger
CREATE TRIGGER ensure_user_profile_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile();