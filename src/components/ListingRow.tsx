import {
  Mic2, MapPin, Users, Lock, Zap, Eye, Download,
  CheckCircle, Clock, AlertTriangle, CalendarClock, Flame, TrendingDown,
  Shield, Tag, ChevronRight,
} from 'lucide-react';
import type { Listing, Newsletter } from '../types';
import { resolvePublishDate, formatDeadlineDate } from '../lib/dateUtils';
import { useLocale } from '../context/LocaleContext';
import { useTranslations } from '../hooks/useTranslations';
import CountdownTimer from './CountdownTimer';
import { calcDynamicPrice, TIER_STYLES } from '../lib/dynamicPricing';

interface ListingRowProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
  onViewMediaProfile?: (profileId: string) => void;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export default function ListingRow({ listing, onSecure, onDetails, onViewMediaProfile }: ListingRowProps) {
  const { formatPrice, browserLocale } = useLocale();
  const tx = useTranslations();

  const newsletter = (listing as any).newsletter as Newsletter | null;
  const isPodcast = listing.media_type === 'podcast';
  const propertyName = newsletter?.name || listing.property_name;
  const publisherName = listing.host_name || newsletter?.publisher_name || listing.media_company_name || listing.media_owner_name;
  const niche = listing.media_profile?.category || newsletter?.niche || null;

  const autoDiscount = listing.auto_discount_enabled !== false;
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, autoDiscount);
  const { currentPrice, discountPct, savings, tier, urgencyLabel } = pricing;
  const tierStyle = TIER_STYLES[tier];
  const depositAmount = Math.round(currentPrice * 0.05);
  const hasDiscount = discountPct > 0;

  const deadlinePassed = new Date(listing.deadline_at).getTime() < Date.now();
  const isLive = listing.status === 'live' && !deadlinePassed;
  const isSecured =
    listing.status === 'secured' ||
    listing.status === 'expired' ||
    listing.status === 'cancelled' ||
    deadlinePassed;

  const isScarce = listing.slots_remaining <= 2;
  const { weekday, calDate } = resolvePublishDate(listing, browserLocale);
  const deadlineFormatted = formatDeadlineDate(listing.deadline_at, browserLocale);

  const subscriberCount = listing.media_profile?.subscriber_count ?? listing.subscribers;
  const openRate = listing.media_profile?.open_rate || listing.open_rate;
  const ctr = listing.media_profile?.ctr || listing.ctr;
  const geography = listing.media_profile?.primary_geography || listing.location;
  const audienceLabel = listing.media_profile?.audience_type || listing.audience;
  const pastAdvertisers = listing.media_profile?.past_advertisers ?? listing.past_advertisers;
  const canViewProfile = !!(listing.media_profile_id && onViewMediaProfile);

  const statusIcon =
    listing.status === 'secured' ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> :
    listing.status === 'securing' ? <Clock className="w-3.5 h-3.5 text-orange-500" /> :
    listing.status === 'pending_review' ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> :
    null;

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

  const accentLineClass =
    tier === 'last_chance' ? 'bg-red-500' :
    tier === 'mid' ? 'bg-orange-500' :
    tier === 'early' ? 'bg-amber-400' :
    isPodcast ? 'bg-sky-500' : 'bg-teal-500';

  const borderClass =
    !isLive ? 'border-black/[0.06]' :
    tier === 'last_chance' ? 'border-red-200' :
    tier === 'mid' ? 'border-orange-200' :
    isPodcast ? 'border-sky-200' : 'border-teal-200';

  const ctaClass = isPodcast
    ? 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-md hover:shadow-lg hover:-translate-y-px'
    : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md hover:shadow-lg hover:-translate-y-px';

  const priceAreaClass = hasDiscount && isLive
    ? tier === 'last_chance' ? 'bg-red-50 border border-red-100'
    : tier === 'mid' ? 'bg-orange-50 border border-orange-100'
    : 'bg-amber-50 border border-amber-100'
    : isPodcast ? 'bg-sky-50 border border-sky-100' : 'bg-teal-50 border border-teal-100';

  const priceTextClass = isPodcast ? 'text-sky-600' : 'text-teal-600';

  const dateLabel = isPodcast ? 'Ep. Date' : 'Send Date';
  const downloads = listing.downloads ?? null;

  return (
    <div
      className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-200
        ${borderClass}
        ${isLive
          ? 'shadow-sm hover:shadow-md hover:-translate-y-px'
          : 'opacity-50 shadow-sm'
        }`}
    >
      {isLive && <div className={`h-[3px] w-full ${accentLineClass}`} />}

      <div className="p-5">

        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold uppercase ${isPodcast ? 'from-sky-500 to-blue-600' : 'from-teal-500 to-emerald-500'}`}>
            {listing.media_profile?.logo_url ? (
              <img
                src={listing.media_profile.logo_url}
                alt={propertyName}
                className="w-full h-full rounded-xl object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              propertyName.slice(0, 2)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{propertyName}</h3>
              {statusIcon}
              {isLive && urgencyLabel && (
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${tierStyle.badge}`}>
                  {tier === 'last_chance' && <Flame className="w-2.5 h-2.5" />}
                  {urgencyLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isPodcast ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                  <Mic2 className="w-2.5 h-2.5" />Podcast
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                  <Mic2 className="w-2.5 h-2.5" />Podcast
                </span>
              )}
              {niche && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  <Tag className="w-2.5 h-2.5" />{niche}
                </span>
              )}
              {listing.slot_type && listing.slot_type !== propertyName && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {listing.slot_type}
                </span>
              )}
            </div>
            <button
              onClick={canViewProfile ? e => { e.stopPropagation(); onViewMediaProfile!(listing.media_profile_id!); } : undefined}
              disabled={!canViewProfile}
              className={`flex items-center gap-1 text-[11px] font-medium mt-0.5 ${canViewProfile ? 'text-sky-600 hover:text-sky-700 hover:underline cursor-pointer' : 'text-slate-400 cursor-default'} transition-colors`}
            >
              {publisherName}
              {canViewProfile && <ChevronRight className="w-3 h-3 opacity-60" />}
            </button>
          </div>

          {isLive && (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className={`text-[11px] font-semibold ${isScarce ? 'text-orange-500' : 'text-slate-400'}`}>
                  {listing.slots_remaining} {listing.slots_remaining === 1 ? 'slot' : 'slots'} left
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(listing.slots_total || 5, 5) }).map((_, i) => (
                  <span key={i} className={`block w-2 h-2 rounded-full ${i < listing.slots_remaining ? (isScarce ? 'bg-orange-400' : isPodcast ? 'bg-sky-500' : 'bg-teal-500') : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
          {isPodcast ? (
            <>
              <StatCell
                icon={<Download className="w-4 h-4 text-slate-400" />}
                label="Downloads/Ep"
                value={downloads ? fmt(downloads) : '—'}
              />
              <StatCell
                icon={<Mic2 className="w-4 h-4 text-sky-500" />}
                label="Ad Slot"
                value={listing.ad_slot_position || listing.slot_type || '—'}
                accent
              />
            </>
          ) : (
            <>
              <StatCell
                icon={<Users className="w-4 h-4 text-slate-400" />}
                label="Subscribers"
                value={subscriberCount ? fmt(subscriberCount) : '—'}
              />
              <StatCell
                icon={<Eye className="w-4 h-4 text-teal-500" />}
                label="Open Rate"
                value={openRate || '—'}
                accent
              />
            </>
          )}
          <StatCell
            icon={<CalendarClock className="w-4 h-4 text-slate-400" />}
            label={dateLabel}
            value={weekday || calDate || '—'}
            sub={weekday ? calDate : undefined}
          />
          <StatCell
            icon={<Clock className="w-4 h-4 text-orange-400" />}
            label="Book By"
            value={deadlineFormatted}
            hot={isLive && isScarce}
          />
        </div>

        {/* Extra stats row */}
        {(ctr || geography || audienceLabel) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[11px] text-slate-400">
            {ctr && (
              <span className="flex items-center gap-1 font-medium">
                <Eye className="w-3 h-3 text-slate-300" />
                Audience <span className="text-slate-600 font-semibold ml-0.5">{ctr}</span>
              </span>
            )}
            {geography && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-300" />
                {geography}
              </span>
            )}
            {audienceLabel && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-300" />
                <span className="truncate max-w-[200px]">{audienceLabel}</span>
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className={`flex items-center justify-between rounded-2xl px-5 py-4 ${priceAreaClass}`}>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-slate-400 text-[13px] line-through">{formatPrice(listing.original_price)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {hasDiscount ? (
                <>
                  <TrendingDown className={`w-3.5 h-3.5 ${priceTextClass}`} />
                  <p className={`text-[11px] font-semibold ${priceTextClass}`}>
                    Save {formatPrice(savings)} · {tx.card.reserveWithDeposit} {formatPrice(depositAmount)}
                  </p>
                </>
              ) : (
                <>
                  <TrendingDown className={`w-3.5 h-3.5 ${priceTextClass} opacity-50`} />
                  <p className={`text-[11px] font-semibold ${priceTextClass}`}>
                    {tx.card.reserveWithDeposit} {formatPrice(depositAmount)}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => !isSecured && onSecure(listing)}
              disabled={isSecured}
              className={`flex items-center gap-2 font-bold text-[14px] px-5 py-3 rounded-xl transition-all duration-200 ${
                isSecured ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ctaClass
              }`}
            >
              {!isSecured && <Lock className="w-4 h-4" />}
              {isSecured ? statusLabel || tx.card.closed : tx.card.secureSlot}
              {!isSecured && <Zap className="w-4 h-4 fill-white" />}
            </button>
            {!isSecured && (
              <button
                onClick={() => onDetails(listing)}
                className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {tx.card.viewDetails}
              </button>
            )}
          </div>
        </div>

        {/* Past advertisers */}
        {pastAdvertisers && pastAdvertisers.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <Shield className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <p className="text-slate-400 text-[11px] flex-shrink-0">{tx.card.usedBy}</p>
            <div className="flex items-center gap-1 flex-wrap">
              {pastAdvertisers.slice(0, 4).map(a => (
                <span key={a} className="text-[10px] text-slate-500 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  {a}
                </span>
              ))}
              {pastAdvertisers.length > 4 && (
                <span className="text-[10px] text-slate-300 font-medium">+{pastAdvertisers.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {isLive && (
          <div className="mt-3">
            <CountdownTimer deadline={listing.deadline_at} compact />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCell({
  icon, label, value, sub, accent, hot,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  hot?: boolean;
}) {
  return (
    <div className="bg-slate-50 rounded-xl py-3 px-2 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className={`text-[14px] font-bold leading-tight ${accent ? 'text-sky-600' : hot ? 'text-orange-600' : 'text-slate-800'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{sub}</p>}
      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{label}</p>
    </div>
  );
}
