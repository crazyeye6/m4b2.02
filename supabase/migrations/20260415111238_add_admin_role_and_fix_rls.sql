/*
  # Add admin role and fix RLS policies

  ## Changes

  ### 1. user_profiles table
  - Add 'admin' to the role check constraint (buyer | seller | admin)

  ### 2. deposit_bookings RLS
  - Drop any open USING(true) policies
  - Add proper policies:
    - Buyers can INSERT their own bookings (email matches auth email)
    - Buyers can SELECT their own bookings
    - Admins (role = 'admin') can SELECT all bookings
    - Admins can UPDATE any booking status

  ### 3. refund_requests RLS
  - Drop open policies
  - Add proper policies:
    - Buyers can INSERT refund requests linked to their own bookings
    - Buyers can SELECT their own refund requests
    - Admins can SELECT all refund requests
    - Admins can UPDATE refund request status

  ### Notes
  - Admin access is checked via a join to user_profiles where role = 'admin'
  - All policies use auth.uid() - never current_user
*/

-- 1. Update role constraint on user_profiles to allow 'admin'
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role = ANY (ARRAY['buyer'::text, 'seller'::text, 'admin'::text]));

-- 2. Fix deposit_bookings RLS
-- Drop all existing policies on deposit_bookings
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'deposit_bookings' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON deposit_bookings', pol.policyname);
  END LOOP;
END $$;

-- Buyers can insert their own booking
CREATE POLICY "Buyers can insert own booking"
  ON deposit_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Buyers can view their own bookings
CREATE POLICY "Buyers can view own bookings"
  ON deposit_bookings FOR SELECT
  TO authenticated
  USING (
    buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can update any booking
CREATE POLICY "Admins can update bookings"
  ON deposit_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 3. Fix refund_requests RLS
-- Drop all existing policies on refund_requests
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'refund_requests' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON refund_requests', pol.policyname);
  END LOOP;
END $$;

-- Buyers can insert refund requests for their own bookings
CREATE POLICY "Buyers can insert refund request for own booking"
  ON refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deposit_bookings
      WHERE deposit_bookings.id = refund_requests.deposit_booking_id
      AND deposit_bookings.buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Buyers can view their own refund requests; admins can view all
CREATE POLICY "Buyers can view own refund requests"
  ON refund_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deposit_bookings
      WHERE deposit_bookings.id = refund_requests.deposit_booking_id
      AND deposit_bookings.buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can update refund request status
CREATE POLICY "Admins can update refund requests"
  ON refund_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Also allow anon to insert deposit_bookings (unauthenticated checkout)
CREATE POLICY "Anon can insert deposit bookings"
  ON deposit_bookings FOR INSERT
  TO anon
  WITH CHECK (true);
