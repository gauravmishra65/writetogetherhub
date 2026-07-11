-- Backfill user_id on existing content rows
-- feedback_submissions: match by user_email
UPDATE feedback_submissions fs
SET user_id = u.id
FROM auth.users u
WHERE lower(fs.user_email) = lower(u.email)
  AND fs.user_id IS NULL;

-- forum_discussions, challenge_entries, feedback_replies: no reliable email link,
-- set user_id from admin accounts where author_name matches known admin email local part
-- These will be NULL for old rows — new rows will always have user_id from the trigger.
