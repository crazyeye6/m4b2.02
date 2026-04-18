/*
  # CSV Upload Batches and Slots

  ## Overview
  Adds support for sellers to submit multiple media opportunities via CSV file upload.
  Each upload creates a "batch" record, and each row in the CSV becomes a separate "slot" record
  that enters the admin review queue — mirroring the existing email submission flow.

  ## New Tables

  ### csv_upload_batches
  Tracks each CSV file upload as a single batch.
  - `id` — primary key
  - `seller_user_id` — authenticated user who uploaded (nullable for unauthenticated future use)
  - `seller_email` — email of the uploading seller
  - `filename` — original name of the uploaded CSV file
  - `row_count` — total number of rows parsed from the CSV
  - `status` — overall batch status: pending_review, needs_review, processed, rejected
  - `admin_notes` — freeform notes from admin
  - `created_at`, `updated_at`

  ### csv_upload_slots
  Each row from a CSV becomes one slot record in the admin queue.
  - `id` — primary key
  - `batch_id` — foreign key to csv_upload_batches
  - `row_index` — 1-based position of row in the CSV
  - `status` — individual slot review status: pending_review, needs_review, approved, rejected, published, expired
  - Opportunity data fields (media_name, media_type, audience_size, etc.)
  - `validation_errors` — JSONB array of validation issues found at upload time
  - `admin_notes`, `reviewed_by`, `reviewed_at`
  - `listing_id` — linked listing record after approval
  - `created_at`, `updated_at`

  ## Security
  - RLS enabled on both tables
  - Sellers can insert batches and read their own batches/slots
  - Sellers cannot update or delete records (admin only for changes)
  - Authenticated users can insert
*/

CREATE TABLE IF NOT EXISTS csv_upload_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_email text NOT NULL DEFAULT '',
  filename text NOT NULL DEFAULT '',
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'needs_review', 'processed', 'rejected')),
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS csv_upload_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES csv_upload_batches(id) ON DELETE CASCADE,
  row_index integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'needs_review', 'approved', 'rejected', 'published', 'expired')),
  media_name text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT '',
  audience_size text NOT NULL DEFAULT '',
  opportunity_type text NOT NULL DEFAULT '',
  original_price text NOT NULL DEFAULT '',
  discount_price text NOT NULL DEFAULT '',
  slots_available text NOT NULL DEFAULT '',
  deadline text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  booking_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  admin_notes text NOT NULL DEFAULT '',
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE csv_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_upload_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert csv batches"
  ON csv_upload_batches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can view own csv batches"
  ON csv_upload_batches FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_user_id);

CREATE POLICY "Authenticated users can insert csv slots"
  ON csv_upload_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM csv_upload_batches
      WHERE csv_upload_batches.id = csv_upload_slots.batch_id
        AND csv_upload_batches.seller_user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can view own csv slots"
  ON csv_upload_slots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM csv_upload_batches
      WHERE csv_upload_batches.id = csv_upload_slots.batch_id
        AND csv_upload_batches.seller_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_csv_upload_batches_seller ON csv_upload_batches(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_csv_upload_slots_batch ON csv_upload_slots(batch_id);
CREATE INDEX IF NOT EXISTS idx_csv_upload_slots_status ON csv_upload_slots(status);
