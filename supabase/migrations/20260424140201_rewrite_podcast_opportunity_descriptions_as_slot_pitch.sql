/*
  # Rewrite opportunity_description for all live podcast listings

  Descriptions are now written as a direct pitch for the specific sponsorship slot —
  what the buyer gets, why this placement converts, what makes this episode/date
  unique, and what kind of advertiser belongs here. Written as the seller addressing
  a potential sponsor, not describing the show in the abstract.
*/

UPDATE listings SET opportunity_description =
  'This is a Pre-roll 30-second slot on one of the highest-reach AI podcasts available anywhere right now — 104,000 downloads per episode from practitioners who are actively building with the tools they hear about. Your brand speaks first, before a single second of content plays. No skips, no drop-off. The episode drops in under 72 hours, which means your message goes live while this audience is in peak engagement mode. If you sell developer tooling, MLOps infrastructure, or anything a hands-on AI engineer would trial today, this is the most direct channel to reach them at scale. Weights & Biases and Modal have both converted meaningful trial volume from this exact placement. One slot. First-mover position. Closing imminently.'
WHERE id = '1a80b07a-210c-4469-9afc-ba9ef448c672';

UPDATE listings SET opportunity_description =
  'Secure a Host-read 60-second Mid-roll on The SaaS Operator — Tom Whitfield delivers your message in his own voice, mid-episode, to 58,000 operators who run real SaaS revenue functions. Mid-roll is where this audience is fully locked in: they came for the operational content and they stay through the ads because Tom weaves sponsorships into the episode flow naturally. This is not a media buy — it is a warm endorsement from a trusted voice inside the SaaS operator community. If you sell a tool, service, or platform that helps SaaS companies grow or run leaner, this slot will put you in front of the exact decision-makers who evaluate and approve that category. Only 1 slot remains on this episode.'
WHERE id = 'fadc4753-158c-4c9b-8d38-06f84515180e';

UPDATE listings SET opportunity_description =
  'A Pre-roll 30-second placement on Fintech Founders Podcast gives your brand the opening word on an episode reaching 31,000 senior fintech professionals in the UK. Pre-roll on a professional podcast is one of the highest-attention positions in audio advertising — the listener has pressed play, they are engaged, and you are the first thing they hear. This audience holds budget authority in payments, banking infrastructure, and B2B fintech. They are not reached by display or social at meaningful rates. If you are trying to reach the people who build and buy in UK fintech, this slot delivers them before any content competitor noise. Stripe and Revolut sponsor here for exactly that reason.'
WHERE id = '4318b398-e178-4c49-9c07-890bf1de4fd6';

UPDATE listings SET opportunity_description =
  'This Host-read 90-second Mid-roll on Growth Operators Podcast is the longest, most immersive ad format we offer — 90 seconds of Marcus Reid speaking your brand''s value proposition, in his own words, to 24,000 growth and revenue professionals who act on what they hear. Ninety seconds lets you tell a real story, not just a tagline. Mid-roll placement means you are reaching the audience at the episode''s most engaged point. HubSpot and Zapier have used this exact slot format because the extended read time drives meaningful recall and trial intent among a B2B audience with genuine purchase authority. 2 slots still available — rare for a show that historically sells out.'
WHERE id = '5cf5faff-1694-4bc6-86dc-96fcc18c21d3';

UPDATE listings SET opportunity_description =
  'This is the only Mid-roll slot on Deep Work Daily''s next episode — a Produced 45-second spot reaching 42,000 knowledge workers who have made this show part of their daily focus ritual. Produced ads here are crafted to match the tone of the show: calm, focused, intentional. This audience is primed to adopt tools that promise to help them work better, because that is the exact reason they listen. There is no better moment to introduce a productivity, focus, or professional tool than mid-episode, while the listener is already in an intentional headspace. Superhuman and Readwise have both cited this placement as a strong acquisition channel. One slot only — once gone, next availability is six-plus weeks out.'
WHERE id = '55a3b25e-904e-4d1f-adfb-06ca2069ac16';

UPDATE listings SET opportunity_description =
  'Claim a Pre-roll 30-second slot on Venture Backed Podcast and be the first voice 15,500 startup founders and early-stage investors hear on this episode. Pre-roll on a show with this audience profile is rare value: these listeners are in the process of making first-time tool, infrastructure, and service decisions for their companies. They have no incumbent relationships yet and they are actively looking for what works. AngelList, Brex, and Mercury sponsor here because the cost-per-acquisition for early-stage startup customers from this slot is among the most efficient in B2B media. If your product targets early-stage companies, this is a direct line to the people making those decisions right now.'
WHERE id = '049df462-2d63-43f4-8515-bd453d281ebc';

UPDATE listings SET opportunity_description =
  'A Post-roll Produced 30-second spot on Indie Hacker Hour reaches the most committed segment of a small, exceptionally action-oriented audience — the listeners who stay to the very end. 6,800 solo founders and bootstrappers who pay for their own tools, make their own decisions, and share recommendations across tight-knit communities. Post-roll audiences self-select for high engagement: if they are still listening, they want to hear what comes next. Produced ads here are polished and feel native to the show''s tone. Notion and Bubble have used this slot to drive word-of-mouth amplification that extends well beyond the episode play count. If your product serves independent builders, this audience is both buyer and evangelist.'
WHERE id = '096c2d28-413c-4382-b9a4-0c5661123c0f';

