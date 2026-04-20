/*
  # Seed 20 Media Sellers with Full Profiles and Listings

  ## Overview
  Inserts 20 realistic newsletter/media seller accounts into managed_sellers,
  newsletters, and listings tables. Each seller gets:
  - A managed_sellers profile (with name, company, email, notes)
  - A newsletter record with subscriber count, open rate, niche, geography
  - 2 live listing slots at realistic prices with deadlines spread over the next 3 weeks

  ## Sellers cover diverse niches
  B2B SaaS, Marketing, Finance, Fintech, Health, Tech, AI, eCommerce,
  Startup, Education, Crypto, Sustainability, Legal, HR, Real Estate

  ## Notes
  - All accounts are unclaimed (account_claimed = false)
  - All listings are status = 'live'
  - Prices are realistic market rates for newsletter sponsorships
*/

DO $$
DECLARE
  now_ts timestamptz := now();
BEGIN

INSERT INTO managed_sellers (email, display_name, company, notes, account_claimed, created_at, updated_at) VALUES
  ('james@saasweekly.io',        'James Holloway',    'SaaS Weekly',               'High-engagement B2B SaaS newsletter, US-focused', false, now_ts, now_ts),
  ('priya@founderhq.co',         'Priya Sharma',      'Founder HQ',                'Startup / VC scene, strong US + UK readership',   false, now_ts, now_ts),
  ('tom@marketingbrew.co',       'Tom Beckett',       'Marketing Brew Co.',         'Marketing ops and growth newsletter',             false, now_ts, now_ts),
  ('sarah@fintechfwd.com',       'Sarah Okonkwo',     'Fintech Forward',            'Fintech and payments audience, global',            false, now_ts, now_ts),
  ('dan@devcurrent.io',          'Dan Morales',       'Dev Current',                'Developer tools and engineering newsletter',       false, now_ts, now_ts),
  ('emma@healthpulsenews.com',   'Emma Lindqvist',    'Health Pulse',               'Health & wellness professionals and consumers',    false, now_ts, now_ts),
  ('raj@aifrontier.email',       'Raj Patel',         'AI Frontier',                'AI / ML practitioners and researchers',            false, now_ts, now_ts),
  ('kate@ecommerceinsider.co',   'Kate Morrison',     'eCommerce Insider',          'DTC and eCommerce operators',                     false, now_ts, now_ts),
  ('luca@cryptodigest.email',    'Luca Ferretti',     'Crypto Digest',              'Crypto investors and DeFi traders',                false, now_ts, now_ts),
  ('nina@hrleaders.io',          'Nina Johansson',    'HR Leaders',                 'HR directors and people ops at scale-ups',         false, now_ts, now_ts),
  ('alex@realestatepulse.co',    'Alex Chen',         'Real Estate Pulse',          'Residential and commercial property investors',    false, now_ts, now_ts),
  ('maya@legaltech.email',       'Maya Thompson',     'LegalTech Insider',          'Legal professionals and GCs',                     false, now_ts, now_ts),
  ('ben@sustainbiz.io',          'Ben Walker',        'Sustain Biz',                'Sustainability and ESG business leaders',          false, now_ts, now_ts),
  ('claire@remotework.email',    'Claire Dubois',     'Remote Work Weekly',         'Distributed teams and remote-first companies',     false, now_ts, now_ts),
  ('mario@datadriven.io',        'Mario Russo',       'Data Driven',                'Data science, analytics, and BI professionals',    false, now_ts, now_ts),
  ('anna@edutech.email',         'Anna Kowalski',     'EduTech Weekly',             'EdTech founders and learning & development pros',  false, now_ts, now_ts),
  ('joel@vcmemo.co',             'Joel Hartmann',     'VC Memo',                    'Early-stage investors and startup ecosystem',      false, now_ts, now_ts),
  ('lisa@cxleader.io',           'Lisa Park',         'CX Leader',                  'Customer experience and success professionals',    false, now_ts, now_ts),
  ('carlos@devopsdaily.email',   'Carlos Mendez',     'DevOps Daily',               'Platform engineering and DevOps practitioners',    false, now_ts, now_ts),
  ('zoe@climatetech.email',      'Zoe Andersen',      'Climate Tech Insider',       'Climate tech investors and founders',              false, now_ts, now_ts)
