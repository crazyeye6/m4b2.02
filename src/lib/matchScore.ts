import type { Listing } from '../types';
import type { BuyerPreferences } from '../hooks/useBuyerPreferences';
import { getDiscountTier, getDiscountPct } from './dynamicPricing';

export interface ScoredListing {
  listing: Listing;
  matchScore: number;
  dealScore: number;
  finalScore: number;
  score: number;
  label: 'Excellent Match' | 'Strong Match' | 'Good Match';
  reasons: string[];
  explanationLine: string;
}

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

function calcTagScore(listing: Listing, prefs: BuyerPreferences): { score: number; matched: string | null } {
  if (!prefs.tags || !prefs.tags.length) return { score: 50, matched: null };
  const listingTagSlugs = (listing.tags ?? []).map(t => normalise(t.name));
  const audience = normalise(listing.audience ?? '');
  const location = normalise(listing.location ?? '');
  for (const slug of prefs.tags) {
    const norm = normalise(slug);
    if (
      listingTagSlugs.some(t => t === norm || t.includes(norm)) ||
      audience.includes(norm) ||
      location.includes(norm)
    ) {
      return { score: 100, matched: slug };
    }
  }
  return { score: 0, matched: null };
}

function calcAudienceScore(listing: Listing, prefs: BuyerPreferences): { score: number; matched: boolean } {
  if (!prefs.audienceSize) return { score: 50, matched: false };
  const subs = listing.subscribers ?? 0;
  const map: Record<string, [number, number]> = {
    small: [0, 30_000],
    mid: [10_000, 150_000],
    large: [50_000, Infinity],
  };
  const [lo, hi] = map[prefs.audienceSize];
  const matched = subs >= lo && subs <= hi;
  return { score: matched ? 100 : 20, matched };
}

function calcBudgetScore(listing: Listing, prefs: BuyerPreferences): { score: number; within: boolean } {
  const price = listing.discounted_price;
  if (!prefs.budgetMin && !prefs.budgetMax) return { score: 50, within: false };
  const min = prefs.budgetMin;
  const max = prefs.budgetMax;
  if (max > 0 && price > max) return { score: 0, within: false };
  if (min > 0 && price < min * 0.5) return { score: 30, within: false };
  return { score: 100, within: true };
}

function calcGeographyScore(listing: Listing, prefs: BuyerPreferences): { score: number; matched: string | null } {
  if (!prefs.locations.length) return { score: 50, matched: null };
  for (const loc of prefs.locations) {
    const kws = LOCATION_MAP[loc] ?? [];
    if (tagMatches(listing, kws)) return { score: 100, matched: loc };
  }
  return { score: 0, matched: null };
}

function calcTimingScore(listing: Listing, prefs: BuyerPreferences): { score: number; reason: string | null } {
  const now = Date.now();
  const deadline = new Date(listing.deadline_at).getTime();
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (!prefs.timing) {
    if (diffHours <= 24) return { score: 100, reason: 'Closing in under 24 hours' };
    if (diffHours <= 72) return { score: 80, reason: null };
    if (diffHours <= 168) return { score: 60, reason: null };
    return { score: 40, reason: null };
  }
  if (prefs.timing === 'last_minute' && diffHours <= 24) return { score: 100, reason: 'Closing soon — fits your last-minute preference' };
  if (prefs.timing === 'next_3_days' && diffHours <= 72) return { score: 100, reason: 'Send date fits your preferred campaign timing' };
  if (prefs.timing === 'this_week' && diffHours <= 168) return { score: 100, reason: 'Available this week as preferred' };
  if (diffHours <= 24) return { score: 70, reason: null };
  return { score: 20, reason: null };
}

