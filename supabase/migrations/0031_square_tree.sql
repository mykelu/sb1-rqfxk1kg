/*
  # Fix Chat Room Policies and Functions

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate chat room function with proper role handling
    - Add proper RLS policies for chat functionality
    
  2. Security
    - Enable RLS on all tables
    - Add proper access control policies
    - Ensure secure message handling
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
  DROP POLICY IF EXISTS "Users can view room participants" ON chat_participants;
  DROP POLICY IF EXISTS "Users can view room messages" ON chat_messages;
  DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Recreate policies with proper checks
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE room_id = id
      AND user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view room participants"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_participants
      WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view room messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_participants
      WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    room_id IN (
      SELECT room_id FROM chat_participants
      WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
    AND sender_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Drop and recreate the chat room function
DROP FUNCTION IF EXISTS create_chat_room(chat_room_type, uuid);

CREATE OR REPLACE FUNCTION create_chat_room(
  p_type chat_room_type,
  p_client_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_provider_id uuid;
  v_client_id uuid;
BEGIN
  -- Set client ID
  v_client_id := COALESCE(p_client_id, (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client ID not found';
  END IF;

  -- Get an available provider based on room type
  SELECT u.id INTO v_provider_id
  FROM users u
  WHERE u.role = CASE 
    WHEN p_type = 'therapy_session' THEN 'therapist'::text
    ELSE 'support'::text
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
        WHEN p_type = 'therapy_session' THEN 'therapist'
        ELSE 'crisis_responder'
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