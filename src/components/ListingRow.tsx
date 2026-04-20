import {
  Mail, MapPin, Users, Lock, Zap, Eye,
  CheckCircle, Clock, AlertTriangle, CalendarClock, Flame, TrendingDown,
} from 'lucide-react';
import type { Listing } from '../types';
import { resolvePublishDate } from '../lib/dateUtils';
import { useLocale } from '../context/LocaleContext';
import CountdownTimer from './CountdownTimer';
import { calcDynamicPrice, TIER_STYLES } from '../lib/dynamicPricing';

interface ListingRowProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
  onViewMediaProfile?: (profileId: string) => void;
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center min-w-[60px]">
      <p className={`text-[13px] font-semibold tabular-nums ${accent ? 'text-teal-600' : 'text-[#1d1d1f]'}`}>{value}</p>
      <p className="text-[9px] text-[#aeaeb2] uppercase tracking-wide font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default function ListingRow({ listing, onSecure, onDetails, onViewMediaProfile }: ListingRowProps) {
  const { formatPrice } = useLocale();

  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at);
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
  const { weekday, calDate } = resolvePublishDate(listing);
  const deadlineFormatted = new Date(listing.deadline_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const statusIcon =
    listing.status === 'secured' ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> :
    listing.status === 'securing' ? <Clock className="w-3.5 h-3.5 text-orange-500" /> :
    listing.status === 'pending_review' ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> :
    null;

  const accentBarClass = tier === 'last_chance'
    ? 'bg-red-500'
    : tier === 'mid'
    ? 'bg-orange-500'
    : tier === 'early'
    ? 'bg-amber-400'
    : 'bg-green-500';

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden
        ${isLive
          ? 'border-black/[0.06] shadow-sm hover:shadow-md hover:border-black/[0.10]'
          : 'border-black/[0.06] opacity-50'
        }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentBarClass}`} />

      <div className="flex items-center gap-3 px-5 py-3.5 pl-5">

        <div className="flex-1 min-w-0 flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5 flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 border border-green-100 bg-green-50 text-green-600 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              <Mail className="w-3 h-3" />
              Newsletter
            </span>
            {isLive && urgencyLabel && (
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tierStyle.badge}`}>
                {tier === 'last_chance' && <Flame className="w-2 h-2" />}
                {urgencyLabel}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-bold text-[#1d1d1f] truncate leading-tight">{listing.property_name}</p>
              {statusIcon}
            </div>
            {listing.media_profile_id && onViewMediaProfile ? (
              <button
                onClick={e => { e.stopPropagation(); onViewMediaProfile(listing.media_profile_id!); }}
                className="text-[12px] text-sky-600 hover:text-sky-700 hover:underline truncate text-left transition-colors"
              >
                {listing.media_company_name || listing.media_owner_name}
              </button>
            ) : (
              <p className="text-[12px] text-[#6e6e73] truncate">{listing.media_company_name || listing.media_owner_name}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-[#aeaeb2]">
                <MapPin className="w-3 h-3" />
                {listing.location}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#aeaeb2] truncate max-w-[160px]">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{listing.audience}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-5 flex-shrink-0">
          <StatCell label="Subscribers" value={fmt(listing.subscribers || 0)} />
          <StatCell label="Open rate" value={listing.open_rate || '—'} accent />
          <StatCell label="CTR" value={listing.ctr || '—'} />
        </div>

        <div className="hidden md:block flex-shrink-0 text-center min-w-[76px]">
          <p className="text-[10px] text-[#aeaeb2] uppercase tracking-wide font-medium">Send date</p>
          <p className="text-[12px] font-bold text-[#1d1d1f] mt-0.5">{weekday || calDate || '—'}</p>
          {weekday && <p className="text-[10px] text-[#6e6e73]">{calDate}</p>}
        </div>

        <div className="hidden sm:flex flex-col items-center flex-shrink-0 min-w-[90px]">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${isLive ? 'bg-orange-50 text-orange-600' : 'bg-[#f5f5f7] text-[#6e6e73]'}`}>
            <CalendarClock className="w-3 h-3" />
            {deadlineFormatted}
          </div>
          {isLive && (
            <div className="mt-1 w-full">
              <CountdownTimer deadline={listing.deadline_at} compact />
            </div>
          )}
          {isLive && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] font-semibold ${isScarce ? 'text-orange-500' : 'text-[#6e6e73]'}`}>
                {listing.slots_remaining} slot{listing.slots_remaining !== 1 ? 's' : ''} left
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(listing.slots_total || 5, 5) }).map((_, i) => (
                  <span
                    key={i}
                    className={`block w-1.5 h-1.5 rounded-full ${
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

        <div className="flex-shrink-0 text-right min-w-[105px]">
          {hasDiscount ? (
            <>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[#aeaeb2] text-[11px] line-through">{formatPrice(listing.original_price)}</span>
                <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${tierStyle.badge}`}>-{discountPct}%</span>
              </div>
              <p className="text-[18px] font-bold text-[#1d1d1f] tabular-nums tracking-tight">{formatPrice(currentPrice)}</p>
              <div className="flex items-center justify-end gap-1">
                <TrendingDown className="w-3 h-3 text-green-600" />
                <p className="text-green-600 text-[10px] font-semibold">Save {formatPrice(savings)}</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-[18px] font-bold text-[#1d1d1f] tabular-nums tracking-tight">{formatPrice(currentPrice)}</p>
              <p className="text-[10px] text-[#aeaeb2]">Full price</p>
            </>
          )}
          <p className="text-[#aeaeb2] text-[10px] mt-0.5">Deposit: {formatPrice(depositAmount)}</p>
        </div>

        <div className="flex-shrink-0 flex flex-col gap-1.5 min-w-[96px]">
          <button
            onClick={() => !isSecured && onSecure(listing)}
            disabled={isSecured}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all
              ${isSecured
                ? 'bg-[#f5f5f7] text-[#aeaeb2] cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm'
              }`}
          >
            {!isSecured && <Lock className="w-3 h-3" />}
            {isSecured ? 'Closed' : 'Secure'}
            {!isSecured && <Zap className="w-3 h-3 fill-white" />}
          </button>
          {!isSecured && (
            <button
              onClick={() => onDetails(listing)}
              className="flex items-center justify-center gap-1 text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] font-medium transition-colors py-1"
            >
              <Eye className="w-3 h-3" />
              Details
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
