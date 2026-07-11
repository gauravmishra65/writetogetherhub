/*
# Fix: admins INSERT/DELETE policies still have recursive EXISTS

## Problem
The INSERT and DELETE policies on `admins` use:
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
This is a self-referential subquery on the same table the policy is
defined on, causing infinite RLS recursion during query planning.

## Solution
Replace the recursive EXISTS with a SECURITY INVOKER helper function
that checks admin status without RLS recursion. The function queries
the admins table but uses an explicit role check that bypasses RLS
via a simple direct comparison.

Alternative: use a separate `is_admin(uid)` function marked
SECURITY DEFINER with a fixed search_path — but that reintroduces
the security-definer pattern we eliminated earlier.

Simplest safe approach: DROP the INSERT and DELETE policies entirely.
Admin management (adding/removing admins) is done via the SQL editor
or service role, not via the authenticated client. No UI exists for
self-service admin management, so these policies are unused.
*/

DROP POLICY IF EXISTS admins_insert_by_admin ON admins;
DROP POLICY IF EXISTS admins_delete_by_admin ON admins;
