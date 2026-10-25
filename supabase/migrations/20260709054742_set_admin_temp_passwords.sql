-- Set a temporary bcrypt-hashed password for both admin accounts so they can log in.
-- Temp password: [removed - rotated 2026-10-25]
-- NOTE: the original value was removed from the repository after it was rotated.
-- This migration has already been applied; do not re-run it.
UPDATE auth.users
SET
  encrypted_password = crypt('[removed]', gen_salt('bf')),
  updated_at = now()
WHERE email IN ('gaurav.mishra65@gmail.com', 'hello@writetogetherhub.com');
