/*
  # Create user_chakra_activations table

  1. New Tables
    - `user_chakra_activations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users table)
      - `chakra_tag` (text, the chakra that was activated)
      - `activation_type` (text, how the chakra was activated)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_chakra_activations` table
    - Add policy for users to insert their own activations
    - Add policy for users to read their own activations
*/

CREATE TABLE IF NOT EXISTS user_chakra_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chakra_tag text NOT NULL,
  activation_type text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to users table
ALTER TABLE user_chakra_activations 
ADD CONSTRAINT user_chakra_activations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

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
  WITH CHECK (uid() = user_id);

-- Create policy for users to read their own chakra activations
CREATE POLICY "Users can view their own chakra activations"
  ON user_chakra_activations
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Create index for performance
CREATE INDEX user_chakra_activations_user_id_idx ON user_chakra_activations (user_id);
CREATE INDEX user_chakra_activations_created_at_idx ON user_chakra_activations (created_at DESC);
CREATE INDEX user_chakra_activations_chakra_tag_idx ON user_chakra_activations (chakra_tag);