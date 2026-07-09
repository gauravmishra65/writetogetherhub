/*
# Create feedback_replies table

## Summary
Adds peer feedback replies to the Feedback Corner. Community members can
post structured four-part feedback on any submitted excerpt, following the
community's "What I Liked / What Confused Me / One Suggestion / One
Encouragement" method. A trigger keeps response_count in sync on the
parent feedback_submissions row.

## New Tables

### feedback_replies
Stores individual structured feedback responses on a submission.
- id (uuid, primary key)
- submission_id (uuid, FK → feedback_submissions.id, CASCADE DELETE)
- author_name (text, not null) — replier's name or pen name
- liked (text, not null) — what the replier liked
- confused (text, not null) — what confused the replier
- suggestion (text, not null) — one constructive suggestion
- encouragement (text, not null) — closing encouragement
- status (text, default 'pending') — admin moderation status
- admin_notes (text, nullable)
- created_at (timestamptz)

## Modified Tables

### feedback_submissions
A trigger now increments response_count by 1 each time a reply is inserted.

## Security
- RLS enabled on feedback_replies.
- SELECT and INSERT open to anon + authenticated (no-auth community site).
- Trigger function uses SET search_path = '' for security.

## Notes
1. This is a no-auth community site; all policies use TO anon, authenticated.
2. The trigger runs AFTER INSERT to increment response_count atomically.
3. Admin can moderate replies via status/admin_notes (same pattern as submissions).
*/

CREATE TABLE IF NOT EXISTS feedback_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  liked text NOT NULL,
  confused text NOT NULL,
  suggestion text NOT NULL,
  encouragement text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
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
TO anon, authenticated WITH CHECK (true);

-- Trigger to keep response_count in sync
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
