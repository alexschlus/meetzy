
-- Add spotify_playlist_url column to events table
ALTER TABLE public.events 
ADD COLUMN spotify_playlist_url text;

-- Add poll_responses column to store user responses for attendance
ALTER TABLE public.events 
ADD COLUMN poll_responses jsonb DEFAULT '[]'::jsonb;

-- Add constraint to ensure spotify_playlist_url is either null or a valid Spotify playlist URL
ALTER TABLE public.events 
ADD CONSTRAINT check_spotify_url 
CHECK (
  spotify_playlist_url IS NULL OR 
  spotify_playlist_url ~* '^https://open\.spotify\.com/playlist/[a-zA-Z0-9]+(\?.*)?$'
);
