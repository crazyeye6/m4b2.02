/*
  # Enhance Email Submission Slots with Newsletter Fields and Confidence Scoring

  ## Summary
  Extends the existing email_submission_slots table to support richer newsletter-specific
  parsed data, per-field confidence scores, and a direct publish-to-listing workflow.

  ## Changes to email_submission_slots
  - Added newsletter-specific fields: open_rate, geography, placement_type, send_date,
    deadline_date, sample_link, past_advertisers_text, publisher_name
  - Added confidence tracking: confidence_score (0-100 overall), field_confidence (jsonb per field)
  - Added missing field flags: missing_fields (text[] array)
  - Added parsed_at timestamp
  - Added source_channel to track how submission arrived

  ## New: publish_email_slot_to_listing() function
  - Converts an approved email_submission_slot into a live listing
  - Sets listing status to 'live'
  - Updates slot status to 'published' and stores the listing_id
  - Returns the new listing id

  ## Security
  - Function runs with SECURITY DEFINER so admin can call it
  - Existing RLS policies on email_submission_slots remain unchanged
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'open_rate'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN open_rate text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'geography'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN geography text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'placement_type'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN placement_type text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'send_date'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN send_date text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'deadline_date'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN deadline_date text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'sample_link'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN sample_link text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'past_advertisers_text'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN past_advertisers_text text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'publisher_name'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN publisher_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'confidence_score'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN confidence_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'field_confidence'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN field_confidence jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'missing_fields'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN missing_fields text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'parsed_at'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN parsed_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_submission_slots' AND column_name = 'source_channel'
  ) THEN
    ALTER TABLE email_submission_slots ADD COLUMN source_channel text DEFAULT 'email';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION publish_email_slot_to_listing(slot_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_record email_submission_slots%ROWTYPE;
  new_listing_id uuid;
  parsed_subscribers integer;
  parsed_original_price integer;
  parsed_discount_price integer;
  parsed_slots_available integer;
  parsed_deadline timestamptz;
BEGIN
  SELECT * INTO slot_record
  FROM email_submission_slots
  WHERE id = slot_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found: %', slot_id;
  END IF;

  parsed_subscribers := COALESCE(
    NULLIF(regexp_replace(slot_record.audience_size, '[^0-9]', '', 'g'), '')::integer,
    0
  );

  parsed_original_price := COALESCE(
    NULLIF(regexp_replace(slot_record.original_price, '[^0-9]', '', 'g'), '')::integer,
    0
  );

  parsed_discount_price := COALESCE(
    NULLIF(regexp_replace(slot_record.discount_price, '[^0-9]', '', 'g'), '')::integer,
    parsed_original_price
  );

  parsed_slots_available := COALESCE(
    NULLIF(regexp_replace(COALESCE(slot_record.slots_available, '1'), '[^0-9]', '', 'g'), '')::integer,
    1
  );

  parsed_deadline := COALESCE(
    NULLIF(slot_record.deadline_date, ''),
    (now() + interval '7 days')
  )::timestamptz;

  INSERT INTO listings (
    media_type,
    media_owner_name,
    media_company_name,
    property_name,
    audience,
    location,
    subscribers,
    open_rate,
    slot_type,
    date_label,
    deadline_at,
    original_price,
    discounted_price,
    slots_remaining,
    slots_total,
    past_advertisers,
    seller_email,
    description,
    status,
    created_at
  ) VALUES (
    COALESCE(NULLIF(lower(slot_record.media_type), ''), 'newsletter'),
    COALESCE(NULLIF(slot_record.publisher_name, ''), NULLIF(slot_record.media_name, ''), 'Unknown Publisher'),
    COALESCE(NULLIF(slot_record.publisher_name, ''), NULLIF(slot_record.media_name, ''), 'Unknown Publisher'),
    COALESCE(NULLIF(slot_record.media_name, ''), 'Unnamed Opportunity'),
    COALESCE(NULLIF(slot_record.category, ''), 'General'),
    COALESCE(NULLIF(slot_record.geography, ''), 'Global'),
    parsed_subscribers,
    COALESCE(NULLIF(slot_record.open_rate, ''), NULL),
    COALESCE(NULLIF(slot_record.placement_type, ''), COALESCE(NULLIF(slot_record.opportunity_type, ''), 'Sponsored Placement')),
    COALESCE(NULLIF(slot_record.send_date, ''), to_char(now() + interval '7 days', 'Day, DD Month YYYY')),
    parsed_deadline,
    parsed_original_price,
    parsed_discount_price,
    parsed_slots_available,
    parsed_slots_available,
    CASE
      WHEN slot_record.past_advertisers_text IS NOT NULL AND slot_record.past_advertisers_text <> ''
      THEN string_to_array(slot_record.past_advertisers_text, ',')
      ELSE ARRAY[]::text[]
    END,
    COALESCE((
      SELECT sender_email FROM email_submissions WHERE id = slot_record.submission_id
    ), ''),
    COALESCE(NULLIF(slot_record.description, ''), ''),
    'live',
    now()
  )
  RETURNING id INTO new_listing_id;

  UPDATE email_submission_slots
  SET
    status = 'published',
    listing_id = new_listing_id,
    updated_at = now()
  WHERE id = slot_id;

  RETURN new_listing_id;
END;
$$;
