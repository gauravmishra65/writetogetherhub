
/*
# Write Together Hub — Community Tables

## Summary
Creates all data tables needed for the Write Together Hub community website.
This is a public, no-auth community site; all tables use anon + authenticated
RLS so the frontend (using the anon key) can read and write freely.

## New Tables

### 1. newsletter_subscribers
Stores email addresses from footer and contact page newsletter signup forms.
- id (uuid, primary key)
- email (text, unique, not null)
- created_at (timestamptz)

### 2. contact_messages
Stores submissions from the Contact page form.
- id (uuid, primary key)
- name (text, not null)
- email (text, not null)
- subject (text, not null)
- message (text, not null)
- created_at (timestamptz)

### 3. join_requests
Stores member sign-up requests from the Join Free page.
- id (uuid, primary key)
- name (text, not null)
- email (text, unique, not null)
- experience_level (text)
- writing_type (text)
- interests (text[])
- message (text)
- created_at (timestamptz)

### 4. forum_discussions
Stores community forum discussion threads.
- id (uuid, primary key)
- category (text, not null)
- title (text, not null)
- author_name (text, not null)
- replies (integer, default 0)
- is_hot (boolean, default false)
- created_at (timestamptz)

### 5. feedback_submissions
Stores writing excerpts submitted to the Feedback Corner.
- id (uuid, primary key)
- title (text, not null)
- genre (text, not null)
- word_count (text)
- feedback_type (text, not null) — what kind of feedback the author needs
- excerpt (text, not null)
- author_name (text, not null)
- response_count (integer, default 0)
- created_at (timestamptz)

### 6. challenge_entries
Stores member entries for weekly writing challenges.
- id (uuid, primary key)
- challenge_title (text, not null)
- entry_text (text, not null)
- author_name (text, not null)
- created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All policies use TO anon, authenticated (no sign-in required).
- SELECT: open read for all tables.
- INSERT: open write for all tables.
- No UPDATE or DELETE policies (submissions are permanent).

## Notes
- This is a single-tenant community site with no user accounts.
- All data is intentionally public/shared within the community.
- newsletter_subscribers.email and join_requests.email are UNIQUE
  to prevent duplicate signups.
*/

-- 1. newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_select_newsletter" ON newsletter_subscribers FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- 2. contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact" ON contact_messages;
CREATE POLICY "anon_insert_contact" ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- 3. join_requests
CREATE TABLE IF NOT EXISTS join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  experience_level text,
  writing_type text,
  interests text[],
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_join" ON join_requests;
CREATE POLICY "anon_insert_join" ON join_requests FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- 4. forum_discussions
CREATE TABLE IF NOT EXISTS forum_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  author_name text NOT NULL,
  replies integer NOT NULL DEFAULT 0,
  is_hot boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_discussions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_forum" ON forum_discussions;
CREATE POLICY "anon_select_forum" ON forum_discussions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_forum" ON forum_discussions;
CREATE POLICY "anon_insert_forum" ON forum_discussions FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS forum_discussions_category_idx ON forum_discussions(category);
CREATE INDEX IF NOT EXISTS forum_discussions_created_at_idx ON forum_discussions(created_at DESC);

-- 5. feedback_submissions
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text NOT NULL,
  word_count text,
  feedback_type text NOT NULL,
  excerpt text NOT NULL,
  author_name text NOT NULL,
  response_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_feedback" ON feedback_submissions;
CREATE POLICY "anon_select_feedback" ON feedback_submissions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_feedback" ON feedback_submissions;
CREATE POLICY "anon_insert_feedback" ON feedback_submissions FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS feedback_submissions_created_at_idx ON feedback_submissions(created_at DESC);

-- 6. challenge_entries
CREATE TABLE IF NOT EXISTS challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_title text NOT NULL,
  entry_text text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_challenge" ON challenge_entries;
CREATE POLICY "anon_select_challenge" ON challenge_entries FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_challenge" ON challenge_entries;
CREATE POLICY "anon_insert_challenge" ON challenge_entries FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS challenge_entries_created_at_idx ON challenge_entries(created_at DESC);
