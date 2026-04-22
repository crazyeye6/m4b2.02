/*
  # Add slot deduplication and diff tracking to csv_upload_slots

  ## Summary
  Enables fast weekly re-imports by fingerprinting each slot and comparing
  it against previous batches for the same publisher.

  ## New Columns on csv_upload_slots

  - `slot_fingerprint` (text) — SHA-like hash of key identifying fields
    (send_date + sponsorship_type + price). Used to detect duplicates
    across weekly uploads for the same publisher.

  - `import_tag` (text) — Classification assigned during import preview:
    - 'new'       = No matching slot in any prior batch for this publisher
    - 'updated'   = Same fingerprint found but key fields changed
    - 'unchanged' = Identical to a slot already published/approved
    - 'duplicate' = Exact duplicate within the current upload

  - `previous_slot_id` (uuid, nullable FK self-ref) — Points to the most
    recent matching slot from a prior batch. Used to track slot history
    and surface diffs in the admin UI.

  ## Notes
  - import_tag defaults to 'new' so existing rows are unaffected by the migration.
  - No destructive changes; all additions are backwards-compatible.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'slot_fingerprint'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN slot_fingerprint text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'import_tag'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN import_tag text NOT NULL DEFAULT 'new';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'csv_upload_slots' AND column_name = 'previous_slot_id'
  ) THEN
    ALTER TABLE csv_upload_slots ADD COLUMN previous_slot_id uuid REFERENCES csv_upload_slots(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_csv_upload_slots_fingerprint
  ON csv_upload_slots(media_profile_id, slot_fingerprint)
  WHERE slot_fingerprint <> '';

CREATE INDEX IF NOT EXISTS idx_csv_upload_slots_import_tag
  ON csv_upload_slots(import_tag);
