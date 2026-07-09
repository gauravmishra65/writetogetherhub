-- Set a temporary bcrypt-hashed password for both admin accounts so they can log in.
-- Temp password: WTH@Admin2026!
-- Both admins MUST change this password immediately after first login.
UPDATE auth.users
SET
  encrypted_password = crypt('WTH@Admin2026!', gen_salt('bf')),
  updated_at = now()
WHERE email IN ('gaurav.mishra65@gmail.com', 'hello@writetogetherhub.com');
