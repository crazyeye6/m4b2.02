import type { Listing } from '../types';
import type { BuyerPreferences } from '../hooks/useBuyerPreferences';

export interface ScoredListing {
  listing: Listing;
  score: number;
  label: 'Excellent Match' | 'Strong Match' | 'Good Match';
  reasons: string[];
}

const CATEGORY_MAP: Record<string, string[]> = {
  SaaS: ['saas', 'b2b', 'software', 'tech', 'developer', 'startup', 'productivity'],
  Marketing: ['marketing', 'growth', 'seo', 'content', 'advertising', 'social'],
  Business: ['business', 'entrepreneurship', 'founder', 'leadership', 'management'],
  Finance: ['finance', 'investing', 'personal-finance', 'fintech', 'crypto', 'money'],
  'E-commerce': ['ecommerce', 'e-commerce', 'shopify', 'retail', 'dtc', 'consumer'],
  Creator: ['creator', 'creator-economy', 'youtube', 'podcast', 'newsletter', 'media'],
  Tech: ['tech', 'technology', 'ai', 'ml', 'data', 'engineering', 'developer'],
  DTC: ['dtc', 'direct-to-consumer', 'brand', 'consumer', 'ecommerce'],
};

const LOCATION_MAP: Record<string, string[]> = {
  UK: ['uk', 'united-kingdom', 'britain', 'england', 'london'],
  Ireland: ['ireland', 'dublin', 'ie'],
  US: ['us', 'usa', 'united-states', 'america'],
  Europe: ['europe', 'eu', 'european', 'germany', 'france', 'spain', 'netherlands'],
  Global: ['global', 'worldwide', 'international', 'multi-region'],
};

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function tagMatches(listing: Listing, keywords: string[]): boolean {
  const tags = (listing.tags ?? []).map(t => normalise(t.name));
  const audience = normalise(listing.audience ?? '');
  const location = normalise(listing.location ?? '');
  return keywords.some(kw => tags.some(t => t.includes(kw)) || audience.includes(kw) || location.includes(kw));
}

function categoryScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  if (!prefs.categories.length) return { score: 15, reason: null };
  for (const cat of prefs.categories) {
    const kws = CATEGORY_MAP[cat] ?? [];
    if (tagMatches(listing, kws)) {
      return { score: 30, reason: `Matches your ${cat} category preference` };
    }
  }
  return { score: 0, reason: null };
}

function locationScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  if (!prefs.locations.length) return { score: 10, reason: null };
  for (const loc of prefs.locations) {
    const kws = LOCATION_MAP[loc] ?? [];
    if (tagMatches(listing, kws)) {
      return { score: 20, reason: `Audience overlaps with your ${loc} targeting` };
    }
  }
  return { score: 0, reason: null };
}

function budgetScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  const price = listing.discounted_price;
  if (!prefs.budgetMin && !prefs.budgetMax) return { score: 8, reason: null };
  const min = prefs.budgetMin;
  const max = prefs.budgetMax;
  if (max > 0 && price > max) return { score: 0, reason: null };
  if (min > 0 && price < min) return { score: 5, reason: null };
  return { score: 15, reason: 'Price is within your selected budget' };
}

function goalScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  if (!prefs.goal) return { score: 8, reason: null };
  const tags = (listing.tags ?? []).map(t => normalise(t.name));
  const audience = normalise(listing.audience ?? '');
  const goalMap: Record<string, string[]> = {
    awareness: ['awareness', 'reach', 'brand', 'newsletter', 'broad'],
    conversions: ['conversion', 'performance', 'direct-response', 'cta'],
    lead_generation: ['lead', 'b2b', 'saas', 'sign-up', 'email-capture'],
  };
  const kws = goalMap[prefs.goal] ?? [];
  const hit = kws.some(kw => tags.some(t => t.includes(kw)) || audience.includes(kw));
  if (hit) return { score: 15, reason: `Aligns with your ${prefs.goal.replace('_', ' ')} goal` };
  return { score: 5, reason: null };
}

function timingScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  if (!prefs.timing) return { score: 5, reason: null };
  const now = Date.now();
  const deadline = new Date(listing.deadline_at).getTime();
  const diff = (deadline - now) / (1000 * 60 * 60);

  if (prefs.timing === 'last_minute' && diff <= 24) return { score: 10, reason: 'Closing soon — fits your last-minute preference' };
  if (prefs.timing === 'next_3_days' && diff <= 72) return { score: 10, reason: 'Send date fits your preferred campaign timing' };
  if (prefs.timing === 'this_week' && diff <= 168) return { score: 10, reason: 'Available this week as preferred' };
  return { score: 3, reason: null };
}

function discountScore(listing: Listing): { score: number; reason: string | null } {
  const pct = ((listing.original_price - listing.discounted_price) / listing.original_price) * 100;
  if (pct >= 50) return { score: 10, reason: `${Math.round(pct)}% off — strong discount` };
  if (pct >= 30) return { score: 7, reason: null };
  if (pct >= 15) return { score: 4, reason: null };
  return { score: 1, reason: null };
}

function audienceSizeScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  if (!prefs.audienceSize) return { score: 5, reason: null };
  const subs = listing.subscribers ?? 0;
  const map: Record<string, [number, number]> = {
    small: [0, 30_000],
    mid: [10_000, 150_000],
    large: [50_000, Infinity],
  };
  const [lo, hi] = map[prefs.audienceSize];
  if (subs >= lo && subs <= hi) return { score: 5, reason: `Audience size matches your ${prefs.audienceSize === 'small' ? 'niche' : prefs.audienceSize === 'mid' ? 'mid-size' : 'large reach'} preference` };
  return { score: 1, reason: null };
}

export function scoreListings(listings: Listing[], prefs: BuyerPreferences): ScoredListing[] {
  return listings
    .filter(l => l.status === 'live')
    .map(listing => {
      const cat = categoryScore(listing, prefs);
      const loc = locationScore(listing, prefs);
      const bud = budgetScore(listing, prefs);
      const goal = goalScore(listing, prefs);
      const tim = timingScore(listing, prefs);
      const disc = discountScore(listing);
      const aud = audienceSizeScore(listing, prefs);

      const raw = cat.score + loc.score + bud.score + goal.score + tim.score + disc.score + aud.score;
      const max = 30 + 20 + 15 + 15 + 10 + 10 + 5;
      const score = Math.round((raw / max) * 100);

      const reasons = [cat.reason, loc.reason, bud.reason, goal.reason, tim.reason, disc.reason, aud.reason]
        .filter(Boolean) as string[];

      const label: ScoredListing['label'] =
        score >= 90 ? 'Excellent Match' :
        score >= 75 ? 'Strong Match' :
        'Good Match';

      return { listing, score, label, reasons };
    })
    .filter(s => s.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
