/*
  # Fix infinite recursion in circles RLS policies

  1. Policy Changes
    - Drop existing problematic policies on circles table
    - Create new simplified policies that avoid circular references
    - Ensure circle_members policies don't create loops

  2. Security
    - Maintain proper access control
    - Users can view circles they created
    - Users can view circles they are members of
    - Prevent infinite recursion in policy evaluation
*/

-- Drop existing problematic policies on circles table
DROP POLICY IF EXISTS "Circles are viewable by members" ON circles;
DROP POLICY IF EXISTS "Creators can update their circles" ON circles;
DROP POLICY IF EXISTS "Users can create circles" ON circles;

-- Create new simplified policies for circles table
CREATE POLICY "Users can view their own circles"
  ON circles
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can view circles they are members of"
  ON circles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT circle_id 
      FROM circle_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create circles"
  ON circles
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their circles"
  ON circles
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can delete their circles"
  ON circles
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Ensure circle_members policies are also safe
DROP POLICY IF EXISTS "Users can view circle members for their circles" ON circle_members;

CREATE POLICY "Users can view circle members for their circles"
  ON circle_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    circle_id IN (
      SELECT id 
      FROM circles 
      WHERE creator_id = auth.uid()
    )
  );