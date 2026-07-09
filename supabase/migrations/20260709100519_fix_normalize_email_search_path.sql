
CREATE OR REPLACE FUNCTION public.normalize_email_on_insert()
RETURNS trigger LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$;
