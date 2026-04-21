/*
  # Fix RLS policies: replace auth.users email lookups with auth.jwt()

  ## Problem
  Several RLS policies use `(SELECT email FROM auth.users WHERE id = auth.uid())`
  to match seller_email. The `authenticated` role only has SELECT(id) on auth.users,
  so accessing the `email` column fails with "permission denied for table users."
  This blocks ALL queries on listings, newsletters, managed_sellers and refund_requests.

  ## Fix
  Replace all `(SELECT email FROM auth.users WHERE id = auth.uid())` patterns with
  `(auth.jwt() ->> 'email')` which reads the email from the JWT token directly --
  no table access needed.

  ## Affected Policies
  - listings: Sellers can select/update/delete own listings by email
  - newsletters: Sellers can select/update/delete own newsletters by email
  - managed_sellers: Sellers can view their own managed_sellers record
  - deposit_bookings: Buyers can read own bookings (already uses auth.jwt())
  - refund_requests: Buyers can view/insert refund requests
*/

-- ============================================================
-- listings policies
-- ============================================================
DROP POLICY IF EXISTS "Sellers can select own listings by email" ON listings;
CREATE POLICY "Sellers can select own listings by email"
  ON listings FOR SELECT TO authenticated
  USING (lower(seller_email) = lower(auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Sellers can update own listings by email" ON listings;
CREATE POLICY "Sellers can update own listings by email"
  ON listings FOR UPDATE TO authenticated
  USING (lower(seller_email) = lower(auth.jwt() ->> 'email'))
  WITH CHECK (lower(seller_email) = lower(auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Sellers can delete own listings by email" ON listings;
CREATE POLICY "Sellers can delete own listings by email"
  ON listings FOR DELETE TO authenticated
  USING (lower(seller_email) = lower(auth.jwt() ->> 'email'));

-- ============================================================
-- newsletters policies
-- ============================================================
DROP POLICY IF EXISTS "Sellers can select own newsletters by email" ON newsletters;
CREATE POLICY "Sellers can select own newsletters by email"
  ON newsletters FOR SELECT TO authenticated
  USING (lower(seller_email) = lower(auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Sellers can update own newsletters by email" ON newsletters;
CREATE POLICY "Sellers can update own newsletters by email"
  ON newsletters FOR UPDATE TO authenticated
  USING (lower(seller_email) = lower(auth.jwt() ->> 'email'))
  WITH CHECK (lower(seller_email) = lower(auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Sellers can delete own newsletters by email" ON newsletters;
CREATE POLICY "Sellers can delete own newsletters by email"
  ON newsletters FOR DELETE TO authenticated
  USING (lower(seller_email) = lower(auth.jwt() ->> 'email'));

-- ============================================================
-- managed_sellers policy
-- ============================================================
DROP POLICY IF EXISTS "Sellers can view their own managed_sellers record" ON managed_sellers;
CREATE POLICY "Sellers can view their own managed_sellers record"
  ON managed_sellers FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- ============================================================
-- refund_requests policies
-- ============================================================
DROP POLICY IF EXISTS "Buyers can view own refund requests" ON refund_requests;
CREATE POLICY "Buyers can view own refund requests"
  ON refund_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deposit_bookings
      WHERE deposit_bookings.id = refund_requests.deposit_booking_id
      AND lower(deposit_bookings.buyer_email) = lower(auth.jwt() ->> 'email')
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS "Buyers can insert refund request for own booking" ON refund_requests;
CREATE POLICY "Buyers can insert refund request for own booking"
  ON refund_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deposit_bookings
      WHERE deposit_bookings.id = refund_requests.deposit_booking_id
      AND lower(deposit_bookings.buyer_email) = lower(auth.jwt() ->> 'email')
    )
  );
