/*
  # Add buyer_user_id to deposit_bookings

  ## Summary
  Adds an optional `buyer_user_id` column to `deposit_bookings` so that bookings
  can be retrieved by authenticated user ID in addition to email. This prevents
  bookings from disappearing if a user's auth email ever changes.

  ## Changes
  - `deposit_bookings`: new nullable `buyer_user_id` (uuid) column with index

  ## Notes
  - Column is nullable so existing rows are unaffected
  - The edge function create-payment-intent will be updated to populate this column
    when a JWT bearer token is provided
*/

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
