
/*
# Create registrations table

## Summary
Adds a dedicated registrations table for full member registration with contact details.
This is a more complete membership form than join_requests, capturing personal contact
information alongside writing preferences.

## New Tables

### registrations
Full member registration records with contact details.

Columns:
- id (uuid, primary key) — unique record identifier
- name (text, not null) — member's full name
- email (text, unique, not null) — primary contact email; unique to prevent duplicates
- phone (text, nullable) — optional phone number
- city (text, nullable) — member's city
- country (text, nullable) — member's country
- experience_level (text, nullable) — writing experience category
- writing_type (text, nullable) — primary writing genre/type
- genres (text[], nullable) — array of genre interests
- bio (text, nullable) — short bio / about yourself
- how_heard (text, nullable) — how they discovered Write Together Hub
- created_at (timestamptz) — registration timestamp

## Security
- RLS enabled.
- Public INSERT policy (anon + authenticated) — anyone can register.
- No SELECT policy — registration data is private; only backend/admin reads it.

## Notes
- email is UNIQUE to prevent duplicate registrations.
- No user_id column — this is a no-auth community site.
- Intentionally no SELECT/UPDATE/DELETE public policies to protect member data.
*/

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  city text,
  country text,
  experience_level text,
  writing_type text,
  genres text[],
  bio text,
  how_heard text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS registrations_country_idx ON registrations(country);
