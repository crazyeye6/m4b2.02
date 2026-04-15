/*
  # Add Seller Profile Fields to Listings

  Adds fields to allow sellers to provide a brief bio/summary and links to their
  company page and social media profiles, so buyers can verify credibility.

  1. New Columns on `listings`
    - `seller_bio` (text) - Short description of the seller / publication
    - `seller_website_url` (text) - Link to company or publication website
    - `seller_linkedin_url` (text) - LinkedIn profile URL
    - `seller_twitter_url` (text) - Twitter/X profile URL
    - `seller_instagram_url` (text) - Instagram profile URL
    - `seller_youtube_url` (text) - YouTube channel URL
    - `seller_tiktok_url` (text) - TikTok profile URL
    - `seller_podcast_url` (text) - Podcast page URL (Apple, Spotify, etc.)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_bio'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_website_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_website_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_linkedin_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_linkedin_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_twitter_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_twitter_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_instagram_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_instagram_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_youtube_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_youtube_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_tiktok_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_tiktok_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_podcast_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_podcast_url text;
  END IF;
END $$;
