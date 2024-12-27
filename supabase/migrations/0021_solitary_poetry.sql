/*
  # Appointment System Schema

  1. Tables
    - appointments: Core appointment records
    - therapist_availability: Therapist scheduling
    - appointment_notifications: Notification management

  2. Security
    - RLS policies for data access control
    - User-specific access rules
*/

-- Drop dependent policies first
DROP POLICY IF EXISTS "Therapists can view client profiles" ON user_profiles;
DROP POLICY IF EXISTS "therapist_manage_client_notifications" ON assessment_notifications;

-- Drop existing tables
DROP TABLE IF EXISTS appointment_notifications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS therapist_availability CASCADE;

-- Create base tables
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES users(id) NOT NULL,
  client_id uuid REFERENCES users(id) NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  type text NOT NULL,
  notes text,
  google_event_id text,
  cancellation_reason text,
  cancelled_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (
    status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show')
  ),
  CONSTRAINT valid_type CHECK (
    type IN ('initial_consultation', 'therapy_session', 'follow_up', 'crisis_intervention')
  ),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES users(id) NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE appointment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) NOT NULL,
  recipient_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_therapist_availability_therapist ON therapist_availability(therapist_id);
CREATE INDEX idx_appointment_notifications_appointment ON appointment_notifications(appointment_id);
CREATE INDEX idx_appointment_notifications_recipient ON appointment_notifications(recipient_id);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR
    therapist_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Clients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR
    therapist_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    client_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR
    therapist_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Therapists can manage own availability"
  ON therapist_availability
  FOR ALL
  TO authenticated
  USING (
    therapist_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    therapist_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can view therapist availability"
  ON therapist_availability
  FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Users can view own notifications"
  ON appointment_notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Recreate dependent policies
CREATE POLICY "Therapists can view client profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = user_profiles.user_id
    )
  );

CREATE POLICY "therapist_manage_client_notifications"
  ON assessment_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = assessment_notifications.user_id
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION check_appointment_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM appointments a
    WHERE (a.therapist_id = NEW.therapist_id OR a.client_id = NEW.client_id)
      AND a.status NOT IN ('cancelled', 'completed')
      AND a.id != NEW.id
      AND (
        (NEW.start_time, NEW.end_time) OVERLAPS 
        (a.start_time, a.end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Appointment time conflicts with existing appointment';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_appointment_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for client
  INSERT INTO appointment_notifications (
    appointment_id,
    recipient_id,
    type,
    scheduled_for
  ) VALUES (
    NEW.id,
    NEW.client_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'appointment_created'
      WHEN NEW.status = 'cancelled' THEN 'appointment_cancelled'
      WHEN NEW.status = 'rescheduled' THEN 'appointment_rescheduled'
      ELSE 'appointment_updated'
    END,
    CASE
      WHEN NEW.status = 'scheduled' THEN NEW.start_time - interval '24 hours'
      ELSE now()
    END
  );

  -- Create notification for therapist
  INSERT INTO appointment_notifications (
    appointment_id,
    recipient_id,
    type,
    scheduled_for
  ) VALUES (
    NEW.id,
    NEW.therapist_id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'new_appointment'
      WHEN NEW.status = 'cancelled' THEN 'appointment_cancelled'
      WHEN NEW.status = 'rescheduled' THEN 'appointment_rescheduled'
      ELSE 'appointment_updated'
    END,
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER check_appointment_conflict_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_conflict();

CREATE TRIGGER create_appointment_notifications_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notifications();