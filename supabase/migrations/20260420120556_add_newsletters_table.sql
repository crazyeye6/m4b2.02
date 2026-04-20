/*
  # Add Newsletters Table

  ## Summary
  Introduces a first-class "Newsletter" entity that sits between a Media Owner (seller account)
  and their Listings (ad slots). This enables sellers who run multiple newsletters to manage
  them as separate entities and reuse their data across listings without re-entering it.

  ## New Tables
  - `newsletters`
    - `id` (uuid, primary key)
    - `seller_user_id` (uuid, FK to auth.users)
    - `seller_email` (text)
    - `name` (text) — newsletter display name
    - `publisher_name` (text) — publisher / company name
    - `subscriber_count` (integer) — subscriber count
    - `avg_open_rate` (text) — e.g. "44%"
    - `niche` (text) — category / niche
    - `primary_geography` (text)
    - `send_frequency` (text) — e.g. "Weekly", "Daily"
    - `description` (text, optional)
    - `logo_url` (text, optional)
    - `website_url` (text, optional)
    - `is_active` (boolean, default true)
    - `created_at` / `updated_at` (timestamptz)

  ## Modified Tables
  - `listings`
    - Adds `newsletter_id` (uuid, nullable FK to newsletters)

  ## Security
  - RLS enabled on `newsletters`
  - Sellers can CRUD their own newsletters
  - Listings: newsletter_id column added with no data migration needed (backwards-compatible)

  ## Notes
  1. newsletter_id on listings is nullable — existing listings remain unaffected
  2. The newsletters table is separate from media_profiles but conceptually similar;
     newsletters are lightweight and focused on slot creation, media profiles are richer buyer-facing profiles
  3. Updating a newsletter record automatically applies to all linked listings via JOIN queries
*/

CREATE TABLE IF NOT EXISTS newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_email text NOT NULL,
  name text NOT NULL,
  publisher_name text NOT NULL DEFAULT '',
  subscriber_count integer,
  avg_open_rate text,
  niche text,
  primary_geography text,
  send_frequency text,
  description text,
  logo_url text,
  website_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own newsletters"
  ON newsletters FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can insert own newsletters"
  ON newsletters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can update own newsletters"
  ON newsletters FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_user_id)
  WITH CHECK (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can delete own newsletters"
  ON newsletters FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'newsletter_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN newsletter_id uuid REFERENCES newsletters(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS newsletters_seller_user_id_idx ON newsletters(seller_user_id);
CREATE INDEX IF NOT EXISTS listings_newsletter_id_idx ON listings(newsletter_id);
