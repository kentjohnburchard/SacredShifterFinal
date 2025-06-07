/*
  # Create tasks table for sacred rituals and daily practices

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key) - Unique identifier for each task
      - `user_id` (uuid, foreign key) - Links task to user
      - `title` (text, required) - Title/name of the task or ritual
      - `description` (text, optional) - Detailed description of the task
      - `date` (date, required) - Date when task is scheduled
      - `time` (text, optional) - Time of day for the task (stored as text for flexibility)
      - `is_recurring` (boolean, default false) - Whether task repeats
      - `recurrence_rule` (text, optional) - Rule for how task recurs
      - `is_completed` (boolean, default false) - Completion status
      - `created_at` (timestamptz, default now()) - When task was created

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for authenticated users to manage their own tasks only

  3. Performance
    - Add indexes on frequently queried columns (user_id, date, is_completed)
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time text,
  is_recurring boolean DEFAULT false,
  recurrence_rule text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_user_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id)
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_date_idx ON tasks(date);
CREATE INDEX IF NOT EXISTS tasks_is_completed_idx ON tasks(is_completed);