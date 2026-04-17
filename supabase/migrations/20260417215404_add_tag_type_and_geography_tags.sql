/*
  # Add tag_type to tags table and seed geography tags

  ## Overview
  Extends the tags system to support typed tags — giving each tag a semantic role
  (niche, geography, audience, format, general). This powers filtered browsing by
  geography and niche through the unified tag system instead of hardcoded dropdowns.

  ## Changes

  ### tags table
  - Adds `tag_type` column: one of 'niche' | 'geography' | 'audience' | 'format' | 'general'
  - Defaults to 'general' so existing tags are unaffected
  - Adds index on tag_type for fast filtering by type

  ### Seed geography tags
  - Inserts canonical geography tags: us, uk, europe, ireland, global, australia, canada
  - Each gets tag_type = 'geography' and a human-readable display_name
  - Uses ON CONFLICT DO NOTHING so re-running is safe

  ### Seed common niche tags
  - Inserts well-known niche tags with tag_type = 'niche'

  ### Populate geography tags from existing listing location field
  - Reads the location column of each live listing and creates listing_tags entries
    for any geography tag whose name matches a substring of the location value
  - Safe to re-run — uses ON CONFLICT DO NOTHING

  ## Security
  - No RLS changes needed; existing policies on tags and listing_tags cover this
*/

-- 1. Add tag_type column to tags table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'tag_type'
  ) THEN
    ALTER TABLE tags ADD COLUMN tag_type text NOT NULL DEFAULT 'general'
      CHECK (tag_type IN ('niche', 'geography', 'audience', 'format', 'general'));
  END IF;
END $$;

-- Index for fast filtering by type
CREATE INDEX IF NOT EXISTS tags_tag_type_idx ON tags(tag_type);

-- 2. Seed geography tags
INSERT INTO tags (name, display_name, tag_type, usage_count)
VALUES
  ('us',          'US',          'geography', 0),
  ('uk',          'UK',          'geography', 0),
  ('europe',      'Europe',      'geography', 0),
  ('ireland',     'Ireland',     'geography', 0),
  ('global',      'Global',      'geography', 0),
  ('australia',   'Australia',   'geography', 0),
  ('canada',      'Canada',      'geography', 0),
  ('asia',        'Asia',        'geography', 0),
  ('latam',       'LatAm',       'geography', 0),
  ('middle-east', 'Middle East', 'geography', 0)
ON CONFLICT (name) DO UPDATE
  SET tag_type = 'geography',
      display_name = EXCLUDED.display_name;

-- 3. Seed common niche tags
INSERT INTO tags (name, display_name, tag_type, usage_count)
VALUES
  ('saas',        'SaaS',        'niche', 0),
  ('ecommerce',   'eCommerce',   'niche', 0),
  ('fintech',     'Fintech',     'niche', 0),
  ('startup',     'Startup',     'niche', 0),
  ('marketing',   'Marketing',   'niche', 0),
  ('fitness',     'Fitness',     'niche', 0),
  ('beauty',      'Beauty',      'niche', 0),
  ('travel',      'Travel',      'niche', 0),
  ('crypto',      'Crypto',      'niche', 0),
  ('ai',          'AI',          'niche', 0),
  ('b2b',         'B2B',         'niche', 0),
  ('b2c',         'B2C',         'niche', 0),
  ('health',      'Health',      'niche', 0),
  ('tech',        'Tech',        'niche', 0),
  ('food',        'Food',        'niche', 0),
  ('fashion',     'Fashion',     'niche', 0),
  ('education',   'Education',   'niche', 0),
  ('finance',     'Finance',     'niche', 0)
ON CONFLICT (name) DO UPDATE
  SET tag_type = 'niche',
      display_name = EXCLUDED.display_name;

-- 4. Auto-populate geography listing_tags from existing listings
-- For each listing, check if any geography tag name appears as a substring
-- of the listing's location field (case-insensitive), then link them.
DO $$
DECLARE
  geo_tag RECORD;
  listing RECORD;
BEGIN
  FOR listing IN
    SELECT id, location FROM listings WHERE location IS NOT NULL AND location != ''
  LOOP
    FOR geo_tag IN
      SELECT id, name FROM tags WHERE tag_type = 'geography'
    LOOP
      IF lower(listing.location) LIKE '%' || geo_tag.name || '%' THEN
        INSERT INTO listing_tags (listing_id, tag_id)
        VALUES (listing.id, geo_tag.id)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 5. Recalculate usage_count for all tags (safe full refresh)
UPDATE tags t
SET usage_count = (
  SELECT COUNT(*) FROM listing_tags lt WHERE lt.tag_id = t.id
);
