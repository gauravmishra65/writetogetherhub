-- #3: Tighten RLS — admin-only for admin tables, authenticated-only for community content

-- feedback_submissions
DROP POLICY IF EXISTS anon_select_feedback ON feedback_submissions;
DROP POLICY IF EXISTS anon_insert_feedback ON feedback_submissions;

CREATE POLICY feedback_select_authenticated
  ON feedback_submissions FOR SELECT TO authenticated USING (true);

CREATE POLICY feedback_insert_owner
  ON feedback_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- feedback_replies
DROP POLICY IF EXISTS anon_select_feedback_replies ON feedback_replies;
DROP POLICY IF EXISTS anon_insert_feedback_replies ON feedback_replies;

CREATE POLICY feedback_replies_select_authenticated
  ON feedback_replies FOR SELECT TO authenticated USING (true);

CREATE POLICY feedback_replies_insert_owner
  ON feedback_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- forum_discussions
DROP POLICY IF EXISTS anon_select_forum ON forum_discussions;
DROP POLICY IF EXISTS anon_insert_forum ON forum_discussions;

CREATE POLICY forum_select_authenticated
  ON forum_discussions FOR SELECT TO authenticated USING (true);

CREATE POLICY forum_insert_owner
  ON forum_discussions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- challenge_entries
DROP POLICY IF EXISTS anon_select_challenge ON challenge_entries;
DROP POLICY IF EXISTS anon_insert_challenge ON challenge_entries;

CREATE POLICY challenge_select_authenticated
  ON challenge_entries FOR SELECT TO authenticated USING (true);

CREATE POLICY challenge_insert_owner
  ON challenge_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- contact_messages: keep public INSERT, admin-only SELECT
DROP POLICY IF EXISTS anon_select_contact ON contact_messages;
DROP POLICY IF EXISTS contact_messages_select_authenticated ON contact_messages;

CREATE POLICY contact_messages_select_admin
  ON contact_messages FOR SELECT TO authenticated
  USING (public.is_admin());

-- registrations: tighten INSERT
DROP POLICY IF EXISTS anon_insert_registrations ON registrations;

CREATE POLICY registrations_insert_own
  ON registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR lower(email) = lower(public.current_user_email()));

-- join_requests: tighten INSERT
DROP POLICY IF EXISTS anon_insert_join ON join_requests;

CREATE POLICY join_requests_insert_own
  ON join_requests FOR INSERT TO authenticated
  WITH CHECK (lower(email) = lower(public.current_user_email()));

-- Admin UPDATE policies — use is_admin()
DROP POLICY IF EXISTS admin_update_feedback_submissions ON feedback_submissions;
CREATE POLICY admin_update_feedback_submissions
  ON feedback_submissions FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_update_feedback_replies ON feedback_replies;
CREATE POLICY admin_update_feedback_replies
  ON feedback_replies FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_update_forum_discussions ON forum_discussions;
CREATE POLICY admin_update_forum_discussions
  ON forum_discussions FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_update_challenge_entries ON challenge_entries;
CREATE POLICY admin_update_challenge_entries
  ON challenge_entries FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_update_registrations ON registrations;
CREATE POLICY admin_update_registrations
  ON registrations FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_update_join_requests ON join_requests;
CREATE POLICY admin_update_join_requests
  ON join_requests FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Admin SELECT for registrations & join_requests
DROP POLICY IF EXISTS admin_select_registrations ON registrations;
CREATE POLICY admin_select_registrations
  ON registrations FOR SELECT TO authenticated
  USING (public.is_admin() OR lower(email) = lower(public.current_user_email()));

DROP POLICY IF EXISTS admin_select_join_requests ON join_requests;
CREATE POLICY admin_select_join_requests
  ON join_requests FOR SELECT TO authenticated
  USING (public.is_admin() OR lower(email) = lower(public.current_user_email()));

DROP POLICY IF EXISTS member_select_own_registration ON registrations;
DROP POLICY IF EXISTS member_select_own_join_request ON join_requests;