ON CONFLICT (email) DO NOTHING;


INSERT INTO newsletters (seller_email, seller_user_id, name, publisher_name, subscriber_count, avg_open_rate, niche, primary_geography, send_frequency, description, website_url, is_active, created_at, updated_at) VALUES
  ('james@saasweekly.io',        null, 'SaaS Weekly',           'SaaS Weekly',           52000,  '44%',  'B2B SaaS',       'US',      'Weekly',     'The definitive weekly read for SaaS founders, operators and investors. Covering growth, pricing, churn, and product strategy.',               'https://saasweekly.io',        true, now_ts, now_ts),
  ('priya@founderhq.co',         null, 'Founder HQ',            'Founder HQ',            38500,  '51%',  'Startup',        'US / UK', 'Weekly',     'Curated intelligence for early-stage founders. VC deals, hiring, fundraising playbooks, and founder stories that actually matter.',           'https://founderhq.co',         true, now_ts, now_ts),
  ('tom@marketingbrew.co',       null, 'Marketing Brew Co.',    'Marketing Brew Co.',    67200,  '39%',  'Marketing',      'US',      'Weekdays',   'Daily marketing intel for brand builders and growth marketers. Campaigns, creative trends, and platform updates — minus the fluff.',        'https://marketingbrew.co',     true, now_ts, now_ts),
  ('sarah@fintechfwd.com',       null, 'Fintech Forward',       'Fintech Forward',       29800,  '47%',  'Fintech',        'Global',  'Weekly',     'Where finance meets technology. Covering payments, banking-as-a-service, regulation, and the companies reshaping money.',                 'https://fintechfwd.com',       true, now_ts, now_ts),
  ('dan@devcurrent.io',          null, 'Dev Current',           'Dev Current',           44100,  '43%',  'Tech',           'Global',  'Weekly',     'A weekly briefing for senior engineers and engineering leaders. OSS, architecture decisions, tools, and career advice.',                  'https://devcurrent.io',        true, now_ts, now_ts),
  ('emma@healthpulsenews.com',   null, 'Health Pulse',          'Health Pulse',          31600,  '52%',  'Health & Wellness','US',    'Weekly',     'Evidence-based health and wellness content for a professional audience. Covers nutrition, longevity, mental health and clinical news.',    'https://healthpulsenews.com',  true, now_ts, now_ts),
  ('raj@aifrontier.email',       null, 'AI Frontier',           'AI Frontier',           88400,  '48%',  'AI',             'Global',  'Bi-weekly',  'Cutting-edge AI research and product developments explained for practitioners. LLMs, agents, robotics, and the business of AI.',           'https://aifrontier.email',     true, now_ts, now_ts),
  ('kate@ecommerceinsider.co',   null, 'eCommerce Insider',     'eCommerce Insider',     24300,  '46%',  'eCommerce',      'US / UK', 'Weekly',     'Tactical advice for DTC and marketplace brands. Ad strategies, conversion optimisation, supply chain, and platform changes.',            'https://ecommerceinsider.co',  true, now_ts, now_ts),
  ('luca@cryptodigest.email',    null, 'Crypto Digest',         'Crypto Digest',         61700,  '38%',  'Crypto',         'Global',  'Daily',      'Daily on-chain intelligence and market commentary. DeFi, NFTs, regulation, and portfolio strategies for serious crypto investors.',        'https://cryptodigest.email',   true, now_ts, now_ts),
  ('nina@hrleaders.io',          null, 'HR Leaders',            'HR Leaders',            19400,  '55%',  'General',        'US',      'Weekly',     'Strategic people-ops content for HR directors and CPOs at growth-stage companies. Compensation, culture, hiring and compliance.',        'https://hrleaders.io',         true, now_ts, now_ts),
  ('alex@realestatepulse.co',    null, 'Real Estate Pulse',     'Real Estate Pulse',     22800,  '50%',  'General',        'US',      'Weekly',     'Commercial and residential real estate intelligence. Cap rates, market reports, deal flow, and proptech news for active investors.',      'https://realestatepulse.co',   true, now_ts, now_ts),
  ('maya@legaltech.email',       null, 'LegalTech Insider',     'LegalTech Insider',     16200,  '58%',  'General',        'US / UK', 'Weekly',     'Keeping legal professionals ahead of technology. Contract AI, e-discovery, courthouse trends, and practice management tools.',          'https://legaltech.email',      true, now_ts, now_ts),
  ('ben@sustainbiz.io',          null, 'Sustain Biz',           'Sustain Biz',           27500,  '49%',  'General',        'Europe',  'Weekly',     'ESG strategy and sustainability intelligence for business leaders. Policy changes, net-zero roadmaps, green finance, and case studies.',  'https://sustainbiz.io',        true, now_ts, now_ts),
  ('claire@remotework.email',    null, 'Remote Work Weekly',    'Remote Work Weekly',    33900,  '45%',  'General',        'Global',  'Weekly',     'The operating system for distributed teams. Async workflows, tools, hiring globally, culture, and the future of work.',                  'https://remotework.email',     true, now_ts, now_ts),
  ('mario@datadriven.io',        null, 'Data Driven',           'Data Driven',           41200,  '42%',  'Tech',           'Global',  'Weekly',     'A practical weekly for data engineers and analysts. SQL, dbt, Spark, dashboarding, and the data stack that powers modern companies.',    'https://datadriven.io',        true, now_ts, now_ts),
  ('anna@edutech.email',         null, 'EduTech Weekly',        'EduTech Weekly',        18600,  '54%',  'Education',      'US / UK', 'Weekly',     'EdTech product, policy, and pedagogy. For founders building learning tools, L&D professionals, and school administrators.',             'https://edutech.email',        true, now_ts, now_ts),
  ('joel@vcmemo.co',             null, 'VC Memo',               'VC Memo',               14900,  '61%',  'Finance',        'US',      'Weekly',     'Unfiltered venture capital intelligence. Deal announcements, LP dynamics, fund strategies, and market thesis breakdowns.',              'https://vcmemo.co',            true, now_ts, now_ts),
  ('lisa@cxleader.io',           null, 'CX Leader',             'CX Leader',             21700,  '53%',  'General',        'US',      'Weekly',     'Customer experience and success strategy for leaders at SaaS and e-commerce companies. Retention, NPS, support tooling and more.',      'https://cxleader.io',          true, now_ts, now_ts),
  ('carlos@devopsdaily.email',   null, 'DevOps Daily',          'DevOps Daily',          35800,  '40%',  'Tech',           'Global',  'Weekdays',   'Daily DevOps and platform engineering digest. Kubernetes, CI/CD, observability, security and cloud cost optimisation.',               'https://devopsdaily.email',    true, now_ts, now_ts),
  ('zoe@climatetech.email',      null, 'Climate Tech Insider',  'Climate Tech Insider',  23100,  '56%',  'General',        'Global',  'Weekly',     'Climate technology and green economy for founders and investors. Solar, EVs, carbon markets, grid tech, and policy intelligence.',      'https://climatetech.email',    true, now_ts, now_ts)
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

