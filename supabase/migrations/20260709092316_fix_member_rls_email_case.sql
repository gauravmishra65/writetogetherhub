-- Fix case-sensitivity in the member self-view RLS policies.
-- Supabase auth normalises emails to lowercase; registration forms may submit mixed case.
-- Using lower() on both sides makes the match case-insensitive.

DROP POLICY IF EXISTS "member_select_own_registration" ON registrations;
CREATE POLICY "member_select_own_registration" ON registrations FOR SELECT
TO authenticated
USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "member_select_own_join_request" ON join_requests;
CREATE POLICY "member_select_own_join_request" ON join_requests FOR SELECT
TO authenticated
USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));
