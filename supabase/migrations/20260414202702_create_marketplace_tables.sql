
/*
  # EndingThisWeek.media - Marketplace Tables

  ## New Tables

  ### listings
  Stores all media opportunity listings including newsletters, podcasts, and influencer slots.
  - Full pricing, audience, and scheduling details
  - Status system: live, securing, pending_review, secured, expired
  - Countdown based on deadline_at timestamp

  ### slot_bookings
  Stores buyer submissions when securing a slot.
  - Links to listing
  - Buyer contact and campaign info
  - Hold timer tracking

  ## Security
  - RLS enabled on both tables
  - Public read for listings
  - Authenticated or anonymous insert for bookings (marketplace open to all)
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type text NOT NULL CHECK (media_type IN ('newsletter', 'podcast', 'influencer')),
  media_owner_name text NOT NULL DEFAULT '',
  media_company_name text NOT NULL DEFAULT '',
  property_name text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  subscribers integer,
  open_rate text,
  ctr text,
  downloads integer,
  ad_type text,
  followers integer,
  engagement_rate text,
  deliverable text,
  slot_type text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  deadline_at timestamptz NOT NULL,
  original_price integer NOT NULL DEFAULT 0,
  discounted_price integer NOT NULL DEFAULT 0,
  slots_remaining integer NOT NULL DEFAULT 1,
  past_advertisers text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'securing', 'pending_review', 'secured', 'expired')),
  hold_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS slot_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  campaign_name text NOT NULL DEFAULT '',
  campaign_url text NOT NULL DEFAULT '',
  brief text NOT NULL DEFAULT '',
  budget_confirmed boolean NOT NULL DEFAULT false,
  creative_ready boolean NOT NULL DEFAULT false,
  booking_type text NOT NULL DEFAULT 'review' CHECK (booking_type IN ('review', 'proceed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live listings"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert a slot booking"
  ON slot_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON slot_bookings FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_media_type_idx ON listings(media_type);
CREATE INDEX IF NOT EXISTS listings_deadline_idx ON listings(deadline_at);
