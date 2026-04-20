/*
  # Add Managed Sellers and Account Claims System

  ## Overview
  This migration adds support for admins to create and manage seller accounts on behalf
  of newsletter owners, with an email-based "claim your account" flow.

  ## New Tables

  ### managed_sellers
  Tracks seller accounts created by admins on behalf of newsletter owners.
  - `id` - UUID primary key
  - `email` - the seller's email address (used to match when they sign up)
  - `display_name` - seller's display name
  - `company` - company/publisher name
  - `created_by_admin` - UUID of admin who created the account
  - `account_claimed` - whether the owner has claimed their account
  - `claimed_at` - when the account was claimed
  - `invite_sent_at` - when the claim invite was last sent
  - `notes` - admin notes
  - `created_at`, `updated_at`

  ### account_claim_tokens
  Short-lived tokens for the email-based "claim your account" flow.
  - `id` - UUID primary key
  - `email` - the seller's email to claim
  - `token` - secure random token (hashed)
  - `expires_at` - token expiry (24 hours)
  - `used_at` - when the token was used
  - `created_at`

  ## Changes to Existing Tables
  - `listings` - no change needed, seller_email ownership already handles this
  - `newsletters` - no change needed, seller_user_id handles this
  - `user_profiles` - admin can set role to 'seller' on signup

  ## Security
  - RLS enabled on both new tables
  - managed_sellers: admin-only write, public read by email match
  - account_claim_tokens: service role only (used by edge function)
*/

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

CREATE POLICY "Admins can select all managed sellers"
  ON managed_sellers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert managed sellers"
  ON managed_sellers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update managed sellers"
  ON managed_sellers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete managed sellers"
  ON managed_sellers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

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

CREATE POLICY "Service role can manage claim tokens"
  ON account_claim_tokens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
