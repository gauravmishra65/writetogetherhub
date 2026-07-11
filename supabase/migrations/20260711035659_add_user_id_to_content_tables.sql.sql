-- Add user_id columns to all content tables for ownership tracking
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE feedback_replies ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE forum_discussions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE challenge_entries ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS feedback_submissions_user_id_idx ON feedback_submissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS feedback_replies_user_id_idx ON feedback_replies(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS forum_discussions_user_id_idx ON forum_discussions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS challenge_entries_user_id_idx ON challenge_entries(user_id) WHERE user_id IS NOT NULL;
