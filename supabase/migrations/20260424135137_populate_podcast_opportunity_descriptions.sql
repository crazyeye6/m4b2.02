/*
  # Populate opportunity_description for all live podcast listings

  Each description is written from the seller's perspective — a genuine pitch
  explaining what makes this slot a unique advertising opportunity: audience
  quality, listener behaviour, why the format works, and what brands have
  succeeded here before.
*/

UPDATE listings SET opportunity_description =
  'AI Frontier Pod reaches 104k downloads per episode — one of the largest independent AI audiences anywhere. These are active practitioners: ML engineers, researchers, and builders who act on what they hear. Our listeners have a strong track record of trialling new developer tools within weeks of an ad airing. Pre-roll placement means your message lands before a single word of content, at peak attention. Previous sponsors like Weights & Biases and Modal report trial sign-ups within 48 hours of episodes dropping. One shot, maximum reach, minimal noise.'
WHERE id = '1a80b07a-210c-4469-9afc-ba9ef448c672';

UPDATE listings SET opportunity_description =
  'The SaaS Operator is the go-to show for the people who actually run SaaS companies day-to-day — ops leads, founders, revenue owners. 58k downloads per episode with a listener base that controls real software budgets. Mid-roll host-read ads perform exceptionally here because Tom scripts them personally and ties them to the episode topic. Sponsors like Linear and Intercom have seen direct sign-up attribution from this slot. Only 1 slot remaining for this episode — once it''s gone, the next opening is 6 weeks out.'
WHERE id = 'fadc4753-158c-4c9b-8d38-06f84515180e';

UPDATE listings SET opportunity_description =
  'Fintech Founders Podcast serves 31k senior fintech professionals in the UK — a notoriously hard-to-reach audience who ignore display ads but trust podcast hosts they follow weekly. Sarah Chen''s audience skews toward payments, banking infrastructure, and B2B fintech. Sponsors like Stripe and Revolut have used this slot to reach decision-makers at scale without expensive account-based campaigns. Pre-roll placement at episode open captures the full audience before any drop-off. Only 1 slot available for this episode date.'
WHERE id = '4318b398-e178-4c49-9c07-890bf1de4fd6';

UPDATE listings SET opportunity_description =
  'Growth Operators is built for revenue and growth teams at scaling companies — the exact people who evaluate, purchase, and champion marketing and sales tools. 24k downloads from an audience with direct budget authority. Marcus delivers 90-second host-read ads woven naturally into the episode narrative, not dropped in as an interruption. HubSpot and Zapier have been repeat sponsors here because conversion rates justify it. 2 slots still open on this episode — rare for a show with consistent sell-out history.'
WHERE id = '5cf5faff-1694-4bc6-86dc-96fcc18c21d3';

UPDATE listings SET opportunity_description =
  'Deep Work Daily has built a cult following of 42k knowledge workers who treat the show as part of their daily productivity ritual — which means they are primed to adopt tools that promise to improve how they work. This is not a passive listening audience. Mid-roll produced ads here have a strong completion rate because listeners are mid-session and highly engaged. Brands like Superhuman and Readwise have seen measurable trial lift from this slot. One slot, one episode — the audience is ready to act.'
WHERE id = '55a3b25e-904e-4d1f-adfb-06ca2069ac16';

UPDATE listings SET opportunity_description =
  'Venture Backed Podcast gives you direct access to 15,500 startup founders and early-stage investors across the US who are actively making product and infrastructure decisions. This is a trusted show in the VC-backed ecosystem — listeners are at the exact moment in their company journey when they are evaluating tools and services for the first time. Pre-roll placement means you lead the episode. Past sponsors AngelList, Brex, and Mercury have all cited this slot as a high-quality acquisition channel for early startup customers.'
WHERE id = '049df462-2d63-43f4-8515-bd453d281ebc';

UPDATE listings SET opportunity_description =
  'Indie Hacker Hour reaches 6,800 solo founders and bootstrappers — a small but extraordinarily action-oriented audience. These are people who ship products, pay for their own tools, and share recommendations across tight-knit communities. Word-of-mouth amplification from this audience punches well above the download number. Post-roll produced ads suit listeners who stay to the end because they genuinely enjoy the show. Notion and Bubble have both used this slot to drive community-level awareness that extends far beyond the episode play count.'
WHERE id = '096c2d28-413c-4382-b9a4-0c5661123c0f';

