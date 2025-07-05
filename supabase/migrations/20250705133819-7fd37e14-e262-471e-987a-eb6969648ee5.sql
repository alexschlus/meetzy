
-- Create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on the extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop the existing pg_trgm extension from public schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;

-- Create the pg_trgm extension in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Update the database search_path to include extensions schema
ALTER DATABASE postgres SET search_path = "$user", public, extensions;

-- Recreate the index that was dropped due to CASCADE
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON public.profiles USING gin(name extensions.gin_trgm_ops);

-- Grant necessary permissions on the extension functions to application roles
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO anon, authenticated, service_role;
