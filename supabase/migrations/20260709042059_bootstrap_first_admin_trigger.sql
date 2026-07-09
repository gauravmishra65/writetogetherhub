/*
# Bootstrap First Admin via Trigger

## Purpose
The admins table starts empty. Without a bootstrap mechanism, no one can ever
log in as admin (the login check would always fail).

## Change
Adds a Postgres trigger on `auth.users` that fires AFTER INSERT. If the `admins`
table is empty at that moment, the newly created user is automatically inserted
as the first admin. All subsequent sign-ups are ignored by this trigger.

## Security Notes
- Only the very first user account is auto-promoted.
- Once an admin exists, new accounts must be manually granted admin access
  by an existing admin through the admins table.
- The trigger runs with SECURITY DEFINER so it can write to admins regardless
  of the caller's RLS context.
*/

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins LIMIT 1) THEN
    INSERT INTO public.admins (user_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootstrap_first_admin ON auth.users;
CREATE TRIGGER trg_bootstrap_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.bootstrap_first_admin();
