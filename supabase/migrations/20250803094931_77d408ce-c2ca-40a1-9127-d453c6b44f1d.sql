-- Update the handle_new_profile function to include consent data
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar, email_consent_given, email_consent_timestamp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User'),
    NEW.email,
    NULL,
    COALESCE((NEW.raw_user_meta_data ->> 'email_consent_given')::boolean, false),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'email_consent_timestamp' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'email_consent_timestamp')::timestamp with time zone
      ELSE NULL
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;