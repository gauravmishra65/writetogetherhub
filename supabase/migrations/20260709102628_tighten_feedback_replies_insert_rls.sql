/*
# Tighten INSERT RLS on feedback_replies

## Summary
Replaces the always-true WITH CHECK clause on the anon INSERT policy for
feedback_replies with a real constraint: the submission_id must reference
an existing row in feedback_submissions. This prevents anyone from inserting
replies that reference non-existent submissions while still allowing all
community members (anon + authenticated) to post feedback on real submissions.

## Modified Tables

### feedback_replies
- anon_insert_feedback_replies policy: WITH CHECK now validates that
  submission_id exists in feedback_submissions instead of always returning true.

## Security
- No longer a trivially-true policy.
- Orphaned reply inserts (submission_id not in feedback_submissions) are rejected.
*/

DROP POLICY IF EXISTS "anon_insert_feedback_replies" ON feedback_replies;
CREATE POLICY "anon_insert_feedback_replies" ON feedback_replies FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feedback_submissions
    WHERE id = submission_id
  )
);