-- SaaS Weekly
('newsletter', null, 'james@saasweekly.io', 'James Holloway', 'SaaS Weekly',
 'SaaS Weekly', 'Sponsored post', 'May 12 issue', now_ts + interval '8 days',
 2400, 2400, 'B2B SaaS', 'US', 52000, '44%', 1, 1, 'live', true,
 '600-word sponsored post above the fold. Includes logo, headline, body copy and CTA link. Full creative review.',
 ARRAY['HubSpot','Notion','Loom'], now_ts),

('newsletter', null, 'james@saasweekly.io', 'James Holloway', 'SaaS Weekly',
 'SaaS Weekly', 'Classified ad', 'May 19 issue', now_ts + interval '15 days',
 950, 950, 'B2B SaaS', 'US', 52000, '44%', 1, 1, 'live', true,
 '75-word classified in the Jobs & Tools section. Plain text with one URL.',
 ARRAY['Zapier','Linear'], now_ts),

-- Founder HQ
('newsletter', null, 'priya@founderhq.co', 'Priya Sharma', 'Founder HQ',
 'Founder HQ', 'Dedicated send', 'May 14 issue', now_ts + interval '10 days',
 3800, 3800, 'Startup', 'US / UK', 38500, '51%', 1, 1, 'live', true,
 'Full dedicated email send. You provide HTML or we write it for you. Subject line A/B tested. Sent Thursday morning.',
 ARRAY['Brex','Rippling'], now_ts),

