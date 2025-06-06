/*
  # Add lightbearer_activities table

  1. New Tables
    - `lightbearer_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `activity_type` (text)
      - `points` (integer)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `lightbearer_activities` table
    - Add policy for users to insert their own activities
    - Add policy for users to view their own activities
*/

CREATE TABLE IF NOT EXISTS lightbearer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE lightbearer_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own activities"
  ON lightbearer_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities"
  ON lightbearer_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS lightbearer_activities_user_id_idx ON lightbearer_activities(user_id);
CREATE INDEX IF NOT EXISTS lightbearer_activities_created_at_idx ON lightbearer_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS lightbearer_activities_activity_type_idx ON lightbearer_activities(activity_type);