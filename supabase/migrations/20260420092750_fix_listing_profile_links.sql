/*
  # Fix and Complete Listing → Media Profile Links

  ## Summary
  Fixes some mismatched profile assignments and links remaining unlinked live listings
  to appropriate media profiles so all visible listings have a clickable publisher profile.
*/

-- Fix EdTech Roundup → should use Founder's Edge (education/startup niche is closer than AI Daily)
UPDATE listings SET media_profile_id = 'f96ad21f-34d6-4c0d-bc8a-24e7f4af44bb'
WHERE property_name = 'EdTech Roundup' AND status = 'live';

-- Fix Retail Edge → should use Marketing Lab, not Real Estate
UPDATE listings SET media_profile_id = 'a1272355-904c-4839-8ba4-d22b9d25753e'
WHERE property_name = 'Retail Edge' AND status = 'live';

-- Fix B2B Matters → should use SaaS Growth Weekly (B2B focus)
UPDATE listings SET media_profile_id = 'b1000001-0000-0000-0000-000000000001'
WHERE property_name = 'B2B Matters' AND status = 'live';

-- Fix Asia Tech Pulse → TechPulse profile (tech professional audience)
UPDATE listings SET media_profile_id = 'b1000005-0000-0000-0000-000000000005'
WHERE property_name = 'Asia Tech Pulse' AND status = 'live';

-- Fix Northstar Newsletter → Marketing Lab (B2B marketers / content)
UPDATE listings SET media_profile_id = 'a1272355-904c-4839-8ba4-d22b9d25753e'
WHERE property_name = 'Northstar Newsletter' AND status = 'live';

-- Fix CFO Lens → FinFlash (finance focus)
UPDATE listings SET media_profile_id = 'b1000009-0000-0000-0000-000000000009'
WHERE property_name = 'CFO Lens' AND status = 'live';

-- Link Wellness Weekly → Health Insider
UPDATE listings SET media_profile_id = '38051032-eb5d-4917-bd76-a72434cc1206'
WHERE property_name = 'Wellness Weekly' AND status = 'live';

-- Link HR Insider → Future of Work profile
UPDATE listings SET media_profile_id = '636959bd-4aa0-442d-bab5-56ae22131164'
WHERE property_name = 'HR Insider' AND status = 'live';

-- Link The Legal Brief → Legal Brief profile
UPDATE listings SET media_profile_id = 'dc1ca20c-252b-4eb4-99cb-b83f0487e671'
WHERE property_name = 'The Legal Brief' AND status = 'live';

-- Link Latam Startup Weekly → Founder's Edge (startup focused)
UPDATE listings SET media_profile_id = 'f96ad21f-34d6-4c0d-bc8a-24e7f4af44bb'
WHERE property_name = 'Latam Startup Weekly' AND status = 'live';

-- Link any remaining unlinked live newsletter listings
-- Use SaaS Growth Weekly as catch-all for any remaining B2B
UPDATE listings SET media_profile_id = 'b1000001-0000-0000-0000-000000000001'
WHERE status = 'live' AND media_profile_id IS NULL AND media_type = 'newsletter';

-- Update existing media profiles to enrich with missing fields where they have them
UPDATE media_profiles SET
  tagline = 'The pulse of financial technology, delivered weekdays',
  category = 'Finance & Fintech',
  audience_summary = 'Fintech founders, product managers, and investors tracking the latest trends in payments, banking, lending, and crypto. Published 5x per week with breaking news and deep analysis.',
  primary_geography = 'Global',
  audience_type = 'Fintech founders & investors',
  subscriber_count = 29000,
  open_rate = '41%',
  publishing_frequency = 'Daily (Mon–Fri)',
  ad_formats = ARRAY['Sponsored briefing', 'Banner ad', 'Dedicated send'],
  past_advertisers = ARRAY['Stripe', 'Plaid', 'Brex', 'Marqeta'],
  website_url = 'https://fintechbriefing.com',
  logo_url = 'https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = '39194c8f-7bc7-42b5-b64c-47f2523a0cdf';

UPDATE media_profiles SET
  tagline = 'Cutting through the noise in crypto and Web3',
  category = 'Crypto & Web3',
  audience_summary = 'Retail and institutional crypto investors, DeFi participants, and Web3 developers. Global readership. Very high engagement with product launches, exchange offers, and DeFi protocol announcements.',
  primary_geography = 'Global',
  audience_type = 'Crypto investors & Web3 developers',
  subscriber_count = 34000,
  open_rate = '37%',
  publishing_frequency = 'Twice weekly (Mon & Thu)',
  ad_formats = ARRAY['Banner ad', 'Sponsored section', 'Exclusive send'],
  past_advertisers = ARRAY['Coinbase', 'Ledger', 'Kraken', 'Bybit'],
  website_url = 'https://cryptocurrents.xyz',
  logo_url = 'https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = '3fa4e243-6f35-42fc-b8f2-643f639905d4';

