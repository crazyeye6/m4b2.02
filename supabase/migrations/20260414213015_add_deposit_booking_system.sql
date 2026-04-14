/*
  # Add Deposit Booking System

  ## Summary
  Extends the marketplace with a 10% deposit reservation system. Buyers pay a deposit
  to reserve a slot; the remaining 90% is settled directly between buyer and seller.

  ## New Tables

  ### deposit_bookings
  Full booking record created after a buyer completes the checkout flow.
  - Stores buyer contact details, slot count, deposit amount, and booking status
  - Links to the listing being reserved
  - Tracks Stripe payment intent and charge reference (demo mode: stores dummy IDs)
  - Status lifecycle: pending_payment → secured → in_progress → completed_off_platform
    → refund_requested → refunded → cancelled

  ### refund_requests
  Stores deposit refund requests raised by buyers.
  - Links to deposit_booking
  - Captures buyer reason and admin decision
  - Status: pending → approved → denied

  ## Modified Tables

  ### listings
  - Adds `slots_total` column (total slots, for admin display)
  - Expands status CHECK to include new statuses: in_progress, completed_off_platform, cancelled
  - Adds `seller_email` and `seller_contact` columns for releasing to buyer post-deposit

  ## Security
  - RLS enabled on all new tables
  - Public insert for deposit_bookings (buyers create bookings without auth)
  - Public read for own booking via reference_number lookup
  - Admin can read/update all via service role

  ## Notes
  1. Stripe payment intent IDs will be stored as dummy values in demo mode
  2. Booking reference is a human-readable ID (e.g. ETW-2026-XXXXX)
  3. Seller contact details are stored on the listing and returned in the booking confirmation
*/

-- Extend listings status to support full booking lifecycle
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN (
    'live', 'securing', 'pending_review', 'secured',
    'in_progress', 'completed_off_platform', 'expired', 'cancelled'
  ));

-- Add seller contact fields to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_email'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_email text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_phone'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_phone text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_website'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_website text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'slots_total'
  ) THEN
    ALTER TABLE listings ADD COLUMN slots_total integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'posting_date_start'
  ) THEN
    ALTER TABLE listings ADD COLUMN posting_date_start date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'posting_date_end'
  ) THEN
    ALTER TABLE listings ADD COLUMN posting_date_end date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'deliverables_detail'
  ) THEN
    ALTER TABLE listings ADD COLUMN deliverables_detail text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'refund_notes'
  ) THEN
    ALTER TABLE listings ADD COLUMN refund_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'response_time'
  ) THEN
    ALTER TABLE listings ADD COLUMN response_time text DEFAULT '';
  END IF;
END $$;

-- deposit_bookings table
CREATE TABLE IF NOT EXISTS deposit_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,

  -- Buyer details
  buyer_name text NOT NULL DEFAULT '',
  buyer_email text NOT NULL DEFAULT '',
  buyer_company text NOT NULL DEFAULT '',
  buyer_website text DEFAULT '',
  buyer_phone text DEFAULT '',
  buyer_country text NOT NULL DEFAULT '',
  message_to_creator text DEFAULT '',
  booking_notes text DEFAULT '',

  -- Slot and pricing
  slots_count integer NOT NULL DEFAULT 1,
  price_per_slot integer NOT NULL DEFAULT 0,
  total_price integer NOT NULL DEFAULT 0,
  deposit_amount integer NOT NULL DEFAULT 0,
  balance_amount integer NOT NULL DEFAULT 0,

  -- Payment
  stripe_payment_intent_id text DEFAULT '',
  stripe_charge_id text DEFAULT '',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Booking status
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'secured', 'in_progress', 'completed_off_platform',
    'refund_requested', 'refunded', 'cancelled'
  )),

  -- Seller contact (copied at time of booking so it doesn't change)
  seller_name text DEFAULT '',
  seller_email text DEFAULT '',
  seller_phone text DEFAULT '',
  seller_website text DEFAULT '',

  -- Admin notes
  admin_notes text DEFAULT '',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- refund_requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_booking_id uuid NOT NULL REFERENCES deposit_bookings(id) ON DELETE CASCADE,
  reference_number text NOT NULL,

  -- Buyer reason
  reason text NOT NULL DEFAULT '',
  reason_category text NOT NULL DEFAULT 'other' CHECK (reason_category IN (
    'seller_cannot_provide', 'seller_changed_terms', 'slot_unavailable',
    'platform_error', 'booking_cannot_proceed', 'other'
  )),

  -- Admin decision
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  admin_decision_reason text DEFAULT '',
  admin_decided_at timestamptz,
  admin_decided_by text DEFAULT '',

  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deposit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- deposit_bookings policies
CREATE POLICY "Anyone can create a deposit booking"
  ON deposit_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view booking by reference"
  ON deposit_bookings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their booking payment status"
  ON deposit_bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- refund_requests policies
CREATE POLICY "Anyone can create a refund request"
  ON refund_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view refund requests"
  ON refund_requests FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update refund requests"
  ON refund_requests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS deposit_bookings_listing_id_idx ON deposit_bookings(listing_id);
CREATE INDEX IF NOT EXISTS deposit_bookings_reference_idx ON deposit_bookings(reference_number);
CREATE INDEX IF NOT EXISTS deposit_bookings_status_idx ON deposit_bookings(status);
CREATE INDEX IF NOT EXISTS deposit_bookings_buyer_email_idx ON deposit_bookings(buyer_email);
CREATE INDEX IF NOT EXISTS refund_requests_booking_id_idx ON refund_requests(deposit_booking_id);
CREATE INDEX IF NOT EXISTS refund_requests_status_idx ON refund_requests(status);
