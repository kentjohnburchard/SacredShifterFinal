/*
  # Create sigil_boards table
  
  1. New Tables
    - `sigil_boards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `description` (text, optional)
      - `stickers` (jsonb, stores sigil positions and properties)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `sigil_boards` table
    - Add policies for users to manage their own boards
*/

CREATE TABLE IF NOT EXISTS sigil_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  stickers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sigil_boards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sigil boards"
  ON sigil_boards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sigil boards"
  ON sigil_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sigil boards"
  ON sigil_boards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sigil boards"
  ON sigil_boards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS sigil_boards_user_id_idx ON sigil_boards(user_id);
CREATE INDEX IF NOT EXISTS sigil_boards_created_at_idx ON sigil_boards(created_at);