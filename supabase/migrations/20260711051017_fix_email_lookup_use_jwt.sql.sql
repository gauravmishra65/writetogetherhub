/*
# Fix: registrations SELECT broke after inlining current_user_email()

## Problem
The previous migration inlined current_user_email() as:
  (SELECT email FROM auth.users WHERE id = auth.uid())
But the `authenticated` role has no SELECT permission on `auth.users`
(protected auth schema). The subquery silently returns NULL, so
`lower(email) = lower(NULL)` is always false — non-admin users can't
see their own registrations or join_requests.

## Solution
Replace all auth.users subqueries with `auth.jwt() ->> 'email'`, which
reads the email from the JWT claims without needing auth schema access.
This is the standard Supabase pattern for accessing user email in RLS.

## Tables affected
- registrations: SELECT, INSERT policies
- join_requests: SELECT policy
*/

-- registrations: SELECT — admin or own email match (via JWT, not auth.users)
DROP POLICY IF EXISTS admin_select_registrations ON registrations;
CREATE POLICY admin_select_registrations ON registrations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- registrations: INSERT — own user_id or own email match (via JWT)
DROP POLICY IF EXISTS registrations_insert_own ON registrations;
CREATE POLICY registrations_insert_own ON registrations FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- join_requests: SELECT — admin or own email match (via JWT)
DROP POLICY IF EXISTS admin_select_join_requests ON join_requests;
CREATE POLICY admin_select_join_requests ON join_requests FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );
