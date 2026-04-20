/*
  # Fix media_profiles SELECT policy for anonymous users

  ## Problem
  The existing "Anyone can read media profiles" policy uses `TO public` (the postgres
  public role), not `TO anon`. Supabase browser clients use the `anon` role for
  unauthenticated requests. This meant the join from listings → media_profiles returned
  no data for anonymous visitors, causing the listings grid to appear empty.

  ## Changes
  - Drop the old policy that targets the wrong role
  - Create a new policy explicitly granting SELECT to both `anon` and `authenticated`
*/

DROP POLICY IF EXISTS "Anyone can read media profiles" ON media_profiles;

CREATE POLICY "Anyone can read media profiles"
  ON media_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);
