export type DiscountTier = 'none' | 'early' | 'mid' | 'last_chance';

export interface PricingInfo {
  currentPrice: number;
  originalPrice: number;
  discountPct: number;
  savings: number;
  tier: DiscountTier;
  urgencyLabel: 'Ending This Week' | 'Ending Soon' | 'Last Chance' | null;
  hoursRemaining: number;
  daysRemaining: number;
}

export function getDiscountTier(deadlineAt: string): DiscountTier {
  const now = Date.now();
  const deadline = new Date(deadlineAt).getTime();
  const msRemaining = deadline - now;
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  if (hoursRemaining < 24) return 'last_chance';
  if (hoursRemaining < 72) return 'mid';
  if (hoursRemaining < 120) return 'early';
  return 'none';
}

export function getDiscountPct(tier: DiscountTier): number {
  switch (tier) {
    case 'last_chance': return 30;
    case 'mid': return 20;
    case 'early': return 10;
    default: return 0;
  }
}

export function calcDynamicPrice(basePrice: number, deadlineAt: string, autoDiscountEnabled = true): PricingInfo {
  const now = Date.now();
  const deadline = new Date(deadlineAt).getTime();
  const msRemaining = deadline - now;
  const hoursRemaining = msRemaining / (1000 * 60 * 60);
  const daysRemaining = hoursRemaining / 24;

  const timeTier = getDiscountTier(deadlineAt);
  const tier = autoDiscountEnabled ? timeTier : 'none';
  const discountPct = getDiscountPct(tier);
  const currentPrice = Math.round(basePrice * (1 - discountPct / 100));
  const savings = basePrice - currentPrice;

  let urgencyLabel: PricingInfo['urgencyLabel'] = null;
  if (timeTier === 'last_chance') urgencyLabel = 'Last Chance';
  else if (timeTier === 'mid') urgencyLabel = 'Ending Soon';
  else if (timeTier === 'early') urgencyLabel = 'Ending This Week';

  return {
    currentPrice,
    originalPrice: basePrice,
    discountPct,
    savings,
    tier,
    urgencyLabel,
    hoursRemaining: Math.max(0, hoursRemaining),
    daysRemaining: Math.max(0, daysRemaining),
  };
}

export const TIER_STYLES: Record<DiscountTier, { badge: string; border: string; bg: string; label: string }> = {
  none: {
    badge: 'bg-[#1d1d1f] text-white',
    border: '',
    bg: '',
    label: '',
  },
  early: {
    badge: 'bg-amber-500 text-white',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    label: 'Ending This Week',
  },
  mid: {
    badge: 'bg-orange-500 text-white',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    label: 'Ending Soon',
  },
  last_chance: {
    badge: 'bg-red-500 text-white',
    border: 'border-red-200',
    bg: 'bg-red-50',
    label: 'Last Chance',
  },
};
