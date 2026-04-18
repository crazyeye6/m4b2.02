/*
  # Seed 24 Newsletter Dummy Listings

  Inserts 24 realistic newsletter-only dummy listings to populate the marketplace.
  All are status='live', no seller_user_id (anonymous/demo data).
  Variety of niches, geographies, slot types, pricing, and deadlines spread across
  the next 2–5 weeks to keep the marketplace looking active.
*/

INSERT INTO listings (
  media_type, media_owner_name, media_company_name, property_name,
  audience, location, subscribers, open_rate, ctr,
  slot_type, date_label, posting_date_start, deadline_at,
  original_price, discounted_price, slots_remaining, slots_total,
  past_advertisers, status,
  seller_bio, seller_website_url
) VALUES

/* 1 */
('newsletter','Sarah Mitchell','Northfield Media','SaaS Growth Weekly',
 'B2B SaaS founders and growth marketers','US',48000,'46%','4.1%',
 'Featured sponsor','Thursday 25 Apr 2026','2026-04-25','2026-04-23 17:00:00+00',
 1200,840,2,2,
 ARRAY['HubSpot','Intercom','Notion'],'live',
 'SaaS Growth Weekly delivers tactical growth insights to 48k SaaS operators every Thursday.','https://saasgrowthweekly.com'),

/* 2 */
('newsletter','James Callahan','Callahan Publishing','The Founder Brief',
 'Early-stage startup founders and investors','US / UK',32000,'41%','3.8%',
 'Dedicated send','Tuesday 29 Apr 2026','2026-04-29','2026-04-27 18:00:00+00',
 900,630,1,1,
 ARRAY['Stripe','Linear','Loom'],'live',
 'The Founder Brief is a twice-weekly read for 32k early-stage builders.','https://thefounderbrief.co'),

/* 3 */
('newsletter','Emma Ryan','Dublin Digital','Irish Tech Digest',
 'Irish tech professionals and startup community','Ireland / UK / US',14500,'52%','5.2%',
 'Banner + mention','Wednesday 30 Apr 2026','2026-04-30','2026-04-28 12:00:00+00',
 400,280,3,3,
 ARRAY['Workable','Flipdish','Wayflyer'],'live',
 'The go-to weekly digest for Ireland''s thriving tech and startup scene.','https://irishtechdigest.ie'),

/* 4 */
('newsletter','Marcus Webb','FinFlash Media','FinFlash Weekly',
 'Fintech professionals and retail investors','UK',27000,'38%','3.3%',
 'Featured sponsor','Friday 2 May 2026','2026-05-02','2026-04-30 17:00:00+00',
 800,560,1,2,
 ARRAY['Revolut','Monzo','Wise'],'live',
 'FinFlash Weekly cuts through the noise in UK fintech every Friday.','https://finflash.co.uk'),

/* 5 */
('newsletter','Priya Nair','Ecom Insider','eCommerce Insider',
 'DTC brand owners and eCommerce operators','US',61000,'43%','4.6%',
 'Native ad','Thursday 1 May 2026','2026-05-01','2026-04-29 20:00:00+00',
 1500,1050,1,1,
 ARRAY['Klaviyo','Gorgias','Recharge'],'live',
 'eCommerce Insider serves 61k DTC operators with weekly strategy, tools, and case studies.','https://ecominsider.io'),

/* 6 */
('newsletter','Tom Berger','Growth Dispatch','Growth Dispatch',
 'Performance marketers and growth professionals','US',39000,'44%','4.0%',
 'Solo blast','Monday 5 May 2026','2026-05-05','2026-05-03 18:00:00+00',
 2200,1540,1,1,
 ARRAY['Triple Whale','Northbeam','Rockerbox'],'live',
 'Growth Dispatch is a no-fluff weekly for 39k performance marketers.','https://growthdispatch.io'),

/* 7 */
('newsletter','Aoife Brennan','Northstar Media','Northstar Newsletter',
 'B2B marketers and content professionals','UK / Europe',21000,'39%','3.5%',
 'Footer sponsor','Tuesday 6 May 2026','2026-05-06','2026-05-04 16:00:00+00',
 350,245,2,4,
 ARRAY['Semrush','Ahrefs','Canva'],'live',
 'Northstar Newsletter helps B2B marketers stay ahead of algorithm and content trends.','https://northstarnews.co'),

