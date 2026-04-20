/*
  # Seed 10 Rich Media Profiles for Buyer Discovery (v2)

  ## Summary
  Creates 10 fully-detailed media profiles using null seller_user_id (same pattern as existing profiles).
  Each profile represents a real-feeling newsletter publisher with:
  - Full tagline, category, and audience summary
  - Subscriber count, open rate, and publishing frequency
  - Ad formats and past advertisers (social proof)
  - Website, sample issue, and logo URLs
*/

INSERT INTO media_profiles (
  id,
  seller_user_id,
  seller_email,
  newsletter_name,
  tagline,
  category,
  audience_summary,
  primary_geography,
  audience_type,
  subscriber_count,
  open_rate,
  publishing_frequency,
  ad_formats,
  past_advertisers,
  media_kit_url,
  sample_issue_url,
  website_url,
  logo_url,
  cover_image_url,
  is_active
) VALUES

-- 1. SaaS Growth Weekly
(
  'b1000001-0000-0000-0000-000000000001',
  NULL,
  'ads@saasgrowthweekly.com',
  'SaaS Growth Weekly',
  'The go-to briefing for B2B SaaS growth, GTM, and retention',
  'SaaS & Technology',
  'Primarily B2B SaaS founders, heads of growth, and revenue operators at companies from seed to Series B. Readers skew 25–44, based in the US and UK. High purchase intent — 67% have made a software buying decision in the past 90 days.',
  'United States',
  'B2B SaaS founders & growth teams',
  48000,
  '46%',
  'Weekly (every Tuesday)',
  ARRAY['Dedicated send', 'Primary sponsor', 'Native editorial', 'Job listings'],
  ARRAY['HubSpot', 'Intercom', 'Notion', 'Close CRM', 'Loom'],
  'https://saasgrowthweekly.com/media-kit',
  'https://saasgrowthweekly.com/issues/latest',
  'https://saasgrowthweekly.com',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 2. The Founder Brief
(
  'b1000002-0000-0000-0000-000000000002',
  NULL,
  'partner@thefounderbrief.com',
  'The Founder Brief',
  'Twice-weekly intelligence for startup founders — fundraising, hiring, and growth',
  'Startups & Venture',
  'Early and growth-stage startup founders, angel investors, and startup operators. Globally distributed with heavy readership in the US, UK, and Israel. 58% are at pre-Series B companies. Highly engaged with sponsor content that solves founder-specific problems.',
  'United States / United Kingdom',
  'Startup founders & investors',
  32000,
  '41%',
  'Twice weekly (Tue & Thu)',
  ARRAY['Primary sponsor', 'Secondary sponsor', 'Exclusive sponsorship', 'Podcast mention'],
  ARRAY['Stripe', 'Linear', 'Loom', 'Mercury Bank', 'Deel'],
  'https://thefounderbrief.com/advertise',
  'https://thefounderbrief.com/issues/sample',
  'https://thefounderbrief.com',
  'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 3. AI Daily
(
  'b1000003-0000-0000-0000-000000000003',
  NULL,
  'sponsor@aidaily.news',
  'AI Daily',
  'The most-read AI newsletter for researchers, engineers, and product builders',
  'Artificial Intelligence',
  'ML engineers, AI researchers, LLM product managers, and data scientists — primarily at tech companies and research labs. 72k subscribers with an unusually high open rate for the category. 84% have direct influence over AI tool purchases.',
  'United States',
  'AI & ML professionals',
  72000,
  '45%',
  'Daily (Mon–Fri)',
  ARRAY['Banner ad', 'Classifieds', 'Dedicated send', 'Sponsored deep-dive'],
  ARRAY['OpenAI', 'Anthropic', 'Cohere', 'Weights & Biases', 'Hugging Face'],
  'https://aidaily.news/media-kit.pdf',
  'https://aidaily.news/archive/latest',
  'https://aidaily.news',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 4. eCommerce Insider
(
  'b1000004-0000-0000-0000-000000000004',
  NULL,
  'hello@ecommerceinsider.io',
  'eCommerce Insider',
  'Tactical weekly for DTC brands, Shopify operators, and e-commerce growth teams',
  'eCommerce & DTC',
  'D2C brand founders, Shopify store owners, e-commerce agency operators, and heads of digital at established retail brands. 61k subscribers. US-heavy (74%). High spend on tools — average reader uses 8+ software tools monthly for their e-commerce stack.',
  'United States',
  'DTC founders & eCommerce operators',
  61000,
  '43%',
  'Weekly (every Wednesday)',
  ARRAY['Primary sponsor', 'Secondary sponsor', 'Advertorial', 'Job board post'],
  ARRAY['Klaviyo', 'Gorgias', 'Recharge', 'Postscript', 'Triple Whale'],
  'https://ecommerceinsider.io/media-kit',
  'https://ecommerceinsider.io/sample',
  'https://ecommerceinsider.io',
  'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 5. TechPulse
(
  'b1000005-0000-0000-0000-000000000005',
  NULL,
  'ads@techpulsehq.com',
  'TechPulse',
  'Weekly engineering and dev-tools briefing for software engineers and CTOs',
  'Engineering & Dev Tools',
  'Senior software engineers, engineering managers, and CTOs — predominantly at US tech companies and scale-ups. 53k subscribers. 79% have direct influence on dev-tool purchasing. Readers cite TechPulse as a primary source for evaluating new developer infrastructure.',
  'United States',
  'Software engineers & CTOs',
  53000,
  '40%',
  'Weekly (every Thursday)',
  ARRAY['Banner placement', 'Classifieds', 'Dedicated issue', 'Event sponsor'],
  ARRAY['GitHub', 'Vercel', 'PlanetScale', 'Railway', 'Fly.io'],
  'https://techpulsehq.com/advertise',
  'https://techpulsehq.com/issue/latest',
  'https://techpulsehq.com',
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 6. Irish Tech Digest
(
  'b1000006-0000-0000-0000-000000000006',
  NULL,
  'partner@irishtechdigest.ie',
  'Irish Tech Digest',
  'Ireland''s most-read tech newsletter — founders, investors, operators',
  'Startups & Technology',
  'Irish and diaspora tech professionals — startup founders, investors, tech leads, and enterprise executives in Dublin, London, and New York. Strong event attendance. High trust in sponsor recommendations. Average reader income >€80k. Very engaged community.',
  'Ireland / United Kingdom / United States',
  'Irish tech professionals & founders',
  14500,
  '52%',
  'Weekly (every Monday)',
  ARRAY['Sponsored article', 'Banner ad', 'Job board post', 'Event partner'],
  ARRAY['Workable', 'Flipdish', 'Wayflyer', 'Stripe', 'HubSpot'],
  'https://irishtechdigest.ie/media-kit.pdf',
  'https://irishtechdigest.ie/latest',
  'https://irishtechdigest.ie',
  'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 7. Growth Dispatch
(
  'b1000007-0000-0000-0000-000000000007',
  NULL,
  'advertise@growthdispatch.io',
  'Growth Dispatch',
  'Performance marketing intelligence for growth practitioners and CMOs',
  'Marketing & Growth',
  'Performance marketers, growth leads, paid acquisition specialists, and CMOs at DTC and B2B brands. 39k subscribers. US-dominated (81%). Readers spend an average of $2.3M/yr on digital advertising. Very high ROI on tool and platform advertising.',
  'United States',
  'Performance marketers & CMOs',
  39000,
  '44%',
  'Twice weekly (Mon & Wed)',
  ARRAY['Primary sponsor', 'Takeover send', 'Native ad', 'Classifieds'],
  ARRAY['Triple Whale', 'Northbeam', 'Rockerbox', 'AdRoll', 'Attentive'],
  'https://growthdispatch.io/partner',
  'https://growthdispatch.io/issue/sample',
  'https://growthdispatch.io',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/3183190/pexels-photo-3183190.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 8. Product Pulse
(
  'b1000008-0000-0000-0000-000000000008',
  NULL,
  'hello@productpulse.media',
  'Product Pulse',
  'Weekly product briefing for PMs, designers, and UX researchers',
  'Product & Design',
  'Product managers, UX designers, product designers, and UX researchers — primarily at tech companies from Series A to public. 37k subscribers. US and Europe split 60/40. Very high engagement with tool comparisons, walkthroughs, and sponsored content that includes demos.',
  'United States / Europe',
  'Product managers & UX professionals',
  37000,
  '43%',
  'Weekly (every Wednesday)',
  ARRAY['Primary sponsor', 'Tool spotlight', 'Newsletter takeover', 'Classifieds'],
  ARRAY['Figma', 'Miro', 'ProductBoard', 'Amplitude', 'Dovetail'],
  'https://productpulse.media/advertise',
  'https://productpulse.media/latest',
  'https://productpulse.media',
  'https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 9. FinFlash Weekly
(
  'b1000009-0000-0000-0000-000000000009',
  NULL,
  'ads@finflashweekly.com',
  'FinFlash Weekly',
  'UK fintech and investing news for forward-thinking finance professionals',
  'Finance & Fintech',
  'Fintech founders, retail investors, banking professionals, and financial services executives in the UK and Europe. 27k subscribers. High-income readership — 61% earn >£80k/yr. Strong engagement with sponsored content from regulated financial and fintech businesses.',
  'United Kingdom',
  'Fintech professionals & retail investors',
  27000,
  '38%',
  'Weekly (every Friday)',
  ARRAY['Sponsored article', 'Banner placement', 'Classified listing', 'Lead magnet co-promotion'],
  ARRAY['Revolut', 'Monzo', 'Wise', 'Starling Bank', 'Freetrade'],
  'https://finflashweekly.com/media-kit',
  'https://finflashweekly.com/issues/sample',
  'https://finflashweekly.com',
  'https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/259249/pexels-photo-259249.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
),

-- 10. Dev Dispatch
(
  'b1000010-0000-0000-0000-000000000010',
  NULL,
  'partner@devdispatch.dev',
  'Dev Dispatch',
  'The weekly roundup for full-stack developers, open-source builders, and engineering leads',
  'Engineering & Dev Tools',
  'Full-stack developers, backend engineers, open-source contributors, and engineering leads at companies ranging from early startups to FAANG. Global readership across US, Europe, India, and APAC. 44k subscribers. 89% have tried a new dev tool in the past month.',
  'Global',
  'Full-stack developers & engineering leads',
  44000,
  '41%',
  'Weekly (every Thursday)',
  ARRAY['Sponsor placement', 'Dedicated send', 'Classified', 'Open-source sponsorship'],
  ARRAY['Supabase', 'Railway', 'Fly.io', 'Neon', 'Clerk'],
  'https://devdispatch.dev/partner',
  'https://devdispatch.dev/issues/latest',
  'https://devdispatch.dev',
  'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800',
  true
)

ON CONFLICT (id) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  category = EXCLUDED.category,
  audience_summary = EXCLUDED.audience_summary,
  primary_geography = EXCLUDED.primary_geography,
  audience_type = EXCLUDED.audience_type,
  subscriber_count = EXCLUDED.subscriber_count,
  open_rate = EXCLUDED.open_rate,
  publishing_frequency = EXCLUDED.publishing_frequency,
  ad_formats = EXCLUDED.ad_formats,
  past_advertisers = EXCLUDED.past_advertisers,
  media_kit_url = EXCLUDED.media_kit_url,
  sample_issue_url = EXCLUDED.sample_issue_url,
  website_url = EXCLUDED.website_url,
  logo_url = EXCLUDED.logo_url,
  cover_image_url = EXCLUDED.cover_image_url,
  is_active = EXCLUDED.is_active,
  updated_at = now();
