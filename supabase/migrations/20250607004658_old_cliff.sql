/*
  # Update codex_entries table and policies
  
  1. Changes
     - Creates codex_entries table if it doesn't exist
     - Adds policies for user access control with checks to prevent duplicate policy errors
     - Adds performance indexes
     
  2. Security
     - Enables RLS
     - Ensures users can only access their own entries
*/

-- Create the table if it doesn't exist
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

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Check if "Users can view their own codex entries" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'codex_entries' AND policyname = 'Users can view their own codex entries'
  ) THEN
    CREATE POLICY "Users can view their own codex entries"
      ON codex_entries
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- Check if "Users can insert their own codex entries" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'codex_entries' AND policyname = 'Users can insert their own codex entries'
  ) THEN
    CREATE POLICY "Users can insert their own codex entries"
      ON codex_entries
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Check if "Users can update their own codex entries" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'codex_entries' AND policyname = 'Users can update their own codex entries'
  ) THEN
    CREATE POLICY "Users can update their own codex entries"
      ON codex_entries
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Check if "Users can delete their own codex entries" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'codex_entries' AND policyname = 'Users can delete their own codex entries'
  ) THEN
    CREATE POLICY "Users can delete their own codex entries"
      ON codex_entries
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS codex_entries_user_id_idx ON codex_entries(user_id);
CREATE INDEX IF NOT EXISTS codex_entries_type_idx ON codex_entries(type);
CREATE INDEX IF NOT EXISTS codex_entries_chakra_idx ON codex_entries(chakra);
CREATE INDEX IF NOT EXISTS codex_entries_created_at_idx ON codex_entries(created_at);