/* 8 */
('newsletter','Liam O''Brien','TechPulse HQ','TechPulse',
 'Software engineers and CTOs','US',53000,'40%','3.9%',
 'Featured sponsor','Wednesday 7 May 2026','2026-05-07','2026-05-05 18:00:00+00',
 1800,1260,1,2,
 ARRAY['GitHub','Vercel','PlanetScale'],'live',
 'TechPulse delivers curated engineering news and tooling tips to 53k developers weekly.','https://techpulse.dev'),

/* 9 */
('newsletter','Clara Schmidt','Wellness Weekly HQ','Wellness Weekly',
 'Health-conscious consumers and wellness practitioners','Europe',18000,'55%','5.8%',
 'Banner + mention','Thursday 8 May 2026','2026-05-08','2026-05-06 12:00:00+00',
 500,350,2,2,
 ARRAY['AG1','Huel','Whoop'],'live',
 'Wellness Weekly is Europe''s fastest-growing health and longevity newsletter.','https://wellnessweekly.eu'),

/* 10 */
('newsletter','Dan Fitzpatrick','CFO Lens','CFO Lens',
 'Finance directors and CFOs at mid-market companies','US / UK',11000,'48%','4.4%',
 'Dedicated send','Friday 9 May 2026','2026-05-09','2026-05-07 17:00:00+00',
 600,420,1,1,
 ARRAY['Brex','Ramp','Airbase'],'live',
 'CFO Lens is a premium weekly read for senior finance leaders navigating growth.','https://cfolens.com'),

/* 11 */
('newsletter','Nina Patel','Crypto Clarity Media','Crypto Clarity',
 'Retail and institutional crypto investors','Global',34000,'37%','3.2%',
 'Native ad','Monday 12 May 2026','2026-05-12','2026-05-10 20:00:00+00',
 700,490,2,2,
 ARRAY['Coinbase','Ledger','Kraken'],'live',
 'Crypto Clarity cuts through noise for 34k crypto investors every Monday.','https://cryptoclarity.io'),

/* 12 */
('newsletter','Ben Lawson','AI Daily Corp','AI Daily',
 'AI researchers, ML engineers, and product teams','US',72000,'45%','4.7%',
 'Featured sponsor','Tuesday 13 May 2026','2026-05-13','2026-05-11 18:00:00+00',
 2500,1750,1,1,
 ARRAY['OpenAI','Anthropic','Cohere'],'live',
 'AI Daily is the most-read AI newsletter for practitioners — 72k subscribers strong.','https://aidaily.co'),

/* 13 */
('newsletter','Sophie Turner','Retail Edge HQ','Retail Edge',
 'Retail buyers and brand managers','UK',16000,'42%','3.7%',
 'Banner + mention','Wednesday 14 May 2026','2026-05-14','2026-05-12 14:00:00+00',
 380,266,3,3,
 ARRAY['Shopify','BigCommerce','Akeneo'],'live',
 'Retail Edge keeps 16k brand managers up to date with UK retail trends.','https://retailedge.co.uk'),

/* 14 */
('newsletter','Carlos Rivera','Latam Startup Weekly','Latam Startup Weekly',
 'Startup founders and VCs in Latin America','LATAM',9500,'50%','5.0%',
 'Featured sponsor','Thursday 15 May 2026','2026-05-15','2026-05-13 18:00:00+00',
 300,210,2,2,
 ARRAY['Kavak','Nubank','Mercado Libre'],'live',
 'The premier English-language newsletter for Latin America''s startup ecosystem.','https://latamstartupweekly.com'),

/* 15 */
('newsletter','Rachel Kim','HR Insider Media','HR Insider',
 'HR leaders and people ops professionals','US',26000,'46%','4.3%',
 'Native ad','Friday 16 May 2026','2026-05-16','2026-05-14 17:00:00+00',
 650,455,1,1,
 ARRAY['Rippling','Lattice','Deel'],'live',
 'HR Insider delivers weekly people ops strategy to 26k HR leaders across the US.','https://hrinsider.us'),

/* 16 */
('newsletter','Oliver Hayes','Dev Dispatch Corp','Dev Dispatch',
 'Full-stack developers and engineering leads','Global',44000,'41%','3.8%',
 'Footer sponsor','Monday 19 May 2026','2026-05-19','2026-05-17 20:00:00+00',
 1000,700,2,4,
 ARRAY['Supabase','Railway','Fly.io'],'live',
 'Dev Dispatch curates the best in open source, tools, and engineering culture weekly.','https://devdispatch.dev'),

