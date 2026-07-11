/*
# Fix: Auto-confirm email when admin approves a registration

## Problem
When an admin approves a user, the registrations table is updated to
status='approved'. But the user's email in auth.users may still be
unconfirmed (email_confirmed_at = NULL). Supabase Auth rejects login
for unconfirmed emails, so approved users get "Invalid login credentials"
and cannot sign in.

## Solution
Create a SECURITY DEFINER trigger function that fires AFTER UPDATE on
registrations. When status changes to 'approved', it confirms the user's
email by setting email_confirmed_at = now() in auth.users.

The function is SECURITY DEFINER (owner = postgres) so it can modify
auth.users. EXECUTE is revoked from anon, authenticated, and public so
it cannot be called via REST RPC — only the trigger invokes it.
*/

CREATE OR REPLACE FUNCTION public.auto_confirm_email_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only act when status transitions TO 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Confirm the email in auth.users if not already confirmed
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = NEW.user_id
      AND email_confirmed_at IS NULL;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.auto_confirm_email_on_approval() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS trg_auto_confirm_on_approval ON public.registrations;
CREATE TRIGGER trg_auto_confirm_on_approval
  AFTER UPDATE OF status ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email_on_approval();