UPDATE listings SET opportunity_description =
  'This Mid-roll Host-read 60-second slot on Creator Economy Weekly puts your brand in front of 38,000 content creators and newsletter operators at the exact moment they are most engaged with the episode. Jess Park delivers your message as a peer recommendation — not an ad read. This audience evaluates monetisation tools, audience growth products, and creator infrastructure on a continuous basis; they are perpetually in buying mode. A 60-second host-read in the middle of a tightly followed episode gives you time to explain your value proposition properly, with the credibility of a trusted voice behind it. Beehiiv and ConvertKit have renewed here after strong click-through and trial data. 2 of 3 slots still available.'
WHERE id = '5439848c-a731-4917-86ee-66b18554219d';

UPDATE listings SET opportunity_description =
  'This Pre-roll 30-second slot on AI Builders Weekly is one of the most precisely targeted sponsorship positions available in developer media — 9,500 downloads from engineers who are actively writing AI code right now. Small reach, extreme relevance. Pre-roll means your message lands before any content plays, at the moment of highest attention. This audience has immediate, practical use for what is being advertised: they are in the middle of building AI products and they are looking for the right tools. Weights & Biases and Replit report above-average trial conversion from this show because the match between the ad and the listener''s current work is almost perfect. One slot only.'
WHERE id = 'a2d2838e-99dd-4224-8d4d-0ab70d541a42';

UPDATE listings SET opportunity_description =
  'Secure a Host-read 60-second Mid-roll on The Health Stack and have Dr. Nina Cho deliver your brand''s message to 22,000 health professionals and biohackers who regard her recommendations as authoritative. A health professional host endorsing your product is qualitatively different from a standard ad read — the credibility transfer is real, and the audience responds to it. Mid-roll placement means the listener is fully absorbed in the episode. This is the right slot for supplement, sleep, performance, or health-tech brands that need professional-audience trust to convert. Athletic Greens and Eight Sleep both cite this placement as a high-quality acquisition channel. 2 of 3 slots still available on this episode.'
WHERE id = '3f829577-d42e-4ec4-a7b7-71004d4cf422';

UPDATE listings SET opportunity_description =
  'A Pre-roll 15-second slot on DevUncensored is one of the most efficient developer-reach buys on the market — 77,000 downloads per episode from a global audience of software engineers and senior developers, at a CPM that significantly undercuts comparable developer-focused channels. Fifteen seconds at episode open is pure signal: your brand name, your value, your URL, delivered to a listener who is ready to code. This audience evaluates, adopts, and internally champions the tools they trust. GitHub, Vercel, Sentry, and Datadog all sponsor here because developer-to-developer trust compounds — an ad on this show starts conversations in Slack and on GitHub. Only 1 slot left on this episode.'
WHERE id = '99c5cd99-b0b4-4224-bb7d-9f93de6c158b';

UPDATE listings SET opportunity_description =
  'This Host-read 60-second Mid-roll on Climate Tech Weekly is a direct line to 17,500 climate investors, fund managers, and sustainability decision-makers — an audience with real capital allocation authority that is nearly impossible to reach through standard programmatic channels. Sofia Andersen''s mid-roll endorsements are treated by listeners as editorial recommendations, not advertising. The climate-tech space moves on relationships and trusted voices; this slot gives you both. If you sell into climate investment, ESG infrastructure, carbon markets, or sustainability technology, this is a rare chance to be introduced by a credible, respected voice to exactly the right room. Climeworks and Pachama have both generated meaningful B2B pipeline from this placement.'
WHERE id = '59f64244-78e5-4ed9-8061-c28e3e068785';

UPDATE listings SET opportunity_description =
  'Three Post-roll Produced 45-second slots are available on The Bootstrapped Founder — an unusual opportunity to own multiple positions across an episode with a highly loyal listener base of 12,000 bootstrapped founders and micro-SaaS builders. Post-roll reaches the audience segment that loves the show most: people who listen to every minute because it helps them build better. Produced ads are professionally crafted to match Arvid Kahl''s tone, giving your brand a native feel. This audience buys tools to run their own businesses and recommends what works — the word-of-mouth return on a sponsorship here extends far beyond the download count. Podia, Gumroad, and Lemon Squeezy have all acquired customers directly from this slot.'
WHERE id = 'fd747f25-8caa-4a82-ab96-d30811c5542e';

UPDATE listings SET opportunity_description =
  'This is the highest-reach single sponsorship slot currently listed on the platform — a Host-read 90-second Mid-roll on True Crime Obsessed, reaching 185,000 downloads per episode from a loyal US audience of women aged 25–45 with strong household purchasing power. A 90-second host-read mid-roll from Hannah Wells is not a media placement, it is a personal recommendation from a voice this audience trusts deeply. Mid-roll delivers your message at peak engagement. This audience has driven remarkable results for DTC, subscription, and consumer service brands: HelloFresh, BetterHelp, and SimpliSafe all maintain repeat sponsorships here. One exclusive slot. Highest possible reach. Booking closes soon.'
WHERE id = '6888c4e0-71cb-454c-9ef0-d5047d385286';

UPDATE listings SET opportunity_description =
  'Secure a Pre-roll 30-second slot on The Gaming Startup Pod and put your brand first-to-ears on the only dedicated podcast for game developers and studio founders actively building games right now. This niche is nearly impossible to reach through generic developer or gaming media — the audience is too specific. Raj Mehta''s listeners are simultaneously a developer audience and a procurement audience: they evaluate game engines, publishing tools, community platforms, and funding products on a weekly basis. Pre-roll means zero competition for attention at episode open. Unity and Discord sponsor here because the cost to reach a qualified game developer through this channel is a fraction of what broader developer-targeted buys cost, with far higher relevance. 2 of 3 slots available.'
WHERE id = '2c946cd3-2759-41c3-8569-43fbcdfc4bf7';