UPDATE listings SET opportunity_description =
  'Creator Economy Weekly is the essential weekly briefing for 38k content creators, YouTubers, and newsletter operators who are building businesses around their audiences. Jess Park''s listeners are platform-native builders who are perpetually evaluating monetisation tools, audience growth products, and creator infrastructure. Mid-roll host-read ads here feel like a peer recommendation — not an interruption. Beehiiv and ConvertKit have both renewed sponsorships here after strong click-through and trial data. 2 slots still available for this episode.'
WHERE id = '5439848c-a731-4917-86ee-66b18554219d';

UPDATE listings SET opportunity_description =
  'AI Builders Weekly is a focused, technical show for the developers actually writing AI code — 9,500 downloads from an audience that is actively building with ML APIs, vector databases, and LLM tooling right now. Small audience, very high intent. Pre-roll placement captures listeners at the start of an episode they chose for professional development. Past sponsors Weights & Biases and Replit report above-average trial conversion from this show because the audience has immediate use for what is being advertised. One slot only.'
WHERE id = 'a2d2838e-99dd-4224-8d4d-0ab70d541a42';

UPDATE listings SET opportunity_description =
  'The Health Stack addresses 22,000 health professionals and high-performance biohackers who are deeply engaged with evidence-based wellness, longevity, and performance optimisation. Dr. Nina Cho''s credibility means her host-read ads carry genuine weight — listeners act because they trust the recommendation. This is a premium slot for health, supplement, sleep, and performance brands looking to reach an educated, spending audience. Athletic Greens and Eight Sleep sponsor here because the audience demographics match perfectly and trial conversion is high. 2 of 3 slots still open.'
WHERE id = '3f829577-d42e-4ec4-a7b7-71004d4cf422';

UPDATE listings SET opportunity_description =
  'DevUncensored pulls 77k downloads per episode from a global audience of software engineers and senior developers — one of the strongest developer reach numbers in the independent podcast space. This audience evaluates, adopts, and internally champions the tools they trust, making them among the highest-value B2B tech listeners available. Pre-roll 15s placement means a punchy, high-impact message at episode open. GitHub, Vercel, Sentry, and Datadog have all sponsored this show because developer-to-developer trust is the most effective channel in B2B tech. Only 1 slot left.'
WHERE id = '99c5cd99-b0b4-4224-bb7d-9f93de6c158b';

UPDATE listings SET opportunity_description =
  'Climate Tech Weekly reaches 17,500 climate investors, fund managers, sustainability leads, and climate-tech operators — a highly specialised audience with genuine capital and procurement authority. Sofia Andersen has built the most trusted independent voice in the climate-tech media ecosystem, and her mid-roll host-read ads are treated as editorial recommendations by listeners. This is a rare opportunity to reach a niche professional audience that is actively deploying money into climate solutions. Climeworks and Pachama have both used this slot to drive meaningful B2B pipeline.'
WHERE id = '59f64244-78e5-4ed9-8061-c28e3e068785';

UPDATE listings SET opportunity_description =
  'The Bootstrapped Founder is Arvid Kahl''s globally recognised show for indie hackers and micro-SaaS builders — 12,000 downloads from an audience that buys, builds on, and recommends tools that help them run leaner, ship faster, and monetise smarter. Post-roll placement here reaches the most loyal segment of the audience: the listeners who stay to the end because they get value from every episode. Podia, Gumroad, and Lemon Squeezy have all seen direct customer acquisition from this slot. 3 slots available — rare for a sold-out show.'
WHERE id = 'fd747f25-8caa-4a82-ab96-d30811c5542e';

UPDATE listings SET opportunity_description =
  'True Crime Obsessed is one of the top-performing independent true crime podcasts in the US, drawing 185,000 downloads per episode from a loyal audience of women aged 25–45 with strong purchasing power and high engagement rates. Hannah Wells''s host-read 90-second mid-roll ads are delivered in her own voice and tone, achieving the conversational intimacy that makes podcast advertising uniquely effective. HelloFresh, BetterHelp, and SimpliSafe all sponsor here for a reason: this audience converts. One exclusive slot on this episode — the highest-reach opening currently on the platform.'
WHERE id = '6888c4e0-71cb-454c-9ef0-d5047d385286';

UPDATE listings SET opportunity_description =
  'The Gaming Startup Pod is the only dedicated podcast for game developers and studio founders actively building and funding game companies — 8,200 highly targeted downloads from an audience that is simultaneously a developer community and a procurement audience. Raj Mehta''s listeners evaluate game engines, publishing infrastructure, community tools, and funding platforms. Pre-roll placement is first-to-ears on every episode. Unity and Discord have both found this to be one of the most cost-effective channels for reaching game developers at scale, at a fraction of the CPM of broader developer-focused buys.'
WHERE id = '2c946cd3-2759-41c3-8569-43fbcdfc4bf7';
