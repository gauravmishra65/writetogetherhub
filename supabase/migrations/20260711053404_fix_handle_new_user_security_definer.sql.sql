/*
# Fix: "Database error saving new user" on signup

## Problem
Migration 20260711050320 converted handle_new_user() from SECURITY DEFINER
to SECURITY INVOKER. During signup, the AFTER INSERT trigger on auth.users
fires before a valid JWT/session exists, so auth.uid() is NULL and
auth.jwt() has no email claim. The registrations INSERT RLS policy
registrations_insert_own rejects the INSERT, the trigger fails, and
Supabase Auth returns "Database error saving new user" — the user is
not created.

## Solution
Restore SECURITY DEFINER so the trigger can INSERT into registrations
bypassing RLS (the function owner is postgres). Keep EXECUTE revoked
from anon, authenticated, and public so the function cannot be called
via REST RPC — only the database trigger can invoke it.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.registrations (user_id, name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    lower(NEW.email),
    'pending'
  )
  ON CONFLICT (email) DO UPDATE
    SET user_id = EXCLUDED.user_id;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
