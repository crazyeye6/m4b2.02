import { Users, MapPin, Mail, Shield, Clock, Eye, Lock, Zap, CalendarClock, Flame, TrendingDown } from 'lucide-react';
import type { Listing } from '../types';
import CountdownTimer from './CountdownTimer';
import { resolvePublishDate, formatDeadlineDate } from '../lib/dateUtils';
import { useLocale } from '../context/LocaleContext';
import { useTranslations } from '../hooks/useTranslations';
import { calcDynamicPrice, TIER_STYLES } from '../lib/dynamicPricing';

interface OpportunityCardProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
  onViewMediaProfile?: (profileId: string) => void;
}

function fmtCompact(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
    return String(n);
  }
}

export default function OpportunityCard({ listing, onSecure, onDetails, onViewMediaProfile }: OpportunityCardProps) {
  const { formatPrice, browserLocale } = useLocale();
  const tx = useTranslations();

  const autoDiscount = listing.auto_discount_enabled !== false;
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, autoDiscount);
  const { currentPrice, discountPct, savings, tier, urgencyLabel } = pricing;
  const tierStyle = TIER_STYLES[tier];
  const depositAmount = Math.round(currentPrice * 0.05);

  const deadlinePassed = new Date(listing.deadline_at).getTime() < Date.now();
  const isLive = listing.status === 'live' && !deadlinePassed;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled' || deadlinePassed;
  const isScarce = listing.slots_remaining <= 2;
  const hasDiscount = discountPct > 0;

  const { weekday, calDate } = resolvePublishDate(listing, browserLocale);
  const deadlineFormatted = formatDeadlineDate(listing.deadline_at, browserLocale);

  const statusLabel = (() => {
    if (isSecured && deadlinePassed && listing.status !== 'secured' && listing.status !== 'cancelled') return tx.card.closed;
    switch (listing.status) {
      case 'securing': return 'Being Secured';
      case 'pending_review': return 'Pending Review';
      case 'secured': return 'Secured';
      case 'expired': return tx.card.closed;
      default: return '';
    }
  })();

  const urgencyAccentClass = tier === 'last_chance'
    ? 'bg-red-500'
    : tier === 'mid'
    ? 'bg-orange-500'
    : tier === 'early'
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  const cardBorderClass = (() => {
    if (!isLive) return 'border-black/[0.06]';
    if (tier === 'last_chance') return 'border-red-200';
    if (tier === 'mid') return 'border-orange-200';
    return 'border-black/[0.06]';
  })();

  const cardOpacity = (() => {
    if (listing.status === 'secured') return 'opacity-50';
    if (listing.status === 'expired') return 'opacity-35';
    if (deadlinePassed && listing.status !== 'secured' && listing.status !== 'expired' && listing.status !== 'cancelled') return 'opacity-40';
    return '';
  })();

  return (
    <div
      className={`relative bg-white rounded-3xl flex flex-col overflow-hidden border transition-all duration-200
        ${cardBorderClass} ${cardOpacity}
        ${isLive ? 'shadow-sm shadow-black/[0.06] hover:shadow-lg hover:shadow-black/[0.09] hover:border-black/[0.10] hover:-translate-y-px' : 'shadow-sm'}
      `}
    >
      {isLive && <div className={`h-[2px] w-full ${urgencyAccentClass}`} />}

      <div className="p-5 flex flex-col h-full">

        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 border border-green-100 bg-green-50 text-green-600 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0">
              <Mail className="w-3.5 h-3.5" />
              Newsletter
            </span>
            {isLive && urgencyLabel && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tierStyle.badge}`}>
                {tier === 'last_chance' && <Flame className="w-2.5 h-2.5" />}
                {urgencyLabel}
              </span>
            )}
          </div>

          {isLive && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-semibold ${isScarce ? 'text-orange-500' : 'text-[#6e6e73]'}`}>
                {listing.slots_remaining} {listing.slots_remaining === 1 ? tx.card.slot : tx.card.slots}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(listing.slots_total || 5, 5) }).map((_, i) => (
                  <span
                    key={i}
                    className={`block w-2 h-2 rounded-full ${
                      i < listing.slots_remaining
                        ? isScarce ? 'bg-orange-400' : 'bg-green-500'
                        : 'bg-[#e5e5ea]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div
            className={`bg-[#f9f9fb] border border-black/[0.04] rounded-2xl p-3 ${listing.media_profile_id && onViewMediaProfile ? 'cursor-pointer hover:bg-[#f0f0f5] transition-colors group/pub' : ''}`}
            onClick={listing.media_profile_id && onViewMediaProfile ? (e) => { e.stopPropagation(); onViewMediaProfile(listing.media_profile_id!); } : undefined}
          >
            <p className="text-[#86868b] text-[8px] font-bold uppercase tracking-widest leading-none mb-1.5">{tx.card.publisher}</p>
            {listing.media_profile?.logo_url ? (
              <div className="flex items-center gap-1.5 mb-0.5">
                <img
                  src={listing.media_profile.logo_url}
                  alt={listing.media_profile.newsletter_name}
                  className="w-5 h-5 rounded-md object-cover flex-shrink-0 border border-black/[0.06]"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <p className={`text-[13px] font-bold leading-tight truncate ${listing.media_profile_id && onViewMediaProfile ? 'text-sky-700 group-hover/pub:underline' : 'text-[#1d1d1f]'}`}>
                  {listing.property_name}
                </p>
              </div>
            ) : (
              <p className={`text-[13px] font-bold leading-tight truncate mb-0.5 ${listing.media_profile_id && onViewMediaProfile ? 'text-sky-700 group-hover/pub:underline' : 'text-[#1d1d1f]'}`}>
                {listing.property_name}
              </p>
            )}
            {listing.media_profile?.tagline ? (
              <p className="text-[#6e6e73] text-[10px] font-medium leading-snug line-clamp-2">{listing.media_profile.tagline}</p>
            ) : (
              <p className="text-[#6e6e73] text-[10px] font-medium leading-none truncate">{listing.media_company_name || listing.media_owner_name}</p>
            )}
            {listing.media_profile?.category && (
              <span className="mt-1.5 inline-block text-[9px] font-semibold text-[#6e6e73] bg-white border border-black/[0.06] px-1.5 py-0.5 rounded-md">{listing.media_profile.category}</span>
            )}
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-3">
            <p className="text-green-700/50 text-[8px] font-bold uppercase tracking-widest leading-none mb-1.5">{tx.card.publishDate}</p>
            {weekday ? (
              <>
                <p className="text-green-800 text-[13px] font-bold leading-tight truncate mb-0.5">{weekday}</p>
                <p className="text-green-700/60 text-[10px] font-medium leading-none truncate">{calDate}</p>
              </>
            ) : (
              <p className="text-green-800 text-[13px] font-bold leading-tight truncate">{calDate || '—'}</p>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-2 mb-3 rounded-xl px-3 py-2 ${isLive ? 'bg-orange-50' : 'bg-[#f5f5f7]'}`}>
          <CalendarClock className={`w-3.5 h-3.5 flex-shrink-0 ${isLive ? 'text-orange-500' : 'text-[#86868b]'}`} />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#86868b] flex-shrink-0">{tx.card.bookBy}</p>
          <p className={`text-[12px] font-bold ml-auto ${isLive ? 'text-orange-600' : 'text-[#1d1d1f]'}`}>{deadlineFormatted}</p>
        </div>

        <div className={`flex items-center justify-between mb-2.5 rounded-2xl p-3.5
          ${hasDiscount && isLive
            ? tier === 'last_chance' ? 'bg-red-50 border border-red-100' : tier === 'mid' ? 'bg-orange-50 border border-orange-100' : 'bg-amber-50 border border-amber-100'
            : 'bg-[#f5f5f7]'
          }`}>
          <div>
            <p className="text-[#86868b] text-[10px] font-medium uppercase tracking-wide mb-1">{tx.card.pricePerSlot}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[#1d1d1f] text-2xl font-semibold tracking-[-0.02em]">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-[#aeaeb2] text-sm line-through">{formatPrice(listing.original_price)}</span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendingDown className="w-3 h-3 text-green-600" />
                <p className="text-green-600 text-[11px] font-semibold">{tx.card.save} {formatPrice(savings)}</p>
              </div>
            )}
          </div>
          {hasDiscount ? (
            <div className={`text-white text-[15px] font-bold px-3 py-1.5 rounded-2xl tabular-nums shadow-sm ${tierStyle.badge}`}>
              -{discountPct}% Off
            </div>
          ) : (
            <div className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl ${autoDiscount ? 'bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.08]' : 'bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.08]'}`}>
              {autoDiscount ? 'Auto-Discount Enabled' : 'No Active Discount'}
            </div>
          )}
        </div>

        {hasDiscount && isLive && (
          <div className={`flex items-start gap-2 mb-3 rounded-xl px-3 py-2 ${tierStyle.bg} border ${tierStyle.border}`}>
            <TrendingDown className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-70" />
            <p className={`text-[10px] font-medium leading-snug ${tier === 'last_chance' ? 'text-red-700' : tier === 'mid' ? 'text-orange-700' : 'text-amber-700'}`}>
              {tier === 'last_chance'
                ? `${discountPct}% off — final price, closes in under 24 hours`
                : tier === 'mid'
                ? `${discountPct}% off — deadline approaching, price drops further if unsold`
                : `${discountPct}% off — early discount, increases as deadline nears`}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3 bg-green-50 border border-green-100 rounded-2xl px-3.5 py-2.5">
          <div>
            <p className="text-green-700 text-[12px] font-semibold">{tx.card.reserveWithDeposit}</p>
            <p className="text-green-600/70 text-[10px] mt-0.5">{tx.card.balanceDirect}</p>
          </div>
          <div className="text-right">
            <p className="text-green-700 text-[18px] font-bold tracking-[-0.02em]">{formatPrice(depositAmount)}</p>
            <p className="text-green-600/70 text-[10px]">{tx.card.now}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <StatPill
            label={tx.card.subscribers}
            value={fmtCompact(listing.media_profile?.subscriber_count ?? listing.subscribers ?? 0, browserLocale)}
          />
          <StatPill
            label={tx.card.openRate}
            value={listing.media_profile?.open_rate || listing.open_rate || '—'}
            accent
          />
          <StatPill label={tx.card.ctr} value={listing.ctr || '—'} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-[#6e6e73]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#aeaeb2]" />
            {listing.media_profile?.primary_geography || listing.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-[#aeaeb2]" />
            <span className="truncate max-w-[140px]">
              {listing.media_profile?.audience_type ? listing.media_profile.audience_type : listing.audience}
            </span>
          </span>
        </div>

        {(listing.media_profile?.past_advertisers?.length ?? listing.past_advertisers.length) > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="w-3 h-3 text-[#aeaeb2] flex-shrink-0" />
            <p className="text-[#86868b] text-[11px] flex-shrink-0">{tx.card.usedBy}</p>
            <div className="flex items-center gap-1 flex-wrap">
              {(listing.media_profile?.past_advertisers ?? listing.past_advertisers).slice(0, 3).map(a => (
                <span key={a} className="text-[10px] text-[#6e6e73] font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">
                  {a}
                </span>
              ))}
              {(listing.media_profile?.past_advertisers ?? listing.past_advertisers).length > 3 && (
                <span className="text-[10px] text-[#aeaeb2] font-medium">+{(listing.media_profile?.past_advertisers ?? listing.past_advertisers).length - 3}</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-2">
          {isLive && <CountdownTimer deadline={listing.deadline_at} compact />}
          {isLive && !hasDiscount && autoDiscount && (
            <p className="text-[10px] text-center text-[#aeaeb2]">
              Price may reduce as the deadline approaches
            </p>
          )}
          <button
            onClick={() => !isSecured && onSecure(listing)}
            disabled={isSecured}
            className={`w-full font-semibold text-[14px] py-3 rounded-2xl transition-all flex items-center justify-center gap-2
              ${isSecured
                ? 'bg-[#f5f5f7] text-[#aeaeb2] cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm'
              }`}
          >
            {!isSecured && <Lock className="w-3.5 h-3.5" />}
            {isSecured ? statusLabel || tx.card.closed : tx.card.secureSlot}
            {!isSecured && <Zap className="w-3.5 h-3.5 fill-white" />}
          </button>
          {!isSecured && (
            <div className="flex items-center justify-between">
              <p className="text-[#aeaeb2] text-[10px]">{tx.card.takes10s}</p>
              <button
                onClick={() => onDetails(listing)}
                className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-[12px] font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {tx.card.viewDetails}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] rounded-xl p-2.5 text-center">
      <p className={`text-[12px] font-semibold ${accent ? 'text-teal-600' : 'text-[#1d1d1f]'}`}>{value}</p>
      <p className="text-[#aeaeb2] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">{label}</p>
    </div>
  );
}
