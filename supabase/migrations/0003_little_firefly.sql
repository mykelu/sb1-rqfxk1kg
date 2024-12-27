/*
  # Consent Management System

  1. New Tables
    - `guardian_consents`
      - `id` (uuid, primary key)
      - `minor_id` (uuid, references users)
      - `guardian_id` (uuid, references users)
      - `consent_type` (enum for different types of consent)
      - `status` (enum for consent status)
      - `valid_until` (timestamptz for consent expiration)
      - Timestamps and metadata

  2. Security
    - Enable RLS
    - Add policies for guardians and authorized staff
*/

-- Create consent types and status enums
CREATE TYPE consent_type AS ENUM (
  'account_creation',
  'therapy_access',
  'data_collection',
  'emergency_contact'
);

CREATE TYPE consent_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'expired',
  'revoked'
);

-- Guardian consents table
CREATE TABLE IF NOT EXISTS guardian_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_id uuid REFERENCES users(id) NOT NULL,
  guardian_id uuid REFERENCES users(id) NOT NULL,
  consent_type consent_type NOT NULL,
  status consent_status NOT NULL DEFAULT 'pending',
  valid_until timestamptz,
  guardian_name text NOT NULL,
  guardian_relationship text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text,
  consent_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE guardian_consents ENABLE ROW LEVEL SECURITY;

-- Guardians can view and manage their consents
CREATE POLICY "Guardians can manage consents"
  ON guardian_consents
  FOR ALL
  TO authenticated
  USING (guardian_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ))
  WITH CHECK (guardian_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Minors can view their consents
CREATE POLICY "Minors can view their consents"
  ON guardian_consents
  FOR SELECT
  TO authenticated
  USING (minor_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ));

-- Staff can view consents
CREATE POLICY "Staff can view consents"
  ON guardian_consents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'support')
    )
  );