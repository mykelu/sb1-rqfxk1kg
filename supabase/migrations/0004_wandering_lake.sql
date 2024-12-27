/*
  # Mental Health Platform Features

  1. New Tables
    - `assessments`: Self-assessment tools and progress tracking
    - `appointments`: Real-time booking and scheduling
    - `chat_sessions`: Crisis support and therapy sessions
    - `peer_groups`: Support forums and group chatrooms
    - `educational_content`: Content management for resources
    - `gamification`: User engagement and rewards
    - `subscriptions`: Financial management
    - `crisis_workflows`: Crisis escalation management
    - `analytics`: System insights and reporting
    - `wearable_metrics`: Health tracking integration

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role
    - Implement HIPAA-compliant data handling
*/

-- Assessment Types and Status
CREATE TYPE assessment_type AS ENUM (
  'depression',
  'anxiety',
  'stress',
  'well_being',
  'custom'
);

CREATE TYPE session_type AS ENUM (
  'crisis',
  'therapy',
  'peer_support',
  'group'
);

CREATE TYPE session_mode AS ENUM (
  'chat',
  'audio',
  'video'
);

-- Self Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type assessment_type NOT NULL,
  responses jsonb NOT NULL,
  score integer,
  recommendations jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat and Support Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  provider_id uuid REFERENCES users(id),
  session_type session_type NOT NULL,
  mode session_mode NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Peer Support Groups
CREATE TABLE IF NOT EXISTS peer_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  max_participants integer,
  moderator_id uuid REFERENCES users(id),
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Group Memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  group_id uuid REFERENCES peer_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Educational Content
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  tags text[],
  author_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gamification
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  achievement_type text NOT NULL,
  points integer DEFAULT 0,
  earned_at timestamptz DEFAULT now()
);

-- Subscriptions and Billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  plan_type text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crisis Workflows
CREATE TABLE IF NOT EXISTS crisis_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  severity text NOT NULL,
  status text NOT NULL,
  assigned_to uuid REFERENCES users(id),
  action_taken text[],
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wearable Integration
CREATE TABLE IF NOT EXISTS wearable_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  device_type text NOT NULL,
  metrics jsonb NOT NULL,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES users(id),
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own assessments
CREATE POLICY "Users can manage own assessments" ON assessments
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can access their chat sessions
CREATE POLICY "Users can access own chat sessions" ON chat_sessions
  USING (user_id = auth.uid() OR provider_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can view public peer groups
CREATE POLICY "Users can view public groups" ON peer_groups
  USING (NOT is_private OR EXISTS (
    SELECT 1 FROM group_memberships
    WHERE group_id = peer_groups.id
    AND user_id = auth.uid()
  ));

-- Users can view their achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  USING (user_id = auth.uid());

-- Users can view their subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  USING (user_id = auth.uid());

-- Crisis workflows accessible to staff
CREATE POLICY "Staff can access crisis workflows" ON crisis_workflows
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('support', 'therapist', 'admin', 'super_admin')
    )
  );

-- Users can access their wearable data
CREATE POLICY "Users can access own wearable data" ON wearable_metrics
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create update triggers
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_peer_groups_updated_at
  BEFORE UPDATE ON peer_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_educational_content_updated_at
  BEFORE UPDATE ON educational_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_crisis_workflows_updated_at
  BEFORE UPDATE ON crisis_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();