-- Allow authenticated members to view their own registration/join_request row
-- so the member area can display their profile and approval status.

CREATE POLICY "member_select_own_registration" ON registrations FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "member_select_own_join_request" ON join_requests FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
