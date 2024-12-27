-- Create ENUMs if they don't exist
DO $$ BEGIN
    CREATE TYPE crisis_severity AS ENUM ('low', 'medium', 'high', 'immediate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crisis_status AS ENUM ('pending', 'active', 'resolved', 'escalated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE support_mode AS ENUM ('chat', 'audio', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create crisis queue table
CREATE TABLE IF NOT EXISTS crisis_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  severity crisis_severity NOT NULL DEFAULT 'medium',
  status crisis_status NOT NULL DEFAULT 'pending',
  mode support_mode NOT NULL DEFAULT 'chat',
  initial_assessment jsonb NOT NULL DEFAULT '{}'::jsonb,
  assigned_to uuid REFERENCES users(id),
  assigned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crisis sessions table
CREATE TABLE IF NOT EXISTS crisis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES crisis_queue(id) NOT NULL,
  responder_id uuid REFERENCES users(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  mode support_mode NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration interval,
  notes text,
  outcome text,
  followup_needed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crisis metrics table
CREATE TABLE IF NOT EXISTS crisis_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responder_id uuid REFERENCES users(id) NOT NULL,
  total_sessions integer DEFAULT 0,
  avg_response_time interval,
  avg_session_duration interval,
  positive_outcomes integer DEFAULT 0,
  escalations integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE crisis_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own crisis requests"
  ON crisis_queue
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Support staff can view all crisis requests"
  ON crisis_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('support', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view own crisis sessions"
  ON crisis_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR responder_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

CREATE POLICY "Support staff can view crisis metrics"
  ON crisis_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create indexes
CREATE INDEX idx_crisis_queue_status ON crisis_queue(status);
CREATE INDEX idx_crisis_queue_severity ON crisis_queue(severity);
CREATE INDEX idx_crisis_queue_assigned ON crisis_queue(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_crisis_sessions_responder ON crisis_sessions(responder_id);
CREATE INDEX idx_crisis_sessions_started ON crisis_sessions(started_at DESC);

-- Create function to calculate response metrics
CREATE OR REPLACE FUNCTION update_crisis_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert metrics for the responder
  INSERT INTO crisis_metrics (
    responder_id,
    total_sessions,
    avg_response_time,
    avg_session_duration,
    positive_outcomes,
    escalations
  )
  SELECT
    NEW.responder_id,
    COUNT(*),
    AVG(started_at - q.created_at),
    AVG(ended_at - started_at),
    COUNT(*) FILTER (WHERE outcome = 'resolved'),
    COUNT(*) FILTER (WHERE outcome = 'escalated')
  FROM crisis_sessions s
  JOIN crisis_queue q ON s.queue_id = q.id
  WHERE s.responder_id = NEW.responder_id
  GROUP BY responder_id
  ON CONFLICT (responder_id) DO UPDATE
  SET
    total_sessions = EXCLUDED.total_sessions,
    avg_response_time = EXCLUDED.avg_response_time,
    avg_session_duration = EXCLUDED.avg_session_duration,
    positive_outcomes = EXCLUDED.positive_outcomes,
    escalations = EXCLUDED.escalations,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for metrics update
CREATE TRIGGER update_crisis_metrics_trigger
  AFTER INSERT OR UPDATE ON crisis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_crisis_metrics();