import { Users, MapPin, Mail, Instagram, Mic, Shield, AlertTriangle, CheckCircle, Clock, Eye, Lock, Zap, Calendar, CalendarClock } from 'lucide-react';
import type { Listing } from '../types';
import CountdownTimer from './CountdownTimer';
import { resolvePublishDate } from '../lib/dateUtils';

interface OpportunityCardProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
}

const MEDIA_CONFIG = {
  newsletter: {
    icon: <Mail className="w-3.5 h-3.5" />,
    label: 'Newsletter',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  podcast: {
    icon: <Mic className="w-3.5 h-3.5" />,
    label: 'Podcast',
    color: 'bg-green-50 text-green-600 border-green-100',
  },
  influencer: {
    icon: <Instagram className="w-3.5 h-3.5" />,
    label: 'Influencer',
    color: 'bg-rose-50 text-rose-500 border-rose-100',
  },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; accent: string }> = {
  live: { label: 'Live', icon: null, accent: '' },
  securing: {
    label: 'Being Secured',
    icon: <Clock className="w-3 h-3" />,
    accent: 'border-t-orange-400',
  },
  pending_review: {
    label: 'Pending Review',
    icon: <AlertTriangle className="w-3 h-3" />,
    accent: 'border-t-yellow-400',
  },
  secured: {
    label: 'Secured',
    icon: <CheckCircle className="w-3 h-3" />,
    accent: 'border-t-green-500',
  },
  expired: {
    label: 'Expired',
    icon: <AlertTriangle className="w-3 h-3" />,
    accent: 'border-t-red-400',
  },
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export default function OpportunityCard({ listing, onSecure, onDetails }: OpportunityCardProps) {
  const mc = MEDIA_CONFIG[listing.media_type];
  const sc = STATUS_CONFIG[listing.status] || STATUS_CONFIG.live;
  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const savings = listing.original_price - listing.discounted_price;
  const depositAmount = Math.round(listing.discounted_price * 0.1);
  const deadlinePassed = new Date(listing.deadline_at).getTime() < Date.now();
  const isLive = listing.status === 'live' && !deadlinePassed;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled' || deadlinePassed;
  const isScarce = listing.slots_remaining <= 2;

  return (
    <div
      className={`relative bg-white rounded-3xl flex flex-col transition-all duration-200 overflow-hidden
        ${isLive ? 'shadow-sm shadow-black/[0.06] hover:shadow-lg hover:shadow-black/[0.10] border border-black/[0.06] hover:border-black/[0.10]' : ''}
        ${listing.status === 'securing' && !deadlinePassed ? 'border border-orange-200 shadow-sm' : ''}
        ${listing.status === 'pending_review' && !deadlinePassed ? 'border border-yellow-200 shadow-sm' : ''}
        ${listing.status === 'secured' ? 'border border-black/[0.06] opacity-50' : ''}
        ${listing.status === 'expired' ? 'border border-black/[0.06] opacity-35' : ''}
        ${deadlinePassed && listing.status !== 'secured' && listing.status !== 'expired' && listing.status !== 'cancelled' ? 'border border-black/[0.06] opacity-40' : ''}
      `}
    >
      {listing.status !== 'live' && sc.accent && (
        <div className={`h-0.5 w-full ${sc.accent.replace('border-t-', 'bg-')}`} />
      )}

      <div className="p-5 flex flex-col h-full">

        {/* Header: type badge + Book By */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <span className={`inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${mc.color}`}>
            {mc.icon}
            {mc.label}
          </span>

          <div className="flex-shrink-0 text-right space-y-1.5">
            {/* Booking Deadline */}
            <div className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5
              ${isLive ? 'bg-orange-50' : 'bg-[#f5f5f7]'}`}>
              <CalendarClock className={`w-3 h-3 flex-shrink-0 ${isLive ? 'text-orange-500' : 'text-[#86868b]'}`} />
              <div className="text-left">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[#86868b] leading-none mb-0.5">Book By</p>
                <p className={`text-[11px] font-semibold leading-none ${isLive ? 'text-orange-600' : 'text-[#1d1d1f]'}`}>
                  {new Date(listing.deadline_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Slot availability */}
            {isLive && (
              <div className="flex items-center justify-end gap-1.5">
                <span className={`text-[10px] font-semibold ${isScarce ? 'text-orange-500' : 'text-[#6e6e73]'}`}>
                  {listing.slots_remaining} {listing.slots_remaining === 1 ? 'slot' : 'slots'}
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
        </div>

        {/* Publish Date */}
        {(() => {
          const { weekday, calDate } = resolvePublishDate(listing);
          return (
            <div className="mb-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-4 py-4 flex items-center gap-3.5 shadow-sm shadow-blue-600/20">
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-200 text-[9px] font-bold uppercase tracking-widest leading-none mb-2">Publish Date</p>
                {weekday && (
                  <p className="text-white text-[14px] font-semibold leading-none mb-1">{weekday}</p>
                )}
                <p className="text-white text-[14px] font-semibold leading-tight truncate">{calDate}</p>
              </div>
            </div>
          );
        })()}

        {/* Title block */}
        <div className="mb-4">
          <p className="text-[#86868b] text-[11px] font-medium mb-0.5">{listing.media_company_name}</p>
          <h3 className="text-[#1d1d1f] font-semibold text-[16px] leading-tight tracking-[-0.01em] mb-1">{listing.property_name}</h3>
          <p className="text-[#6e6e73] text-[12px]">{listing.media_owner_name}</p>
        </div>

        {/* Price block */}
        <div className="flex items-center justify-between mb-3 bg-[#f5f5f7] rounded-2xl p-3.5">
          <div>
            <p className="text-[#86868b] text-[10px] font-medium uppercase tracking-wide mb-1">Price per slot</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[#1d1d1f] text-2xl font-semibold tracking-[-0.02em]">${listing.discounted_price.toLocaleString()}</span>
              <span className="text-[#aeaeb2] text-sm line-through">${listing.original_price.toLocaleString()}</span>
            </div>
            <p className="text-green-600 text-[11px] font-semibold mt-0.5">Save ${savings.toLocaleString()}</p>
          </div>
          <div className="bg-[#1d1d1f] text-white text-[15px] font-bold px-3 py-1.5 rounded-2xl tabular-nums">
            -{discount}%
          </div>
        </div>

        {/* Deposit callout */}
        <div className="flex items-center justify-between mb-4 bg-green-50 rounded-2xl px-3.5 py-3">
          <div>
            <p className="text-green-700 text-[12px] font-semibold">Reserve with deposit</p>
            <p className="text-green-600/70 text-[10px] mt-0.5">Balance paid direct to creator</p>
          </div>
          <div className="text-right">
            <p className="text-green-700 text-[18px] font-bold tracking-[-0.02em]">${depositAmount.toLocaleString()}</p>
            <p className="text-green-600/70 text-[10px]">10% now</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {listing.media_type === 'newsletter' && (
            <>
              <StatPill label="Subscribers" value={fmt(listing.subscribers || 0)} />
              <StatPill label="Open rate" value={listing.open_rate || '—'} accent />
              <StatPill label="CTR" value={listing.ctr || '—'} />
            </>
          )}
          {listing.media_type === 'podcast' && (
            <>
              <StatPill label="Downloads/ep" value={fmt(listing.downloads || 0)} />
              <StatPill label="Ad type" value={listing.ad_type || '—'} accent />
              <StatPill label="Location" value={listing.location.split('/')[0].trim()} />
            </>
          )}
          {listing.media_type === 'influencer' && (
            <>
              <StatPill label="Followers" value={fmt(listing.followers || 0)} />
              <StatPill label="Engagement" value={listing.engagement_rate || '—'} accent />
              <StatPill label="Deliverable" value={listing.deliverable || '—'} />
            </>
          )}
        </div>

        {/* Context row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-[#6e6e73]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#aeaeb2]" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-[#aeaeb2]" />
            <span className="truncate">{listing.audience}</span>
          </span>
        </div>

        {/* Past advertisers */}
        {listing.past_advertisers.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <Shield className="w-3 h-3 text-[#aeaeb2] flex-shrink-0" />
            <p className="text-[#86868b] text-[11px]">Used by</p>
            <div className="flex items-center gap-1 flex-wrap">
              {listing.past_advertisers.map(a => (
                <span
                  key={a}
                  className="text-[11px] text-[#6e6e73] font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          {isLive && <CountdownTimer deadline={listing.deadline_at} compact />}
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
            {isSecured ? (deadlinePassed && listing.status !== 'secured' && listing.status !== 'cancelled' ? 'Closed' : sc.label) : 'Secure Slot'}
            {!isSecured && <Zap className="w-3.5 h-3.5 fill-white" />}
          </button>
          {!isSecured && (
            <div className="flex items-center justify-between">
              <p className="text-[#aeaeb2] text-[10px]">Takes 10 seconds</p>
              <button
                onClick={() => onDetails(listing)}
                className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-[12px] font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View details
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
    <div className="bg-[#f5f5f7] rounded-2xl p-2.5 text-center">
      <p className={`text-[12px] font-semibold ${accent ? 'text-blue-600' : 'text-[#1d1d1f]'}`}>{value}</p>
      <p className="text-[#aeaeb2] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">{label}</p>
    </div>
  );
}
