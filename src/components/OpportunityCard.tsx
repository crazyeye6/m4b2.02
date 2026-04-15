import { Users, MapPin, Mail, Instagram, Mic, Shield, AlertTriangle, CheckCircle, Clock, Eye, Lock, Zap } from 'lucide-react';
import type { Listing } from '../types';
import CountdownTimer from './CountdownTimer';

interface OpportunityCardProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
}

const MEDIA_CONFIG = {
  newsletter: {
    icon: <Mail className="w-4 h-4" />,
    label: 'Newsletter',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  podcast: {
    icon: <Mic className="w-4 h-4" />,
    label: 'Podcast',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  influencer: {
    icon: <Instagram className="w-4 h-4" />,
    label: 'Influencer',
    color: 'bg-pink-100/20 text-pink-300 border-pink-300/20',
  },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; topbar: string }> = {
  live: { label: 'Live', icon: null, topbar: '' },
  securing: {
    label: 'Being Secured',
    icon: <Clock className="w-3 h-3" />,
    topbar: 'bg-amber-400',
  },
  pending_review: {
    label: 'Pending Review',
    icon: <AlertTriangle className="w-3 h-3" />,
    topbar: 'bg-yellow-500',
  },
  secured: {
    label: 'Secured',
    icon: <CheckCircle className="w-3 h-3" />,
    topbar: 'bg-emerald-500',
  },
  expired: {
    label: 'Expired',
    icon: <AlertTriangle className="w-3 h-3" />,
    topbar: 'bg-yellow-500',
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
  const isLive = listing.status === 'live';
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled';
  const isScarce = listing.slots_remaining <= 2;

  return (
    <div
      className={`relative bg-[#161b22] rounded-xl border flex flex-col transition-all duration-200
        ${isLive ? 'border-[#30363d] hover:border-[#484f58] hover:shadow-lg hover:shadow-black/20' : ''}
        ${listing.status === 'securing' ? 'border-amber-400/30' : ''}
        ${listing.status === 'pending_review' ? 'border-yellow-500/20' : ''}
        ${listing.status === 'secured' ? 'border-emerald-500/20 opacity-60' : ''}
        ${listing.status === 'expired' ? 'border-yellow-500/15 opacity-40' : ''}
      `}
    >
      {listing.status !== 'live' && sc.topbar && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${sc.topbar}`} />
      )}

      <div className="p-5 flex flex-col h-full">

        {/* Header: type badge + urgency + timer */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-2 border text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${mc.color}`}>
            {mc.icon}
            {mc.label}
          </span>
          <div className="flex items-center gap-2">
            {isScarce && (
              <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-md">
                {listing.slots_remaining} left
              </span>
            )}
            <div className="flex items-center gap-1 bg-[#21262d] border border-[#30363d] rounded-md px-2 py-1">
              <CountdownTimer deadline={listing.deadline_at} compact />
            </div>
          </div>
        </div>

        {/* Title block */}
        <div className="mb-4">
          <p className="text-[#8b949e] text-xs font-medium mb-0.5">{listing.media_company_name}</p>
          <h3 className="text-[#e6edf3] font-bold text-base leading-tight mb-1">{listing.property_name}</h3>
          <p className="text-[#8b949e] text-xs">{listing.media_owner_name}</p>
        </div>

        {/* Price block */}
        <div className="flex items-center justify-between mb-3 bg-[#0d1117] rounded-lg p-3 border border-[#30363d]">
          <div>
            <p className="text-[#8b949e] text-[10px] font-medium uppercase tracking-wide mb-0.5">Price per slot</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[#e6edf3] text-2xl font-bold tracking-tight">${listing.discounted_price.toLocaleString()}</span>
              <span className="text-[#8b949e] text-sm line-through">${listing.original_price.toLocaleString()}</span>
            </div>
            <p className="text-emerald-400 text-xs font-semibold mt-0.5">Save ${savings.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-500 text-black text-base font-bold px-3 py-1.5 rounded-lg tabular-nums">
            -{discount}%
          </div>
        </div>

        {/* Deposit callout */}
        <div className="flex items-center justify-between mb-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5">
          <div>
            <p className="text-emerald-400 text-xs font-semibold">Reserve with deposit</p>
            <p className="text-[#8b949e] text-[10px] mt-0.5">Balance paid direct to creator</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 text-lg font-bold">${depositAmount.toLocaleString()}</p>
            <p className="text-[#8b949e] text-[10px]">10% now</p>
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-[#8b949e]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="truncate">{listing.audience}</span>
          </span>
          <span className="flex items-center gap-1">
            Ad slot: <span className="text-[#e6edf3] font-medium">{listing.date_label}</span>
          </span>
        </div>

        {/* Past advertisers */}
        {listing.past_advertisers.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <Shield className="w-3 h-3 text-[#8b949e] flex-shrink-0" />
            <p className="text-[#8b949e] text-[11px]">Used by</p>
            <div className="flex items-center gap-1 flex-wrap">
              {listing.past_advertisers.map(a => (
                <span
                  key={a}
                  className="text-[11px] text-[#8b949e] font-medium bg-[#21262d] px-1.5 py-0.5 rounded border border-[#30363d]"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <button
            onClick={() => !isSecured && onSecure(listing)}
            disabled={isSecured}
            className={`w-full font-semibold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 border
              ${isSecured
                ? 'bg-[#21262d] text-[#8b949e] border-[#30363d] cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-500/30 shadow-md shadow-emerald-900/20'
              }`}
          >
            {!isSecured && <Lock className="w-4 h-4" />}
            {isSecured ? sc.label : 'Secure Slot'}
            {!isSecured && <Zap className="w-3.5 h-3.5 fill-white" />}
          </button>
          {!isSecured && (
            <div className="flex items-center justify-between">
              <p className="text-[#8b949e] text-[10px]">Takes 10 seconds</p>
              <button
                onClick={() => onDetails(listing)}
                className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] text-xs font-semibold transition-colors underline underline-offset-2"
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
    <div className="bg-[#21262d] rounded-lg p-2 border border-[#30363d] text-center">
      <p className={`text-xs font-bold ${accent ? 'text-blue-400' : 'text-[#e6edf3]'}`}>{value}</p>
      <p className="text-[#8b949e] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">{label}</p>
    </div>
  );
}
