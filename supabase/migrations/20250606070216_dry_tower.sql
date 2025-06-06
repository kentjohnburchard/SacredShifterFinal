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

-- Create wisdom_snippets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.wisdom_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  tradition TEXT NOT NULL,
  chakra TEXT NOT NULL,
  tags TEXT[] DEFAULT NULL,
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

-- Create codex_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.codex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chakra_tag TEXT,
  spiritual_tradition TEXT,
  belief_related BOOLEAN DEFAULT false,
  tags TEXT[],
  wisdom_snippet_id UUID REFERENCES public.wisdom_snippets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
CREATE TABLE IF NOT EXISTS public.hierophant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_name TEXT,
  belief_reflection TEXT,
  wisdom_snippet_id UUID REFERENCES public.wisdom_snippets(id),
  codex_entry_id UUID REFERENCES public.codex_entries(id),
  chakra TEXT DEFAULT 'Throat',
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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

-- Insert some sample wisdom snippets
INSERT INTO public.wisdom_snippets (content, source, tradition, chakra)
VALUES 
  ('The cave you fear to enter holds the treasure you seek.', 'Joseph Campbell', 'Mythology', 'throat'),
  ('As above, so below; as within, so without.', 'Hermes Trismegistus', 'Hermeticism', 'third_eye'),
  ('Be still, and know that I am God.', 'Psalms 46:10', 'Christianity', 'crown'),
  ('Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.', 'Zen Proverb', 'Buddhism', 'root'),
  ('The kingdom of heaven is within you.', 'Jesus Christ', 'Christianity', 'heart'),
  ('You are not a drop in the ocean. You are the entire ocean in a drop.', 'Rumi', 'Sufism', 'third_eye'),
  ('The Tao that can be told is not the eternal Tao.', 'Lao Tzu', 'Taoism', 'throat'),
  ('Know thyself.', 'Delphic Maxim', 'Greek Philosophy', 'third_eye'),
  ('Meditation brings wisdom; lack of meditation leaves ignorance.', 'Buddha', 'Buddhism', 'crown')
ON CONFLICT (id) DO NOTHING;