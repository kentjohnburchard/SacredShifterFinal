/*
  # Create Sacred Library tables
  
  1. New Tables
    - `sacred_library_items` - Stores meditation tracks, wisdom teachings, and other media
    - `sacred_library_playlists` - User-created collections of library items
    - `sacred_playlist_items` - Junction table connecting playlists to items
    - `sacred_library_comments` - User comments on library items
    - `sacred_library_upload_requests` - User requests to add content to the library

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create sacred_library_items table
CREATE TABLE IF NOT EXISTS sacred_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  thumbnail_url text,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create sacred_library_playlists table
CREATE TABLE IF NOT EXISTS sacred_library_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_shared boolean DEFAULT false,
  cover_image_url text
);

-- Create sacred_playlist_items table
CREATE TABLE IF NOT EXISTS sacred_playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES sacred_library_playlists(id) ON DELETE CASCADE,
  item_id uuid REFERENCES sacred_library_items(id) ON DELETE CASCADE,
  position integer NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, item_id)
);

-- Create sacred_library_comments table
CREATE TABLE IF NOT EXISTS sacred_library_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES sacred_library_items(id) ON DELETE CASCADE,
  commenter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sacred_library_upload_requests table
CREATE TABLE IF NOT EXISTS sacred_library_upload_requests (
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
ALTER TABLE sacred_library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_library_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_library_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_library_upload_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for sacred_library_items
CREATE POLICY "Anyone can view unlocked library items"
  ON sacred_library_items
  FOR SELECT
  TO public
  USING (NOT is_locked OR creator_id = auth.uid());

CREATE POLICY "Users can insert their own library items"
  ON sacred_library_items
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own library items"
  ON sacred_library_items
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own library items"
  ON sacred_library_items
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create policies for sacred_library_playlists
CREATE POLICY "Users can view their own playlists"
  ON sacred_library_playlists
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can view shared playlists"
  ON sacred_library_playlists
  FOR SELECT
  TO authenticated
  USING (is_shared = true);

CREATE POLICY "Users can insert their own playlists"
  ON sacred_library_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own playlists"
  ON sacred_library_playlists
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own playlists"
  ON sacred_library_playlists
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create policies for sacred_playlist_items
CREATE POLICY "Users can view playlist items for their playlists"
  ON sacred_playlist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sacred_library_playlists
      WHERE sacred_library_playlists.id = sacred_playlist_items.playlist_id
      AND (sacred_library_playlists.creator_id = auth.uid() OR sacred_library_playlists.is_shared = true)
    )
  );

CREATE POLICY "Users can insert items into their playlists"
  ON sacred_playlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sacred_library_playlists
      WHERE sacred_library_playlists.id = sacred_playlist_items.playlist_id
      AND sacred_library_playlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their playlists"
  ON sacred_playlist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sacred_library_playlists
      WHERE sacred_library_playlists.id = sacred_playlist_items.playlist_id
      AND sacred_library_playlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their playlists"
  ON sacred_playlist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sacred_library_playlists
      WHERE sacred_library_playlists.id = sacred_playlist_items.playlist_id
      AND sacred_library_playlists.creator_id = auth.uid()
    )
  );

-- Create policies for sacred_library_comments
CREATE POLICY "Anyone can view comments on unlocked items"
  ON sacred_library_comments
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM sacred_library_items
      WHERE sacred_library_items.id = sacred_library_comments.item_id
      AND (NOT sacred_library_items.is_locked OR sacred_library_items.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert comments on unlocked items"
  ON sacred_library_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    commenter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sacred_library_items
      WHERE sacred_library_items.id = sacred_library_comments.item_id
      AND (NOT sacred_library_items.is_locked OR sacred_library_items.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own comments"
  ON sacred_library_comments
  FOR UPDATE
  TO authenticated
  USING (commenter_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON sacred_library_comments
  FOR DELETE
  TO authenticated
  USING (commenter_id = auth.uid());

-- Create policies for sacred_library_upload_requests
CREATE POLICY "Users can view their own upload requests"
  ON sacred_library_upload_requests
  FOR SELECT
  TO authenticated
  USING (submitter_id = auth.uid());

CREATE POLICY "Users can insert their own upload requests"
  ON sacred_library_upload_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (submitter_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS sacred_library_items_creator_id_idx ON sacred_library_items(creator_id);
CREATE INDEX IF NOT EXISTS sacred_library_items_chakra_idx ON sacred_library_items(chakra);
CREATE INDEX IF NOT EXISTS sacred_library_items_timeline_idx ON sacred_library_items(timeline);
CREATE INDEX IF NOT EXISTS sacred_library_items_media_type_idx ON sacred_library_items(media_type);
CREATE INDEX IF NOT EXISTS sacred_library_items_is_locked_idx ON sacred_library_items(is_locked);

CREATE INDEX IF NOT EXISTS sacred_library_playlists_creator_id_idx ON sacred_library_playlists(creator_id);
CREATE INDEX IF NOT EXISTS sacred_library_playlists_is_shared_idx ON sacred_library_playlists(is_shared);

CREATE INDEX IF NOT EXISTS sacred_playlist_items_playlist_id_idx ON sacred_playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS sacred_playlist_items_item_id_idx ON sacred_playlist_items(item_id);

CREATE INDEX IF NOT EXISTS sacred_library_comments_item_id_idx ON sacred_library_comments(item_id);
CREATE INDEX IF NOT EXISTS sacred_library_comments_commenter_id_idx ON sacred_library_comments(commenter_id);

CREATE INDEX IF NOT EXISTS sacred_library_upload_requests_submitter_id_idx ON sacred_library_upload_requests(submitter_id);
CREATE INDEX IF NOT EXISTS sacred_library_upload_requests_status_idx ON sacred_library_upload_requests(status);