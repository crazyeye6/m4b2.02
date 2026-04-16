/*
  # Add Buyer Digest Preferences

  ## Summary
  Adds opportunity alert / digest preferences to the buyer user profile.
  This powers the personalised email matching system so buyers receive
  digests filtered by their stated interests.

  ## New Columns on user_profiles

  - `digest_enabled` (boolean, default true) — whether the buyer wants digest emails
  - `digest_frequency` (text, default 'weekly') — 'daily' or 'weekly'
  - `digest_media_types` (text[], default '{}') — e.g. ['newsletter','podcast','influencer']
  - `digest_locations` (text[], default '{}') — e.g. ['US','UK','Global']
  - `digest_tags` (text[], default '{}') — tag names the buyer is interested in
  - `digest_last_sent_at` (timestamptz) — timestamp of last digest email sent

  ## Notes
  - Columns are added safely with IF NOT EXISTS checks
  - No data is dropped or altered
  - RLS policies on user_profiles already exist and cover these columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'digest_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN digest_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'digest_frequency'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN digest_frequency text DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'digest_media_types'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN digest_media_types text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'digest_locations'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN digest_locations text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'digest_tags'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN digest_tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'digest_last_sent_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN digest_last_sent_at timestamptz;
  END IF;
END $$;
