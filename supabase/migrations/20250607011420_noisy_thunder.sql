/*
  # Add ritual fields to heart_resonance_sessions table
  
  1. New Columns
     - `ritual_type` - Stores the type of ritual being performed
     - `chakra_focus` - The primary chakra focus for the ritual
     - `timeline_focus` - The timeline focus (past/present/future)
     - `intention_category` - Category of intention (healing/manifesting/etc)
     - `broadcast_to_all` - Whether to broadcast to all circle members
     
  2. Security
     - No changes to existing policies
*/

-- Add new columns to heart_resonance_sessions table
ALTER TABLE heart_resonance_sessions ADD COLUMN IF NOT EXISTS ritual_type text;
ALTER TABLE heart_resonance_sessions ADD COLUMN IF NOT EXISTS chakra_focus text;
ALTER TABLE heart_resonance_sessions ADD COLUMN IF NOT EXISTS timeline_focus text;
ALTER TABLE heart_resonance_sessions ADD COLUMN IF NOT EXISTS intention_category text;
ALTER TABLE heart_resonance_sessions ADD COLUMN IF NOT EXISTS broadcast_to_all boolean DEFAULT true;

-- Add message_type column to circle_messages
ALTER TABLE circle_messages ADD COLUMN IF NOT EXISTS message_type text;