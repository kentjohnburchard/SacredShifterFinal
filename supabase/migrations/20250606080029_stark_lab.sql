/*
  # Create Hierophant tables and supporting schema
  
  1. New Tables
     - `wisdom_snippets` - Stores short spiritual teachings
     - `codex_entries` - User-generated insights from their spiritual journey
     - `hierophant_sessions` - Tracks The Hierophant journey sessions

  2. Security
     - Enable RLS on all tables
     - Create policies for user access control
*/

-- Drop existing tables if they exist to ensure clean schema
DROP TABLE IF EXISTS public.hierophant_sessions CASCADE;
DROP TABLE IF EXISTS public.codex_entries CASCADE;
DROP TABLE IF EXISTS public.wisdom_snippets CASCADE;

-- Create wisdom_snippets table
CREATE TABLE public.wisdom_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  source TEXT,
  tradition TEXT,
  chakra TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wisdom_snippets ENABLE ROW LEVEL SECURITY;

-- Create policy for public reading of wisdom snippets
CREATE POLICY "Wisdom snippets are viewable by all users"
  ON public.wisdom_snippets
  FOR SELECT
  TO public
  USING (true);

-- Create codex_entries table
CREATE TABLE public.codex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  chakra TEXT,
  spiritual_tradition TEXT,
  belief_related BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.codex_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for codex entries
CREATE POLICY "Users can insert their own codex entries"
  ON public.codex_entries
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own codex entries"
  ON public.codex_entries
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own codex entries"
  ON public.codex_entries
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Create hierophant_sessions table
CREATE TABLE public.hierophant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_awarded INTEGER DEFAULT 0,
  reflection_text TEXT,
  chakra_focus TEXT,
  mentor_name TEXT,
  teaching_received TEXT
);

-- Enable RLS
ALTER TABLE public.hierophant_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for hierophant sessions
CREATE POLICY "Users can insert their own hierophant sessions"
  ON public.hierophant_sessions
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own hierophant sessions"
  ON public.hierophant_sessions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Insert sample wisdom snippets using the correct column name 'text'
INSERT INTO public.wisdom_snippets (text, source, tradition, chakra)
VALUES 
  ('The cave you fear to enter holds the treasure you seek.', 'Joseph Campbell', 'Mythology', 'throat'),
  ('As above, so below; as within, so without.', 'Hermes Trismegistus', 'Hermeticism', 'third_eye'),
  ('Be still, and know that I am God.', 'Psalms 46:10', 'Christianity', 'crown'),
  ('Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.', 'Zen Proverb', 'Buddhism', 'root'),
  ('The kingdom of heaven is within you.', 'Jesus Christ', 'Christianity', 'heart'),
  ('You are not a drop in the ocean. You are the entire ocean in a drop.', 'Rumi', 'Sufism', 'third_eye'),
  ('The Tao that can be told is not the eternal Tao.', 'Lao Tzu', 'Taoism', 'throat'),
  ('Know thyself.', 'Delphic Maxim', 'Greek Philosophy', 'third_eye'),
  ('Meditation brings wisdom; lack of meditation leaves ignorance.', 'Buddha', 'Buddhism', 'crown');