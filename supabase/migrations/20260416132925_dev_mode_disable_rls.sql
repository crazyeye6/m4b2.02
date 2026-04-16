/*
  # Dev Mode: Disable All RLS Policies

  Drops all existing RLS policies and disables RLS on all tables for development.
  This allows unrestricted access to all tables without authentication checks.
  
  IMPORTANT: Re-enable RLS and restore policies before going live.

  Tables affected:
  - listings
  - slot_bookings
  - deposit_bookings
  - refund_requests
  - user_profiles
  - tags
  - listing_tags
  - platform_settings
*/

-- listings
DROP POLICY IF EXISTS "Anyone can view live listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can insert listings" ON listings;
DROP POLICY IF EXISTS "Sellers can view own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update any listing" ON listings;
DROP POLICY IF EXISTS "Authenticated sellers can insert listings" ON listings;
DROP POLICY IF EXISTS "Public can view live listings" ON listings;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;

-- slot_bookings
DROP POLICY IF EXISTS "Anyone can insert a slot booking" ON slot_bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON slot_bookings;
ALTER TABLE slot_bookings DISABLE ROW LEVEL SECURITY;

-- deposit_bookings
DROP POLICY IF EXISTS "Public can create a booking with valid data" ON deposit_bookings;
DROP POLICY IF EXISTS "Public can view own booking by reference" ON deposit_bookings;
DROP POLICY IF EXISTS "Anon can insert deposit bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Buyers can view own bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Authenticated buyers can view own bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Authenticated buyers can create bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Public can insert deposit bookings" ON deposit_bookings;
DROP POLICY IF EXISTS "Public can view deposit bookings by reference" ON deposit_bookings;
ALTER TABLE deposit_bookings DISABLE ROW LEVEL SECURITY;

-- refund_requests
DROP POLICY IF EXISTS "Authenticated buyers can create refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Authenticated buyers can view own refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Admins can update refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Admins can view all refund requests" ON refund_requests;
ALTER TABLE refund_requests DISABLE ROW LEVEL SECURITY;

-- user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- tags
DROP POLICY IF EXISTS "Tags are publicly readable" ON tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can update tag usage count" ON tags;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;

-- listing_tags
DROP POLICY IF EXISTS "Listing tags are publicly readable" ON listing_tags;
DROP POLICY IF EXISTS "Authenticated users can insert listing tags" ON listing_tags;
DROP POLICY IF EXISTS "Authenticated users can delete listing tags" ON listing_tags;
ALTER TABLE listing_tags DISABLE ROW LEVEL SECURITY;

-- platform_settings
DROP POLICY IF EXISTS "Authenticated users can read settings" ON platform_settings;
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON platform_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON platform_settings;
ALTER TABLE platform_settings DISABLE ROW LEVEL SECURITY;
