/*
  # Fix infinite recursion in circle_members policy
  
  1. Changes
     - Drop the problematic recursive policy
     - Create a new, non-recursive policy for viewing circle members
     - Ensure policies for joining and leaving circles are correct
     
  2. Security
     - Maintain proper access control while fixing the recursion issue
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Circle members are viewable by authenticated users" ON circle_members;

-- Create a new, non-recursive policy for viewing circle members
CREATE POLICY "Users can view circle members for their circles"
  ON circle_members
  FOR SELECT
  TO authenticated
  USING (
    -- User can see members if they are the creator of the circle
    EXISTS (
      SELECT 1 FROM circles 
      WHERE circles.id = circle_members.circle_id 
      AND circles.creator_id = auth.uid()
    )
    OR 
    -- OR if they are viewing their own membership
    user_id = auth.uid()
  );

-- Also ensure we have a policy for users to join circles
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;

CREATE POLICY "Users can join circles"
  ON circle_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add policy for users to leave circles (delete their own membership)
DROP POLICY IF EXISTS "Users can leave circles" ON circle_members;

CREATE POLICY "Users can leave circles"
  ON circle_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);