('newsletter', null, 'priya@founderhq.co', 'Priya Sharma', 'Founder HQ',
 'Founder HQ', 'Sponsored post', 'May 21 issue', now_ts + interval '17 days',
 1600, 1600, 'Startup', 'US / UK', 38500, '51%', 1, 1, 'live', true,
 '400-word sponsored story with founder angle. Positioned as editorial, not ad.',
 ARRAY['Deel','AngelList'], now_ts),

-- Marketing Brew Co.
('newsletter', null, 'tom@marketingbrew.co', 'Tom Beckett', 'Marketing Brew Co.',
 'Marketing Brew Co.', 'Banner ad', 'May 13 issue', now_ts + interval '9 days',
 1100, 1100, 'Marketing', 'US', 67200, '39%', 1, 1, 'live', true,
 'Header banner (600x200px). Appears above the fold in the top ad slot. Link + UTM provided.',
 ARRAY['Sprout Social','Canva'], now_ts),

('newsletter', null, 'tom@marketingbrew.co', 'Tom Beckett', 'Marketing Brew Co.',
 'Marketing Brew Co.', 'Sponsored post', 'May 20 issue', now_ts + interval '16 days',
 1800, 1800, 'Marketing', 'US', 67200, '39%', 1, 1, 'live', true,
 '500-word sponsored feature. Includes brand logo, headline, body and two CTAs.',
 ARRAY['Semrush','Mailchimp'], now_ts),

-- Fintech Forward
('newsletter', null, 'sarah@fintechfwd.com', 'Sarah Okonkwo', 'Fintech Forward',
 'Fintech Forward', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days',
 2800, 2800, 'Fintech', 'Global', 29800, '47%', 1, 1, 'live', true,
 '500-word sponsored section including product overview, key metrics, and CTA. Reviewed for regulatory compliance.',
 ARRAY['Stripe','Plaid'], now_ts),

('newsletter', null, 'sarah@fintechfwd.com', 'Sarah Okonkwo', 'Fintech Forward',
 'Fintech Forward', 'Newsletter mention', 'May 22 issue', now_ts + interval '18 days',
 800, 800, 'Fintech', 'Global', 29800, '47%', 1, 1, 'live', true,
 'Two-sentence editorial mention in the weekly round-up. Natural, non-promotional tone.',
 ARRAY['Wise','Monzo'], now_ts),

-- Dev Current
('newsletter', null, 'dan@devcurrent.io', 'Dan Morales', 'Dev Current',
 'Dev Current', 'Sponsored post', 'May 12 issue', now_ts + interval '8 days',
 2100, 2100, 'Tech', 'Global', 44100, '43%', 1, 1, 'live', true,
 '450-word technical sponsorship with code snippet option. Developer-authentic tone required.',
 ARRAY['Datadog','Supabase'], now_ts),

('newsletter', null, 'dan@devcurrent.io', 'Dan Morales', 'Dev Current',
 'Dev Current', 'Classified ad', 'May 19 issue', now_ts + interval '15 days',
 700, 700, 'Tech', 'Global', 44100, '43%', 1, 1, 'live', true,
 '80-word tool spotlight in the Dev Tools section. Direct and technical.',
 ARRAY['GitHub','Vercel'], now_ts),

-- Health Pulse
('newsletter', null, 'emma@healthpulsenews.com', 'Emma Lindqvist', 'Health Pulse',
 'Health Pulse', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days',
 1900, 1900, 'Health & Wellness', 'US', 31600, '52%', 1, 1, 'live', true,
 '500-word sponsored feature. Health claims must be evidence-based. Includes disclaimer section.',
 ARRAY['Whoop','Eight Sleep'], now_ts),

('newsletter', null, 'emma@healthpulsenews.com', 'Emma Lindqvist', 'Health Pulse',
 'Health Pulse', 'Banner ad', 'May 21 issue', now_ts + interval '17 days',
 650, 650, 'Health & Wellness', 'US', 31600, '52%', 1, 1, 'live', true,
 'Mid-newsletter banner (600x150px). Clicks tracked with UTM.',
 ARRAY['AG1','Huel'], now_ts),

