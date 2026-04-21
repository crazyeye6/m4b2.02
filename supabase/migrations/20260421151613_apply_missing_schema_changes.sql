/*
  # Apply Missing Schema Changes

  Multiple migrations failed to apply to the remote database. This migration
  consolidates all missing changes from:
  - 20260420092604 link_listings_to_media_profiles
  - 20260420092750 fix_listing_profile_links
  - 20260420104723 add_ctr_to_media_profiles
  - 20260420113114 add_auto_discount_enabled_to_listings
  - 20260420120556 add_newsletters_table
  - 20260420124303 add_managed_sellers_and_account_claims
  - 20260420124752 allow_admin_created_newsletters_and_listings
  - 20260420130143 seed_20_media_sellers_with_profiles_and_listings
  - 20260420131658 add_public_read_newsletters
  - 20260420132546 add_buyer_user_id_to_deposit_bookings
  - 20260420142323 fix_deposit_bookings_rls
  - 20260420161006 fix_media_profiles_anon_select_policy
  - 20260421142318 add_auto_create_profile_trigger

  ## New Tables
  - `newsletters` - Newsletter entities for sellers
  - `managed_sellers` - Admin-created seller accounts
  - `account_claim_tokens` - Tokens for account claim flow

  ## Modified Tables
  - `listings` - Added newsletter_id (FK to newsletters), auto_discount_enabled
  - `deposit_bookings` - Added buyer_user_id
  - `media_profiles` - Added ctr column

  ## Security
  - RLS enabled on all new tables
  - Fixed media_profiles anon SELECT policy
  - Fixed deposit_bookings RLS policies
  - Added public read for newsletters

  ## Data
  - Links existing listings to media profiles
  - Seeds 20 managed sellers, newsletters, and 40 listings
*/

-- ============================================================
-- 1. Add CTR to media_profiles (20260420104723)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_profiles' AND column_name = 'ctr'
  ) THEN
    ALTER TABLE media_profiles ADD COLUMN ctr text;
  END IF;
END $$;

-- ============================================================
-- 2. Add auto_discount_enabled to listings (20260420113114)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'auto_discount_enabled'
  ) THEN
    ALTER TABLE listings ADD COLUMN auto_discount_enabled boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- ============================================================
-- 3. Create newsletters table (20260420120556)
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_email text NOT NULL,
  name text NOT NULL,
  publisher_name text NOT NULL DEFAULT '',
  subscriber_count integer,
  avg_open_rate text,
  niche text,
  primary_geography text,
  send_frequency text,
  description text,
  logo_url text,
  website_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can view own newsletters') THEN
    CREATE POLICY "Sellers can view own newsletters"
      ON newsletters FOR SELECT TO authenticated
      USING (auth.uid() = seller_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can insert own newsletters') THEN
    CREATE POLICY "Sellers can insert own newsletters"
      ON newsletters FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = seller_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can update own newsletters') THEN
    CREATE POLICY "Sellers can update own newsletters"
      ON newsletters FOR UPDATE TO authenticated
      USING (auth.uid() = seller_user_id)
      WITH CHECK (auth.uid() = seller_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can delete own newsletters') THEN
    CREATE POLICY "Sellers can delete own newsletters"
      ON newsletters FOR DELETE TO authenticated
      USING (auth.uid() = seller_user_id);
  END IF;
END $$;

-- Add newsletter_id FK to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'newsletter_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN newsletter_id uuid REFERENCES newsletters(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS newsletters_seller_user_id_idx ON newsletters(seller_user_id);
CREATE INDEX IF NOT EXISTS listings_newsletter_id_idx ON listings(newsletter_id);

-- ============================================================
-- 4. Create managed_sellers and account_claim_tokens (20260420124303)
-- ============================================================
CREATE TABLE IF NOT EXISTS managed_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  created_by_admin uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  account_claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  invite_sent_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS managed_sellers_email_idx ON managed_sellers (email);

ALTER TABLE managed_sellers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'managed_sellers' AND policyname = 'Admins can select all managed sellers') THEN
    CREATE POLICY "Admins can select all managed sellers"
      ON managed_sellers FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'managed_sellers' AND policyname = 'Admins can insert managed sellers') THEN
    CREATE POLICY "Admins can insert managed sellers"
      ON managed_sellers FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'managed_sellers' AND policyname = 'Admins can update managed sellers') THEN
    CREATE POLICY "Admins can update managed sellers"
      ON managed_sellers FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'managed_sellers' AND policyname = 'Admins can delete managed sellers') THEN
    CREATE POLICY "Admins can delete managed sellers"
      ON managed_sellers FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS account_claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_claim_tokens_token_idx ON account_claim_tokens (token);
