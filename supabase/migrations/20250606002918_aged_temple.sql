/*
  # Add missing columns to profiles table
  
  1. New Columns
     - `light_points` - Stores the user's experience points
     - `light_level` - Stores the user's current level
     - `ascension_title` - Stores the user's title based on their level
     - `onboarding_completed` - Tracks if the user has completed onboarding
     - `chakra_highlight` - Stores the user's currently highlighted chakra
     - `last_level_up` - Records the timestamp of the last level-up

  2. Security
     - No changes to existing policies
*/

-- Check if columns exist before adding them to prevent errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'light_points'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN light_points INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'light_level'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN light_level INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ascension_title'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN ascension_title TEXT DEFAULT 'Seeker';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'chakra_highlight'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN chakra_highlight TEXT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_level_up'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_level_up TIMESTAMP WITH TIME ZONE NULL;
  END IF;
END $$;