/*
  # Add auto_discount_enabled to listings

  1. Changes
    - Adds `auto_discount_enabled` boolean column to `listings` table
      - DEFAULT true  — existing listings keep auto-discounting as before (no data loss, no behaviour change)
      - When false: price stays fixed at original_price regardless of time remaining
      - When true: existing time-based discount tiers apply (10% / 20% / 30%)

  2. Notes
    - Fully backwards-compatible: all existing listings get auto_discount_enabled = true by default
    - Sellers can opt out via the listing form; no manual discount percentages are exposed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'auto_discount_enabled'
  ) THEN
    ALTER TABLE listings ADD COLUMN auto_discount_enabled boolean NOT NULL DEFAULT true;
  END IF;
END $$;
