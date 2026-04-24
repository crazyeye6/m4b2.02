/*
  # Add opportunity_description to listings

  1. New Column
    - `opportunity_description` (text, nullable) — seller-written pitch text explaining
      why this sponsorship slot is a unique advertising opportunity. Shown on the listing
      card in the marketplace feed to give buyers context beyond raw stats.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'opportunity_description'
  ) THEN
    ALTER TABLE listings ADD COLUMN opportunity_description text DEFAULT '';
  END IF;
END $$;
