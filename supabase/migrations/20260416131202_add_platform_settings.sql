/*
  # Add Platform Settings Table

  1. New Tables
    - `platform_settings`
      - `key` (text, primary key) - setting name
      - `value` (text) - setting value
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS
    - Only authenticated admin users can read/write settings

  3. Notes
    - Used to store admin-configurable values like Stripe publishable key
    - Admins can update these via the Admin Dashboard UI without touching code
*/

CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON platform_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO platform_settings (key, value) VALUES ('stripe_publishable_key', '')
  ON CONFLICT (key) DO NOTHING;