UPDATE media_profiles SET
  tagline = 'Navigating the new world of distributed work and talent',
  category = 'Future of Work & HR',
  audience_summary = 'HR leaders, people operations professionals, remote work advocates, and future-of-work researchers. Global readership skewing US and Europe. Very strong engagement with HR tech and workplace tools.',
  primary_geography = 'United States / Europe',
  audience_type = 'HR leaders & remote work professionals',
  subscriber_count = 23000,
  open_rate = '45%',
  publishing_frequency = 'Weekly (every Tuesday)',
  ad_formats = ARRAY['Primary sponsor', 'Sponsored article', 'Job board'],
  past_advertisers = ARRAY['Notion', 'Loom', 'Miro', 'Rippling', 'Lattice'],
  website_url = 'https://futureofwork.email',
  logo_url = 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = '636959bd-4aa0-442d-bab5-56ae22131164';

UPDATE media_profiles SET
  tagline = 'The sustainability newsletter for business leaders and impact investors',
  category = 'Climate & Sustainability',
  audience_summary = 'Impact investors, sustainability executives, ESG professionals, and climate-tech founders. European-heavy readership with strong representation in the UK, Germany, and Nordics. High credibility with B2B climate-tech advertisers.',
  primary_geography = 'Europe / Global',
  audience_type = 'Impact investors & sustainability professionals',
  subscriber_count = 12000,
  open_rate = '53%',
  publishing_frequency = 'Weekly (every Thursday)',
  ad_formats = ARRAY['Sponsored editorial', 'Banner placement', 'Event partner'],
  past_advertisers = ARRAY['Climeworks', 'Pachama', 'Watershed', 'Patch'],
  website_url = 'https://climatesignal.io',
  logo_url = 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = 'bbd697a9-74ce-4b96-bfb8-7c99f9ff819f';

UPDATE media_profiles SET
  tagline = 'Expert health and wellness insights for modern professionals',
  category = 'Health & Wellness',
  audience_summary = 'Health-conscious professionals, wellness practitioners, nutritionists, and consumers interested in evidence-based health. US and Europe heavy. Strong buying intent for supplements, fitness tech, and wellness services.',
  primary_geography = 'United States / Europe',
  audience_type = 'Health-conscious professionals',
  subscriber_count = 18000,
  open_rate = '55%',
  publishing_frequency = 'Weekly (every Wednesday)',
  ad_formats = ARRAY['Primary sponsor', 'Product review', 'Dedicated send'],
  past_advertisers = ARRAY['AG1', 'Huel', 'Whoop', 'Eight Sleep', 'Levels'],
  website_url = 'https://healthinsidernews.com',
  logo_url = 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = '38051032-eb5d-4917-bd76-a72434cc1206';

UPDATE media_profiles SET
  tagline = 'The essential read for ambitious startup founders and operators',
  category = 'Startups & Venture',
  audience_summary = 'Pre-seed to Series B startup founders, early employees, and angel investors. Global readership with strong US and European presence. High engagement with growth, fundraising, and operations content.',
  primary_geography = 'United States / Global',
  audience_type = 'Startup founders & operators',
  subscriber_count = 27000,
  open_rate = '44%',
  publishing_frequency = 'Weekly (every Wednesday)',
  ad_formats = ARRAY['Primary sponsor', 'Classifieds', 'Dedicated issue'],
  past_advertisers = ARRAY['Stripe', 'Deel', 'Brex', 'Notion', 'Mercury Bank'],
  website_url = 'https://foundersedge.co',
  logo_url = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = 'f96ad21f-34d6-4c0d-bc8a-24e7f4af44bb';

UPDATE media_profiles SET
  tagline = 'Weekly dev tool and open-source roundup for engineers',
  category = 'Engineering & Dev Tools',
  audience_summary = 'Frontend and full-stack developers, open-source contributors, and engineering leads at startups and scale-ups. Global readership. Very high trial rate for new developer tools and infrastructure.',
  primary_geography = 'Global',
  audience_type = 'Developers & engineering teams',
  subscriber_count = 31000,
  open_rate = '43%',
  publishing_frequency = 'Weekly (every Friday)',
  ad_formats = ARRAY['Sponsor placement', 'Tool spotlight', 'Classified'],
  past_advertisers = ARRAY['Supabase', 'Vercel', 'PlanetScale', 'Neon', 'Railway'],
  website_url = 'https://devdigest.dev',
  logo_url = 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = 'ccfd6ff0-66cb-4cd5-8938-a76dbdda2881';

