-- #3: Admin access control — add role + user_id columns, create helpers

-- Add role column to registrations (de-facto profile table)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

-- Add user_id column so we can link auth.users → registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS registrations_user_id_idx ON registrations(user_id) WHERE user_id IS NOT NULL;

-- Helper: is the current user an admin?
-- Checks the admins table OR role = 'admin' on registrations.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM registrations WHERE registrations.user_id = auth.uid() AND registrations.role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Helper: current user's email (for ownership checks in RLS)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated, anon;
