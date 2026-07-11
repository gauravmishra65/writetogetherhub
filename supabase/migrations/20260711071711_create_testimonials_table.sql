/*
# Create testimonials table

## Purpose
Allows admins to curate and display member testimonials on the public homepage
for social proof. Admins add, edit, reorder, and toggle visibility of
testimonials through the admin panel.

## New Tables
- `testimonials`
  - `id` (uuid, PK)
  - `author_name` (text, not null) — display name of the member
  - `author_role` (text, nullable) — e.g. "Fiction writer", "Poet"
  - `author_location` (text, nullable) — e.g. "London, UK"
  - `quote` (text, not null) — the testimonial text
  - `rating` (int, default 5) — 1–5 star rating for display
  - `is_published` (boolean, default false) — admin toggles to show publicly
  - `sort_order` (int, default 0) — manual ordering, lower appears first
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on `testimonials`.
- SELECT: public (anon + authenticated) so the homepage can read published
  testimonials without a sign-in.
- INSERT / UPDATE / DELETE: authenticated only — the admin panel enforces
  admin access via AdminRoute. These operations are gated by the admin
  auth check in the frontend.

## Notes
1. Only rows with `is_published = true` should be fetched on the public site.
2. `sort_order` is used to manually rank testimonials; lower values appear first.
3. The admin UI provides full CRUD: create, edit, delete, publish/unpublish,
   and reorder.
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  author_location text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read published testimonials (for homepage display)
DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can insert (admin panel)
DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
CREATE POLICY "auth_insert_testimonials"
ON testimonials FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update (admin panel)
DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials"
ON testimonials FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- Authenticated users can delete (admin panel)
DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials"
ON testimonials FOR DELETE
TO authenticated
USING (true);

-- Index for efficient public queries
CREATE INDEX IF NOT EXISTS idx_testimonials_published_sort
ON testimonials (is_published, sort_order, created_at);
