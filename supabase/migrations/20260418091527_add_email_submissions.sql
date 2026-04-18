/*
  # Add Email Submissions System

  ## Summary
  Creates tables to capture media slot opportunities submitted via email by sellers.
  Each email can contain one or multiple slot opportunities. Each slot is stored as
  a separate record for individual admin review.

  ## New Tables

  ### email_submissions
  Stores raw email submissions from sellers.
  - `id` – UUID primary key
  - `sender_email` – Email address of the sender
  - `sender_name` – Sender's name
  - `subject` – Email subject line
  - `raw_body` – Full raw email body
  - `slot_count` – Number of slots parsed
  - `created_at` – Submission timestamp

  ### email_submission_slots
  Each parsed slot opportunity from an email submission.
  - `id` – UUID primary key
  - `submission_id` – FK to email_submissions
  - `status` – pending_review | parsed_ok | needs_review | approved | rejected | published | expired
  - `slot_index` – Position in the email
  - Parsed fields: media_name, media_type, audience_size, opportunity_type, etc.
  - `raw_slot_text` – Original unparsed segment text
  - `admin_notes` – Admin internal notes
  - `listing_id` – FK to listings when published

  ## Security
  - RLS enabled on both tables
  - Admin-only access via user_profiles.role = 'admin'
*/

CREATE TABLE IF NOT EXISTS email_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email text NOT NULL,
  sender_name text DEFAULT '',
  subject text DEFAULT '',
  raw_body text NOT NULL DEFAULT '',
  slot_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email submissions"
  ON email_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert email submissions"
  ON email_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS email_submission_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES email_submissions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'parsed_ok', 'needs_review', 'approved', 'rejected', 'published', 'expired')),
  slot_index integer DEFAULT 1,
  media_name text DEFAULT '',
  media_type text DEFAULT '',
  audience_size text DEFAULT '',
  opportunity_type text DEFAULT '',
  original_price text DEFAULT '',
  discount_price text DEFAULT '',
  slots_available text DEFAULT '',
  deadline text DEFAULT '',
  category text DEFAULT '',
  booking_url text DEFAULT '',
  description text DEFAULT '',
  raw_slot_text text DEFAULT '',
  admin_notes text DEFAULT '',
  reviewed_by text DEFAULT '',
  reviewed_at timestamptz,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_submission_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email submission slots"
  ON email_submission_slots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert email submission slots"
  ON email_submission_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update email submission slots"
  ON email_submission_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );
