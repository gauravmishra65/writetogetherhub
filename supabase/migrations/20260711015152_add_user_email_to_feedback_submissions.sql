/*
# Add user_email to feedback_submissions

## Summary
Adds a nullable `user_email` column to `feedback_submissions` so that when a
signed-in member submits an excerpt, we can reliably link the submission to
their account. This enables the Member Area to display a member's own posts
and the feedback they've received — without depending on the free-text
`author_name` field, which is not guaranteed to be unique or match a profile.

## Modified Tables

### feedback_submissions
- New column: `user_email` (text, nullable).
  - Nullable because existing rows and anonymous submissions have no
    associated account. The column is populated only when a signed-in user
    submits an excerpt.
- New index on `user_email` to speed up per-member lookups.

## Security
- No RLS policy changes. The table remains open to `anon, authenticated`
  for SELECT and INSERT (no-auth community site pattern). The new column
  is covered by the existing open SELECT/INSERT policies.

## Notes
1. This is a no-auth community site; all existing policies use
   `TO anon, authenticated`.
2. The column is intentionally nullable so historical and anonymous
   submissions are unaffected.
3. No data is migrated — existing rows simply have `user_email = NULL`.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_submissions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE feedback_submissions ADD COLUMN user_email text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS feedback_submissions_user_email_idx
  ON feedback_submissions(user_email)
  WHERE user_email IS NOT NULL;
