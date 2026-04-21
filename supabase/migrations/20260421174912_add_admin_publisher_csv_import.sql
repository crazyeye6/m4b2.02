/*
  # Admin Publisher CSV Import System

  ## Summary
  Extends the CSV upload system to support an admin-only weekly publisher import workflow.
  Each import is linked to a specific publisher (media profile), tracked as a named batch,
  and individual slots carry send_date, price, and other newsletter-specific fields.

  ## Changes

  ### csv_upload_batches — new columns
  - `media_profile_id` (uuid, FK to media_profiles) — links batch to a publisher
  - `publisher_name` (text) — denormalised publisher name for quick display
  - `uploaded_by_admin` (boolean) — distinguishes admin vs seller uploads
  - `import_week` (date) — the week this batch covers (set to Monday of the upload week)

  ### csv_upload_slots — new columns
  - `send_date` (text) — scheduled send date from CSV
  - `price` (text) — raw price from simplified admin CSV format
  - `media_profile_id` (uuid) — direct link to publisher profile

  ### publisher_csv_imports view
  Convenience view showing batch stats per publisher per week.

  ## Security
  All new columns inherit existing RLS on their tables.
  No new tables, no new policies required beyond existing coverage.
*/

-- csv_upload_batches extensions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_batches' AND column_name = 'media_profile_id'
  ) THEN
    ALTER TABLE csv_upload_batches ADD COLUMN media_profile_id uuid REFERENCES media_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_batches' AND column_name = 'publisher_name'
  ) THEN
    ALTER TABLE csv_upload_batches ADD COLUMN publisher_name text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_batches' AND column_name = 'uploaded_by_admin'
  ) THEN
    ALTER TABLE csv_upload_batches ADD COLUMN uploaded_by_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_batches' AND column_name = 'import_week'
  ) THEN
    ALTER TABLE csv_upload_batches ADD COLUMN import_week date;
  END IF;
END $$;

-- csv_upload_slots extensions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'send_date'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN send_date text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'price'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN price text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'media_profile_id'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN media_profile_id uuid REFERENCES media_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index for fast publisher batch lookups
CREATE INDEX IF NOT EXISTS idx_csv_upload_batches_media_profile_id
  ON csv_upload_batches(media_profile_id);

CREATE INDEX IF NOT EXISTS idx_csv_upload_batches_import_week
  ON csv_upload_batches(import_week);

CREATE INDEX IF NOT EXISTS idx_csv_upload_slots_media_profile_id
  ON csv_upload_slots(media_profile_id);
