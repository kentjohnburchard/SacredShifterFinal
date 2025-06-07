/*
  # Create Sacred Library System Tables
  
  1. New Tables
    - `library_items` - Stores meditation tracks, videos, and other media
    - `library_playlists` - Allows users to create collections of items
    - `playlist_items` - Junction table for playlist-item relationships
    - `library_comments` - User comments on library items
    - `library_upload_requests` - Tracks user requests to add content

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create library_items table
CREATE TABLE IF NOT EXISTS library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  thumbnail_url text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  chakra text,
  timeline text,
  frequency_hz numeric,
  tags text[],
  is_locked boolean DEFAULT false,
  media_type text NOT NULL,
  duration_seconds integer,
  view_count integer DEFAULT 0
);

-- Create library_playlists table
CREATE TABLE IF NOT EXISTS library_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_shared boolean DEFAULT false,
  cover_image_url text
);

-- Create playlist_items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES library_playlists(id) ON DELETE CASCADE,
  item_id uuid REFERENCES library_items(id) ON DELETE CASCADE,
  position integer NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, item_id)
);

-- Create library_comments table
CREATE TABLE IF NOT EXISTS library_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES library_items(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create library_upload_requests table
CREATE TABLE IF NOT EXISTS library_upload_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  submitter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  reviewer_notes text,
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_upload_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for library_items
CREATE POLICY "Anyone can view unlocked library items"
  ON library_items
  FOR SELECT
  TO public
  USING (NOT is_locked OR owner_id = auth.uid());

CREATE POLICY "Users can insert their own library items"
  ON library_items
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own library items"
  ON library_items
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own library items"
  ON library_items
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create policies for library_playlists
CREATE POLICY "Users can view their own playlists"
  ON library_playlists
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared playlists"
  ON library_playlists
  FOR SELECT
  TO authenticated
  USING (is_shared = true);

CREATE POLICY "Users can insert their own playlists"
  ON library_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own playlists"
  ON library_playlists
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own playlists"
  ON library_playlists
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create policies for playlist_items
CREATE POLICY "Users can view playlist items for their playlists"
  ON playlist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM library_playlists
      WHERE library_playlists.id = playlist_items.playlist_id
      AND (library_playlists.owner_id = auth.uid() OR library_playlists.is_shared = true)
    )
  );

CREATE POLICY "Users can insert items into their playlists"
  ON playlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM library_playlists
      WHERE library_playlists.id = playlist_items.playlist_id
      AND library_playlists.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their playlists"
  ON playlist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM library_playlists
      WHERE library_playlists.id = playlist_items.playlist_id
      AND library_playlists.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their playlists"
  ON playlist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM library_playlists
      WHERE library_playlists.id = playlist_items.playlist_id
      AND library_playlists.owner_id = auth.uid()
    )
  );

-- Create policies for library_comments
CREATE POLICY "Anyone can view comments on unlocked items"
  ON library_comments
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM library_items
      WHERE library_items.id = library_comments.item_id
      AND (NOT library_items.is_locked OR library_items.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert comments on unlocked items"
  ON library_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM library_items
      WHERE library_items.id = library_comments.item_id
      AND (NOT library_items.is_locked OR library_items.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own comments"
  ON library_comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON library_comments
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create policies for library_upload_requests
CREATE POLICY "Users can view their own upload requests"
  ON library_upload_requests
  FOR SELECT
  TO authenticated
  USING (submitter_id = auth.uid());

CREATE POLICY "Users can insert their own upload requests"
  ON library_upload_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (submitter_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS library_items_owner_id_idx ON library_items(owner_id);
CREATE INDEX IF NOT EXISTS library_items_chakra_idx ON library_items(chakra);
CREATE INDEX IF NOT EXISTS library_items_timeline_idx ON library_items(timeline);
CREATE INDEX IF NOT EXISTS library_items_media_type_idx ON library_items(media_type);
CREATE INDEX IF NOT EXISTS library_items_is_locked_idx ON library_items(is_locked);

CREATE INDEX IF NOT EXISTS library_playlists_owner_id_idx ON library_playlists(owner_id);
CREATE INDEX IF NOT EXISTS library_playlists_is_shared_idx ON library_playlists(is_shared);

CREATE INDEX IF NOT EXISTS playlist_items_playlist_id_idx ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS playlist_items_item_id_idx ON playlist_items(item_id);

CREATE INDEX IF NOT EXISTS library_comments_item_id_idx ON library_comments(item_id);
CREATE INDEX IF NOT EXISTS library_comments_author_id_idx ON library_comments(author_id);

CREATE INDEX IF NOT EXISTS library_upload_requests_submitter_id_idx ON library_upload_requests(submitter_id);
CREATE INDEX IF NOT EXISTS library_upload_requests_status_idx ON library_upload_requests(status);