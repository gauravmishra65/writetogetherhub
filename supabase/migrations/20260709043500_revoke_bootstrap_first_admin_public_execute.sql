-- bootstrap_first_admin is a trigger function; only the trigger should invoke it.
-- Revoke direct RPC access from anon and authenticated roles.
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM authenticated;
