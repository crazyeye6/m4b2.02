/*
  # Seed Media Profiles Dummy Data

  1. Summary
    Inserts 12 realistic dummy media profiles representing a variety of newsletter publishers
    across different niches, geographies, and audience sizes.

  2. Profiles Added
    - The Fintech Briefing (Finance, US, 85k subs)
    - Founder's Edge (Business, Global, 42k subs)
    - Climate Signal (Sustainability, Europe, 31k subs)
    - Dev Digest (Technology, Global, 120k subs)
    - Health Insider (Health & Wellness, US, 67k subs)
    - The Marketing Lab (Marketing, US/UK, 54k subs)
    - AI Weekly (Technology/AI, Global, 210k subs)
    - Real Estate Rundown (Real Estate, US, 28k subs)
    - Crypto Currents (Crypto & Web3, Global, 93k subs)
    - Future of Work (Human Resources, Global, 38k subs)
    - Food & Bev Insider (Food & Beverage, US, 19k subs)
    - The Legal Brief (Legal, US, 22k subs)

  3. Notes
    - seller_user_id is NULL (seed data, no linked auth user)
    - Empty strings used for optional URL fields (media_kit_url, sample_issue_url)
    - All profiles are marked active (is_active = true)
    - Pexels image URLs used for logos and cover images
*/

INSERT INTO media_profiles (
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
  is_active,
  created_at,
  updated_at
) VALUES

(
  NULL,
  'hello@fintechbriefing.com',
  'The Fintech Briefing',
  'The pulse of financial technology, delivered weekdays',
  'Finance',
  'Senior finance professionals, fintech founders, and investors who need sharp, actionable insights on payments, banking tech, and capital markets.',
  'United States',
  'B2B',
  85000,
  '42%',
  'Daily (weekdays)',
  ARRAY['Sponsored Article', 'Top Banner Ad', 'Dedicated Send'],
  ARRAY['Stripe', 'Brex', 'Mercury', 'Ramp'],
  '',
  '',
  'https://fintechbriefing.com',
  'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '90 days',
  now() - interval '2 days'
),

(
  NULL,
  'team@foundersedge.co',
  'Founder''s Edge',
  'Tactical playbooks for builders and operators',
  'Business',
  'Early-stage and growth-stage founders, operators, and startup employees looking for hands-on frameworks to scale their companies.',
  'Global',
  'B2B',
  42000,
  '51%',
  'Weekly',
  ARRAY['Sponsored Article', 'Job Board Listing', 'Product Spotlight'],
  ARRAY['Notion', 'Linear', 'Lemon Squeezy', 'Beehiiv'],
  '',
  '',
  'https://foundersedge.co',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '80 days',
  now() - interval '5 days'
),

(
  NULL,
  'editor@climatesignal.io',
  'Climate Signal',
  'The sustainability newsletter for business leaders',
  'Sustainability',
  'ESG officers, sustainability managers, impact investors, and policy professionals across Europe and beyond.',
  'Europe',
  'B2B',
  31000,
  '48%',
  'Weekly',
  ARRAY['Sponsored Article', 'Event Promotion', 'Top Banner Ad'],
  ARRAY['Patagonia', 'Too Good To Go', 'Ecosia'],
  '',
  '',
  'https://climatesignal.io',
  'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '70 days',
  now() - interval '1 day'
),

(
  NULL,
  'hi@devdigest.dev',
  'Dev Digest',
  'The weekly roundup for software engineers',
  'Technology',
  'Software engineers, engineering managers, and CTOs who want curated links, tutorials, and industry news without the noise.',
  'Global',
  'B2C',
  120000,
  '38%',
  'Weekly',
  ARRAY['Sponsored Article', 'Top Banner Ad', 'Classified Ad', 'Dedicated Send'],
  ARRAY['GitHub', 'Vercel', 'Supabase', 'Cloudflare', 'PlanetScale'],
  '',
  '',
  'https://devdigest.dev',
  'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '120 days',
  now() - interval '3 days'
),

(
  NULL,
  'contact@healthinsidernews.com',
  'Health Insider',
  'Evidence-based health and wellness for modern professionals',
  'Health & Wellness',
  'Health-conscious professionals, clinicians, and wellness entrepreneurs seeking research-backed content on nutrition, fitness, and longevity.',
  'United States',
  'B2C',
  67000,
  '44%',
  'Twice a week',
  ARRAY['Sponsored Article', 'Product Spotlight', 'Top Banner Ad'],
  ARRAY['Whoop', 'Eight Sleep', 'AG1', 'Levels Health'],
  '',
  '',
  'https://healthinsidernews.com',
  'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '100 days',
  now() - interval '4 days'
),

