/*
  # Add circle ascension tier system
  
  1. New Tables
     - `circle_ascension_tiers` - Defines the different ascension tiers for circles
     
  2. New Columns
     - Add `ascension_tier` to circles table
     - Add `ascension_points` to circles table
     
  3. Security
     - Enable RLS on new table
     - Add policy for public viewing of tier definitions
*/

-- Create circle_ascension_tiers table
CREATE TABLE IF NOT EXISTS circle_ascension_tiers (
  id serial PRIMARY KEY,
  tier_name text NOT NULL,
  min_points integer NOT NULL,
  description text,
  benefits text[],
  created_at timestamptz DEFAULT now()
);

-- Add columns to circles table
ALTER TABLE circles ADD COLUMN IF NOT EXISTS ascension_tier text DEFAULT 'Seed';
ALTER TABLE circles ADD COLUMN IF NOT EXISTS ascension_points integer DEFAULT 0;

-- Enable RLS on circle_ascension_tiers
ALTER TABLE circle_ascension_tiers ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing of tier definitions
CREATE POLICY "Anyone can view circle ascension tiers"
  ON circle_ascension_tiers
  FOR SELECT
  TO public
  USING (true);

-- Insert default tiers
INSERT INTO circle_ascension_tiers (tier_name, min_points, description, benefits)
VALUES 
  ('Seed', 0, 'A newly formed circle beginning its journey', ARRAY['Basic ritual scheduling', 'Member messaging', 'Sigil sharing']),
  ('Sprout', 100, 'A growing circle with established connections', ARRAY['Enhanced ritual effects', 'Timeline cohesion monitoring', 'Chakra balance visualization']),
  ('Bloom', 500, 'A thriving circle with strong resonance', ARRAY['Advanced sigil activation', 'Soul thread visualization', 'Lunar phase synchronization']),
  ('Mature', 1000, 'A powerful circle with deep connections', ARRAY['Quantum field manipulation', 'Cross-circle resonance', 'Enhanced manifestation power']),
  ('Transcendent', 5000, 'A legendary circle operating at the highest frequencies', ARRAY['Reality anchoring', 'Collective consciousness access', 'Manifestation amplification x3'])
ON CONFLICT DO NOTHING;