/*
  # Create fractal_glyphs table for sigil storage if it doesn't exist

  1. New Tables
    - `fractal_glyphs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_id` (uuid, optional session reference)
      - `image_url` (text, optional image storage URL)
      - `parameters` (jsonb, stores sigil generation parameters)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `fractal_glyphs` table if not already enabled
    - Add policies for users to manage their own sigils if they don't exist
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS fractal_glyphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid,
  image_url text,
  parameters jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'fractal_glyphs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE fractal_glyphs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'fractal_glyphs' AND policyname = 'Users can view their own fractal glyphs'
  ) THEN
    CREATE POLICY "Users can view their own fractal glyphs"
      ON fractal_glyphs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'fractal_glyphs' AND policyname = 'Users can insert their own fractal glyphs'
  ) THEN
    CREATE POLICY "Users can insert their own fractal glyphs"
      ON fractal_glyphs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'fractal_glyphs' AND policyname = 'Users can update their own fractal glyphs'
  ) THEN
    CREATE POLICY "Users can update their own fractal glyphs"
      ON fractal_glyphs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Check if policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'fractal_glyphs' AND policyname = 'Users can delete their own fractal glyphs'
  ) THEN
    CREATE POLICY "Users can delete their own fractal glyphs"
      ON fractal_glyphs
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS fractal_glyphs_user_id_idx ON fractal_glyphs(user_id);
CREATE INDEX IF NOT EXISTS fractal_glyphs_created_at_idx ON fractal_glyphs(created_at DESC);