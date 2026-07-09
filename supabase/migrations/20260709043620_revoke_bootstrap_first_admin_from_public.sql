-- PostgreSQL grants EXECUTE to PUBLIC by default when a function is created.
-- Revoking named roles is insufficient if the PUBLIC grant still exists.
-- Revoke from PUBLIC to close the gap entirely; the trigger still fires normally.
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC;
