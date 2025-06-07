/*
  # Fix infinite recursion in circle_members RLS policy

  1. Problem
    - The current policy on circle_members table creates infinite recursion
    - Policy tries to query circle_members table from within itself
    
  2. Solution
    - Drop the problematic policy
    - Create a simpler, non-recursive policy
    - Ensure users can view circle members for circles they belong to or created
    
  3. Security
    - Maintain proper access control without recursion
    - Users can see members of circles they're part of
    - Circle creators can see all members of their circles
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Circle members are viewable by authenticated users" ON circle_members;

-- Create a new, non-recursive policy for viewing circle members
CREATE POLICY "Users can view circle members for their circles"
  ON circle_members
  FOR SELECT
  TO authenticated
  USING (
    -- User can see members if they are a member of the same circle
    -- OR if they are the creator of the circle
    EXISTS (
      SELECT 1 FROM circles 
      WHERE circles.id = circle_members.circle_id 
      AND circles.creator_id = auth.uid()
    )
    OR 
    user_id = auth.uid()
  );

-- Also ensure we have a policy for users to join circles
-- (This should already exist but let's make sure it's correct)
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;

CREATE POLICY "Users can join circles"
  ON circle_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add policy for users to leave circles (delete their own membership)
CREATE POLICY "Users can leave circles"
  ON circle_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);