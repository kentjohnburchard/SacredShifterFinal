/*
  # Create sigil_alignments table

  1. New Tables
    - `sigil_alignments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `sigil_id` (uuid, foreign key to fractal_glyphs)
      - `timeline_node_id` (text)
      - `alignment_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sigil_alignments` table
    - Add policies for users to manage their own alignments
*/

CREATE TABLE IF NOT EXISTS sigil_alignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sigil_id uuid NOT NULL REFERENCES fractal_glyphs(id) ON DELETE CASCADE,
  timeline_node_id text NOT NULL,
  alignment_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sigil_alignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sigil alignments"
  ON sigil_alignments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sigil alignments"
  ON sigil_alignments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sigil alignments"
  ON sigil_alignments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sigil alignments"
  ON sigil_alignments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS sigil_alignments_user_id_idx ON sigil_alignments(user_id);
CREATE INDEX IF NOT EXISTS sigil_alignments_sigil_id_idx ON sigil_alignments(sigil_id);
CREATE UNIQUE INDEX IF NOT EXISTS sigil_alignments_sigil_id_unique_idx ON sigil_alignments(sigil_id);