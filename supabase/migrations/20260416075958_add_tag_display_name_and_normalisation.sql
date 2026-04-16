/*
  # Enhance Tags Table with Display Name and Normalisation

  ## Overview
  Improves the tag system to support a canonical display name (e.g. "SaaS") 
  separate from the slug key used for deduplication (e.g. "saas").
  This allows consistent casing and human-readable presentation while 
  preventing duplicates via the unique slug.

  ## Changes to `tags` table
  - Adds `display_name` (text) — the canonical human-readable form e.g. "SaaS", "E-commerce"
  - Renames conceptual role of `name` to be the normalised slug key (already lowercase)
  - Backfills display_name from existing name values (title-cased)
  - Adds a trigram index on name for fast prefix/fuzzy search

  ## Notes
  1. `name` remains the unique key (lowercase slug) — used for deduplication
  2. `display_name` is what users see in the UI
  3. Trigram (pg_trgm) index enables fast ILIKE queries for autocomplete
*/

-- Enable pg_trgm for fuzzy/prefix matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add display_name column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tags' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE tags ADD COLUMN display_name text;
  END IF;
END $$;

-- Backfill display_name from existing name values
-- Capitalise first letter of each word
UPDATE tags
SET display_name = initcap(replace(name, '-', ' '))
WHERE display_name IS NULL;

-- Trigram index on name for fast autocomplete (ILIKE prefix/fuzzy)
CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON tags USING GIN(name gin_trgm_ops);

-- Trigram index on display_name for display-side search
CREATE INDEX IF NOT EXISTS tags_display_name_trgm_idx ON tags USING GIN(display_name gin_trgm_ops);
