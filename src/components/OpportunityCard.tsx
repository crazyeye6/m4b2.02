import { Users, MapPin, Mail, Shield, Clock, Lock, Zap, CalendarClock, Flame, TrendingDown, Tag, ChevronRight, Mic2 } from 'lucide-react';
import type { Listing, Newsletter } from '../types';
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

  const newsletter = (listing as any).newsletter as Newsletter | null;
  const isPodcast = listing.media_type === 'podcast';

  const newsletterName = newsletter?.name || listing.property_name;
  const publisherName = listing.host_name || newsletter?.publisher_name || listing.media_company_name || listing.media_owner_name;
  const niche = listing.media_profile?.category || newsletter?.niche || null;

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
    : 'bg-teal-500';

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

  const subscriberCount = listing.media_profile?.subscriber_count ?? listing.subscribers;
  const openRate = listing.media_profile?.open_rate || listing.open_rate;
  const geography = listing.media_profile?.primary_geography || listing.location;
  const pastAdvertisers = listing.media_profile?.past_advertisers ?? listing.past_advertisers;
  const canViewProfile = !!(listing.media_profile_id && onViewMediaProfile);

  return (
    <div
      className={`relative bg-white rounded-3xl flex flex-col overflow-hidden border transition-all duration-200
        ${cardBorderClass} ${cardOpacity}
        ${isLive ? 'shadow-sm shadow-black/[0.06] hover:shadow-lg hover:shadow-black/[0.09] hover:border-black/[0.10] hover:-translate-y-px' : 'shadow-sm'}
      `}
    >
      {/* Urgency accent line */}
      {isLive && <div className={`h-[2px] w-full ${urgencyAccentClass}`} />}

      <div className="p-5 flex flex-col h-full">

        {/* Row 1: Format badge + urgency + slots indicator */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPodcast ? (
              <span className="inline-flex items-center gap-1.5 border border-sky-100 bg-sky-50 text-sky-700 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0">
                <Mic2 className="w-3.5 h-3.5" />
                Podcast
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-teal-100 bg-teal-50 text-teal-700 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0">
                <Mail className="w-3.5 h-3.5" />
                Newsletter
              </span>
            )}
            {niche && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-[#f5f5f7] border border-black/[0.06] px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                {niche}
              </span>
            )}
            {isLive && urgencyLabel && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tierStyle.badge}`}>
                {tier === 'last_chance' && <Flame className="w-2.5 h-2.5" />}
                {urgencyLabel}
              </span>
            )}
          </div>

          {isLive && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-semibold ${isScarce ? 'text-orange-500' : 'text-slate-400'}`}>
                {listing.slots_remaining} {listing.slots_remaining === 1 ? tx.card.slot : tx.card.slots}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(listing.slots_total || 5, 5) }).map((_, i) => (
                  <span key={i} className={`block w-2 h-2 rounded-full ${i < listing.slots_remaining ? (isScarce ? 'bg-orange-400' : 'bg-teal-500') : 'bg-[#e5e5ea]'}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Newsletter/Podcast identity */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-0.5">
            {listing.media_profile?.logo_url && (
              <img
                src={listing.media_profile.logo_url}
                alt={newsletterName}
                className="w-5 h-5 rounded-md object-cover border border-black/[0.06] flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <h3 className="text-slate-900 text-[15px] font-bold leading-tight line-clamp-1">{newsletterName}</h3>
          </div>
          <button
            onClick={canViewProfile ? (e) => { e.stopPropagation(); onViewMediaProfile!(listing.media_profile_id!); } : undefined}
            disabled={!canViewProfile}
            className={`flex items-center gap-1 text-[11px] font-medium ${canViewProfile ? 'text-sky-600 hover:text-sky-700 hover:underline cursor-pointer' : 'text-slate-400 cursor-default'} transition-colors`}
          >
            {publisherName}
            {canViewProfile && <ChevronRight className="w-3 h-3 opacity-60" />}
          </button>
        </div>

        {/* Row 3: Slot type */}
        {listing.slot_type && listing.slot_type !== newsletterName && (
          <div className="mb-3 inline-flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {listing.slot_type}
            </span>
          </div>
        )}

        {/* Row 4: Publish date + deadline */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3">
            <p className="text-teal-500 text-[8px] font-bold uppercase tracking-widest leading-none mb-1.5">{isPodcast ? 'Episode Date' : 'Issue Date'}</p>
            {weekday ? (
              <>
                <p className="text-teal-900 text-[13px] font-bold leading-tight truncate mb-0.5">{weekday}</p>
                <p className="text-teal-600/60 text-[10px] font-medium leading-none truncate">{calDate}</p>
              </>
            ) : (
              <p className="text-teal-900 text-[13px] font-bold leading-tight truncate">{calDate || '—'}</p>
            )}
          </div>

          <div className={`rounded-2xl p-3 ${isLive ? 'bg-orange-50 border border-orange-100' : 'bg-[#f5f5f7] border border-black/[0.04]'}`}>
            <p className={`text-[8px] font-bold uppercase tracking-widest leading-none mb-1.5 ${isLive ? 'text-orange-400' : 'text-slate-400'}`}>Book By</p>
            <p className={`text-[13px] font-bold leading-tight ${isLive ? 'text-orange-700' : 'text-slate-900'}`}>{deadlineFormatted}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <CalendarClock className={`w-2.5 h-2.5 ${isLive ? 'text-orange-400' : 'text-slate-300'}`} />
              <p className="text-[9px] font-medium text-slate-400">Booking deadline</p>
            </div>
          </div>
        </div>

        {/* Row 5: Price */}
        <div className={`flex items-center justify-between mb-2.5 rounded-2xl p-3.5
          ${hasDiscount && isLive
            ? tier === 'last_chance' ? 'bg-red-50 border border-red-100' : tier === 'mid' ? 'bg-orange-50 border border-orange-100' : 'bg-amber-50 border border-amber-100'
            : 'bg-[#f5f5f7]'
          }`}>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide">{tx.card.pricePerSlot}</p>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md leading-none ${
                hasDiscount
                  ? tier === 'last_chance' ? 'bg-red-100 text-red-700' : tier === 'mid' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  : 'bg-[#f0f0f2] text-slate-500'
              }`}>
                {hasDiscount ? `${discountPct}% Off` : autoDiscount ? 'Auto-Discount' : 'Fixed'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-900 text-2xl font-semibold tracking-[-0.02em]">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-slate-300 text-sm line-through">{formatPrice(listing.original_price)}</span>
              )}
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendingDown className="w-3 h-3 text-teal-600" />
                <p className="text-teal-600 text-[11px] font-semibold">{tx.card.save} {formatPrice(savings)}</p>
              </div>
            )}
          </div>
          {hasDiscount && (
            <div className={`text-white text-[15px] font-bold px-3 py-1.5 rounded-2xl tabular-nums shadow-sm ${tierStyle.badge}`}>
              -{discountPct}%
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
                ? `${discountPct}% off — deadline approaching`
                : `${discountPct}% off — early discount active`}
            </p>
          </div>
        )}

        {/* Row 6: Deposit strip */}
        <div className="flex items-center justify-between mb-3 bg-teal-50 border border-teal-100 rounded-2xl px-3.5 py-2.5">
          <div>
            <p className="text-teal-700 text-[12px] font-semibold">{tx.card.reserveWithDeposit}</p>
            <p className="text-teal-600/70 text-[10px] mt-0.5">{tx.card.balanceDirect}</p>
          </div>
          <div className="text-right">
            <p className="text-teal-700 text-[18px] font-bold tracking-[-0.02em]">{formatPrice(depositAmount)}</p>
            <p className="text-teal-600/70 text-[10px]">{tx.card.now}</p>
          </div>
        </div>

        {/* Row 7: Audience stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {isPodcast ? (
            <>
              <StatPill label="Downloads/Ep" value={listing.downloads ? fmtCompact(listing.downloads, browserLocale) : '—'} />
              <StatPill label="Ad Slot" value={listing.ad_slot_position || listing.slot_type || '—'} accent />
            </>
          ) : (
            <>
              <StatPill label={tx.card.subscribers} value={subscriberCount ? fmtCompact(subscriberCount, browserLocale) : '—'} />
              <StatPill label={tx.card.openRate} value={openRate || '—'} accent />
            </>
          )}
          <StatPill label={tx.card.ctr} value={listing.media_profile?.ctr || listing.ctr || '—'} />
        </div>

        {/* Row 8: Geography + audience */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-slate-400">
          {geography && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-300" />
              {geography}
            </span>
          )}
          {(listing.media_profile?.audience_type || listing.audience) && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-300" />
              <span className="truncate max-w-[140px]">
                {listing.media_profile?.audience_type || listing.audience}
              </span>
            </span>
          )}
        </div>

        {/* Row 9: Past advertisers */}
        {pastAdvertisers.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <p className="text-slate-400 text-[11px] flex-shrink-0">{tx.card.usedBy}</p>
            <div className="flex items-center gap-1 flex-wrap">
              {pastAdvertisers.slice(0, 3).map(a => (
                <span key={a} className="text-[10px] text-slate-500 font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">
                  {a}
                </span>
              ))}
              {pastAdvertisers.length > 3 && (
                <span className="text-[10px] text-slate-300 font-medium">+{pastAdvertisers.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Row 10: CTA */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          {isLive && <CountdownTimer deadline={listing.deadline_at} compact />}
          {isLive && !hasDiscount && autoDiscount && (
            <p className="text-[10px] text-center text-slate-300">
              Price may reduce as the deadline approaches
            </p>
          )}
          <button
            onClick={() => !isSecured && onSecure(listing)}
            disabled={isSecured}
            className={`w-full font-semibold text-[14px] py-3 rounded-2xl transition-all flex items-center justify-center gap-2
              ${isSecured
                ? 'bg-[#f5f5f7] text-slate-300 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm'
              }`}
          >
            {!isSecured && <Lock className="w-3.5 h-3.5" />}
            {isSecured ? statusLabel || tx.card.closed : tx.card.secureSlot}
            {!isSecured && <Zap className="w-3.5 h-3.5 fill-white" />}
          </button>
          {!isSecured && (
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-[10px]">{tx.card.takes10s}</p>
              <button
                onClick={() => onDetails(listing)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-[12px] font-medium transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
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
      <p className={`text-[12px] font-semibold ${accent ? 'text-teal-600' : 'text-slate-900'}`}>{value}</p>
      <p className="text-slate-400 text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">{label}</p>
    </div>
  );
}
