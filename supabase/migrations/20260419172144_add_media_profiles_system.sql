/*
  # Add Media Profiles System

  ## Overview
  Creates a reusable media/newsletter profile system that sellers fill out once
  and link to multiple slot listings.

  ## New Tables

  ### `media_profiles`
  Stores one record per newsletter/media property owned by a seller.
  Sellers can have multiple media profiles (e.g. two newsletters).

  Columns:
  - `id` (uuid, PK)
  - `seller_user_id` (uuid, FK → auth.users) — owner
  - `seller_email` (text) — fallback owner identifier
  - `newsletter_name` (text) — the media/newsletter name
  - `tagline` (text) — short one-liner
  - `category` (text) — e.g. 'SaaS', 'Finance', 'Creator'
  - `audience_summary` (text) — who reads this
  - `primary_geography` (text) — primary audience location
  - `audience_type` (text) — e.g. 'B2B', 'B2C', 'Founders'
  - `subscriber_count` (integer)
  - `open_rate` (text) — e.g. '42%'
  - `publishing_frequency` (text) — e.g. 'Weekly', 'Daily'
  - `ad_formats` (text[]) — available ad format options
  - `past_advertisers` (text[]) — brand names
  - `media_kit_url` (text)
  - `sample_issue_url` (text)
  - `website_url` (text)
  - `logo_url` (text)
  - `cover_image_url` (text)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Modified Tables

  ### `listings`
  - Adds `media_profile_id` (uuid, nullable FK → media_profiles) so each slot listing can
    reference one reusable media profile. When set, buyers see the full media context.

  ## Security
  - RLS enabled on media_profiles
  - Sellers can CRUD their own profiles
  - Anyone (including unauthenticated) can read profiles (for buyer-side display)

  ## Notes
  1. The media_profile_id on listings is nullable — existing listings remain valid.
  2. When a seller selects a media profile when creating a slot, the listing inherits
     audience context from that profile automatically on the buyer side.
  3. No destructive changes to existing listings table.
*/

-- Create media_profiles table
CREATE TABLE IF NOT EXISTS media_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_email text NOT NULL,
  newsletter_name text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  audience_summary text NOT NULL DEFAULT '',
  primary_geography text NOT NULL DEFAULT '',
  audience_type text NOT NULL DEFAULT '',
  subscriber_count integer,
  open_rate text NOT NULL DEFAULT '',
  publishing_frequency text NOT NULL DEFAULT '',
  ad_formats text[] NOT NULL DEFAULT '{}',
  past_advertisers text[] NOT NULL DEFAULT '{}',
  media_kit_url text NOT NULL DEFAULT '',
  sample_issue_url text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add media_profile_id FK to listings (nullable, non-destructive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'media_profile_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN media_profile_id uuid REFERENCES media_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE media_profiles ENABLE ROW LEVEL SECURITY;

-- Sellers can read all active profiles (for their own listings view)
CREATE POLICY "Anyone can read media profiles"
  ON media_profiles
  FOR SELECT
  USING (true);

-- Sellers can insert their own profiles
CREATE POLICY "Sellers can insert own media profiles"
  ON media_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_user_id);

-- Sellers can update their own profiles
CREATE POLICY "Sellers can update own media profiles"
  ON media_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_user_id)
  WITH CHECK (auth.uid() = seller_user_id);

-- Sellers can delete their own profiles
CREATE POLICY "Sellers can delete own media profiles"
  ON media_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_user_id);
