/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - The current RLS policies on circles and circle_members tables create infinite recursion
    - Policies reference each other in circular dependencies
    
  2. Solution
    - Drop all existing problematic policies
    - Create new simplified policies that avoid circular references
    - Use direct user authentication checks instead of complex joins
    
  3. Security
    - Users can view and manage circles they created
    - Users can view circles they are members of (without recursive lookups)
    - Users can manage their own circle memberships
*/

-- First, drop ALL existing policies on circles table to start fresh
DROP POLICY IF EXISTS "circles_select_own_policy" ON circles;
DROP POLICY IF EXISTS "circles_select_member_policy" ON circles;
DROP POLICY IF EXISTS "circles_insert_policy" ON circles;
DROP POLICY IF EXISTS "circles_update_policy" ON circles;
DROP POLICY IF EXISTS "circles_delete_policy" ON circles;
DROP POLICY IF EXISTS "Users can view their own circles" ON circles;
DROP POLICY IF EXISTS "Users can view circles they are members of" ON circles;
DROP POLICY IF EXISTS "Users can create circles" ON circles;
DROP POLICY IF EXISTS "Creators can update their circles" ON circles;
DROP POLICY IF EXISTS "Creators can delete their circles" ON circles;

-- Drop ALL existing policies on circle_members table to start fresh
DROP POLICY IF EXISTS "circle_members_select_policy" ON circle_members;
DROP POLICY IF EXISTS "circle_members_select_creator_policy" ON circle_members;
DROP POLICY IF EXISTS "circle_members_insert_policy" ON circle_members;
DROP POLICY IF EXISTS "circle_members_delete_policy" ON circle_members;
DROP POLICY IF EXISTS "Users can view circle members for their circles" ON circle_members;
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;
DROP POLICY IF EXISTS "Users can leave circles" ON circle_members;

-- Create simple, non-recursive policies for circles table
-- Policy 1: Users can view circles they created
CREATE POLICY "circles_select_own_policy"
  ON circles
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

-- Policy 2: Users can create circles
CREATE POLICY "circles_insert_policy"
  ON circles
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Policy 3: Users can update their own circles
CREATE POLICY "circles_update_policy"
  ON circles
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Policy 4: Users can delete their own circles
CREATE POLICY "circles_delete_policy"
  ON circles
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create simple, non-recursive policies for circle_members table
-- Policy 1: Users can view their own memberships
CREATE POLICY "circle_members_select_policy"
  ON circle_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can join circles (insert their own membership)
CREATE POLICY "circle_members_insert_policy"
  ON circle_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can leave circles (delete their own membership)
CREATE POLICY "circle_members_delete_policy"
  ON circle_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 4: Circle creators can view members of their circles
-- This uses a simple direct lookup without recursion
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

-- Add a separate policy for circles that allows viewing circles where user is a member
-- This will be handled in the application layer to avoid recursion
-- We'll create a simple function-based approach instead

-- Create a function to check if user is member of a circle
CREATE OR REPLACE FUNCTION is_circle_member(circle_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM circle_members 
    WHERE circle_id = circle_uuid AND user_id = user_uuid
  );
$$;

-- Now create a policy for viewing circles where user is a member
-- This uses the function to avoid direct table recursion
CREATE POLICY "circles_select_member_policy"
  ON circles
  FOR SELECT
  TO authenticated
  USING (is_circle_member(id, auth.uid()));