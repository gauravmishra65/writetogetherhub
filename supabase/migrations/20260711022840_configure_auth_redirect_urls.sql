/*
# Configure Site URL and Redirect URL Allow List for Auth

## Summary
The password reset email fails because the redirect URL passed to
resetPasswordForEmail() is not in Supabase Auth's URI allow list.
The auth.instances config only had HIBP enabled — no site URL or
external redirect URLs were set.

This migration updates the raw_base_config to include:
- GOTRUE_SITE_URL: the primary app URL
- GOTRUE_EXTERNAL_REDIRECT_URLS: allowed redirect destinations

## Modified Tables
### auth.instances
- Updates raw_base_config to merge in site URL and redirect URLs.

## Notes
1. The config is stored as JSON text in raw_base_config.
2. Bolt automatically updates these when publishing, but manual
   overrides are respected.
*/

UPDATE auth.instances
SET raw_base_config = (
  COALESCE(raw_base_config::jsonb, '{}'::jsonb)
  || jsonb_build_object(
    'GOTRUE_SITE_URL', 'http://localhost:3000',
    'GOTRUE_EXTERNAL_REDIRECT_URLS', 'http://localhost:3000/**,http://localhost:5173/**'
  )
)::text,
  updated_at = now();
