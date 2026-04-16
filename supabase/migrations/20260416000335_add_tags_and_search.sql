/*
  # Add Tags & Full-Text Search System

  ## Overview
  Introduces a tagging system for listings and buyer search/discovery.

  ## New Tables
  - `tags`
    - `id` (uuid, primary key)
    - `name` (text, unique, lowercase slug-style tag label)
    - `usage_count` (int, how many listings use this tag)
    - `created_at` (timestamp)

  - `listing_tags`
    - `listing_id` (uuid, FK to listings)
    - `tag_id` (uuid, FK to tags)
    - Composite primary key

  ## Modified Tables
  - `listings`: adds `search_vector` tsvector column for full-text search

  ## Security
  - RLS enabled on both new tables
  - Tags are publicly readable (for search suggestions)
  - Only authenticated users can insert tags
  - listing_tags are publicly readable
  - Only authenticated users can insert listing_tags

  ## Notes
  1. Full-text search vector is built from property_name, audience, location, and slot_type
  2. A GIN index is created on the search_vector for fast full-text search
  3. A trigger keeps search_vector up to date on insert/update
  4. usage_count on tags is maintained by triggers on listing_tags
*/

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are publicly readable"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tag usage count"
  ON tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Listing tags junction table
CREATE TABLE IF NOT EXISTS listing_tags (
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, tag_id)
);

ALTER TABLE listing_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing tags are publicly readable"
  ON listing_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert listing tags"
  ON listing_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete listing tags"
  ON listing_tags FOR DELETE
  TO authenticated
  USING (true);

-- Add search_vector column to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE listings ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS listings_search_vector_idx ON listings USING GIN(search_vector);

-- Function to update search_vector
CREATE OR REPLACE FUNCTION update_listings_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.property_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.audience, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.slot_type, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.media_owner_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.media_company_name, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep search_vector updated
DROP TRIGGER IF EXISTS listings_search_vector_update ON listings;
CREATE TRIGGER listings_search_vector_update
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listings_search_vector();

-- Backfill existing listings
UPDATE listings SET search_vector =
  setweight(to_tsvector('english', coalesce(property_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(audience, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(location, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(slot_type, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(media_owner_name, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(media_company_name, '')), 'B');

-- Function to update tag usage_count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listing_tags_usage_count ON listing_tags;
CREATE TRIGGER listing_tags_usage_count
  AFTER INSERT OR DELETE ON listing_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
