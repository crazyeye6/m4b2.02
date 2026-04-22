/*
  # Add name_change_requests table

  ## Purpose
  Implements the permissions workflow where sellers cannot directly change publisher_name
  or newsletter_name. Instead, they submit a name change request which an admin must
  approve or reject.

  ## New Tables
  - `name_change_requests`
    - `id` (uuid, primary key)
    - `entity_type` ('publisher' | 'newsletter') — which kind of name is being changed
    - `entity_id` (uuid) — ID of the media_profile or newsletter record
    - `current_name` (text) — the name as it currently stands
    - `requested_name` (text) — the seller's desired new name
    - `reason` (text) — seller-provided justification
    - `status` ('pending' | 'approved' | 'rejected') — workflow status
    - `seller_user_id` (uuid) — who submitted the request
    - `seller_email` (text)
    - `admin_notes` (text, nullable) — admin comment on decision
    - `created_at` (timestamptz)
    - `reviewed_at` (timestamptz, nullable)
    - `reviewed_by` (text, nullable) — admin email

  ## Security
  - RLS enabled
  - Sellers can INSERT their own requests and SELECT their own requests
  - Admins (via app_metadata.role = 'admin') can SELECT all and UPDATE (to approve/reject)
*/

CREATE TABLE IF NOT EXISTS name_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('publisher', 'newsletter')),
  entity_id uuid NOT NULL,
  current_name text NOT NULL,
  requested_name text NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  seller_user_id uuid NOT NULL,
  seller_email text NOT NULL DEFAULT '',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

ALTER TABLE name_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can submit name change requests"
  ON name_change_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can view their own name change requests"
  ON name_change_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_user_id OR (auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "Admins can update name change requests"
  ON name_change_requests FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') = 'admin');
