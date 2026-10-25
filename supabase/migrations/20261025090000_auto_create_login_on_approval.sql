/*
  # Create the member's login automatically when an admin approves them

  The live admin screens approve with a plain status update, which marked people
  "approved" without creating a login or emailing them. This trigger fires when a
  join request or registration changes to 'approved' through the API by a signed-in
  user and hands the same request (with that admin's own bearer token) to the
  approve-applicant edge function, which:
    - creates the login if needed and emails a link to create a password, or
    - emails "you're approved, sign in" to people who already chose a password.

  Notes
  - The function verifies the caller is an admin, so non-admins can do nothing here.
  - Updates made by the function itself (service role) or by SQL do not fire this,
    so there are no duplicate emails and no loops.
  - Fires only on a change TO 'approved' (not on inserts, not when already approved).
  - pg_net calls are asynchronous and run after the update commits.
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.request_login_for_approved_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net
AS $$
DECLARE
  bearer text;
BEGIN
  IF coalesce(auth.role(), '') <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  bearer := coalesce(current_setting('request.headers', true), '{}')::json ->> 'authorization';
  IF bearer IS NULL OR bearer = '' THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := 'https://amblonweizpfqdebersh.supabase.co/functions/v1/approve-applicant',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', bearer),
    body    := jsonb_build_object('source', TG_TABLE_NAME, 'id', NEW.id::text, 'resend', true)
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.request_login_for_approved_member() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_login_on_approval ON public.join_requests;
CREATE TRIGGER trg_login_on_approval
  AFTER UPDATE OF status ON public.join_requests
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.request_login_for_approved_member();

DROP TRIGGER IF EXISTS trg_login_on_approval ON public.registrations;
CREATE TRIGGER trg_login_on_approval
  AFTER UPDATE OF status ON public.registrations
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.request_login_for_approved_member();
