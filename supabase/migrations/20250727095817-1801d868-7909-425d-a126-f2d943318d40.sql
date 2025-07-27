-- Add email consent tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_consent_given BOOLEAN DEFAULT false,
ADD COLUMN email_consent_timestamp TIMESTAMP WITH TIME ZONE;