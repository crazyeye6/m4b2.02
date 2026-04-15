/*
  # Add seller social and contact link columns to user_profiles

  ## Changes

  ### user_profiles table — new columns
  - `seller_bio` (text) — short bio for the seller shown on listings
  - `seller_website_url` (text) — personal/publication website
  - `seller_company_url` (text) — company/brand page
  - `seller_linkedin_url` (text)
  - `seller_twitter_url` (text)
  - `seller_instagram_url` (text)
  - `seller_youtube_url` (text)
  - `seller_tiktok_url` (text)
  - `seller_podcast_url` (text)

  ## Notes
  - All columns are optional (nullable text)
  - These are stored once on the seller profile and pre-populated into listing forms
  - The `website` column already exists and maps to personal website (kept for backwards compat)
  - The `bio` column already exists and maps to seller_bio (kept for backwards compat)
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_bio') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_bio text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_website_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_website_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_company_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_company_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_linkedin_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_linkedin_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_twitter_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_twitter_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_instagram_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_instagram_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_youtube_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_youtube_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_tiktok_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_tiktok_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'seller_podcast_url') THEN
    ALTER TABLE user_profiles ADD COLUMN seller_podcast_url text;
  END IF;
END $$;
