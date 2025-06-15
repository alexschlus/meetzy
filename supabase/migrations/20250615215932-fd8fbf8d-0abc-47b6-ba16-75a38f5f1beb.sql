
-- Create a table for friend relationships
CREATE TABLE public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', or 'declined'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

-- Enable Row Level Security
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Policy: Only users involved in the request can select
CREATE POLICY "Users can see their friendships"
  ON public.friends
  FOR SELECT
  USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- Policy: Only the requester can send a friend request
CREATE POLICY "Requester can insert friend request"
  ON public.friends
  FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
  );

-- Policy: Only involved users can update friendship status
CREATE POLICY "Users can update their friendship status"
  ON public.friends
  FOR UPDATE
  USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- Policy: Only involved users can delete friendships
CREATE POLICY "Users can delete their friendships"
  ON public.friends
  FOR DELETE
  USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );
