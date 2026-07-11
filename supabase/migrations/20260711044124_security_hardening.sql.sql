-- ============================================================
-- Security hardening: fix RLS bypass + lock down SECURITY DEFINER functions
-- ============================================================

-- 1) RLS Policy Always True: tighten join_requests INSERT
--    Replace WITH CHECK (true) with field validation.
--    The JoinFree form is public, but we require name + email.
DROP POLICY IF EXISTS join_requests_insert_anon ON join_requests;

CREATE POLICY join_requests_insert_anon
  ON join_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (name IS NOT NULL AND email IS NOT NULL AND email != '');

-- 2) handle_new_user(): trigger function — revoke ALL execute grants.
--    Only the trigger on auth.users should invoke it, not any role via RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 3) current_user_email(): used inside RLS policies (join_requests, registrations).
--    Authenticated users need EXECUTE so RLS policies can call it.
--    Anon must NOT — it would leak auth.users emails via REST RPC.
REVOKE EXECUTE ON FUNCTION public.current_user_email() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;

-- 4) is_admin(): used inside RLS policies on nearly every admin-scoped table.
--    Must stay SECURITY DEFINER to avoid infinite recursion
--    (admins/registrations RLS policies call is_admin(), which queries those tables).
--    Authenticated users need EXECUTE for RLS + frontend RPC check.
--    Anon must NOT — prevents admin-status probing by anonymous users.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
