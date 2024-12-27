/*
  # Secure Messaging System

  1. New Tables
    - `chat_rooms`: Stores chat room metadata
      - `id` (uuid, primary key)
      - `type` (enum: therapy_session, crisis_support)
      - `status` (enum: active, archived)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `chat_participants`: Links users to chat rooms
      - `room_id` (uuid, references chat_rooms)
      - `user_id` (uuid, references users)
      - `role` (enum: client, therapist, crisis_responder)
      - `joined_at` (timestamptz)
      
    - `chat_messages`: Stores encrypted messages
      - `id` (uuid, primary key)
      - `room_id` (uuid, references chat_rooms)
      - `sender_id` (uuid, references users)
      - `encrypted_content` (text)
      - `iv` (text, initialization vector)
      - `is_anonymous` (boolean)
      - `created_at` (timestamptz)
      - `edited_at` (timestamptz)
      - `deleted_at` (timestamptz)

    - `message_reports`: Tracks reported messages
      - `id` (uuid, primary key)
      - `message_id` (uuid, references chat_messages)
      - `reporter_id` (uuid, references users)
      - `reason` (text)
      - `status` (enum: pending, reviewed, dismissed)
      - `created_at` (timestamptz)

    - `blocked_users`: Tracks user blocking
      - `blocker_id` (uuid, references users)
      - `blocked_id` (uuid, references users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure end-to-end encryption
*/

-- Create ENUMs
CREATE TYPE chat_room_type AS ENUM ('therapy_session', 'crisis_support');
CREATE TYPE chat_room_status AS ENUM ('active', 'archived');
CREATE TYPE chat_participant_role AS ENUM ('client', 'therapist', 'crisis_responder');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed');

-- Create Tables
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type chat_room_type NOT NULL,
  status chat_room_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE chat_participants (
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role chat_participant_role NOT NULL,
  public_key text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  encrypted_content text NOT NULL,
  iv text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  CONSTRAINT content_not_empty CHECK (encrypted_content != '')
);

CREATE TABLE message_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status report_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_message_reporter UNIQUE (message_id, reporter_id)
);

CREATE TABLE blocked_users (
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Create Indexes
CREATE INDEX idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_message_reports_status ON message_reports(status);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Chat Rooms
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE room_id = id
      AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Chat Participants
CREATE POLICY "Users can view room participants"
  ON chat_participants
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_participants
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Chat Messages
CREATE POLICY "Users can view room messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT room_id FROM chat_participants
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
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
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
    AND sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can edit own messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    AND deleted_at IS NULL
  )
  WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    AND deleted_at IS NULL
  );

-- Message Reports
CREATE POLICY "Users can report messages"
  ON message_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    AND message_id IN (
      SELECT id FROM chat_messages
      WHERE room_id IN (
        SELECT room_id FROM chat_participants
        WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      )
    )
  );

-- Blocked Users
CREATE POLICY "Users can manage blocks"
  ON blocked_users
  FOR ALL
  TO authenticated
  USING (
    blocker_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    blocker_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Functions

-- Function to create a new chat room
CREATE OR REPLACE FUNCTION create_chat_room(
  p_type chat_room_type,
  p_client_id uuid,
  p_provider_id uuid,
  p_provider_role chat_participant_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id uuid;
BEGIN
  -- Validate provider role
  IF p_provider_role NOT IN ('therapist', 'crisis_responder') THEN
    RAISE EXCEPTION 'Invalid provider role';
  END IF;

  -- Create room
  INSERT INTO chat_rooms (type)
  VALUES (p_type)
  RETURNING id INTO v_room_id;

  -- Add participants
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES
    (v_room_id, p_client_id, 'client'),
    (v_room_id, p_provider_id, p_provider_role);

  RETURN v_room_id;
END;
$$;