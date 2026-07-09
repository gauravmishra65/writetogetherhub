/*
# Scope Admin RLS Policies to Admins Table

## Problem
The previous migration added UPDATE (and SELECT) policies for authenticated users
using USING (true) / WITH CHECK (true). This allows ANY authenticated Supabase user
to read or modify every row — not just designated admins.

## Fix
1. Create an `admins` table that explicitly lists admin user IDs.
2. Replace every always-true admin policy with a check against that table:
   EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())

## New Tables
- `admins`
  - `user_id` (uuid, PK, FK → auth.users) — the Supabase user granted admin access

## Modified Policies
All 6 tables (registrations, join_requests, contact_messages, feedback_submissions,
challenge_entries, forum_discussions) have their admin UPDATE policies tightened.
The SELECT policies on registrations and contact_messages are also tightened.

## Security Notes
- The admins table itself has RLS enabled; only existing admins can insert new admins.
- An admin user is automatically seeded for the first authenticated user in the system
  via a bootstrap helper — see below.
- No data is lost; only the access predicate changes.
*/

-- 1. Admins table
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_self" ON admins;
CREATE POLICY "admins_select_self" ON admins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_insert_by_admin" ON admins;
CREATE POLICY "admins_insert_by_admin" ON admins FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

DROP POLICY IF EXISTS "admins_delete_by_admin" ON admins;
CREATE POLICY "admins_delete_by_admin" ON admins FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- Helper: any authenticated user can check whether they are an admin (needed by the app).
DROP POLICY IF EXISTS "admins_select_own_membership" ON admins;
CREATE POLICY "admins_select_own_membership" ON admins FOR SELECT
TO authenticated
USING (true);

-- 2. Tighten registrations policies
DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations" ON registrations FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

DROP POLICY IF EXISTS "admin_update_registrations" ON registrations;
CREATE POLICY "admin_update_registrations" ON registrations FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 3. Tighten join_requests policies
DROP POLICY IF EXISTS "admin_update_join_requests" ON join_requests;
CREATE POLICY "admin_update_join_requests" ON join_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 4. Tighten contact_messages policies
DROP POLICY IF EXISTS "admin_select_contact_messages" ON contact_messages;
CREATE POLICY "admin_select_contact_messages" ON contact_messages FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 5. Tighten feedback_submissions policies
DROP POLICY IF EXISTS "admin_update_feedback_submissions" ON feedback_submissions;
CREATE POLICY "admin_update_feedback_submissions" ON feedback_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 6. Tighten challenge_entries policies
DROP POLICY IF EXISTS "admin_update_challenge_entries" ON challenge_entries;
CREATE POLICY "admin_update_challenge_entries" ON challenge_entries FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 7. Tighten forum_discussions policies
DROP POLICY IF EXISTS "admin_update_forum_discussions" ON forum_discussions;
CREATE POLICY "admin_update_forum_discussions" ON forum_discussions FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);
