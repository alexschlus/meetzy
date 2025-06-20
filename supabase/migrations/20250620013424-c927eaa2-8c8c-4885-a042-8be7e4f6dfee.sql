
-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add unique constraint to the name column in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_name_unique UNIQUE (name);

-- Create an index for better search performance
CREATE INDEX idx_profiles_name_search ON public.profiles USING gin(name gin_trgm_ops);
