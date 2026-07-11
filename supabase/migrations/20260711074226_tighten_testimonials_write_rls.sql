/*
# Tighten testimonials RLS — admin-only writes

## Context
The `testimonials` table had three RLS policies with always-true clauses
(`USING (true)` / `WITH CHECK (true)`) scoped to `authenticated`, which
allowed ANY signed-in user to insert, update, or delete testimonials.
This bypassed row-level security entirely for write operations.

## Changes
1. Dropped the insecure policies:
   - `auth_delete_testimonials` (DELETE, USING true)
   - `auth_insert_testimonials` (INSERT, WITH CHECK true)
   - `auth_update_testimonials` (UPDATE, USING true, WITH CHECK true)

2. Created three replacement policies scoped to admins only:
   - `admin_insert_testimonials` — INSERT for authenticated users who
     exist in the `admins` table.
   - `admin_update_testimonials` — UPDATE for admin users.
   - `admin_delete_testimonials` — DELETE for admin users.

   All three use:
     EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())

3. The existing `public_read_testimonials` SELECT policy (anon +
   authenticated, USING true) is intentionally left unchanged —
   published testimonials are public content visible to all visitors,
   including logged-out users.

## Security
- Write access (insert/update/delete) is now restricted to admin users.
- Public read access is preserved for the homepage testimonials section.
- No data is modified or lost — only policies are replaced.
*/

DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;

CREATE POLICY "admin_insert_testimonials"
ON testimonials FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

CREATE POLICY "admin_update_testimonials"
ON testimonials FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

CREATE POLICY "admin_delete_testimonials"
ON testimonials FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);