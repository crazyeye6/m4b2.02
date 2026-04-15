/*
  # Add Seller Company URL and Portfolio Links

  Adds two new fields to the listings table:
  - `seller_company_url` (text) - Direct link to the seller's company page (distinct from personal website)
  - `portfolio_links` (text[]) - Array of URLs to past work examples / media kit / case studies

  These allow buyers to review the seller's work and validate credibility before booking.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'seller_company_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN seller_company_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'portfolio_links'
  ) THEN
    ALTER TABLE listings ADD COLUMN portfolio_links text[] DEFAULT '{}';
  END IF;
END $$;
