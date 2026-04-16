/*
  # Re-enable Row Level Security with proper policies

  ## Summary
  The previous dev-mode migration disabled RLS on every table, meaning any client
  using the anon key could read and write any row. This migration re-enables RLS
  on all public tables and installs restrictive policies that enforce ownership,
  membership, and public-read where appropriate.

  ## Tables Secured
  1. listings                - public can read live listings; sellers manage their own; admins manage all
  2. tags                    - public can read; authenticated can insert new tags
  3. listing_tags            - public can read; listing owners or admins can manage
  4. deposit_bookings        - buyers read their own; sellers read bookings for their listings; admins read all.
                               Inserts restricted to service_role (done by edge function after Stripe confirms).
  5. slot_bookings           - authenticated users can insert; admins read all
  6. user_profiles           - users read/update their own; public can read seller profile fields minimally
  7. refund_requests         - buyer of the booking can create/read; admins read/update all
  8. platform_settings       - public read of specific public keys; admins manage all

  ## Security Notes
  1. No policy uses USING (true) for writes.
  2. Every policy restricts to authenticated unless the data is genuinely public (listings, tags).
  3. deposit_bookings writes only allowed via service_role so the edge function is the single source of truth.
*/

-- Helper: function that checks whether the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- LISTINGS ------------------------------------------------------------------
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view live listings" ON public.listings;
CREATE POLICY "Public can view live listings"
  ON public.listings FOR SELECT
  TO anon, authenticated
  USING (status IN ('live','securing','secured','in_progress','completed_off_platform'));

DROP POLICY IF EXISTS "Sellers manage own listings select" ON public.listings;
CREATE POLICY "Sellers manage own listings select"
  ON public.listings FOR SELECT
  TO authenticated
  USING (seller_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Sellers insert own listings" ON public.listings;
CREATE POLICY "Sellers insert own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (seller_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Sellers update own listings" ON public.listings;
CREATE POLICY "Sellers update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (seller_user_id = auth.uid() OR public.is_admin())
  WITH CHECK (seller_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins delete listings" ON public.listings;
CREATE POLICY "Admins delete listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- TAGS ----------------------------------------------------------------------
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tags" ON public.tags;
CREATE POLICY "Public read tags"
  ON public.tags FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated insert tags" ON public.tags;
CREATE POLICY "Authenticated insert tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins update tags" ON public.tags;
CREATE POLICY "Admins update tags"
  ON public.tags FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LISTING_TAGS --------------------------------------------------------------
ALTER TABLE public.listing_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read listing_tags" ON public.listing_tags;
CREATE POLICY "Public read listing_tags"
  ON public.listing_tags FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Listing owners manage tags insert" ON public.listing_tags;
CREATE POLICY "Listing owners manage tags insert"
  ON public.listing_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND (l.seller_user_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "Listing owners manage tags delete" ON public.listing_tags;
CREATE POLICY "Listing owners manage tags delete"
  ON public.listing_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND (l.seller_user_id = auth.uid() OR public.is_admin()))
  );

-- DEPOSIT_BOOKINGS ----------------------------------------------------------
ALTER TABLE public.deposit_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers read own bookings" ON public.deposit_bookings;
CREATE POLICY "Buyers read own bookings"
  ON public.deposit_bookings FOR SELECT
  TO authenticated
  USING (
    lower(buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins update bookings" ON public.deposit_bookings;
CREATE POLICY "Admins update bookings"
  ON public.deposit_bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- No INSERT or DELETE policy: only service_role (edge function / webhook) may insert.

-- SLOT_BOOKINGS -------------------------------------------------------------
ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated insert slot bookings" ON public.slot_bookings;
CREATE POLICY "Authenticated insert slot bookings"
  ON public.slot_bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read slot bookings" ON public.slot_bookings;
CREATE POLICY "Admins read slot bookings"
  ON public.slot_bookings FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid())
  );

-- USER_PROFILES -------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.user_profiles;
CREATE POLICY "Users read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Public read seller profile summary" ON public.user_profiles;
CREATE POLICY "Public read seller profile summary"
  ON public.user_profiles FOR SELECT
  TO anon, authenticated
  USING (
    role = 'seller'
    AND EXISTS (SELECT 1 FROM public.listings l WHERE l.seller_user_id = user_profiles.id AND l.status IN ('live','securing','secured','in_progress','completed_off_platform'))
  );

DROP POLICY IF EXISTS "Users insert own profile" ON public.user_profiles;
CREATE POLICY "Users insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- REFUND_REQUESTS -----------------------------------------------------------
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers view own refund requests" ON public.refund_requests;
CREATE POLICY "Buyers view own refund requests"
  ON public.refund_requests FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.deposit_bookings b
      WHERE b.id = deposit_booking_id
        AND lower(b.buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    )
  );

DROP POLICY IF EXISTS "Buyers create refund requests" ON public.refund_requests;
CREATE POLICY "Buyers create refund requests"
  ON public.refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deposit_bookings b
      WHERE b.id = deposit_booking_id
        AND lower(b.buyer_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    )
  );

DROP POLICY IF EXISTS "Admins update refund requests" ON public.refund_requests;
CREATE POLICY "Admins update refund requests"
  ON public.refund_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PLATFORM_SETTINGS ---------------------------------------------------------
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read public settings" ON public.platform_settings;
CREATE POLICY "Public read public settings"
  ON public.platform_settings FOR SELECT
  TO anon, authenticated
  USING (key IN ('stripe_publishable_key', 'platform_name', 'support_email'));

DROP POLICY IF EXISTS "Admins read all settings" ON public.platform_settings;
CREATE POLICY "Admins read all settings"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins upsert settings insert" ON public.platform_settings;
CREATE POLICY "Admins upsert settings insert"
  ON public.platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins upsert settings update" ON public.platform_settings;
CREATE POLICY "Admins upsert settings update"
  ON public.platform_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
