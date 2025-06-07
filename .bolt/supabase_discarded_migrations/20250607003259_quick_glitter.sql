/*
  # Add INSERT policy for sigil_boards table

  1. Security
    - Add policy for authenticated users to insert their own sigil boards
    - Ensures users can only create boards with their own user_id

  This migration fixes the RLS policy violation error when creating new sigil boards.
*/

CREATE POLICY "Users can insert their own sigil boards"
  ON sigil_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);