-- AI Frontier
('newsletter', null, 'raj@aifrontier.email', 'Raj Patel', 'AI Frontier',
 'AI Frontier', 'Sponsored post', 'May 16 issue', now_ts + interval '12 days',
 4200, 4200, 'AI', 'Global', 88400, '48%', 1, 1, 'live', true,
 '600-word AI-native sponsorship. Must demonstrate genuine AI use case. Technical reviewers on editorial team.',
 ARRAY['OpenAI','Anthropic','Scale AI'], now_ts),

('newsletter', null, 'raj@aifrontier.email', 'Raj Patel', 'AI Frontier',
 'AI Frontier', 'Dedicated send', 'May 23 issue', now_ts + interval '19 days',
 9800, 9800, 'AI', 'Global', 88400, '48%', 1, 1, 'live', true,
 'Full dedicated send to 88k AI practitioners. You supply HTML or briefing. Sent Friday AM.',
 ARRAY['Cohere','Weights & Biases'], now_ts),

-- eCommerce Insider
('newsletter', null, 'kate@ecommerceinsider.co', 'Kate Morrison', 'eCommerce Insider',
 'eCommerce Insider', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days',
 1450, 1450, 'eCommerce', 'US / UK', 24300, '46%', 1, 1, 'live', true,
 '400-word DTC-focused sponsorship. Product highlight, founder story, or tool review formats available.',
 ARRAY['Klaviyo','Gorgias'], now_ts),

('newsletter', null, 'kate@ecommerceinsider.co', 'Kate Morrison', 'eCommerce Insider',
 'eCommerce Insider', 'Newsletter mention', 'May 20 issue', now_ts + interval '16 days',
 480, 480, 'eCommerce', 'US / UK', 24300, '46%', 1, 1, 'live', true,
 'Three-sentence brand mention in the Weekly Finds section.',
 ARRAY['Shopify','Recharge'], now_ts),

-- Crypto Digest
('newsletter', null, 'luca@cryptodigest.email', 'Luca Ferretti', 'Crypto Digest',
 'Crypto Digest', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days',
 3100, 3100, 'Crypto', 'Global', 61700, '38%', 1, 1, 'live', true,
 '500-word crypto-native sponsorship. Exchange listings, DeFi protocols, wallets, and infra welcome. No meme coins.',
 ARRAY['Ledger','Coinbase'], now_ts),

('newsletter', null, 'luca@cryptodigest.email', 'Luca Ferretti', 'Crypto Digest',
 'Crypto Digest', 'Banner ad', 'May 21 issue', now_ts + interval '17 days',
 1200, 1200, 'Crypto', 'Global', 61700, '38%', 1, 1, 'live', true,
 'Top-of-newsletter banner (600x200px). Highest-visibility placement in daily digest.',
 ARRAY['Binance','Kraken'], now_ts),

-- HR Leaders
('newsletter', null, 'nina@hrleaders.io', 'Nina Johansson', 'HR Leaders',
 'HR Leaders', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days',
 1750, 1750, 'General', 'US', 19400, '55%', 1, 1, 'live', true,
 '450-word HR-focused sponsorship. HRIS, payroll, benefits, engagement, and compliance tools preferred.',
 ARRAY['Lattice','Workday'], now_ts),

('newsletter', null, 'nina@hrleaders.io', 'Nina Johansson', 'HR Leaders',
 'HR Leaders', 'Classified ad', 'May 22 issue', now_ts + interval '18 days',
 580, 580, 'General', 'US', 19400, '55%', 1, 1, 'live', true,
 '80-word job board listing or tool spotlight in the People Ops Picks section.',
 ARRAY['Culture Amp','Greenhouse'], now_ts),

-- Real Estate Pulse
('newsletter', null, 'alex@realestatepulse.co', 'Alex Chen', 'Real Estate Pulse',
 'Real Estate Pulse', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days',
 1600, 1600, 'General', 'US', 22800, '50%', 1, 1, 'live', true,
 '400-word sponsored feature for proptech, lenders, and services targeting property investors.',
 ARRAY['Roofstock','Fundrise'], now_ts),

