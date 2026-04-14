/*
  # Add User Profiles for Buyer and Seller Dashboards

  ## Summary
  Adds a user_profiles table linked to Supabase auth.users so that both buyers and
  sellers can have private authenticated dashboards. Sellers are linked to their listings
  via seller_email. Buyers look up their bookings by email after verifying identity.

  ## New Tables

  ### user_profiles
  - Stores role (buyer | seller), display name, company, and phone
  - One row per auth user
  - role determines which dashboard is shown

  ## Modified Tables

  ### listings
  - Adds seller_user_id column (nullable) to link a listing to an authenticated seller
    so sellers can manage their own listings from the seller dashboard

  ## Security
  - RLS enabled on user_profiles
  - Users can only read and update their own profile
  - Sellers can view and update their own listings
  - Buyers can view their own deposit_bookings by matching auth user email

  ## Notes
  1. Roles: 'buyer' or 'seller' — set at registration
  2. Sellers are matched to listings by seller_email OR seller_user_id
  3. Buyers are matched to bookings by buyer_email matching their auth email
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller')),
  display_name text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  website text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Link listings to authenticated sellers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_user_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS listings_seller_user_id_idx ON listings(seller_user_id);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);

-- Sellers can view and update their own listings
CREATE POLICY "Sellers can view own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (seller_user_id = auth.uid());

CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (seller_user_id = auth.uid())
  WITH CHECK (seller_user_id = auth.uid());

-- Buyers can view their own bookings (matched by email stored in JWT)
CREATE POLICY "Buyers can view own bookings"
  ON deposit_bookings FOR SELECT
  TO authenticated
  USING (buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
