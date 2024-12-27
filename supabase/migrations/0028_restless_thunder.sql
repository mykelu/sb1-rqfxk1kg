-- Create chat audit log table
CREATE TABLE chat_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  encrypted_content text NOT NULL,
  iv text NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  recipient_ids uuid[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  accessed_by uuid[] DEFAULT ARRAY[]::uuid[],
  access_log jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE chat_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for superadmin access only
CREATE POLICY "Only superadmins can access chat logs"
  ON chat_audit_logs
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create function to log chat messages
CREATE OR REPLACE FUNCTION log_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Store encrypted message in audit log
  INSERT INTO chat_audit_logs (
    room_id,
    message_id,
    encrypted_content,
    iv,
    sender_id,
    recipient_ids,
    created_at
  )
  SELECT
    NEW.room_id,
    NEW.id,
    NEW.encrypted_content,
    NEW.iv,
    NEW.sender_id,
    ARRAY_AGG(cp.user_id),
    NEW.created_at
  FROM chat_participants cp
  WHERE cp.room_id = NEW.room_id
  GROUP BY NEW.room_id, NEW.id, NEW.encrypted_content, NEW.iv, NEW.sender_id, NEW.created_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log messages
CREATE TRIGGER log_chat_message_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION log_chat_message();

-- Create function to record audit log access
CREATE OR REPLACE FUNCTION record_audit_log_access(log_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE chat_audit_logs
  SET 
    accessed_by = array_append(accessed_by, auth.uid()),
    access_log = access_log || jsonb_build_object(
      'accessed_at', now(),
      'accessed_by', auth.uid(),
      'ip_address', current_setting('request.headers')::json->>'x-forwarded-for'
    )
  WHERE id = log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;