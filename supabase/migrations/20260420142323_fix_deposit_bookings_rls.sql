/*
  # Fix deposit_bookings RLS policies

  ## Problem
  The existing "Buyers read own bookings" policy allows sellers to read bookings only
  if their listing has seller_user_id = auth.uid(). But many admin-created listings
  have seller_user_id = null, so those sellers can't see bookings for their own listings.

  Also, there was no INSERT policy, so buyers couldn't create bookings directly.

  ## Changes
  1. Drop the overcomplicated combined policy
  2. Add a clean buyer SELECT policy (by email or user_id)
  3. Add a clean seller SELECT policy (by listing seller_user_id OR seller_email match)
  4. Add an INSERT policy for authenticated buyers
*/

-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Buyers read own bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Buyers can read own bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Sellers can read bookings for own listings" ON deposit_bookings;
DROP POLICY IF EXISTS "Buyers can create bookings" ON deposit_bookings;

-- Buyers can read their own bookings (by user_id or email)
CREATE POLICY "Buyers can read own bookings"
  ON deposit_bookings FOR SELECT
  TO authenticated
  USING (
    buyer_user_id = auth.uid()
    OR lower(buyer_email) = lower(COALESCE((auth.jwt() ->> 'email'), ''))
    OR is_admin()
  );

-- Sellers can read bookings for their listings (via seller_user_id or seller_email on the listing)
CREATE POLICY "Sellers can read bookings for own listings"
  ON deposit_bookings FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = deposit_bookings.listing_id
        AND (
          l.seller_user_id = auth.uid()
          OR lower(l.seller_email) = lower(COALESCE((auth.jwt() ->> 'email'), ''))
        )
    )
  );

-- Buyers can insert bookings (checkout flow)
CREATE POLICY "Buyers can create bookings"
  ON deposit_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_user_id = auth.uid()
    OR lower(buyer_email) = lower(COALESCE((auth.jwt() ->> 'email'), ''))
  );
