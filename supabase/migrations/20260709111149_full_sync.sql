-- ============================================================
-- FULL SYNC: applies all Write Together Hub migrations
-- idempotently. Safe to run on a DB that already has some
-- or all of these objects.
-- ============================================================

-- ── 1. Harden INSERT policies with data-quality constraints ──

DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (email IS NOT NULL AND length(trim(email)) > 3 AND email LIKE '%@%');

DROP POLICY IF EXISTS "anon_insert_contact" ON contact_messages;
CREATE POLICY "anon_insert_contact" ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(trim(name)) > 0
  AND email IS NOT NULL AND email LIKE '%@%'
  AND subject IS NOT NULL AND length(trim(subject)) > 0
  AND message IS NOT NULL AND length(trim(message)) > 0
);

DROP POLICY IF EXISTS "anon_insert_join" ON join_requests;
CREATE POLICY "anon_insert_join" ON join_requests FOR INSERT
TO anon, authenticated
WITH CHECK (name IS NOT NULL AND length(trim(name)) > 0 AND email IS NOT NULL AND email LIKE '%@%');

DROP POLICY IF EXISTS "anon_insert_forum" ON forum_discussions;
CREATE POLICY "anon_insert_forum" ON forum_discussions FOR INSERT
TO anon, authenticated
WITH CHECK (
  category IS NOT NULL AND length(trim(category)) > 0
  AND title IS NOT NULL AND length(trim(title)) > 0
  AND author_name IS NOT NULL AND length(trim(author_name)) > 0
);

DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback_submissions;
CREATE POLICY "anon_insert_feedback" ON feedback_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (
  title IS NOT NULL AND length(trim(title)) > 0
  AND genre IS NOT NULL AND length(trim(genre)) > 0
  AND feedback_type IS NOT NULL AND length(trim(feedback_type)) > 0
  AND excerpt IS NOT NULL AND length(trim(excerpt)) >= 10
  AND author_name IS NOT NULL AND length(trim(author_name)) > 0
);

DROP POLICY IF EXISTS "anon_insert_challenge" ON challenge_entries;
CREATE POLICY "anon_insert_challenge" ON challenge_entries FOR INSERT
TO anon, authenticated
WITH CHECK (
  challenge_title IS NOT NULL AND length(trim(challenge_title)) > 0
  AND entry_text IS NOT NULL AND length(trim(entry_text)) >= 10
  AND author_name IS NOT NULL AND length(trim(author_name)) > 0
);

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
TO anon, authenticated
WITH CHECK (name IS NOT NULL AND length(trim(name)) > 0 AND email IS NOT NULL AND email LIKE '%@%');

-- ── 2. Add admin evaluation fields (status + admin_notes) ─────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='status') THEN
    ALTER TABLE registrations ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='admin_notes') THEN
    ALTER TABLE registrations ADD COLUMN admin_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='join_requests' AND column_name='status') THEN
    ALTER TABLE join_requests ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='join_requests' AND column_name='admin_notes') THEN
    ALTER TABLE join_requests ADD COLUMN admin_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='status') THEN
    ALTER TABLE contact_messages ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='admin_notes') THEN
    ALTER TABLE contact_messages ADD COLUMN admin_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback_submissions' AND column_name='status') THEN
    ALTER TABLE feedback_submissions ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback_submissions' AND column_name='admin_notes') THEN
    ALTER TABLE feedback_submissions ADD COLUMN admin_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='challenge_entries' AND column_name='status') THEN
    ALTER TABLE challenge_entries ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='challenge_entries' AND column_name='admin_notes') THEN
    ALTER TABLE challenge_entries ADD COLUMN admin_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_discussions' AND column_name='status') THEN
    ALTER TABLE forum_discussions ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_discussions' AND column_name='admin_notes') THEN
    ALTER TABLE forum_discussions ADD COLUMN admin_notes text;
  END IF;
END $$;

-- SELECT policies for admin-readable tables
DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_registrations" ON registrations;
CREATE POLICY "admin_update_registrations" ON registrations FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_join_requests" ON join_requests;
CREATE POLICY "admin_update_join_requests" ON join_requests FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_contact_messages" ON contact_messages;
CREATE POLICY "admin_select_contact_messages" ON contact_messages FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_feedback_submissions" ON feedback_submissions;
CREATE POLICY "admin_update_feedback_submissions" ON feedback_submissions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_challenge_entries" ON challenge_entries;
CREATE POLICY "admin_update_challenge_entries" ON challenge_entries FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_forum_discussions" ON forum_discussions;
CREATE POLICY "admin_update_forum_discussions" ON forum_discussions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- ── 3. Admins table + scoped policies ─────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_self" ON admins;
CREATE POLICY "admins_select_self" ON admins FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_select_own_membership" ON admins;
CREATE POLICY "admins_select_own_membership" ON admins FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admins_insert_by_admin" ON admins;
CREATE POLICY "admins_insert_by_admin" ON admins FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admins_delete_by_admin" ON admins;
CREATE POLICY "admins_delete_by_admin" ON admins FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Tighten policies on all submission tables to require admin role
DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_registrations" ON registrations;
CREATE POLICY "admin_update_registrations" ON registrations FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_join_requests" ON join_requests;
CREATE POLICY "admin_update_join_requests" ON join_requests FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_select_contact_messages" ON contact_messages;
CREATE POLICY "admin_select_contact_messages" ON contact_messages FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_feedback_submissions" ON feedback_submissions;
CREATE POLICY "admin_update_feedback_submissions" ON feedback_submissions FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_challenge_entries" ON challenge_entries;
CREATE POLICY "admin_update_challenge_entries" ON challenge_entries FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_forum_discussions" ON forum_discussions;
CREATE POLICY "admin_update_forum_discussions" ON forum_discussions FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ── 4. Bootstrap first-admin trigger ─────────────────────────

CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins LIMIT 1) THEN
    INSERT INTO public.admins (user_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootstrap_first_admin ON auth.users;
CREATE TRIGGER trg_bootstrap_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.bootstrap_first_admin();

REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC;

-- ── 5. Seed admin accounts ────────────────────────────────────

DO $$
DECLARE
  v_gaurav uuid;
  v_hello  uuid;
BEGIN
  SELECT id INTO v_gaurav FROM auth.users WHERE email = 'gaurav.mishra65@gmail.com';
  IF v_gaurav IS NULL THEN
    v_gaurav := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      v_gaurav, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'gaurav.mishra65@gmail.com', '', now(),
      '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), false, '', '', '', ''
    );
  END IF;
  INSERT INTO public.admins (user_id) VALUES (v_gaurav) ON CONFLICT DO NOTHING;

  SELECT id INTO v_hello FROM auth.users WHERE email = 'hello@writetogetherhub.com';
  IF v_hello IS NULL THEN
    v_hello := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      v_hello, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'hello@writetogetherhub.com', '', now(),
      '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), false, '', '', '', ''
    );
  END IF;
  INSERT INTO public.admins (user_id) VALUES (v_hello) ON CONFLICT DO NOTHING;
END;
$$;

-- ── 6. Member self-view RLS (case-insensitive) ────────────────

DROP POLICY IF EXISTS "member_select_own_registration" ON registrations;
CREATE POLICY "member_select_own_registration" ON registrations FOR SELECT
TO authenticated
USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "member_select_own_join_request" ON join_requests;
CREATE POLICY "member_select_own_join_request" ON join_requests FOR SELECT
TO authenticated
USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));

-- ── 7. Email normalisation trigger ───────────────────────────

UPDATE registrations SET email = lower(email) WHERE email != lower(email);
UPDATE join_requests  SET email = lower(email) WHERE email != lower(email);

CREATE OR REPLACE FUNCTION public.normalize_email_on_insert()
RETURNS trigger LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_registrations_normalize_email
  BEFORE INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION public.normalize_email_on_insert();

CREATE OR REPLACE TRIGGER trg_join_requests_normalize_email
  BEFORE INSERT ON join_requests
  FOR EACH ROW EXECUTE FUNCTION public.normalize_email_on_insert();

-- ── 8. feedback_replies table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS feedback_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  liked text NOT NULL,
  confused text NOT NULL,
  suggestion text NOT NULL,
  encouragement text NOT NULL,
  status text NOT NULL DEFAULT 'approved',
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_replies_submission_id_idx ON feedback_replies(submission_id);
CREATE INDEX IF NOT EXISTS feedback_replies_created_at_idx ON feedback_replies(created_at DESC);

ALTER TABLE feedback_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_feedback_replies" ON feedback_replies;
CREATE POLICY "anon_select_feedback_replies" ON feedback_replies FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_feedback_replies" ON feedback_replies;
CREATE POLICY "anon_insert_feedback_replies" ON feedback_replies FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.feedback_submissions WHERE id = submission_id)
);

DROP POLICY IF EXISTS "admin_update_feedback_replies" ON feedback_replies;
CREATE POLICY "admin_update_feedback_replies" ON feedback_replies FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()));

-- Response count trigger
CREATE OR REPLACE FUNCTION public.increment_feedback_response_count()
RETURNS trigger LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.feedback_submissions
  SET response_count = response_count + 1
  WHERE id = NEW.submission_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_feedback_response_count ON feedback_replies;
CREATE TRIGGER trg_increment_feedback_response_count
  AFTER INSERT ON feedback_replies
  FOR EACH ROW EXECUTE FUNCTION public.increment_feedback_response_count();

-- Auto-approve any lingering pending replies
ALTER TABLE feedback_replies ALTER COLUMN status SET DEFAULT 'approved';
UPDATE feedback_replies SET status = 'approved' WHERE status = 'pending';
