/*
# Add Admin Evaluation Fields

## Summary
Adds evaluation columns to all user-submitted entry tables so admins can
review, approve/reject, and leave notes on each submission.

## Changes

### Modified Tables
All 6 submission tables (registrations, join_requests, contact_messages,
feedback_submissions, challenge_entries, forum_discussions) receive two new columns:
- `status` (text, default 'pending') — evaluation state: 'pending', 'approved', 'rejected', 'flagged'
- `admin_notes` (text, nullable) — internal notes left by the admin reviewer

### Security
- New RLS policies added: `authenticated` users (admins) can SELECT all rows
  on registrations and contact_messages (which previously had no SELECT policy).
- Update policies added for `authenticated` role on all tables to allow
  status + admin_notes changes.

### Notes
1. Uses IF NOT EXISTS / DO blocks for idempotency.
2. Only the authenticated (admin) session can UPDATE rows.
3. The anon INSERT policies already in place are left untouched.
*/

-- registrations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='status') THEN
    ALTER TABLE registrations ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='admin_notes') THEN
    ALTER TABLE registrations ADD COLUMN admin_notes text;
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_registrations" ON registrations;
CREATE POLICY "admin_update_registrations" ON registrations FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- join_requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='join_requests' AND column_name='status') THEN
    ALTER TABLE join_requests ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='join_requests' AND column_name='admin_notes') THEN
    ALTER TABLE join_requests ADD COLUMN admin_notes text;
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_update_join_requests" ON join_requests;
CREATE POLICY "admin_update_join_requests" ON join_requests FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- contact_messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='status') THEN
    ALTER TABLE contact_messages ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_messages' AND column_name='admin_notes') THEN
    ALTER TABLE contact_messages ADD COLUMN admin_notes text;
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_select_contact_messages" ON contact_messages;
CREATE POLICY "admin_select_contact_messages" ON contact_messages FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- feedback_submissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback_submissions' AND column_name='status') THEN
    ALTER TABLE feedback_submissions ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feedback_submissions' AND column_name='admin_notes') THEN
    ALTER TABLE feedback_submissions ADD COLUMN admin_notes text;
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_update_feedback_submissions" ON feedback_submissions;
CREATE POLICY "admin_update_feedback_submissions" ON feedback_submissions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- challenge_entries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='challenge_entries' AND column_name='status') THEN
    ALTER TABLE challenge_entries ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='challenge_entries' AND column_name='admin_notes') THEN
    ALTER TABLE challenge_entries ADD COLUMN admin_notes text;
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_update_challenge_entries" ON challenge_entries;
CREATE POLICY "admin_update_challenge_entries" ON challenge_entries FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- forum_discussions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_discussions' AND column_name='status') THEN
    ALTER TABLE forum_discussions ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_discussions' AND column_name='admin_notes') THEN
    ALTER TABLE forum_discussions ADD COLUMN admin_notes text;
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_update_forum_discussions" ON forum_discussions;
CREATE POLICY "admin_update_forum_discussions" ON forum_discussions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);
