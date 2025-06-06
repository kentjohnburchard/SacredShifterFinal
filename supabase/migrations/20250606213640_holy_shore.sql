/*
  # Create continuum_sessions table

  1. New Tables
    - `continuum_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_type` (text)
      - `xp_awarded` (integer, default 0)
      - `chakra` (text, optional chakra type)
      - `frequency` (numeric, optional frequency)
      - `tarot_archetype` (text, optional)
      - `sephirah` (text, optional)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `continuum_sessions` table
    - Add policies for users to manage their own sessions

  3. Performance
    - Add indexes on user_id, timestamp, and session_type
</*/

-- Create the continuum_sessions table
CREATE TABLE IF NOT EXISTS continuum_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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