UPDATE media_profiles SET
  tagline = 'Intelligent weekly briefing for the B2B marketing and growth community',
  category = 'Marketing & Growth',
  audience_summary = 'B2B marketing leaders, content strategists, SEO professionals, and brand managers. US and Europe split. High trust brand among senior marketers making tool and agency purchasing decisions.',
  primary_geography = 'United States / Europe',
  audience_type = 'B2B marketers & content teams',
  subscriber_count = 22000,
  open_rate = '42%',
  publishing_frequency = 'Weekly (every Thursday)',
  ad_formats = ARRAY['Sponsored article', 'Banner ad', 'Classifieds', 'Takeover'],
  past_advertisers = ARRAY['Semrush', 'Ahrefs', 'Canva', 'Klaviyo', 'Mailchimp'],
  website_url = 'https://themarketinglab.io',
  logo_url = 'https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = 'a1272355-904c-4839-8ba4-d22b9d25753e';

UPDATE media_profiles SET
  tagline = 'Actionable intelligence for AI professionals and enterprise adopters',
  category = 'Artificial Intelligence',
  audience_summary = 'AI/ML practitioners, data scientists, LLMOps engineers, and enterprise AI adoption leaders. Global readership with heavy US and EU presence. High purchase intent for AI tooling, compute, and data platforms.',
  primary_geography = 'United States / Europe',
  audience_type = 'AI & ML professionals',
  subscriber_count = 19000,
  open_rate = '48%',
  publishing_frequency = 'Weekly (every Tuesday)',
  ad_formats = ARRAY['Primary sponsor', 'Deep-dive co-authorship', 'Banner ad'],
  past_advertisers = ARRAY['Hugging Face', 'Weights & Biases', 'Scale AI', 'Cohere'],
  website_url = 'https://aiweekly.news',
  logo_url = 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = '6b32e56e-cd8d-45ef-b899-c5b61d970019';

UPDATE media_profiles SET
  tagline = 'Market data, deal flow, and insights for real estate professionals',
  category = 'Real Estate',
  audience_summary = 'Real estate investors, commercial property professionals, proptech founders, and real estate agents. US and UK heavy. High intent for proptech tools, financial services, and market data platforms.',
  primary_geography = 'United States / United Kingdom',
  audience_type = 'Real estate investors & professionals',
  subscriber_count = 15000,
  open_rate = '44%',
  publishing_frequency = 'Weekly (every Monday)',
  ad_formats = ARRAY['Primary sponsor', 'Classifieds', 'Sponsored report'],
  past_advertisers = ARRAY['Roofstock', 'Arrived', 'CREXi', 'CoStar'],
  website_url = 'https://reroundup.com',
  logo_url = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = '3b1e219c-10bd-4887-a6ac-3b19cf2df003';

UPDATE media_profiles SET
  tagline = 'Legal tech, in-house counsel intelligence, and legal ops briefing',
  category = 'Legal & LegalTech',
  audience_summary = 'In-house counsel, legal operations professionals, and law firm partners. UK and US heavy. Very high trust in sponsor recommendations. Readers make technology and service purchasing decisions for their legal teams.',
  primary_geography = 'United Kingdom / United States',
  audience_type = 'In-house counsel & legal ops',
  subscriber_count = 9500,
  open_rate = '51%',
  publishing_frequency = 'Weekly (every Wednesday)',
  ad_formats = ARRAY['Sponsored editorial', 'Banner placement', 'Classifieds'],
  past_advertisers = ARRAY['Ironclad', 'Clio', 'LexisNexis', 'DocuSign'],
  website_url = 'https://legalbrief.law',
  logo_url = 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = 'dc1ca20c-252b-4eb4-99cb-b83f0487e671';

-- Food & Bev Insider profile
UPDATE media_profiles SET
  tagline = 'Inside the food and beverage industry — trends, brands, and M&A',
  category = 'Food & Beverage',
  audience_summary = 'Food and beverage founders, brand managers, investors, and retail buyers. Global readership with US and UK core. Strong engagement with supplier, ingredient, and distribution content.',
  primary_geography = 'United States / United Kingdom',
  audience_type = 'F&B professionals & brand managers',
  subscriber_count = 13000,
  open_rate = '46%',
  publishing_frequency = 'Weekly (every Thursday)',
  ad_formats = ARRAY['Sponsored article', 'Product launch', 'Classifieds'],
  past_advertisers = ARRAY['Oatly', 'Beyond Meat', 'NotCo', 'Minor Figures'],
  website_url = 'https://foodbevinsider.com',
  logo_url = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  updated_at = now()
WHERE id = 'b93a0a99-87ae-4d1c-b699-ebdf85182a81';
