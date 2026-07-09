/*
# Auto-approve feedback replies + admin moderation policy

## Summary
Feedback replies were defaulting to 'pending' status, which meant the
app's 'approved'-only filter caused every submission to show "No feedback
yet" — permanently. This migration:
1. Changes the default reply status to 'approved' so new replies appear
   immediately without admin action.
2. Bulk-approves all existing 'pending' replies so authors can now see
   feedback that was already posted.
3. Adds an UPDATE policy so admins can downgrade (reject/flag) inappropriate
   replies after they go live — post-hoc moderation rather than pre-approval.

## Modified Tables

### feedback_replies
- Default for `status` column changed from 'pending' to 'approved'.
- Existing rows with status = 'pending' updated to 'approved'.

## Security
- New UPDATE policy: `admin_update_feedback_replies`
  Only authenticated admins (in the `admins` table) can change status/notes.
  Keeps the community-write, admin-moderate pattern consistent with all
  other tables in this project.
*/

-- 1. Change column default
ALTER TABLE feedback_replies
  ALTER COLUMN status SET DEFAULT 'approved';

-- 2. Approve all existing pending replies
UPDATE feedback_replies
SET status = 'approved'
WHERE status = 'pending';

-- 3. Admin UPDATE policy
DROP POLICY IF EXISTS "admin_update_feedback_replies" ON feedback_replies;
CREATE POLICY "admin_update_feedback_replies" ON feedback_replies FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
);
