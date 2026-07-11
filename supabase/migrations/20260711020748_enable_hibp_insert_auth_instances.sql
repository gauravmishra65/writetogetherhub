/*
# Enable Leaked Password Protection (HIBP) via auth.instances

## Summary
The Security Advisor flags "Leaked Password Protection Disabled" because
Supabase Auth is not checking new/changed passwords against the
HaveIBeenPwned breach database. A previous migration tried to UPDATE
auth.instances but the table was empty (zero rows), so the config was
never written.

This migration inserts a config row with
GOTRUE_PASSWORD_HIBP_ENABLED = "true" so that GoTrue (Supabase Auth)
rejects passwords that have appeared in known data breaches.

## Modified Tables
### auth.instances
- New row with raw_base_config containing the HIBP-enabled flag.
- The row uses a generated UUID for the id column.

## Security
- Enables server-side breached-password checking for all sign-up and
  password-change operations going forward.
- Existing passwords are NOT retroactively checked (per Supabase docs).

## Notes
1. If a row already exists, the migration is idempotent — it only
   inserts when the table is empty.
2. The client-side checkPasswordBreached() in supabase.ts provides a
   defense-in-depth layer, but the server-side setting is the authoritative
   control that the Security Advisor checks.
*/

DO $$
BEGIN
  -- Only insert if the table has no rows
  IF NOT EXISTS (SELECT 1 FROM auth.instances LIMIT 1) THEN
    INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      gen_random_uuid(),
      '{"GOTRUE_PASSWORD_HIBP_ENABLED": "true"}',
      now(),
      now()
    );
  ELSE
    -- Row exists — update the config to enable HIBP
    UPDATE auth.instances
    SET raw_base_config = COALESCE(raw_base_config::jsonb, '{}'::jsonb)
      || '{"GOTRUE_PASSWORD_HIBP_ENABLED": "true"}'::jsonb,
      updated_at = now();
  END IF;
END $$;