function calcEngagementScore(listing: Listing): { score: number; highlight: string | null } {
  const openRate = parseFloat((listing.open_rate ?? '').replace('%', ''));
  const ctr = parseFloat((listing.ctr ?? '').replace('%', ''));

  let score = 50;
  let highlight: string | null = null;

  if (!isNaN(openRate)) {
    if (openRate >= 40) { score = Math.max(score, 100); highlight = `${openRate}% open rate — well above average`; }
    else if (openRate >= 25) { score = Math.max(score, 75); highlight = `${openRate}% open rate`; }
    else if (openRate >= 15) { score = Math.max(score, 55); }
  }
  if (!isNaN(ctr)) {
    if (ctr >= 3) { score = Math.max(score, 95); highlight = highlight ?? `${ctr}% CTR — high engagement`; }
    else if (ctr >= 1.5) { score = Math.max(score, 70); }
  }
  return { score, highlight };
}

function calcDealScore(listing: Listing): number {
  const now = Date.now();
  const deadline = new Date(listing.deadline_at).getTime();
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  const tier = getDiscountTier(listing.deadline_at);
  const discountPct = getDiscountPct(tier);

  let score = 0;

  if (discountPct >= 30) score += 50;
  else if (discountPct >= 20) score += 35;
  else if (discountPct >= 10) score += 20;

  if (diffHours <= 12) score += 50;
  else if (diffHours <= 24) score += 40;
  else if (diffHours <= 48) score += 25;
  else if (diffHours <= 72) score += 15;
  else if (diffHours <= 120) score += 8;

  return Math.min(100, score);
}

export function scoreListings(listings: Listing[], prefs: BuyerPreferences): ScoredListing[] {
  return listings
    .filter(l => l.status === 'live')
    .map(listing => {
      const cat = calcTagScore(listing, prefs);
      const aud = calcAudienceScore(listing, prefs);
      const bud = calcBudgetScore(listing, prefs);
      const geo = calcGeographyScore(listing, prefs);
      const tim = calcTimingScore(listing, prefs);
      const eng = calcEngagementScore(listing);

      const matchScore = Math.round(
        cat.score * 0.30 +
        aud.score * 0.20 +
        bud.score * 0.15 +
        geo.score * 0.15 +
        tim.score * 0.10 +
        eng.score * 0.10
      );

      const dealScore = calcDealScore(listing);
      const finalScore = Math.round(matchScore * 0.7 + dealScore * 0.3);

      const explanationParts: string[] = [];
      if (cat.matched) explanationParts.push(`Matches your "${cat.matched}" tag preference`);
      if (bud.within) explanationParts.push('Fits your budget');
      if (geo.matched) explanationParts.push(`Suitable for your ${geo.matched} target geography`);
      if (eng.highlight && explanationParts.length < 3) explanationParts.push(eng.highlight.split('—')[0].trim());
      if (tim.reason && explanationParts.length < 3) explanationParts.push('Strong timing match');
      if (explanationParts.length === 0) explanationParts.push('Relevant to your buyer profile');
      const explanationLine = explanationParts.slice(0, 3).join(' · ');

      const reasons: string[] = [];
      if (cat.matched) {
        reasons.push(`Matches your "${cat.matched}" tag preference`);
      } else if (!prefs.tags?.length) {
        reasons.push('No tag filter set — showing all niches');
      }
      if (aud.matched && prefs.audienceSize) {
        const sizeLabel = prefs.audienceSize === 'small' ? 'niche (<30K)' : prefs.audienceSize === 'mid' ? 'mid-size (10–150K)' : 'large reach (50K+)';
        reasons.push(`Audience size fits your ${sizeLabel} preference`);
      }
      if (bud.within) reasons.push('Fits your budget — priced within your selected range');
      if (geo.matched) reasons.push(`Suitable for your ${geo.matched} target geography`);
      if (tim.reason) reasons.push(`Strong timing match — ${tim.reason.toLowerCase()}`);
      if (eng.highlight) reasons.push(eng.highlight);
      if (reasons.length === 0) {
        reasons.push('Relevant based on your buyer profile');
        reasons.push('Live deal with automatic time-based pricing');
      }

      const label: ScoredListing['label'] =
        matchScore >= 85 ? 'Excellent Match' :
        matchScore >= 65 ? 'Strong Match' :
        'Good Match';

      return { listing, matchScore, dealScore, finalScore, score: matchScore, label, reasons, explanationLine };
    })
    .filter(s => s.finalScore >= 35)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 6);
}
