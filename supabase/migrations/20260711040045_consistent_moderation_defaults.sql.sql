-- #7: Consistent moderation — make feedback_replies default to 'pending' (same as submissions)
ALTER TABLE feedback_replies ALTER COLUMN status SET DEFAULT 'pending';

-- Update existing auto-approved replies to pending for consistency (only those never reviewed)
-- Actually keep existing data as-is — only new rows get the new default.
-- Also make feedback_submissions default explicit (already 'pending', just confirm)
ALTER TABLE feedback_submissions ALTER COLUMN status SET DEFAULT 'pending';
