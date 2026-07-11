-- E8: Idempotent backfill for any auth users missing a registrations row.
-- The handle_new_user trigger already creates rows for new signups,
-- but this catches any existing auth users that predate the trigger.
-- ON CONFLICT makes it safe to re-run any number of times.

INSERT INTO public.registrations (user_id, name, email, status, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  lower(au.email),
  'pending',
  'member'
FROM auth.users au
LEFT JOIN public.registrations r ON r.user_id = au.id
WHERE r.user_id IS NULL
ON CONFLICT (email) DO UPDATE
SET user_id = EXCLUDED.user_id;

-- E9/E11: Add admin DELETE policies on content tables so admins can
-- moderate (remove spam/inappropriate content) at the RLS level.
-- SELECT is already TO authenticated, INSERT already checks auth.uid().

DROP POLICY IF EXISTS "admin_delete_feedback_submissions" ON feedback_submissions;
CREATE POLICY "admin_delete_feedback_submissions"
ON feedback_submissions FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

DROP POLICY IF EXISTS "admin_delete_feedback_replies" ON feedback_replies;
CREATE POLICY "admin_delete_feedback_replies"
ON feedback_replies FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

DROP POLICY IF EXISTS "admin_delete_forum_discussions" ON forum_discussions;
CREATE POLICY "admin_delete_forum_discussions"
ON forum_discussions FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);