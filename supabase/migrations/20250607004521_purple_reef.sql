/*
  # Create codex_entries table for the Echo Compass Codex

  1. New Tables
    - `codex_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `content` (text)
      - `type` (text)
      - `chakra` (text)
      - `tags` (text[])
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `codex_entries` table
    - Add policies for users to manage their own entries
*/

CREATE TABLE IF NOT EXISTS codex_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  chakra text NOT NULL,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE codex_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own codex entries"
  ON codex_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own codex entries"
  ON codex_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own codex entries"
  ON codex_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own codex entries"
  ON codex_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS codex_entries_user_id_idx ON codex_entries(user_id);
CREATE INDEX IF NOT EXISTS codex_entries_type_idx ON codex_entries(type);
CREATE INDEX IF NOT EXISTS codex_entries_chakra_idx ON codex_entries(chakra);
CREATE INDEX IF NOT EXISTS codex_entries_created_at_idx ON codex_entries(created_at);