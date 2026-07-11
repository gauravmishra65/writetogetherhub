/*
# Fix: admins table RLS infinite recursion

## Problem
The `admins_select_self_or_admin` policy has a recursive subquery:
  EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid())
inside a SELECT policy ON the `admins` table itself.
This causes infinite RLS recursion → query errors out.

All callers (AdminLogin, AdminRoute, supabase.ts) filter `.eq('user_id', uid)`
and use maybeSingle(), so the simpler `admins_select_self` policy
(`auth.uid() = user_id`) is sufficient.

## Solution
Drop the recursive policy. Keep `admins_select_self`.
*/

DROP POLICY IF EXISTS admins_select_self_or_admin ON admins;
