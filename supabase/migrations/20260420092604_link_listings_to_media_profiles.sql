/*
  # Link Live Listings to Media Profiles

  ## Summary
  Updates live listings to link them to the newly created and existing media profiles.
  This allows buyers to click through from a listing to see the full publisher profile.

  ## Listings linked:
  - SaaS Growth Weekly → b1000001 (SaaS Growth Weekly profile)
  - The Founder Brief → b1000002 (The Founder Brief profile)
  - AI Daily → b1000003 (AI Daily profile)
  - eCommerce Insider → b1000004 (eCommerce Insider profile)
  - TechPulse → b1000005 (TechPulse profile)
  - Irish Tech Digest → b1000006 (Irish Tech Digest profile)
  - Growth Dispatch → b1000007 (Growth Dispatch profile)
  - Product Pulse → b1000008 (Product Pulse profile)
  - FinFlash Weekly → b1000009 (FinFlash Weekly profile)
  - Dev Dispatch (ee15da9d) → b1000010 (Dev Dispatch profile)
  
  Also links several more live listings to existing media profiles for variety.
*/

-- SaaS Growth Weekly listings
UPDATE listings SET media_profile_id = 'b1000001-0000-0000-0000-000000000001'
WHERE property_name ILIKE '%SaaS Growth%' AND status = 'live';

-- The Founder Brief listings
UPDATE listings SET media_profile_id = 'b1000002-0000-0000-0000-000000000002'
WHERE property_name ILIKE '%Founder Brief%' AND status = 'live';

-- AI Daily listings
UPDATE listings SET media_profile_id = 'b1000003-0000-0000-0000-000000000003'
WHERE property_name ILIKE '%AI Daily%' AND status = 'live';

-- eCommerce Insider listings
UPDATE listings SET media_profile_id = 'b1000004-0000-0000-0000-000000000004'
WHERE (property_name ILIKE '%eCommerce Insider%' OR property_name ILIKE '%ecom%') AND status = 'live';

-- TechPulse listings
UPDATE listings SET media_profile_id = 'b1000005-0000-0000-0000-000000000005'
WHERE property_name ILIKE '%TechPulse%' AND status = 'live';

-- Irish Tech Digest listings
UPDATE listings SET media_profile_id = 'b1000006-0000-0000-0000-000000000006'
WHERE property_name ILIKE '%Irish Tech%' AND status = 'live';

-- Growth Dispatch listings
UPDATE listings SET media_profile_id = 'b1000007-0000-0000-0000-000000000007'
WHERE property_name ILIKE '%Growth Dispatch%' AND status = 'live';

-- Product Pulse listings
UPDATE listings SET media_profile_id = 'b1000008-0000-0000-0000-000000000008'
WHERE property_name ILIKE '%Product Pulse%' AND status = 'live';

-- FinFlash Weekly listings
UPDATE listings SET media_profile_id = 'b1000009-0000-0000-0000-000000000009'
WHERE property_name ILIKE '%FinFlash%' AND status = 'live';

-- Dev Dispatch listings
UPDATE listings SET media_profile_id = 'b1000010-0000-0000-0000-000000000010'
WHERE property_name ILIKE '%Dev Dispatch%' AND status = 'live';

-- Also link some more listings to the existing 12 profiles for variety

-- AI Weekly profile (6b32e56e)
UPDATE listings SET media_profile_id = '6b32e56e-cd8d-45ef-b899-c5b61d970019'
WHERE (property_name ILIKE '%AI Weekly%' OR property_name ILIKE '%AI Practitioner%' OR property_name ILIKE '%AI Tools%') AND status = 'live' AND media_profile_id IS NULL;

-- Founder's Edge profile (f96ad21f)
UPDATE listings SET media_profile_id = 'f96ad21f-34d6-4c0d-bc8a-24e7f4af44bb'
WHERE (property_name ILIKE '%Founder%') AND status = 'live' AND media_profile_id IS NULL;

-- Dev Digest profile (ccfd6ff0)
UPDATE listings SET media_profile_id = 'ccfd6ff0-66cb-4cd5-8938-a76dbdda2881'
WHERE (property_name ILIKE '%Dev %' OR property_name ILIKE '%Dev Morning%') AND status = 'live' AND media_profile_id IS NULL;

-- The Marketing Lab profile (a1272355)
UPDATE listings SET media_profile_id = 'a1272355-904c-4839-8ba4-d22b9d25753e'
WHERE (property_name ILIKE '%Marketing%' OR property_name ILIKE '%Growth Operator%') AND status = 'live' AND media_profile_id IS NULL;

-- Future of Work profile (636959bd)
UPDATE listings SET media_profile_id = '636959bd-4aa0-442d-bab5-56ae22131164'
WHERE (property_name ILIKE '%Future of Work%' OR property_name ILIKE '%Long Game%') AND status = 'live' AND media_profile_id IS NULL;

-- Real Estate Rundown profile (3b1e219c)
UPDATE listings SET media_profile_id = '3b1e219c-10bd-4887-a6ac-3b19cf2df003'
WHERE (property_name ILIKE '%Real Estate%' OR property_name ILIKE '%Retail Edge%' OR property_name ILIKE '%Retail%') AND status = 'live' AND media_profile_id IS NULL;

-- Finance profiles
UPDATE listings SET media_profile_id = '39194c8f-7bc7-42b5-b64c-47f2523a0cdf'
WHERE (property_name ILIKE '%CFO%' OR property_name ILIKE '%Funding%' OR property_name ILIKE '%Finance%') AND status = 'live' AND media_profile_id IS NULL;

-- Crypto profile (3fa4e243)
UPDATE listings SET media_profile_id = '3fa4e243-6f35-42fc-b8f2-643f639905d4'
WHERE (property_name ILIKE '%Crypto%' OR property_name ILIKE '%B2B Revenue%') AND status = 'live' AND media_profile_id IS NULL;

-- Climate Signal (bbd697a9)
UPDATE listings SET media_profile_id = 'bbd697a9-74ce-4b96-bfb8-7c99f9ff819f'
WHERE (property_name ILIKE '%Climate%' OR property_name ILIKE '%Northstar%') AND status = 'live' AND media_profile_id IS NULL;

-- Health Insider (38051032)
UPDATE listings SET media_profile_id = '38051032-eb5d-4917-bd76-a72434cc1206'
WHERE (property_name ILIKE '%DTC Dispatch%' OR property_name ILIKE '%B2B Matters%') AND status = 'live' AND media_profile_id IS NULL;

-- For any remaining live listings without a profile, assign sensible ones
UPDATE listings SET media_profile_id = 'b1000001-0000-0000-0000-000000000001'
WHERE status = 'live' AND media_profile_id IS NULL
AND (property_name ILIKE '%SaaS%' OR property_name ILIKE '%B2B%' OR property_name ILIKE '%Revenue%');

UPDATE listings SET media_profile_id = 'b1000007-0000-0000-0000-000000000007'
WHERE status = 'live' AND media_profile_id IS NULL
AND (property_name ILIKE '%Growth%' OR property_name ILIKE '%Dispatch%' OR property_name ILIKE '%Ops%');

UPDATE listings SET media_profile_id = 'b1000003-0000-0000-0000-000000000003'
WHERE status = 'live' AND media_profile_id IS NULL
AND (property_name ILIKE '%AI%' OR property_name ILIKE '%Tech%' OR property_name ILIKE '%Pulse%');
