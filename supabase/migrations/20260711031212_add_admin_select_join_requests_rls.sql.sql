-- Admins need to read join_requests to review/approve them.
-- This policy was missing, so the admin panel showed no join requests.
CREATE POLICY "admin_select_join_requests"
  ON join_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
