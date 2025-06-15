
-- Create the events table with a user_id foreign key
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  location text,
  description text,
  attendees jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select (view) only their own events
CREATE POLICY "Users can view their own events"
  ON public.events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert events for themselves
CREATE POLICY "Users can create their own events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own events only
CREATE POLICY "Users can update their own events"
  ON public.events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own events only
CREATE POLICY "Users can delete their own events"
  ON public.events
  FOR DELETE
  USING (auth.uid() = user_id);
