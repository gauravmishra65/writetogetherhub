-- Security fix: tighten admins SELECT — only self or admin can see
DROP POLICY IF EXISTS admins_select_own_membership ON admins;

CREATE POLICY admins_select_self_or_admin
  ON admins FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
