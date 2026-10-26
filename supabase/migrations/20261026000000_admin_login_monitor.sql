/*
  # Admin login monitor

  Supabase keeps sign-in history in its own log system, not in the database
  (auth.audit_log_entries is empty), so the admin panel had no way to show who
  has signed in. This adds:

  1. public.login_events - one row per successful sign-in (password, reset link
     or approval link), filled automatically by a trigger on auth.users.
     IP address and device come from the newest auth.sessions row when available.
     Existing users get one "backfilled" row for their last known sign-in.
  2. public.admin_login_overview() - one row per login with name, member status,
     last sign-in, sign-in count, and whether they have an active session.
     Admins only.

  Security
  - login_events is readable only by admins (RLS); nothing writes to it except the trigger.
  - admin_login_overview() raises an error for anyone who is not in public.admins and
    is not executable by anon.
  - The trigger swallows its own errors so a logging problem can never block a sign-in.
  - Failed sign-in attempts are NOT recorded here (Supabase does not store them in the
    database); they remain visible in the Supabase dashboard under Logs.
*/

CREATE TABLE IF NOT EXISTS public.login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  signed_in_at timestamptz NOT NULL,
  ip text,
  user_agent text,
  backfilled boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS login_events_signed_in_at_idx ON public.login_events (signed_in_at DESC);
CREATE INDEX IF NOT EXISTS login_events_user_idx ON public.login_events (user_id, signed_in_at DESC);

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_read_login_events" ON public.login_events;
CREATE POLICY "admins_read_login_events" ON public.login_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

REVOKE ALL ON public.login_events FROM anon, authenticated;
GRANT SELECT ON public.login_events TO authenticated;

-- Record every successful sign-in.
CREATE OR REPLACE FUNCTION public.log_member_sign_in()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  s record;
BEGIN
  IF NEW.last_sign_in_at IS NOT NULL AND NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    BEGIN
      SELECT ip, user_agent INTO s
        FROM auth.sessions
       WHERE user_id = NEW.id
       ORDER BY created_at DESC
       LIMIT 1;

      INSERT INTO public.login_events (user_id, email, signed_in_at, ip, user_agent)
      VALUES (NEW.id, lower(coalesce(NEW.email, '')), NEW.last_sign_in_at, host(s.ip), s.user_agent);
    EXCEPTION WHEN OTHERS THEN
      NULL; -- never block a sign-in because logging failed
    END;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.log_member_sign_in() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_log_member_sign_in ON auth.users;
CREATE TRIGGER trg_log_member_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_sign_in();

-- One row per existing login so the page is not empty on day one.
INSERT INTO public.login_events (user_id, email, signed_in_at, backfilled)
SELECT u.id, lower(coalesce(u.email, '')), u.last_sign_in_at, true
  FROM auth.users u
 WHERE u.last_sign_in_at IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM public.login_events e WHERE e.user_id = u.id);

-- Admin-only overview of every login.
CREATE OR REPLACE FUNCTION public.admin_login_overview()
RETURNS TABLE (
  user_id uuid,
  email text,
  name text,
  member_status text,
  member_role text,
  created_at timestamptz,
  email_confirmed boolean,
  last_sign_in_at timestamptz,
  sign_in_count bigint,
  has_active_session boolean,
  invited_by_admin boolean,
  is_admin boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
#variable_conflict use_column
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'admins only' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    lower(coalesce(u.email, ''))::text,
    coalesce(nullif(btrim(r.name), ''), nullif(u.raw_user_meta_data ->> 'name', ''), split_part(coalesce(u.email, ''), '@', 1))::text,
    r.status::text,
    r.role::text,
    u.created_at,
    u.email_confirmed_at IS NOT NULL,
    u.last_sign_in_at,
    (SELECT count(*) FROM public.login_events e WHERE e.user_id = u.id AND NOT e.backfilled),
    EXISTS (SELECT 1 FROM auth.sessions s WHERE s.user_id = u.id AND (s.not_after IS NULL OR s.not_after > now())),
    coalesce((u.raw_user_meta_data ->> 'invited_by_admin') = 'true', false),
    EXISTS (SELECT 1 FROM public.admins a2 WHERE a2.user_id = u.id)
  FROM auth.users u
  LEFT JOIN public.registrations r ON r.user_id = u.id
  ORDER BY u.last_sign_in_at DESC NULLS LAST, u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_login_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_login_overview() TO authenticated;