('newsletter', null, 'alex@realestatepulse.co', 'Alex Chen', 'Real Estate Pulse',
 'Real Estate Pulse', 'Newsletter mention', 'May 20 issue', now_ts + interval '16 days',
 420, 420, 'General', 'US', 22800, '50%', 1, 1, 'live', true,
 'Two-sentence mention in the Deal of the Week section.',
 ARRAY['Buildium','Yardi'], now_ts),

-- LegalTech Insider
('newsletter', null, 'maya@legaltech.email', 'Maya Thompson', 'LegalTech Insider',
 'LegalTech Insider', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days',
 2200, 2200, 'General', 'US / UK', 16200, '58%', 1, 1, 'live', true,
 '450-word feature for legal tech tools, CLM, e-discovery, or practice management platforms.',
 ARRAY['Clio','Ironclad'], now_ts),

('newsletter', null, 'maya@legaltech.email', 'Maya Thompson', 'LegalTech Insider',
 'LegalTech Insider', 'Banner ad', 'May 22 issue', now_ts + interval '18 days',
 680, 680, 'General', 'US / UK', 16200, '58%', 1, 1, 'live', true,
 'Mid-email banner (600x150px). Targeted at legal professionals and GCs.',
 ARRAY['DocuSign','Relativity'], now_ts),

-- Sustain Biz
('newsletter', null, 'ben@sustainbiz.io', 'Ben Walker', 'Sustain Biz',
 'Sustain Biz', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days',
 1500, 1500, 'General', 'Europe', 27500, '49%', 1, 1, 'live', true,
 '500-word sponsored feature for sustainability tools, ESG data, green finance, or circular economy businesses.',
 ARRAY['Watershed','Persefoni'], now_ts),

('newsletter', null, 'ben@sustainbiz.io', 'Ben Walker', 'Sustain Biz',
 'Sustain Biz', 'Newsletter mention', 'May 21 issue', now_ts + interval '17 days',
 490, 490, 'General', 'Europe', 27500, '49%', 1, 1, 'live', true,
 'Three-sentence mention in the ESG Spotlight section.',
 ARRAY['South Pole','EcoVadis'], now_ts),

-- Remote Work Weekly
('newsletter', null, 'claire@remotework.email', 'Claire Dubois', 'Remote Work Weekly',
 'Remote Work Weekly', 'Sponsored post', 'May 16 issue', now_ts + interval '12 days',
 1850, 1850, 'General', 'Global', 33900, '45%', 1, 1, 'live', true,
 '450-word sponsorship for remote collaboration tools, async platforms, and distributed HR software.',
 ARRAY['Loom','Notion','Doist'], now_ts),

('newsletter', null, 'claire@remotework.email', 'Claire Dubois', 'Remote Work Weekly',
 'Remote Work Weekly', 'Classified ad', 'May 23 issue', now_ts + interval '19 days',
 550, 550, 'General', 'Global', 33900, '45%', 1, 1, 'live', true,
 '80-word tool or job listing in the Remote-First Picks section.',
 ARRAY['Deel','Remote.com'], now_ts),

-- Data Driven
('newsletter', null, 'mario@datadriven.io', 'Mario Russo', 'Data Driven',
 'Data Driven', 'Sponsored post', 'May 12 issue', now_ts + interval '8 days',
 2300, 2300, 'Tech', 'Global', 41200, '42%', 1, 1, 'live', true,
 '500-word technical sponsorship for data tools, cloud data warehouses, BI platforms and analytics infrastructure.',
 ARRAY['dbt Labs','Snowflake'], now_ts),

('newsletter', null, 'mario@datadriven.io', 'Mario Russo', 'Data Driven',
 'Data Driven', 'Banner ad', 'May 19 issue', now_ts + interval '15 days',
 780, 780, 'Tech', 'Global', 41200, '42%', 1, 1, 'live', true,
 'Header banner (600x200px). First visual element readers see.',
 ARRAY['Looker','Metabase'], now_ts),

-- EduTech Weekly
('newsletter', null, 'anna@edutech.email', 'Anna Kowalski', 'EduTech Weekly',
 'EduTech Weekly', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days',
 1300, 1300, 'Education', 'US / UK', 18600, '54%', 1, 1, 'live', true,
 '400-word feature for EdTech products, LMS platforms, corporate training tools and curriculum resources.',
 ARRAY['Teachable','Coursera'], now_ts),

