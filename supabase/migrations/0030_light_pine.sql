-- Drop existing function
DROP FUNCTION IF EXISTS create_chat_room(chat_room_type, uuid);

-- Create function to create a new chat room with proper role handling
CREATE OR REPLACE FUNCTION create_chat_room(
  p_type chat_room_type,
  p_client_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id uuid;
  v_provider_id uuid;
  v_client_id uuid;
  v_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO v_user_role
  FROM users
  WHERE auth_id = auth.uid();

  -- Set client ID
  v_client_id := COALESCE(p_client_id, (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

  -- Get an available provider based on room type
  SELECT u.id INTO v_provider_id
  FROM users u
  WHERE u.role = CASE 
    WHEN p_type = 'therapy_session' THEN 'therapist'
    ELSE 'support'
  END
  AND u.last_active >= NOW() - INTERVAL '5 minutes'
  AND NOT EXISTS (
    SELECT 1 FROM chat_participants cp
    JOIN chat_rooms cr ON cp.room_id = cr.id
    WHERE cp.user_id = u.id
    AND cr.status = 'active'
  )
  ORDER BY RANDOM()
  LIMIT 1;

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'No available providers found';
  END IF;

  -- Create room
  INSERT INTO chat_rooms (type, status)
  VALUES (p_type, 'active')
  RETURNING id INTO v_room_id;

  -- Add participants
  INSERT INTO chat_participants (room_id, user_id, role, public_key)
  VALUES
    (v_room_id, v_client_id, 'client', encode(gen_random_bytes(32), 'base64')),
    (v_room_id, v_provider_id, 
      CASE 
        WHEN p_type = 'therapy_session' THEN 'therapist'::chat_participant_role 
        ELSE 'crisis_responder'::chat_participant_role
      END,
      encode(gen_random_bytes(32), 'base64')
    );

  -- Update provider's last_active timestamp
  UPDATE users
  SET last_active = NOW()
  WHERE id = v_provider_id;

  RETURN v_room_id;
END;
$$;