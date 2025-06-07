/*
  # Check and create sigil_boards insert policy if needed
  
  1. Changes
     - Checks if the INSERT policy for sigil_boards already exists
     - Only creates the policy if it doesn't exist
     
  2. Security
     - Ensures users can only insert sigil boards where they are the owner
*/

-- Check if the policy exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'sigil_boards' AND policyname = 'Users can insert their own sigil boards'
  ) THEN
    CREATE POLICY "Users can insert their own sigil boards"
      ON sigil_boards
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Make sure the sigil_boards table has RLS enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'sigil_boards' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE sigil_boards ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;