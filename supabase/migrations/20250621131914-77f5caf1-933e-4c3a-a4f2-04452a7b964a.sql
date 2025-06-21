
-- First, let's check if the trigger exists and recreate it to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_profile();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User'),
    NEW.email,
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- Now populate profiles for all existing users who don't have profiles yet
INSERT INTO public.profiles (id, name, email, avatar)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'name', 'User'),
  au.email,
  NULL
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Add RLS policies to allow users to view all profiles (for friend search)
DROP POLICY IF EXISTS "Users can view all profiles for friend search" ON public.profiles;
CREATE POLICY "Users can view all profiles for friend search"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
