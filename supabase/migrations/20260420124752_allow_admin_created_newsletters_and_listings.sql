/*
  # Allow Admin-Created Newsletters and Listings

  ## Changes

  ### newsletters table
  - Make `seller_user_id` nullable to allow admin-created newsletter profiles
    where the owner has not yet claimed their account.
  - Add RLS policy so sellers can access newsletters linked to their email
    (for when they claim their account and log in).

  ### listings table
  - Add RLS policy so sellers can access listings linked to their email
    when no seller_user_id is set (admin-created on their behalf).

  ## Notes
  - When a seller claims their account, the `seller_user_id` on their newsletters
    and listings should be updated to their actual auth user ID. This is handled
    by the claim flow in the frontend.
  - Admin-created records use seller_email for ownership, not seller_user_id.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'newsletters' AND column_name = 'seller_user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE newsletters ALTER COLUMN seller_user_id DROP NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletters'
    AND policyname = 'Sellers can select own newsletters by email'
  ) THEN
    CREATE POLICY "Sellers can select own newsletters by email"
      ON newsletters FOR SELECT
      TO authenticated
      USING (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletters'
    AND policyname = 'Sellers can update own newsletters by email'
  ) THEN
    CREATE POLICY "Sellers can update own newsletters by email"
      ON newsletters FOR UPDATE
      TO authenticated
      USING (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
      WITH CHECK (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletters'
    AND policyname = 'Sellers can delete own newsletters by email'
  ) THEN
    CREATE POLICY "Sellers can delete own newsletters by email"
      ON newsletters FOR DELETE
      TO authenticated
      USING (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings'
    AND policyname = 'Sellers can select own listings by email'
  ) THEN
    CREATE POLICY "Sellers can select own listings by email"
      ON listings FOR SELECT
      TO authenticated
      USING (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings'
    AND policyname = 'Sellers can update own listings by email'
  ) THEN
    CREATE POLICY "Sellers can update own listings by email"
      ON listings FOR UPDATE
      TO authenticated
      USING (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
      WITH CHECK (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings'
    AND policyname = 'Sellers can delete own listings by email'
  ) THEN
    CREATE POLICY "Sellers can delete own listings by email"
      ON listings FOR DELETE
      TO authenticated
      USING (
        seller_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'managed_sellers'
    AND policyname = 'Sellers can view their own managed_sellers record'
  ) THEN
    CREATE POLICY "Sellers can view their own managed_sellers record"
      ON managed_sellers FOR SELECT
      TO authenticated
      USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
  END IF;
END $$;
