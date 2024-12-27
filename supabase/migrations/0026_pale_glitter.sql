-- Create function to get active users
CREATE OR REPLACE FUNCTION get_active_users()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO active_count
  FROM users
  WHERE last_active >= NOW() - INTERVAL '30 days';
  
  RETURN active_count;
END;
$$;