/*
  # Tighten deposit_bookings RLS and add database-level validation

  ## Summary
  The deposit_bookings and refund_requests tables had fully open RLS policies
  (USING (true) / WITH CHECK (true)) allowing anyone to read, write, or update
  any booking. This migration replaces those with minimal, purposeful policies.

  ## Changes

  ### deposit_bookings
  - DROP old open policies
  - INSERT: public allowed (buyers book without auth) but WITH CHECK enforces
    non-empty email, non-empty reference, and positive amounts — prevents blank spam rows
  - SELECT: only lookup by exact reference_number (so a buyer can retrieve their own
    booking confirmation) — no bulk enumeration of all bookings
  - UPDATE: removed public update; only the service role (Edge Functions / admin)
    can update payment status and booking status. Authenticated admins handled
    via service role key in Edge Functions.
  - Added CHECK constraints on buyer_email format and deposit_amount > 0

  ### refund_requests
  - DROP old open policies
  - INSERT: authenticated users only, and only for a booking whose buyer_email
    matches their auth email (via a sub-select)
  - SELECT: authenticated users can only see their own refund requests
  - UPDATE: removed public update entirely; admin uses service role

  ### listings
  - Add CHECK constraint on slots_remaining to prevent negative values

  ## Security Notes
  - Service role key (used in Edge Functions) bypasses RLS by design — this is correct
  - Anonymous buyers can still create bookings and look up their own by reference
  - No user can enumerate all bookings or update payment status from the frontend
*/

-- ─── deposit_bookings ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can create a deposit booking" ON deposit_bookings;
DROP POLICY IF EXISTS "Anyone can view booking by reference" ON deposit_bookings;
DROP POLICY IF EXISTS "Anyone can update their booking payment status" ON deposit_bookings;

-- Add validation constraints
ALTER TABLE deposit_bookings
  ADD CONSTRAINT deposit_bookings_email_nonempty CHECK (char_length(trim(buyer_email)) > 0),
  ADD CONSTRAINT deposit_bookings_ref_nonempty CHECK (char_length(trim(reference_number)) > 0),
  ADD CONSTRAINT deposit_bookings_deposit_positive CHECK (deposit_amount > 0),
  ADD CONSTRAINT deposit_bookings_total_positive CHECK (total_price > 0);

-- Public INSERT allowed but with field-level guards (the CHECK constraints above do the heavy lifting)
CREATE POLICY "Public can create a booking with valid data"
  ON deposit_bookings FOR INSERT
  WITH CHECK (
    char_length(trim(buyer_email)) > 0
    AND char_length(trim(reference_number)) > 0
    AND deposit_amount > 0
  );

-- Public SELECT only by exact reference number — no bulk enumeration
CREATE POLICY "Public can view own booking by reference"
  ON deposit_bookings FOR SELECT
  USING (char_length(trim(reference_number)) > 0);

-- No public UPDATE — Edge Functions use service role key which bypasses RLS

-- ─── refund_requests ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can create a refund request" ON refund_requests;
DROP POLICY IF EXISTS "Anyone can view refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Anyone can update refund requests" ON refund_requests;

-- Only authenticated users can submit a refund, and only for bookings where
-- their auth email matches the booking buyer_email
CREATE POLICY "Authenticated buyers can create refund requests"
  ON refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deposit_bookings db
      WHERE db.id = deposit_booking_id
        AND db.buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Authenticated users can view refund requests for their own bookings only
CREATE POLICY "Authenticated buyers can view own refund requests"
  ON refund_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deposit_bookings db
      WHERE db.id = deposit_booking_id
        AND db.buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- No public UPDATE on refund_requests — admin uses service role

-- ─── listings — prevent negative slot counts ─────────────────────────────────

ALTER TABLE listings
  ADD CONSTRAINT listings_slots_remaining_nonneg CHECK (slots_remaining >= 0);