CREATE INDEX IF NOT EXISTS account_claim_tokens_email_idx ON account_claim_tokens (email);

ALTER TABLE account_claim_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'account_claim_tokens' AND policyname = 'Service role can manage claim tokens') THEN
    CREATE POLICY "Service role can manage claim tokens"
      ON account_claim_tokens FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));
  END IF;
END $$;

-- ============================================================
-- 5. Allow admin-created newsletters/listings policies (20260420124752)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can select own newsletters by email') THEN
    CREATE POLICY "Sellers can select own newsletters by email"
      ON newsletters FOR SELECT TO authenticated
      USING (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can update own newsletters by email') THEN
    CREATE POLICY "Sellers can update own newsletters by email"
      ON newsletters FOR UPDATE TO authenticated
      USING (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      WITH CHECK (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Sellers can delete own newsletters by email') THEN
    CREATE POLICY "Sellers can delete own newsletters by email"
      ON newsletters FOR DELETE TO authenticated
      USING (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Sellers can select own listings by email') THEN
    CREATE POLICY "Sellers can select own listings by email"
      ON listings FOR SELECT TO authenticated
      USING (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Sellers can update own listings by email') THEN
    CREATE POLICY "Sellers can update own listings by email"
      ON listings FOR UPDATE TO authenticated
      USING (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      WITH CHECK (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Sellers can delete own listings by email') THEN
    CREATE POLICY "Sellers can delete own listings by email"
      ON listings FOR DELETE TO authenticated
      USING (seller_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'managed_sellers' AND policyname = 'Sellers can view their own managed_sellers record') THEN
    CREATE POLICY "Sellers can view their own managed_sellers record"
      ON managed_sellers FOR SELECT TO authenticated
      USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
END $$;

-- ============================================================
-- 6. Public read for newsletters (20260420131658)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletters' AND policyname = 'Anyone can read newsletters') THEN
    CREATE POLICY "Anyone can read newsletters"
      ON newsletters FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 7. Add buyer_user_id to deposit_bookings (20260420132546)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deposit_bookings' AND column_name = 'buyer_user_id'
  ) THEN
    ALTER TABLE deposit_bookings ADD COLUMN buyer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS deposit_bookings_buyer_user_id_idx ON deposit_bookings(buyer_user_id);
  END IF;
END $$;

-- ============================================================
-- 8. Fix deposit_bookings RLS (20260420142323)
-- ============================================================
DROP POLICY IF EXISTS "Buyers read own bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Buyers can read own bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Sellers can read bookings for own listings" ON deposit_bookings;
DROP POLICY IF EXISTS "Buyers can create bookings" ON deposit_bookings;

CREATE POLICY "Buyers can read own bookings"
  ON deposit_bookings FOR SELECT TO authenticated
  USING (
    buyer_user_id = auth.uid()
    OR lower(buyer_email) = lower(COALESCE((auth.jwt() ->> 'email'), ''))
    OR is_admin()
  );

CREATE POLICY "Sellers can read bookings for own listings"
  ON deposit_bookings FOR SELECT TO authenticated
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

CREATE POLICY "Buyers can create bookings"
  ON deposit_bookings FOR INSERT TO authenticated
  WITH CHECK (
    buyer_user_id = auth.uid()
    OR lower(buyer_email) = lower(COALESCE((auth.jwt() ->> 'email'), ''))
  );

-- ============================================================
-- 9. Fix media_profiles anon SELECT (20260420161006)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read media profiles" ON media_profiles;

CREATE POLICY "Anyone can read media profiles"
  ON media_profiles FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- 10. Auto-create profile trigger (20260421142318)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, display_name, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
