/*
  # Seed Data: Link Listings to Media Profiles and Add Sellers

  Links existing live listings to media profiles using actual profile IDs,
  then seeds 20 managed sellers, newsletters, and 40 new listings.
*/

-- ============================================================
-- Link existing listings to media profiles by name match
-- ============================================================

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'SaaS Growth Weekly' LIMIT 1)
WHERE property_name ILIKE '%SaaS Growth%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'The Founder Brief' LIMIT 1)
WHERE property_name ILIKE '%Founder Brief%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'AI Daily' LIMIT 1)
WHERE property_name ILIKE '%AI Daily%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'eCommerce Insider' LIMIT 1)
WHERE (property_name ILIKE '%eCommerce Insider%' OR property_name ILIKE '%ecom%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'TechPulse' LIMIT 1)
WHERE property_name ILIKE '%TechPulse%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Irish Tech Digest' LIMIT 1)
WHERE property_name ILIKE '%Irish Tech%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Growth Dispatch' LIMIT 1)
WHERE property_name ILIKE '%Growth Dispatch%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Product Pulse' LIMIT 1)
WHERE property_name ILIKE '%Product Pulse%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'FinFlash Weekly' LIMIT 1)
WHERE property_name ILIKE '%FinFlash%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Dev Dispatch' LIMIT 1)
WHERE property_name ILIKE '%Dev Dispatch%' AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'AI Weekly' LIMIT 1)
WHERE (property_name ILIKE '%AI Weekly%' OR property_name ILIKE '%AI Practitioner%' OR property_name ILIKE '%AI Tools%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Founder''s Edge' LIMIT 1)
WHERE (property_name ILIKE '%Founder%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Dev Digest' LIMIT 1)
WHERE (property_name ILIKE '%Dev %' OR property_name ILIKE '%Dev Morning%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'The Marketing Lab' LIMIT 1)
WHERE (property_name ILIKE '%Marketing%' OR property_name ILIKE '%Growth Operator%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Future of Work' LIMIT 1)
WHERE (property_name ILIKE '%Future of Work%' OR property_name ILIKE '%Long Game%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Real Estate Rundown' LIMIT 1)
WHERE (property_name ILIKE '%Real Estate%' OR property_name ILIKE '%Retail Edge%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'The Fintech Briefing' LIMIT 1)
WHERE (property_name ILIKE '%CFO%' OR property_name ILIKE '%Funding%' OR property_name ILIKE '%Finance%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Crypto Currents' LIMIT 1)
WHERE (property_name ILIKE '%Crypto%' OR property_name ILIKE '%B2B Revenue%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Climate Signal' LIMIT 1)
WHERE (property_name ILIKE '%Climate%' OR property_name ILIKE '%Northstar%') AND status = 'live' AND media_profile_id IS NULL;

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Health Insider' LIMIT 1)
WHERE (property_name ILIKE '%DTC Dispatch%' OR property_name ILIKE '%B2B Matters%' OR property_name ILIKE '%Wellness%') AND status = 'live' AND media_profile_id IS NULL;

-- Fix specific profile links
UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Founder''s Edge' LIMIT 1)
WHERE property_name = 'EdTech Roundup' AND status = 'live';

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'The Marketing Lab' LIMIT 1)
WHERE property_name = 'Retail Edge' AND status = 'live';

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'TechPulse' LIMIT 1)
WHERE property_name = 'Asia Tech Pulse' AND status = 'live';

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'FinFlash Weekly' LIMIT 1)
WHERE property_name = 'CFO Lens' AND status = 'live';

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Future of Work' LIMIT 1)
WHERE property_name = 'HR Insider' AND status = 'live';

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'The Legal Brief' LIMIT 1)
WHERE property_name = 'The Legal Brief' AND status = 'live';

UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'Founder''s Edge' LIMIT 1)
WHERE property_name = 'Latam Startup Weekly' AND status = 'live';

-- Catch-all: assign remaining unlinked newsletter listings
UPDATE listings SET media_profile_id = (SELECT id FROM media_profiles WHERE newsletter_name = 'SaaS Growth Weekly' LIMIT 1)
WHERE status = 'live' AND media_profile_id IS NULL AND media_type = 'newsletter';

