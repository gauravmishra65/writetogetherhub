/*
# Harden INSERT RLS policies with data-quality constraints

## Summary
Replaces all trivially-true `WITH CHECK (true)` INSERT policies with meaningful
data-quality checks. The tables remain publicly insertable (no sign-in required)
but policies now validate required fields and basic format rules at the database
layer, eliminating the "always true" security warning.

## Modified Tables and Policy Changes

### newsletter_subscribers
- Old: WITH CHECK (true)
- New: require non-empty, plausible-format email (contains @, length > 3)

### contact_messages
- Old: WITH CHECK (true)
- New: require non-empty name, valid-format email, non-empty subject and message

### join_requests
- Old: WITH CHECK (true)
- New: require non-empty name and valid-format email

### forum_discussions
- Old: WITH CHECK (true)
- New: require non-empty category, title, and author_name

### feedback_submissions
- Old: WITH CHECK (true)
- New: require non-empty title, genre, feedback_type, excerpt (min 10 chars), and author_name

### challenge_entries
- Old: WITH CHECK (true)
- New: require non-empty challenge_title, entry_text (min 10 chars), and author_name

### registrations
- Old: WITH CHECK (true)
- New: require non-empty name and valid-format email

## Security Notes
1. All tables remain writable by the anon role — this is a public community site
   with no login screen; the policies must allow anon inserts.
2. The constraints match existing NOT NULL column constraints but enforce them
   at the RLS layer too, preventing empty/garbage row injection.
3. Email validation uses `LIKE '%@%'` — a basic format guard consistent with
   what the frontend already validates client-side.
4. Excerpt/entry minimum length (10 chars) prevents trivially empty submissions.
5. All policies are idempotent: DROP IF EXISTS then CREATE.
*/

-- newsletter_subscribers
DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(trim(email)) > 3
  AND email LIKE '%@%'
);

-- contact_messages
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_messages;
CREATE POLICY "anon_insert_contact" ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(trim(name)) > 0
  AND email IS NOT NULL AND email LIKE '%@%'
  AND subject IS NOT NULL AND length(trim(subject)) > 0
  AND message IS NOT NULL AND length(trim(message)) > 0
);

-- join_requests
DROP POLICY IF EXISTS "anon_insert_join" ON join_requests;
CREATE POLICY "anon_insert_join" ON join_requests FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(trim(name)) > 0
  AND email IS NOT NULL AND email LIKE '%@%'
);

-- forum_discussions
DROP POLICY IF EXISTS "anon_insert_forum" ON forum_discussions;
CREATE POLICY "anon_insert_forum" ON forum_discussions FOR INSERT
TO anon, authenticated
WITH CHECK (
  category IS NOT NULL AND length(trim(category)) > 0
  AND title IS NOT NULL AND length(trim(title)) > 0
  AND author_name IS NOT NULL AND length(trim(author_name)) > 0
);

-- feedback_submissions
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

-- challenge_entries
DROP POLICY IF EXISTS "anon_insert_challenge" ON challenge_entries;
CREATE POLICY "anon_insert_challenge" ON challenge_entries FOR INSERT
TO anon, authenticated
WITH CHECK (
  challenge_title IS NOT NULL AND length(trim(challenge_title)) > 0
  AND entry_text IS NOT NULL AND length(trim(entry_text)) >= 10
  AND author_name IS NOT NULL AND length(trim(author_name)) > 0
);

-- registrations
DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND length(trim(name)) > 0
  AND email IS NOT NULL AND email LIKE '%@%'
);