/* 17 */
('newsletter','Fiona Walsh','Climate Capital News','Climate Capital',
 'Impact investors and sustainability professionals','Europe',8000,'53%','5.5%',
 'Dedicated send','Tuesday 20 May 2026','2026-05-20','2026-05-18 16:00:00+00',
 450,315,1,1,
 ARRAY['Climeworks','Pachama','Watershed'],'live',
 'Climate Capital is a weekly briefing on climate finance and sustainable investing.','https://climatecapital.news'),

/* 18 */
('newsletter','Jake Morrison','Product Pulse Media','Product Pulse',
 'Product managers and UX professionals','US',37000,'43%','4.0%',
 'Featured sponsor','Wednesday 21 May 2026','2026-05-21','2026-05-19 18:00:00+00',
 1100,770,1,2,
 ARRAY['Figma','Miro','ProductBoard'],'live',
 'Product Pulse is the weekly read for 37k PMs who want to build better products.','https://productpulse.io'),

/* 19 */
('newsletter','Anna Kowalski','B2B Matters HQ','B2B Matters',
 'B2B sales leaders and revenue teams','US / UK',20000,'40%','3.6%',
 'Banner + mention','Thursday 22 May 2026','2026-05-22','2026-05-20 17:00:00+00',
 480,336,2,2,
 ARRAY['Salesforce','Outreach','Gong'],'live',
 'B2B Matters helps 20k revenue professionals close more deals with actionable insight.','https://b2bmatters.co'),

/* 20 */
('newsletter','Patrick Doyle','The Legal Brief Co','The Legal Brief',
 'In-house counsel and legal operations professionals','UK',7500,'51%','4.9%',
 'Native ad','Friday 23 May 2026','2026-05-23','2026-05-21 14:00:00+00',
 320,224,1,1,
 ARRAY['Ironclad','Clio','LexisNexis'],'live',
 'The Legal Brief is the go-to weekly digest for 7.5k UK in-house lawyers.','https://thelegalbriefing.co.uk'),

/* 21 */
('newsletter','Mei Lin','Asia Tech Pulse','Asia Tech Pulse',
 'Tech executives and investors across Southeast Asia','APAC',13000,'48%','4.5%',
 'Featured sponsor','Monday 26 May 2026','2026-05-26','2026-05-24 18:00:00+00',
 420,294,2,2,
 ARRAY['Grab','Sea Group','Bukalapak'],'live',
 'Asia Tech Pulse covers the most important tech and startup moves in the APAC region.','https://asiatechpulse.com'),

/* 22 */
('newsletter','George Bell','Ops Digest HQ','Ops Digest',
 'Operations managers and supply chain professionals','US',17000,'38%','3.4%',
 'Banner + mention','Tuesday 27 May 2026','2026-05-27','2026-05-25 16:00:00+00',
 380,266,3,3,
 ARRAY['Flexport','ShipBob','FreightWaves'],'live',
 'Ops Digest gives 17k operations pros the weekly intel they need to run lean and fast.','https://opsdigest.io'),

/* 23 */
('newsletter','Isabel Torres','EdTech Roundup Corp','EdTech Roundup',
 'Educators, EdTech founders, and learning & development teams','Global',11500,'49%','4.6%',
 'Footer sponsor','Wednesday 28 May 2026','2026-05-28','2026-05-26 18:00:00+00',
 280,196,2,2,
 ARRAY['Coursera','Teachable','Thinkific'],'live',
 'EdTech Roundup aggregates the best in online education tools and pedagogy weekly.','https://edtechroundup.com'),

/* 24 */
('newsletter','Harry Stone','Future of Work Weekly','Future of Work Weekly',
 'HR, remote work advocates, and future-of-work researchers','US',23000,'45%','4.2%',
 'Solo blast','Thursday 29 May 2026','2026-05-29','2026-05-27 18:00:00+00',
 1400,980,1,1,
 ARRAY['Notion','Loom','Miro'],'live',
 'Future of Work Weekly is a solo-send to 23k professionals who care about how work evolves.','https://futureofworkweekly.com');