-- ============================================================
-- Seed 20 managed sellers, newsletters, and 40 listings
-- ============================================================

DO $$
DECLARE
  now_ts timestamptz := now();
BEGIN

INSERT INTO managed_sellers (email, display_name, company, notes, account_claimed, created_at, updated_at) VALUES
  ('james@saasweekly.io',        'James Holloway',    'SaaS Weekly',               'High-engagement B2B SaaS newsletter', false, now_ts, now_ts),
  ('priya@founderhq.co',         'Priya Sharma',      'Founder HQ',                'Startup / VC scene newsletter',       false, now_ts, now_ts),
  ('tom@marketingbrew.co',       'Tom Beckett',       'Marketing Brew Co.',         'Marketing ops newsletter',            false, now_ts, now_ts),
  ('sarah@fintechfwd.com',       'Sarah Okonkwo',     'Fintech Forward',            'Fintech audience, global',            false, now_ts, now_ts),
  ('dan@devcurrent.io',          'Dan Morales',       'Dev Current',                'Developer tools newsletter',          false, now_ts, now_ts),
  ('emma@healthpulsenews.com',   'Emma Lindqvist',    'Health Pulse',               'Health & wellness newsletter',        false, now_ts, now_ts),
  ('raj@aifrontier.email',       'Raj Patel',         'AI Frontier',                'AI / ML newsletter',                  false, now_ts, now_ts),
  ('kate@ecommerceinsider.co',   'Kate Morrison',     'eCommerce Insider',          'DTC and eCommerce newsletter',        false, now_ts, now_ts),
  ('luca@cryptodigest.email',    'Luca Ferretti',     'Crypto Digest',              'Crypto investors newsletter',         false, now_ts, now_ts),
  ('nina@hrleaders.io',          'Nina Johansson',    'HR Leaders',                 'HR directors newsletter',             false, now_ts, now_ts),
  ('alex@realestatepulse.co',    'Alex Chen',         'Real Estate Pulse',          'Property investors newsletter',       false, now_ts, now_ts),
  ('maya@legaltech.email',       'Maya Thompson',     'LegalTech Insider',          'Legal professionals newsletter',      false, now_ts, now_ts),
  ('ben@sustainbiz.io',          'Ben Walker',        'Sustain Biz',                'Sustainability newsletter',           false, now_ts, now_ts),
  ('claire@remotework.email',    'Claire Dubois',     'Remote Work Weekly',         'Distributed teams newsletter',        false, now_ts, now_ts),
  ('mario@datadriven.io',        'Mario Russo',       'Data Driven',                'Data science newsletter',             false, now_ts, now_ts),
  ('anna@edutech.email',         'Anna Kowalski',     'EduTech Weekly',             'EdTech newsletter',                   false, now_ts, now_ts),
  ('joel@vcmemo.co',             'Joel Hartmann',     'VC Memo',                    'VC ecosystem newsletter',             false, now_ts, now_ts),
  ('lisa@cxleader.io',           'Lisa Park',         'CX Leader',                  'Customer experience newsletter',      false, now_ts, now_ts),
  ('carlos@devopsdaily.email',   'Carlos Mendez',     'DevOps Daily',               'DevOps newsletter',                   false, now_ts, now_ts),
  ('zoe@climatetech.email',      'Zoe Andersen',      'Climate Tech Insider',       'Climate tech newsletter',             false, now_ts, now_ts)
ON CONFLICT (email) DO NOTHING;

