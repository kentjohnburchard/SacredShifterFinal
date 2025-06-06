/*
  # Create continuum_sessions table

  1. New Tables
    - `continuum_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_type` (text) - Type of spiritual session
      - `xp_awarded` (integer) - Experience points awarded
      - `chakra` (text, optional) - Associated chakra
      - `frequency` (numeric, optional) - Sound frequency used
      - `tarot_archetype` (text, optional) - Tarot card archetype
      - `sephirah` (text, optional) - Tree of Life sephirah
      - `timestamp` (timestamptz) - When the session occurred
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on `continuum_sessions` table
    - Add policy for users to read their own sessions
    - Add policy for users to insert their own sessions

  3. Indexes
    - Index on user_id for faster queries
    - Index on timestamp for chronological ordering
*/

-- Create the continuum_sessions table
CREATE TABLE IF NOT EXISTS continuum_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type text NOT NULL,
  xp_awarded integer NOT NULL DEFAULT 0,
  chakra text,
  frequency numeric,
  tarot_archetype text,
  sephirah text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add constraint for chakra values to match ChakraType
ALTER TABLE continuum_sessions 
ADD CONSTRAINT continuum_sessions_chakra_check 
CHECK (chakra IS NULL OR chakra = ANY (ARRAY['Root'::text, 'Sacral'::text, 'SolarPlexus'::text, 'Heart'::text, 'Throat'::text, 'ThirdEye'::text, 'Crown'::text]));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS continuum_sessions_user_id_idx ON continuum_sessions(user_id);
CREATE INDEX IF NOT EXISTS continuum_sessions_timestamp_idx ON continuum_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS continuum_sessions_session_type_idx ON continuum_sessions(session_type);

-- Enable Row Level Security
ALTER TABLE continuum_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own continuum sessions"
  ON continuum_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own continuum sessions"
  ON continuum_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own continuum sessions"
  ON continuum_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);