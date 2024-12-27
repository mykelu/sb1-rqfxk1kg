-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_chat_room(chat_room_type, uuid, uuid, chat_participant_role);

-- Create function to create a new chat room
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
BEGIN
  -- Get an available provider
  SELECT id INTO v_provider_id
  FROM users
  WHERE role = CASE 
    WHEN p_type = 'therapy_session' THEN 'therapist'
    ELSE 'support'
  END
  AND last_active >= NOW() - INTERVAL '5 minutes'
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
    (v_room_id, COALESCE(p_client_id, auth.uid()), 'client', encode(gen_random_bytes(32), 'base64')),
    (v_room_id, v_provider_id, 
      CASE 
        WHEN p_type = 'therapy_session' THEN 'therapist'::chat_participant_role 
        ELSE 'crisis_responder'::chat_participant_role
      END,
      encode(gen_random_bytes(32), 'base64')
    );

  RETURN v_room_id;
END;
$$;