INSERT INTO newsletters (seller_email, seller_user_id, name, publisher_name, subscriber_count, avg_open_rate, niche, primary_geography, send_frequency, description, website_url, is_active, created_at, updated_at) VALUES
  ('james@saasweekly.io',        null, 'SaaS Weekly',           'SaaS Weekly',           52000,  '44%',  'B2B SaaS',         'US',      'Weekly',     'The definitive weekly read for SaaS founders.',  'https://saasweekly.io',        true, now_ts, now_ts),
  ('priya@founderhq.co',         null, 'Founder HQ',            'Founder HQ',            38500,  '51%',  'Startup',           'US / UK', 'Weekly',     'Curated intelligence for early-stage founders.',  'https://founderhq.co',         true, now_ts, now_ts),
  ('tom@marketingbrew.co',       null, 'Marketing Brew Co.',    'Marketing Brew Co.',    67200,  '39%',  'Marketing',         'US',      'Weekdays',   'Daily marketing intel for growth marketers.',     'https://marketingbrew.co',     true, now_ts, now_ts),
  ('sarah@fintechfwd.com',       null, 'Fintech Forward',       'Fintech Forward',       29800,  '47%',  'Fintech',           'Global',  'Weekly',     'Finance meets technology.',                        'https://fintechfwd.com',       true, now_ts, now_ts),
  ('dan@devcurrent.io',          null, 'Dev Current',           'Dev Current',           44100,  '43%',  'Tech',              'Global',  'Weekly',     'A weekly briefing for senior engineers.',          'https://devcurrent.io',        true, now_ts, now_ts),
  ('emma@healthpulsenews.com',   null, 'Health Pulse',          'Health Pulse',          31600,  '52%',  'Health & Wellness', 'US',      'Weekly',     'Evidence-based health and wellness content.',     'https://healthpulsenews.com',  true, now_ts, now_ts),
  ('raj@aifrontier.email',       null, 'AI Frontier',           'AI Frontier',           88400,  '48%',  'AI',                'Global',  'Bi-weekly',  'Cutting-edge AI research for practitioners.',     'https://aifrontier.email',     true, now_ts, now_ts),
  ('kate@ecommerceinsider.co',   null, 'eCommerce Insider',     'eCommerce Insider',     24300,  '46%',  'eCommerce',         'US / UK', 'Weekly',     'Tactical advice for DTC brands.',                 'https://ecommerceinsider.co',  true, now_ts, now_ts),
  ('luca@cryptodigest.email',    null, 'Crypto Digest',         'Crypto Digest',         61700,  '38%',  'Crypto',            'Global',  'Daily',      'Daily on-chain intelligence.',                    'https://cryptodigest.email',   true, now_ts, now_ts),
  ('nina@hrleaders.io',          null, 'HR Leaders',            'HR Leaders',            19400,  '55%',  'General',           'US',      'Weekly',     'Strategic people-ops content.',                    'https://hrleaders.io',         true, now_ts, now_ts),
  ('alex@realestatepulse.co',    null, 'Real Estate Pulse',     'Real Estate Pulse',     22800,  '50%',  'General',           'US',      'Weekly',     'Real estate intelligence.',                        'https://realestatepulse.co',   true, now_ts, now_ts),
  ('maya@legaltech.email',       null, 'LegalTech Insider',     'LegalTech Insider',     16200,  '58%',  'General',           'US / UK', 'Weekly',     'Legal technology insights.',                       'https://legaltech.email',      true, now_ts, now_ts),
  ('ben@sustainbiz.io',          null, 'Sustain Biz',           'Sustain Biz',           27500,  '49%',  'General',           'Europe',  'Weekly',     'ESG strategy and sustainability intelligence.',   'https://sustainbiz.io',        true, now_ts, now_ts),
  ('claire@remotework.email',    null, 'Remote Work Weekly',    'Remote Work Weekly',    33900,  '45%',  'General',           'Global',  'Weekly',     'The operating system for distributed teams.',     'https://remotework.email',     true, now_ts, now_ts),
  ('mario@datadriven.io',        null, 'Data Driven',           'Data Driven',           41200,  '42%',  'Tech',              'Global',  'Weekly',     'A practical weekly for data engineers.',           'https://datadriven.io',        true, now_ts, now_ts),
  ('anna@edutech.email',         null, 'EduTech Weekly',        'EduTech Weekly',        18600,  '54%',  'Education',         'US / UK', 'Weekly',     'EdTech product, policy, and pedagogy.',            'https://edutech.email',        true, now_ts, now_ts),
  ('joel@vcmemo.co',             null, 'VC Memo',               'VC Memo',               14900,  '61%',  'Finance',           'US',      'Weekly',     'Unfiltered venture capital intelligence.',         'https://vcmemo.co',            true, now_ts, now_ts),
  ('lisa@cxleader.io',           null, 'CX Leader',             'CX Leader',             21700,  '53%',  'General',           'US',      'Weekly',     'Customer experience strategy for leaders.',        'https://cxleader.io',          true, now_ts, now_ts),
  ('carlos@devopsdaily.email',   null, 'DevOps Daily',          'DevOps Daily',          35800,  '40%',  'Tech',              'Global',  'Weekdays',   'Daily DevOps and platform engineering digest.',   'https://devopsdaily.email',    true, now_ts, now_ts),
  ('zoe@climatetech.email',      null, 'Climate Tech Insider',  'Climate Tech Insider',  23100,  '56%',  'General',           'Global',  'Weekly',     'Climate technology for founders and investors.',   'https://climatetech.email',    true, now_ts, now_ts)
