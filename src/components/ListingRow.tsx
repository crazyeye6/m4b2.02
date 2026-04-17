import {
  Mail, Mic, Instagram, MapPin, Users, Lock, Zap, Eye,
  CheckCircle, Clock, AlertTriangle, CalendarClock,
} from 'lucide-react';
import type { Listing } from '../types';
import { resolvePublishDate } from '../lib/dateUtils';
import { useLocale } from '../context/LocaleContext';
import CountdownTimer from './CountdownTimer';

interface ListingRowProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
}

const MEDIA_CONFIG = {
  newsletter: {
    icon: <Mail className="w-3.5 h-3.5" />,
    label: 'Newsletter',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    bar: 'bg-sky-500',
  },
  podcast: {
    icon: <Mic className="w-3.5 h-3.5" />,
    label: 'Podcast',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    bar: 'bg-violet-500',
  },
  influencer: {
    icon: <Instagram className="w-3.5 h-3.5" />,
    label: 'Influencer',
    color: 'bg-rose-50 text-rose-500 border-rose-100',
    bar: 'bg-rose-500',
  },
};

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

export default function ListingRow({ listing, onSecure, onDetails }: ListingRowProps) {
  const mc = MEDIA_CONFIG[listing.media_type];
  const { formatPrice } = useLocale();

  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const savings = listing.original_price - listing.discounted_price;
  const depositAmount = Math.round(listing.discounted_price * 0.1);
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

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden
        ${isLive
          ? 'border-black/[0.06] shadow-sm hover:shadow-md hover:border-black/[0.10]'
          : isSecured
            ? 'border-black/[0.06] opacity-50'
            : 'border-black/[0.06]'
        }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${mc.bar}`} />

      <div className="flex items-center gap-4 px-5 py-4 pl-6">

        {/* Media badge + name */}
        <div className="flex-1 min-w-0 flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <span className={`inline-flex items-center gap-1.5 border text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${mc.color}`}>
              {mc.icon}
              {mc.label}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-[#1d1d1f] truncate">{listing.property_name}</p>
              {statusIcon}
            </div>
            <p className="text-[12px] text-[#6e6e73] truncate">{listing.media_company_name || listing.media_owner_name}</p>
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

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {listing.media_type === 'newsletter' && (
            <>
              <StatCell label="Subscribers" value={fmt(listing.subscribers || 0)} />
              <StatCell label="Open rate" value={listing.open_rate || '—'} accent />
              <StatCell label="CTR" value={listing.ctr || '—'} />
            </>
          )}
          {listing.media_type === 'podcast' && (
            <>
              <StatCell label="Downloads/ep" value={fmt(listing.downloads || 0)} />
              <StatCell label="Ad type" value={listing.ad_type || '—'} accent />
            </>
          )}
          {listing.media_type === 'influencer' && (
            <>
              <StatCell label="Followers" value={fmt(listing.followers || 0)} />
              <StatCell label="Engagement" value={listing.engagement_rate || '—'} accent />
            </>
          )}
        </div>

        {/* Publish date */}
        <div className="hidden md:block flex-shrink-0 text-center min-w-[80px]">
          <p className="text-[10px] text-[#aeaeb2] uppercase tracking-wide font-medium">Publish</p>
          <p className="text-[12px] font-bold text-[#1d1d1f] mt-0.5">{weekday || calDate || '—'}</p>
          {weekday && <p className="text-[10px] text-[#6e6e73]">{calDate}</p>}
        </div>

        {/* Book by */}
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

        {/* Price */}
        <div className="flex-shrink-0 text-right min-w-[100px]">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[#aeaeb2] text-[11px] line-through">{formatPrice(listing.original_price)}</span>
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">-{discount}%</span>
          </div>
          <p className="text-[18px] font-bold text-[#1d1d1f] tabular-nums tracking-tight">{formatPrice(listing.discounted_price)}</p>
          <p className="text-green-600 text-[10px] font-semibold">Save {formatPrice(savings)}</p>
          <p className="text-[#aeaeb2] text-[10px] mt-0.5">Deposit: {formatPrice(depositAmount)}</p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 flex flex-col gap-1.5 min-w-[110px]">
          <button
            onClick={() => !isSecured && onSecure(listing)}
            disabled={isSecured}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all
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
