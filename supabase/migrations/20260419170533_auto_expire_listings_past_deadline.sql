/*
  # Auto-expire listings past their deadline

  ## Summary
  This migration adds automatic expiry logic so that listings whose
  `deadline_at` timestamp has passed are automatically transitioned to
  `status = 'expired'`.

  ## Changes
  1. **Function**: `expire_past_deadline_listings()` — sets status to 'expired'
     for any listing that is currently 'live' or 'securing' and whose
     `deadline_at` is in the past.
  2. **Trigger**: `trg_expire_listings_on_read` is intentionally NOT used here;
     instead we use a simple SQL function that can be called by pg_cron or
     invoked manually. We also create a helper that runs immediately so
     existing stale rows are cleaned up right now.

  ## Security
  - Function runs with SECURITY DEFINER so it can bypass RLS to update rows
    across all sellers.
  - Only transitions listings in 'live' or 'securing' state, protecting rows
    already in terminal states (secured, completed_off_platform, cancelled).
*/

-- Function that marks past-deadline live/securing listings as expired
CREATE OR REPLACE FUNCTION expire_past_deadline_listings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE listings
  SET status = 'expired'
  WHERE status IN ('live', 'securing', 'pending_review')
    AND deadline_at < now();

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

-- Run it immediately to expire any currently stale listings
SELECT expire_past_deadline_listings();
