/*
  # Add CTR field to media_profiles

  1. Changes
    - Adds `ctr` (click-through rate) text column to `media_profiles` table
      - Stored as text (e.g. "2.4%") consistent with how `open_rate` is stored
      - Nullable — not all publishers will have CTR data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_profiles' AND column_name = 'ctr'
  ) THEN
    ALTER TABLE media_profiles ADD COLUMN ctr text;
  END IF;
END $$;
