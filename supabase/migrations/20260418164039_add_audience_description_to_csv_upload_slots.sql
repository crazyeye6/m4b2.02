/*
  # Add audience_description to csv_upload_slots

  ## Summary
  Adds an `audience_description` column to the `csv_upload_slots` table to capture
  the niche/audience tags description submitted via CSV or email upload.

  ## Changes
  - `csv_upload_slots`: new optional text column `audience_description`
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'audience_description'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN audience_description text;
  END IF;
END $$;
