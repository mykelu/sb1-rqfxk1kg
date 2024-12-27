/*
  # Add last_active column to users table

  1. New Columns
    - `last_active` (timestamptz) - Tracks when user was last active
    
  2. Changes
    - Adds last_active column with default value
    - Updates existing users with current timestamp
*/

-- Add last_active column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_active 
ON users(last_active DESC);

-- Update existing users
UPDATE users 
SET last_active = updated_at 
WHERE last_active IS NULL;