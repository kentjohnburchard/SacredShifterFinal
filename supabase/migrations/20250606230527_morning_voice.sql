/*
  # Create user_chakra_activations table
  
  1. New Tables
    - `user_chakra_activations` - Records user chakra activations for energy tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `chakra_tag` (text, the activated chakra)
      - `activation_type` (text, how the chakra was activated)
      - `created_at` (timestamptz, when the activation occurred)

  2. Security
    - Enable RLS on the new table
    - Add policies for users to manage their own chakra activations
*/

CREATE TABLE IF NOT EXISTS user_chakra_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chakra_tag text NOT NULL,
  activation_type text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to auth.users table
ALTER TABLE user_chakra_activations 
ADD CONSTRAINT user_chakra_activations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add check constraint for valid chakra values
ALTER TABLE user_chakra_activations 
ADD CONSTRAINT user_chakra_activations_chakra_tag_check 
CHECK (chakra_tag = ANY (ARRAY['Root'::text, 'Sacral'::text, 'SolarPlexus'::text, 'Heart'::text, 'Throat'::text, 'ThirdEye'::text, 'Crown'::text]));

-- Enable RLS
ALTER TABLE user_chakra_activations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own chakra activations
CREATE POLICY "Users can insert their own chakra activations"
  ON user_chakra_activations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to read their own chakra activations
CREATE POLICY "Users can view their own chakra activations"
  ON user_chakra_activations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX user_chakra_activations_user_id_idx ON user_chakra_activations (user_id);
CREATE INDEX user_chakra_activations_created_at_idx ON user_chakra_activations (created_at DESC);
CREATE INDEX user_chakra_activations_chakra_tag_idx ON user_chakra_activations (chakra_tag);