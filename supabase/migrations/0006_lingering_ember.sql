/*
  # Assessment Notifications System

  1. New Tables
    - `assessment_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (enum: reminder, request)
      - `status` (enum: pending, read, dismissed)
      - `message` (text)
      - `created_at` (timestamp)
      - `read_at` (timestamp, nullable)

  2. Security
    - Enable RLS on new table
    - Add policies for users to manage their notifications
    - Add policies for therapists to create notifications for their clients
*/

-- Create notification types
CREATE TYPE notification_type AS ENUM ('reminder', 'request');
CREATE TYPE notification_status AS ENUM ('pending', 'read', 'dismissed');

-- Assessment notifications table
CREATE TABLE IF NOT EXISTS assessment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  created_by uuid REFERENCES users(id),
  type notification_type NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  message text NOT NULL,
  assessment_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE assessment_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON assessment_notifications
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON assessment_notifications
  FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Therapists can create notifications for their clients
CREATE POLICY "Therapists can create client notifications"
  ON assessment_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN therapists t ON t.user_id = u.id
      JOIN appointments a ON a.therapist_id = t.id
      WHERE u.auth_id = auth.uid()
      AND a.client_id = assessment_notifications.user_id
    )
  );