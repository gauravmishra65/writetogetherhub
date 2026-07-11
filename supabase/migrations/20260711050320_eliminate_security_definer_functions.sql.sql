/*
# Security hardening: eliminate SECURITY DEFINER functions from public API

## Problem
Three SECURITY DEFINER functions (is_admin, current_user_email, handle_new_user)
were callable via REST RPC by anon and/or authenticated roles. The scanner flags
this as a security risk because SECURITY DEFINER functions execute with the
privileges of their owner (postgres), bypassing RLS.

Additionally, join_requests INSERT policy had a WITH CHECK that was flagged as
"always true".

## Solution
1. Drop is_admin() and current_user_email() entirely. Inline their logic
   directly into every RLS policy that referenced them, using:
   - Admin check: EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
   - Own-email check: (SELECT email FROM auth.users WHERE id = auth.uid())
2. Convert handle_new_user() to SECURITY INVOKER so it no longer runs as
   postgres. The trigger fires during auth.users INSERT, which is executed
   by the Supabase Auth service (privileged role), so SECURITY INVOKER works.
3. Tighten join_requests INSERT WITH CHECK to validate name, email format.
4. Drop duplicate contact_messages SELECT policy (contact_messages_select_admin)
   that used is_admin(); admin_select_contact_messages already uses inline EXISTS.

## Tables affected
- admins: SELECT policy updated (is_admin inlined)
- challenge_entries: UPDATE policy updated
- contact_messages: duplicate SELECT policy dropped
- feedback_replies: UPDATE policy updated
- feedback_submissions: UPDATE policy updated
- forum_discussions: UPDATE policy updated
- join_requests: SELECT + UPDATE policies updated, INSERT tightened
- registrations: SELECT + INSERT + UPDATE policies updated

## Functions dropped
- public.is_admin()
- public.current_user_email()

## Functions modified
- public.handle_new_user() → SECURITY INVOKER, EXECUTE revoked from all roles
*/

-- ============================================================
-- 1. Drop all policies that reference is_admin() or current_user_email()
-- ============================================================

DROP POLICY IF EXISTS admins_select_self_or_admin ON admins;
DROP POLICY IF EXISTS contact_messages_select_admin ON contact_messages;
DROP POLICY IF EXISTS admin_update_challenge_entries ON challenge_entries;
DROP POLICY IF EXISTS admin_update_feedback_replies ON feedback_replies;
DROP POLICY IF EXISTS admin_update_feedback_submissions ON feedback_submissions;
DROP POLICY IF EXISTS admin_update_forum_discussions ON forum_discussions;
DROP POLICY IF EXISTS admin_select_join_requests ON join_requests;
DROP POLICY IF EXISTS admin_update_join_requests ON join_requests;
DROP POLICY IF EXISTS registrations_insert_own ON registrations;
DROP POLICY IF EXISTS admin_select_registrations ON registrations;
DROP POLICY IF EXISTS admin_update_registrations ON registrations;

-- Also drop the join_requests INSERT policy to recreate with tighter checks
DROP POLICY IF EXISTS join_requests_insert_anon ON join_requests;

-- ============================================================
-- 2. Recreate policies with inlined admin check (no function calls)
-- ============================================================

-- admins: SELECT — self or any row if user is an admin
CREATE POLICY admins_select_self_or_admin ON admins FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
  );

-- challenge_entries: UPDATE — admin only
CREATE POLICY admin_update_challenge_entries ON challenge_entries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

-- feedback_replies: UPDATE — admin only
CREATE POLICY admin_update_feedback_replies ON feedback_replies FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

-- feedback_submissions: UPDATE — admin only
CREATE POLICY admin_update_feedback_submissions ON feedback_submissions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

-- forum_discussions: UPDATE — admin only
CREATE POLICY admin_update_forum_discussions ON forum_discussions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

-- join_requests: INSERT — public form, validate required fields + email format
CREATE POLICY join_requests_insert_anon ON join_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL
    AND btrim(name) <> ''
    AND email IS NOT NULL
    AND btrim(email) <> ''
    AND email ~ '@'
  );

-- join_requests: SELECT — admin or own email match
CREATE POLICY admin_select_join_requests ON join_requests FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
    OR lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- join_requests: UPDATE — admin only
CREATE POLICY admin_update_join_requests ON join_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

-- registrations: INSERT — own user_id or own email match
CREATE POLICY registrations_insert_own ON registrations FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    OR lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- registrations: SELECT — admin or own email match
CREATE POLICY admin_select_registrations ON registrations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
    OR lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- registrations: UPDATE — admin only
CREATE POLICY admin_update_registrations ON registrations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));

-- ============================================================
-- 3. Drop the SECURITY DEFINER functions that are no longer referenced
-- ============================================================

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.current_user_email();

-- ============================================================
-- 4. Convert handle_new_user() to SECURITY INVOKER and lock down grants
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
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
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
