/*
  # Allow public read access to newsletters

  ## Problem
  The newsletters table had no public SELECT policy, only authenticated sellers
  could read their own. When the listings query joins newsletter:newsletters(*) 
  for anonymous users, PostgREST returns empty results for the entire query.

  ## Fix
  Add a public SELECT policy so anyone can read newsletter data, which is needed
  to display listing details on the marketplace.
*/

CREATE POLICY "Anyone can read newsletters"
  ON newsletters
  FOR SELECT
  TO anon, authenticated
  USING (true);
