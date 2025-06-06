/*
  # Create High Priestess meditation module tables
  
  1. New Tables
    - `high_priestess_sessions` - Records user meditation sessions in the High Priestess journey
    
  2. Security
    - Enable RLS on new tables
    - Add policies for users to manage their own data
    
  3. Schema
    - Tracks meditation duration, reflections, and chosen tracks
    - Links to user profiles
*/

-- Create high_priestess_sessions table to track meditation sessions
CREATE TABLE IF NOT EXISTS public.high_priestess_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meditation_duration_seconds INTEGER NOT NULL DEFAULT 0,
  reflection_text TEXT,
  chakra TEXT DEFAULT 'ThirdEye',
  frequency INTEGER DEFAULT 852,
  track_id UUID,
  intuition_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.high_priestess_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting own sessions
CREATE POLICY "Users can insert their own sessions"
  ON public.high_priestess_sessions
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Create policy for viewing own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.high_priestess_sessions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create policy for updating own sessions
CREATE POLICY "Users can update their own sessions"
  ON public.high_priestess_sessions
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Create meditation_tracks table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.meditation_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  chakra TEXT NOT NULL,
  frequency_hz INTEGER NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  is_guided BOOLEAN DEFAULT false,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meditation_tracks ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing meditation tracks (public read access)
CREATE POLICY "Anyone can view meditation tracks"
  ON public.meditation_tracks
  FOR SELECT
  TO public
  USING (true);