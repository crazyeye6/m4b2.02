/*
  # Seed rich podcast listings with varied urgency tiers

  Adds 15 realistic podcast ad slot listings with:
  - Varied deadline urgency: <24h (last_chance), 2–4 days (mid), 5–7 days (early), 10–14 days (no discount)
  - Full field coverage: downloads, ad_slot_position, slot_type, deliverable, audience, location, date_label,
    posting_date_start, past_advertisers, host_name, slots_remaining, slots_total
  - Wide niche variety: SaaS, AI, Fintech, Health, Startup, Gaming, Creator Economy, True Crime, etc.
  - Realistic CPMs and pricing tiers
  - auto_discount_enabled = true so dynamic pricing applies
*/

INSERT INTO listings (
  media_type, property_name, host_name, slot_type, ad_slot_position, deliverable,
  audience, location, downloads, original_price, discounted_price,
  slots_remaining, slots_total, deadline_at, posting_date_start, date_label,
  past_advertisers, status, auto_discount_enabled
) VALUES

-- LAST CHANCE tier (deadline < 24h from now)
(
  'podcast', 'The SaaS Operator', 'Tom Whitfield',
  'Mid-roll', 'Mid-roll', 'Host-read 60s',
  'SaaS founders & operators', 'US',
  58000, 1850, 1850,
  1, 3, NOW() + INTERVAL '18 hours', '2026-05-03',
  'Episode 211 – 3 May 2026',
  ARRAY['Linear', 'Intercom', 'Loom', 'Paddle'],
  'live', true
),
(
  'podcast', 'AI Frontier Pod', 'Priya Nair',
  'Pre-roll', 'Pre-roll', 'Pre-roll 30s',
  'AI researchers & ML engineers', 'Global',
  104000, 3200, 3200,
  1, 2, NOW() + INTERVAL '10 hours', '2026-05-04',
  'Episode 95 – 4 May 2026',
  ARRAY['Weights & Biases', 'Replit', 'Modal'],
  'live', true
),

-- MID tier (deadline 2–4 days)
(
  'podcast', 'Fintech Founders Podcast', 'Sarah Chen',
  'Pre-roll', 'Pre-roll', 'Pre-roll 30s',
  'Fintech & payments professionals', 'UK',
  31000, 1800, 1800,
  1, 1, NOW() + INTERVAL '2 days 6 hours', '2026-05-06',
  'Episode 122 – 6 May 2026',
  ARRAY['Stripe', 'Monzo', 'Revolut'],
  'live', true
),
(
  'podcast', 'Growth Operators Podcast', 'Marcus Reid',
  'Mid-roll', 'Mid-roll', 'Host-read 90s',
  'Growth marketers & revenue teams', 'US',
  24000, 980, 980,
  2, 3, NOW() + INTERVAL '3 days 4 hours', '2026-05-07',
  'Episode 155 – 7 May 2026',
  ARRAY['HubSpot', 'Zapier', 'Close CRM'],
  'live', true
),
(
  'podcast', 'Deep Work Daily', 'Elena Vasquez',
  'Mid-roll', 'Mid-roll', 'Produced 45s',
  'Knowledge workers & productivity enthusiasts', 'Global',
  42000, 2200, 2200,
  1, 1, NOW() + INTERVAL '3 days 18 hours', '2026-05-07',
  'Episode 318 – 7 May 2026',
  ARRAY['Superhuman', 'Sunsama', 'Readwise'],
  'live', true
),

