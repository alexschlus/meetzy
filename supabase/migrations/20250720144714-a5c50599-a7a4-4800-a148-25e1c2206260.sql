-- Add messages column to events table for synchronized chat
ALTER TABLE public.events 
ADD COLUMN messages jsonb DEFAULT '[]'::jsonb;

-- Update the RLS policy comment to include messages access
COMMENT ON COLUMN public.events.messages IS 'Chat messages for the event, accessible to event owner and invited users';