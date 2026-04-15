/*
  # Add posting_time column to listings

  1. Changes
    - `listings` table: adds optional `posting_time` (time) column
      - Allows sellers to specify the time of day their ad will air
      - Nullable — existing rows are unaffected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'posting_time'
  ) THEN
    ALTER TABLE listings ADD COLUMN posting_time time DEFAULT NULL;
  END IF;
END $$;