-- EARLY tier (deadline 5–7 days)
(
  'podcast', 'Venture Backed Podcast', 'David Okoye',
  'Pre-roll', 'Pre-roll', 'Pre-roll 30s',
  'Startup founders & early-stage investors', 'US',
  15500, 850, 850,
  1, 2, NOW() + INTERVAL '5 days 12 hours', '2026-05-10',
  'Episode 71 – 10 May 2026',
  ARRAY['AngelList', 'Brex', 'Mercury'],
  'live', true
),
(
  'podcast', 'Indie Hacker Hour', 'Jake Morrison',
  'Post-roll', 'Post-roll', 'Produced 30s',
  'Solo founders & bootstrappers', 'Global',
  6800, 290, 290,
  1, 1, NOW() + INTERVAL '6 days', '2026-05-11',
  'Episode 61 – 11 May 2026',
  ARRAY['Notion', 'Bubble'],
  'live', true
),
(
  'podcast', 'Creator Economy Weekly', 'Jess Park',
  'Mid-roll', 'Mid-roll', 'Host-read 60s',
  'Content creators & YouTubers', 'US',
  38000, 1600, 1600,
  2, 3, NOW() + INTERVAL '7 days', '2026-05-12',
  'Episode 88 – 12 May 2026',
  ARRAY['Beehiiv', 'Kajabi', 'ConvertKit'],
  'live', true
),

-- NO DISCOUNT tier (deadline 10–14 days)
(
  'podcast', 'AI Builders Weekly', 'Priya Nair',
  'Pre-roll', 'Pre-roll', 'Pre-roll 30s',
  'AI developers & ML practitioners', 'Global',
  9500, 380, 380,
  1, 1, NOW() + INTERVAL '11 days', '2026-05-16',
  'Episode 89 – 16 May 2026',
  ARRAY['Weights & Biases', 'Replit'],
  'live', true
),
(
  'podcast', 'The Health Stack', 'Dr. Nina Cho',
  'Mid-roll', 'Mid-roll', 'Host-read 60s',
  'Health professionals & biohackers', 'US',
  22000, 1200, 1200,
  2, 3, NOW() + INTERVAL '12 days', '2026-05-17',
  'Episode 44 – 17 May 2026',
  ARRAY['Athletic Greens', 'Eight Sleep', 'Levels Health'],
  'live', true
),
(
  'podcast', 'DevUncensored', 'Liam O''Sullivan',
  'Pre-roll', 'Pre-roll', 'Pre-roll 15s',
  'Software engineers & developers', 'Global',
  77000, 2800, 2800,
  1, 2, NOW() + INTERVAL '13 days', '2026-05-18',
  'Episode 209 – 18 May 2026',
  ARRAY['GitHub', 'Vercel', 'Sentry', 'Datadog'],
  'live', true
),
(
  'podcast', 'The Bootstrapped Founder', 'Arvid Kahl',
  'Post-roll', 'Post-roll', 'Produced 45s',
  'Bootstrapped founders & micro-SaaS builders', 'Global',
  12000, 520, 520,
  3, 3, NOW() + INTERVAL '14 days', '2026-05-19',
  'Episode 192 – 19 May 2026',
  ARRAY['Podia', 'Gumroad', 'Lemon Squeezy'],
  'live', true
),
(
  'podcast', 'True Crime Obsessed', 'Hannah Wells',
  'Mid-roll', 'Mid-roll', 'Host-read 90s',
  'True crime fans 25–45F', 'US',
  185000, 6500, 6500,
  1, 1, NOW() + INTERVAL '14 days', '2026-05-19',
  'Episode 301 – 19 May 2026',
  ARRAY['HelloFresh', 'BetterHelp', 'SimpliSafe'],
  'live', true
),
(
  'podcast', 'The Gaming Startup Pod', 'Raj Mehta',
  'Pre-roll', 'Pre-roll', 'Pre-roll 30s',
  'Game developers & studio founders', 'Global',
  8200, 340, 340,
  2, 3, NOW() + INTERVAL '14 days', '2026-05-20',
  'Episode 38 – 20 May 2026',
  ARRAY['Unity', 'Discord'],
  'live', true
),
(
  'podcast', 'Climate Tech Weekly', 'Sofia Andersen',
  'Mid-roll', 'Mid-roll', 'Host-read 60s',
  'Climate investors & sustainability professionals', 'Global',
  17500, 950, 950,
  1, 2, NOW() + INTERVAL '13 days', '2026-05-18',
  'Episode 56 – 18 May 2026',
  ARRAY['Climeworks', 'Pachama', 'Patch'],
  'live', true
);
