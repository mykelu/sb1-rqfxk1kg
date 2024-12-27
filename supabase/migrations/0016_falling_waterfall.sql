/*
  # Add Role Helper Function

  1. Changes
    - Add stored function to get user role without recursion
    - Function uses direct query with no RLS
  
  2. Security
    - Function is SECURITY DEFINER to bypass RLS
    - Only returns role for the authenticated user
*/

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id uuid)
RETURNS TABLE (role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.role::text
  FROM users u
  WHERE u.auth_id = user_auth_id
  LIMIT 1;
END;
$$;