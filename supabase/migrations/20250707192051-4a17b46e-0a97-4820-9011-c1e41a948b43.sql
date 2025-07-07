
-- Add columns to track event invitations
ALTER TABLE public.events 
ADD COLUMN invited_users jsonb DEFAULT '[]'::jsonb,
ADD COLUMN invitation_responses jsonb DEFAULT '{}'::jsonb;

-- Update RLS policies to allow invited users to view events they're invited to
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;

CREATE POLICY "Users can view their own events and events they're invited to"
  ON public.events
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(invited_users)
    )
  );

-- Allow invited users to update invitation responses
CREATE POLICY "Invited users can update invitation responses"
  ON public.events
  FOR UPDATE
  USING (
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(invited_users)
    )
  )
  WITH CHECK (
    auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(invited_users)
    )
  );
