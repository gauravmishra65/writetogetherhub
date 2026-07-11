-- #4: Auto-create registration row on signup via trigger

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.registrations (user_id, name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    lower(NEW.email),
    'pending'
  )
  ON CONFLICT (email) DO UPDATE
    SET user_id = EXCLUDED.user_id;
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create missing registration rows for existing auth.users
-- Idempotent — safe to re-run
INSERT INTO public.registrations (user_id, name, email, status)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  lower(u.email),
  'pending'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.registrations r WHERE r.email = lower(u.email)
)
ON CONFLICT (email) DO UPDATE
  SET user_id = EXCLUDED.user_id;