(
  NULL,
  'ads@themarketinglab.io',
  'The Marketing Lab',
  'Growth tactics and campaign breakdowns for marketers',
  'Marketing',
  'Performance marketers, growth leads, and brand managers at DTC and SaaS companies looking to sharpen their acquisition and retention strategies.',
  'United States & United Kingdom',
  'B2B',
  54000,
  '46%',
  'Weekly',
  ARRAY['Sponsored Article', 'Case Study Feature', 'Top Banner Ad', 'Dedicated Send'],
  ARRAY['Klaviyo', 'Triple Whale', 'Northbeam', 'Attentive'],
  '',
  '',
  'https://themarketinglab.io',
  'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '60 days',
  now() - interval '6 days'
),

(
  NULL,
  'sponsor@aiweekly.news',
  'AI Weekly',
  'The most-read AI newsletter for practitioners and leaders',
  'Technology',
  'AI researchers, ML engineers, product managers, and executives tracking the frontier of artificial intelligence across research, tooling, and applications.',
  'Global',
  'B2B',
  210000,
  '39%',
  'Weekly',
  ARRAY['Sponsored Article', 'Top Banner Ad', 'Dedicated Send', 'Classified Ad'],
  ARRAY['OpenAI', 'Anthropic', 'Cohere', 'Weights & Biases', 'Hugging Face'],
  '',
  '',
  'https://aiweekly.news',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '150 days',
  now() - interval '1 day'
),

(
  NULL,
  'partnerships@reroundup.com',
  'Real Estate Rundown',
  'Market data and deal flow for real estate professionals',
  'Real Estate',
  'Real estate investors, agents, brokers, and developers following residential and commercial market trends across major US metros.',
  'United States',
  'B2B',
  28000,
  '52%',
  'Weekly',
  ARRAY['Sponsored Article', 'Listing Spotlight', 'Top Banner Ad'],
  ARRAY['Roofstock', 'Arrived', 'Fundrise'],
  '',
  '',
  'https://reroundup.com',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '55 days',
  now() - interval '7 days'
),

(
  NULL,
  'hello@cryptocurrents.xyz',
  'Crypto Currents',
  'Cutting through the noise in crypto and Web3',
  'Crypto & Web3',
  'Crypto traders, DeFi participants, NFT collectors, and Web3 builders who need clear, jargon-free analysis of on-chain developments.',
  'Global',
  'B2C',
  93000,
  '41%',
  'Daily (weekdays)',
  ARRAY['Sponsored Article', 'Top Banner Ad', 'Dedicated Send', 'Product Spotlight'],
  ARRAY['Ledger', 'Coinbase', 'Alchemy', 'Phantom'],
  '',
  '',
  'https://cryptocurrents.xyz',
  'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '85 days',
  now() - interval '2 days'
),

(
  NULL,
  'ads@futureofwork.email',
  'Future of Work',
  'Navigating the new world of distributed work and talent',
  'Human Resources',
  'HR leaders, people ops professionals, remote team managers, and founders building distributed companies and shaping workplace culture.',
  'Global',
  'B2B',
  38000,
  '49%',
  'Weekly',
  ARRAY['Sponsored Article', 'Job Board Listing', 'Top Banner Ad'],
  ARRAY['Deel', 'Remote', 'Rippling', 'Lattice'],
  '',
  '',
  'https://futureofwork.email',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '65 days',
  now() - interval '8 days'
),

(
  NULL,
  'partner@foodbevinsider.com',
  'Food & Bev Insider',
  'Trends, brands, and business intelligence for the food industry',
  'Food & Beverage',
  'Food founders, CPG brand managers, retail buyers, and investors tracking emerging trends in food, beverage, and consumer packaged goods.',
  'United States',
  'B2B',
  19000,
  '55%',
  'Weekly',
  ARRAY['Sponsored Article', 'Brand Spotlight', 'Top Banner Ad'],
  ARRAY['Oatly', 'Liquid Death', 'Magic Spoon'],
  '',
  '',
  'https://foodbevinsider.com',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '40 days',
  now() - interval '3 days'
),

(
  NULL,
  'hello@legalbrief.law',
  'The Legal Brief',
  'Plain-English legal intelligence for business professionals',
  'Legal',
  'In-house counsel, compliance officers, legal ops professionals, and business leaders who need to stay current on regulatory changes and legal strategy.',
  'United States',
  'B2B',
  22000,
  '53%',
  'Weekly',
  ARRAY['Sponsored Article', 'Top Banner Ad', 'Classified Ad'],
  ARRAY['Clio', 'ContractPodAi', 'Ironclad'],
  '',
  '',
  'https://legalbrief.law',
  'https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?auto=compress&cs=tinysrgb&w=1200',
  true,
  now() - interval '35 days',
  now() - interval '5 days'
);
