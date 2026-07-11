-- Fix: restore anon INSERT on join_requests for the JoinFree landing page form
-- (this is an interest form, not user-generated content — safe for anon submission)
DROP POLICY IF EXISTS join_requests_insert_own ON join_requests;

CREATE POLICY join_requests_insert_anon
  ON join_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);