('newsletter', null, 'anna@edutech.email', 'Anna Kowalski', 'EduTech Weekly',
 'EduTech Weekly', 'Newsletter mention', 'May 20 issue', now_ts + interval '16 days',
 390, 390, 'Education', 'US / UK', 18600, '54%', 1, 1, 'live', true,
 'Two-sentence editorial mention in the Learning Picks section.',
 ARRAY['Udemy','Duolingo'], now_ts),

-- VC Memo
('newsletter', null, 'joel@vcmemo.co', 'Joel Hartmann', 'VC Memo',
 'VC Memo', 'Sponsored post', 'May 15 issue', now_ts + interval '11 days',
 3500, 3500, 'Finance', 'US', 14900, '61%', 1, 1, 'live', true,
 '500-word sponsorship targeting VCs, angels and founders. High CPM — premium investor audience.',
 ARRAY['Carta','AngelList'], now_ts),

('newsletter', null, 'joel@vcmemo.co', 'Joel Hartmann', 'VC Memo',
 'VC Memo', 'Classified ad', 'May 22 issue', now_ts + interval '18 days',
 950, 950, 'Finance', 'US', 14900, '61%', 1, 1, 'live', true,
 '80-word fund announcement, job posting, or LP-facing product mention.',
 ARRAY['Foundersuite','Visible.vc'], now_ts),

-- CX Leader
('newsletter', null, 'lisa@cxleader.io', 'Lisa Park', 'CX Leader',
 'CX Leader', 'Sponsored post', 'May 16 issue', now_ts + interval '12 days',
 1650, 1650, 'General', 'US', 21700, '53%', 1, 1, 'live', true,
 '450-word sponsorship for CX/CS software, chatbots, voice of customer, or retention tools.',
 ARRAY['Zendesk','Intercom'], now_ts),

('newsletter', null, 'lisa@cxleader.io', 'Lisa Park', 'CX Leader',
 'CX Leader', 'Newsletter mention', 'May 23 issue', now_ts + interval '19 days',
 420, 420, 'General', 'US', 21700, '53%', 1, 1, 'live', true,
 'Three-sentence mention in the CX Tool of the Week spotlight.',
 ARRAY['Gong','Totango'], now_ts),

-- DevOps Daily
('newsletter', null, 'carlos@devopsdaily.email', 'Carlos Mendez', 'DevOps Daily',
 'DevOps Daily', 'Sponsored post', 'May 13 issue', now_ts + interval '9 days',
 1950, 1950, 'Tech', 'Global', 35800, '40%', 1, 1, 'live', true,
 '500-word technical sponsorship for infra tools, cloud platforms, observability, and security solutions.',
 ARRAY['HashiCorp','Grafana'], now_ts),

('newsletter', null, 'carlos@devopsdaily.email', 'Carlos Mendez', 'DevOps Daily',
 'DevOps Daily', 'Banner ad', 'May 20 issue', now_ts + interval '16 days',
 720, 720, 'Tech', 'Global', 35800, '40%', 1, 1, 'live', true,
 'Top-of-email banner (600x200px). First position in daily digest.',
 ARRAY['Datadog','PagerDuty'], now_ts),

-- Climate Tech Insider
('newsletter', null, 'zoe@climatetech.email', 'Zoe Andersen', 'Climate Tech Insider',
 'Climate Tech Insider', 'Sponsored post', 'May 14 issue', now_ts + interval '10 days',
 1700, 1700, 'General', 'Global', 23100, '56%', 1, 1, 'live', true,
 '450-word feature for climate tech companies, clean energy, carbon markets, EV infrastructure or impact investors.',
 ARRAY['Climeworks','ChargePoint'], now_ts),

('newsletter', null, 'zoe@climatetech.email', 'Zoe Andersen', 'Climate Tech Insider',
 'Climate Tech Insider', 'Newsletter mention', 'May 21 issue', now_ts + interval '17 days',
 520, 520, 'General', 'Global', 23100, '56%', 1, 1, 'live', true,
 'Two-sentence mention in the Deal Flow section for climate tech companies.',
 ARRAY['Breakthrough Energy','Lowercarbon Capital'], now_ts);

END $$;
