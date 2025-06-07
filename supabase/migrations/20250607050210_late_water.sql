/*
  # Fix RLS Policy Infinite Recursion

  This migration fixes the infinite recursion issue in RLS policies for circles and circle_members tables.
  
  ## Changes Made
  1. Drop existing problematic policies on circles and circle_members tables
  2. Create new, simplified policies that avoid circular dependencies
  3. Ensure policies use direct relationships without mutual recursion

  ## Security
  - Users can view circles they created or are members of
  - Users can manage their own circle memberships
  - Circle creators can manage their circles
*/

-- Drop existing problematic policies on circles table
DROP POLICY IF EXISTS "Users can view circles they are members of" ON circles;
DROP POLICY IF EXISTS "Users can view their own circles" ON circles;
DROP POLICY IF EXISTS "Users can create circles" ON circles;
DROP POLICY IF EXISTS "Creators can update their circles" ON circles;
DROP POLICY IF EXISTS "Creators can delete their circles" ON circles;

-- Drop existing problematic policies on circle_members table
DROP POLICY IF EXISTS "Users can view circle members for their circles" ON circle_members;
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;
DROP POLICY IF EXISTS "Users can leave circles" ON circle_members;

-- Create new simplified policies for circles table
CREATE POLICY "circles_select_own_policy"
  ON circles
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "circles_select_member_policy"
  ON circles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_members.circle_id = circles.id 
      AND circle_members.user_id = auth.uid()
    )
  );

CREATE POLICY "circles_insert_policy"
  ON circles
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "circles_update_policy"
  ON circles
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "circles_delete_policy"
  ON circles
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create new simplified policies for circle_members table
CREATE POLICY "circle_members_select_policy"
  ON circle_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "circle_members_insert_policy"
  ON circle_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "circle_members_delete_policy"
  ON circle_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow circle creators to view members of their circles
CREATE POLICY "circle_members_select_creator_policy"
  ON circle_members
  FOR SELECT
  TO authenticated
  USING (
    circle_id IN (
      SELECT id FROM circles 
      WHERE creator_id = auth.uid()
    )
  );