/*
  # Create fractal_glyphs table

  1. New Tables
    - `fractal_glyphs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_id` (uuid, nullable)
      - `image_url` (text, nullable)
      - `parameters` (jsonb, stores sigil configuration)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `fractal_glyphs` table
    - Add policies for users to manage their own sigils
*/

CREATE TABLE IF NOT EXISTS fractal_glyphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid,
  image_url text,
  parameters jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fractal_glyphs_user_id_fkey'
  ) THEN
    ALTER TABLE fractal_glyphs 
    ADD CONSTRAINT fractal_glyphs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE fractal_glyphs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own fractal glyphs"
  ON fractal_glyphs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fractal glyphs"
  ON fractal_glyphs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fractal glyphs"
  ON fractal_glyphs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fractal glyphs"
  ON fractal_glyphs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS fractal_glyphs_user_id_idx ON fractal_glyphs(user_id);
CREATE INDEX IF NOT EXISTS fractal_glyphs_created_at_idx ON fractal_glyphs(created_at DESC);
CREATE INDEX IF NOT EXISTS fractal_glyphs_session_id_idx ON fractal_glyphs(session_id) WHERE session_id IS NOT NULL;