ON CONFLICT DO NOTHING;

INSERT INTO listings (
  media_type, seller_user_id, seller_email, media_owner_name, media_company_name,
  property_name, slot_type, date_label, deadline_at,
  original_price, discounted_price,
  audience, location, subscribers, open_rate,
  slots_remaining, slots_total, status,
  auto_discount_enabled, deliverables_detail,
  past_advertisers, created_at
) VALUES
('newsletter', null, 'james@saasweekly.io', 'James Holloway', 'SaaS Weekly', 'SaaS Weekly', 'Sponsored post', 'May 12 issue', now_ts + interval '8 days', 2400, 2400, 'B2B SaaS', 'US', 52000, '44%', 1, 1, 'live', true, '600-word sponsored post above the fold.', ARRAY['HubSpot','Notion','Loom'], now_ts),
('newsletter', null, 'james@saasweekly.io', 'James Holloway', 'SaaS Weekly', 'SaaS Weekly', 'Classified ad', 'May 19 issue', now_ts + interval '15 days', 950, 950, 'B2B SaaS', 'US', 52000, '44%', 1, 1, 'live', true, '75-word classified.', ARRAY['Zapier','Linear'], now_ts),
('newsletter', null, 'priya@founderhq.co', 'Priya Sharma', 'Founder HQ', 'Founder HQ', 'Dedicated send', 'May 14 issue', now_ts + interval '10 days', 3800, 3800, 'Startup', 'US / UK', 38500, '51%', 1, 1, 'live', true, 'Full dedicated email send.', ARRAY['Brex','Rippling'], now_ts),
('newsletter', null, 'priya@founderhq.co', 'Priya Sharma', 'Founder HQ', 'Founder HQ', 'Sponsored post', 'May 21 issue', now_ts + interval '17 days', 1600, 1600, 'Startup', 'US / UK', 38500, '51%', 1, 1, 'live', true, '400-word sponsored story.', ARRAY['Deel','AngelList'], now_ts),
('newsletter', null, 'tom@marketingbrew.co', 'Tom Beckett', 'Marketing Brew Co.', 'Marketing Brew Co.', 'Banner ad', 'May 13 issue', now_ts + interval '9 days', 1100, 1100, 'Marketing', 'US', 67200, '39%', 1, 1, 'live', true, 'Header banner (600x200px).', ARRAY['Sprout Social','Canva'], now_ts),
('newsletter', null, 'tom@marketingbrew.co', 'Tom Beckett', 'Marketing Brew Co.', 'Marketing Brew Co.', 'Sponsored post', 'May 20 issue', now_ts + interval '16 days', 1800, 1800, 'Marketing', 'US', 67200, '39%', 1, 1, 'live', true, '500-word sponsored feature.', ARRAY['Semrush','Mailchimp'], now_ts),
('newsletter', null, 'sarah@fintechfwd.com', 'Sarah Okonkwo', 'Fintech Forward', 'Fintech Forward', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days', 2800, 2800, 'Fintech', 'Global', 29800, '47%', 1, 1, 'live', true, '500-word sponsored section.', ARRAY['Stripe','Plaid'], now_ts),
('newsletter', null, 'sarah@fintechfwd.com', 'Sarah Okonkwo', 'Fintech Forward', 'Fintech Forward', 'Newsletter mention', 'May 22 issue', now_ts + interval '18 days', 800, 800, 'Fintech', 'Global', 29800, '47%', 1, 1, 'live', true, 'Two-sentence editorial mention.', ARRAY['Wise','Monzo'], now_ts),
('newsletter', null, 'dan@devcurrent.io', 'Dan Morales', 'Dev Current', 'Dev Current', 'Sponsored post', 'May 12 issue', now_ts + interval '8 days', 2100, 2100, 'Tech', 'Global', 44100, '43%', 1, 1, 'live', true, '450-word technical sponsorship.', ARRAY['Datadog','Supabase'], now_ts),
('newsletter', null, 'dan@devcurrent.io', 'Dan Morales', 'Dev Current', 'Dev Current', 'Classified ad', 'May 19 issue', now_ts + interval '15 days', 700, 700, 'Tech', 'Global', 44100, '43%', 1, 1, 'live', true, '80-word tool spotlight.', ARRAY['GitHub','Vercel'], now_ts),
('newsletter', null, 'emma@healthpulsenews.com', 'Emma Lindqvist', 'Health Pulse', 'Health Pulse', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days', 1900, 1900, 'Health & Wellness', 'US', 31600, '52%', 1, 1, 'live', true, '500-word sponsored feature.', ARRAY['Whoop','Eight Sleep'], now_ts),
('newsletter', null, 'emma@healthpulsenews.com', 'Emma Lindqvist', 'Health Pulse', 'Health Pulse', 'Banner ad', 'May 21 issue', now_ts + interval '17 days', 650, 650, 'Health & Wellness', 'US', 31600, '52%', 1, 1, 'live', true, 'Mid-newsletter banner.', ARRAY['AG1','Huel'], now_ts),
('newsletter', null, 'raj@aifrontier.email', 'Raj Patel', 'AI Frontier', 'AI Frontier', 'Sponsored post', 'May 16 issue', now_ts + interval '12 days', 4200, 4200, 'AI', 'Global', 88400, '48%', 1, 1, 'live', true, '600-word AI-native sponsorship.', ARRAY['OpenAI','Anthropic','Scale AI'], now_ts),
('newsletter', null, 'raj@aifrontier.email', 'Raj Patel', 'AI Frontier', 'AI Frontier', 'Dedicated send', 'May 23 issue', now_ts + interval '19 days', 9800, 9800, 'AI', 'Global', 88400, '48%', 1, 1, 'live', true, 'Full dedicated send to 88k AI practitioners.', ARRAY['Cohere','Weights & Biases'], now_ts),
('newsletter', null, 'kate@ecommerceinsider.co', 'Kate Morrison', 'eCommerce Insider', 'eCommerce Insider', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days', 1450, 1450, 'eCommerce', 'US / UK', 24300, '46%', 1, 1, 'live', true, '400-word DTC-focused sponsorship.', ARRAY['Klaviyo','Gorgias'], now_ts),
('newsletter', null, 'kate@ecommerceinsider.co', 'Kate Morrison', 'eCommerce Insider', 'eCommerce Insider', 'Newsletter mention', 'May 20 issue', now_ts + interval '16 days', 480, 480, 'eCommerce', 'US / UK', 24300, '46%', 1, 1, 'live', true, 'Three-sentence brand mention.', ARRAY['Shopify','Recharge'], now_ts),
('newsletter', null, 'luca@cryptodigest.email', 'Luca Ferretti', 'Crypto Digest', 'Crypto Digest', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days', 3100, 3100, 'Crypto', 'Global', 61700, '38%', 1, 1, 'live', true, '500-word crypto-native sponsorship.', ARRAY['Ledger','Coinbase'], now_ts),
('newsletter', null, 'luca@cryptodigest.email', 'Luca Ferretti', 'Crypto Digest', 'Crypto Digest', 'Banner ad', 'May 21 issue', now_ts + interval '17 days', 1200, 1200, 'Crypto', 'Global', 61700, '38%', 1, 1, 'live', true, 'Top-of-newsletter banner.', ARRAY['Binance','Kraken'], now_ts),
('newsletter', null, 'nina@hrleaders.io', 'Nina Johansson', 'HR Leaders', 'HR Leaders', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days', 1750, 1750, 'General', 'US', 19400, '55%', 1, 1, 'live', true, '450-word HR-focused sponsorship.', ARRAY['Lattice','Workday'], now_ts),
('newsletter', null, 'nina@hrleaders.io', 'Nina Johansson', 'HR Leaders', 'HR Leaders', 'Classified ad', 'May 22 issue', now_ts + interval '18 days', 580, 580, 'General', 'US', 19400, '55%', 1, 1, 'live', true, '80-word job board listing.', ARRAY['Culture Amp','Greenhouse'], now_ts),
('newsletter', null, 'alex@realestatepulse.co', 'Alex Chen', 'Real Estate Pulse', 'Real Estate Pulse', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days', 1600, 1600, 'General', 'US', 22800, '50%', 1, 1, 'live', true, '400-word sponsored feature.', ARRAY['Roofstock','Fundrise'], now_ts),
('newsletter', null, 'alex@realestatepulse.co', 'Alex Chen', 'Real Estate Pulse', 'Real Estate Pulse', 'Newsletter mention', 'May 20 issue', now_ts + interval '16 days', 420, 420, 'General', 'US', 22800, '50%', 1, 1, 'live', true, 'Two-sentence mention.', ARRAY['Buildium','Yardi'], now_ts),
('newsletter', null, 'maya@legaltech.email', 'Maya Thompson', 'LegalTech Insider', 'LegalTech Insider', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days', 2200, 2200, 'General', 'US / UK', 16200, '58%', 1, 1, 'live', true, '450-word feature for legal tech.', ARRAY['Clio','Ironclad'], now_ts),
('newsletter', null, 'maya@legaltech.email', 'Maya Thompson', 'LegalTech Insider', 'LegalTech Insider', 'Banner ad', 'May 22 issue', now_ts + interval '18 days', 680, 680, 'General', 'US / UK', 16200, '58%', 1, 1, 'live', true, 'Mid-email banner.', ARRAY['DocuSign','Relativity'], now_ts),
('newsletter', null, 'ben@sustainbiz.io', 'Ben Walker', 'Sustain Biz', 'Sustain Biz', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days', 1500, 1500, 'General', 'Europe', 27500, '49%', 1, 1, 'live', true, '500-word sponsored feature.', ARRAY['Watershed','Persefoni'], now_ts),
('newsletter', null, 'ben@sustainbiz.io', 'Ben Walker', 'Sustain Biz', 'Sustain Biz', 'Newsletter mention', 'May 21 issue', now_ts + interval '17 days', 490, 490, 'General', 'Europe', 27500, '49%', 1, 1, 'live', true, 'Three-sentence mention.', ARRAY['South Pole','EcoVadis'], now_ts),
('newsletter', null, 'claire@remotework.email', 'Claire Dubois', 'Remote Work Weekly', 'Remote Work Weekly', 'Sponsored post', 'May 16 issue', now_ts + interval '12 days', 1850, 1850, 'General', 'Global', 33900, '45%', 1, 1, 'live', true, '450-word sponsorship.', ARRAY['Loom','Notion','Doist'], now_ts),
('newsletter', null, 'claire@remotework.email', 'Claire Dubois', 'Remote Work Weekly', 'Remote Work Weekly', 'Classified ad', 'May 23 issue', now_ts + interval '19 days', 550, 550, 'General', 'Global', 33900, '45%', 1, 1, 'live', true, '80-word tool or job listing.', ARRAY['Deel','Remote.com'], now_ts),
('newsletter', null, 'mario@datadriven.io', 'Mario Russo', 'Data Driven', 'Data Driven', 'Sponsored post', 'May 12 issue', now_ts + interval '8 days', 2300, 2300, 'Tech', 'Global', 41200, '42%', 1, 1, 'live', true, '500-word technical sponsorship.', ARRAY['dbt Labs','Snowflake'], now_ts),
('newsletter', null, 'mario@datadriven.io', 'Mario Russo', 'Data Driven', 'Data Driven', 'Banner ad', 'May 19 issue', now_ts + interval '15 days', 780, 780, 'Tech', 'Global', 41200, '42%', 1, 1, 'live', true, 'Header banner (600x200px).', ARRAY['Looker','Metabase'], now_ts),
('newsletter', null, 'anna@edutech.email', 'Anna Kowalski', 'EduTech Weekly', 'EduTech Weekly', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days', 1300, 1300, 'Education', 'US / UK', 18600, '54%', 1, 1, 'live', true, '400-word feature for EdTech.', ARRAY['Teachable','Coursera'], now_ts),
('newsletter', null, 'anna@edutech.email', 'Anna Kowalski', 'EduTech Weekly', 'EduTech Weekly', 'Newsletter mention', 'May 20 issue', now_ts + interval '16 days', 390, 390, 'Education', 'US / UK', 18600, '54%', 1, 1, 'live', true, 'Two-sentence editorial mention.', ARRAY['Udemy','Duolingo'], now_ts),
('newsletter', null, 'joel@vcmemo.co', 'Joel Hartmann', 'VC Memo', 'VC Memo', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days', 3500, 3500, 'Finance', 'US', 14900, '61%', 1, 1, 'live', true, '500-word sponsorship targeting VCs.', ARRAY['Carta','AngelList'], now_ts),
('newsletter', null, 'joel@vcmemo.co', 'Joel Hartmann', 'VC Memo', 'VC Memo', 'Classified ad', 'May 22 issue', now_ts + interval '18 days', 950, 950, 'Finance', 'US', 14900, '61%', 1, 1, 'live', true, '80-word fund announcement.', ARRAY['Foundersuite','Visible.vc'], now_ts),
('newsletter', null, 'lisa@cxleader.io', 'Lisa Park', 'CX Leader', 'CX Leader', 'Sponsored post', 'May 16 issue', now_ts + interval '12 days', 1650, 1650, 'General', 'US', 21700, '53%', 1, 1, 'live', true, '450-word sponsorship for CX software.', ARRAY['Zendesk','Intercom'], now_ts),
('newsletter', null, 'lisa@cxleader.io', 'Lisa Park', 'CX Leader', 'CX Leader', 'Newsletter mention', 'May 23 issue', now_ts + interval '19 days', 420, 420, 'General', 'US', 21700, '53%', 1, 1, 'live', true, 'Three-sentence mention.', ARRAY['Gong','Totango'], now_ts),
('newsletter', null, 'carlos@devopsdaily.email', 'Carlos Mendez', 'DevOps Daily', 'DevOps Daily', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days', 1950, 1950, 'Tech', 'Global', 35800, '40%', 1, 1, 'live', true, '500-word technical sponsorship.', ARRAY['HashiCorp','Grafana'], now_ts),
('newsletter', null, 'carlos@devopsdaily.email', 'Carlos Mendez', 'DevOps Daily', 'DevOps Daily', 'Banner ad', 'May 20 issue', now_ts + interval '16 days', 720, 720, 'Tech', 'Global', 35800, '40%', 1, 1, 'live', true, 'Top-of-email banner.', ARRAY['Datadog','PagerDuty'], now_ts),
('newsletter', null, 'zoe@climatetech.email', 'Zoe Andersen', 'Climate Tech Insider', 'Climate Tech Insider', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days', 1700, 1700, 'General', 'Global', 23100, '56%', 1, 1, 'live', true, '450-word feature for climate tech.', ARRAY['Climeworks','ChargePoint'], now_ts),
('newsletter', null, 'zoe@climatetech.email', 'Zoe Andersen', 'Climate Tech Insider', 'Climate Tech Insider', 'Newsletter mention', 'May 21 issue', now_ts + interval '17 days', 520, 520, 'General', 'Global', 23100, '56%', 1, 1, 'live', true, 'Two-sentence mention.', ARRAY['Breakthrough Energy','Lowercarbon Capital'], now_ts);

END $$;
