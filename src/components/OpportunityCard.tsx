import { Users, MapPin, BarChart2, Mic, Mail, Instagram, Shield, AlertTriangle, CheckCircle, Clock, Eye, Lock } from 'lucide-react';
import type { Listing } from '../types';
import CountdownTimer from './CountdownTimer';

interface OpportunityCardProps {
  listing: Listing;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
}

const MEDIA_CONFIG = {
  newsletter: {
    icon: <Mail className="w-3 h-3" />,
    label: 'Newsletter',
    color: 'bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/25',
    accent: '#58a6ff',
  },
  podcast: {
    icon: <Mic className="w-3 h-3" />,
    label: 'Podcast',
    color: 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/25',
    accent: '#3fb950',
  },
  influencer: {
    icon: <Instagram className="w-3 h-3" />,
    label: 'Influencer',
    color: 'bg-[#f78166]/10 text-[#f78166] border-[#f78166]/25',
    accent: '#f78166',
  },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; badge: string; topbar: string }> = {
  live: { label: 'Live', icon: null, badge: '', topbar: '' },
  securing: {
    label: 'Being Secured',
    icon: <Clock className="w-3 h-3" />,
    badge: 'bg-[#e3b341]/10 text-[#e3b341] border-[#e3b341]/25',
    topbar: 'bg-[#e3b341]',
  },
  pending_review: {
    label: 'Pending Review',
    icon: <AlertTriangle className="w-3 h-3" />,
    badge: 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/25',
    topbar: 'bg-[#f85149]',
  },
  secured: {
    label: 'Secured',
    icon: <CheckCircle className="w-3 h-3" />,
    badge: 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/25',
    topbar: 'bg-[#3fb950]',
  },
  expired: {
    label: 'Expired',
    icon: <AlertTriangle className="w-3 h-3" />,
    badge: 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/25',
    topbar: 'bg-[#f85149]',
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
      className={`relative bg-[#161b22] rounded-lg border flex flex-col transition-all duration-200
        ${isLive ? 'border-[#30363d] hover:border-[#484f58]' : ''}
        ${listing.status === 'securing' ? 'border-[#e3b341]/30' : ''}
        ${listing.status === 'pending_review' ? 'border-[#f85149]/20' : ''}
        ${listing.status === 'secured' ? 'border-[#3fb950]/20 opacity-70' : ''}
        ${listing.status === 'expired' ? 'border-[#f85149]/15 opacity-50' : ''}
      `}
    >
      {listing.status !== 'live' && sc.topbar && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-lg ${sc.topbar}`} />
      )}

      <div className="p-4 flex flex-col h-full gap-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${mc.color}`}>
                {mc.icon}
                {mc.label}
              </span>
              {listing.status !== 'live' && (
                <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${sc.badge}`}>
                  {sc.icon}
                  {sc.label}
                </span>
              )}
            </div>
            <p className="text-[#8b949e] text-[11px] font-medium mb-0.5">{listing.media_company_name}</p>
            <h3 className="text-[#e6edf3] font-semibold text-sm leading-tight truncate">{listing.property_name}</h3>
            <p className="text-[#6e7681] text-[11px] mt-0.5">{listing.media_owner_name}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 bg-[#21262d] border border-[#30363d] rounded-md px-2 py-1">
              <CountdownTimer deadline={listing.deadline_at} compact />
            </div>
            <div className="bg-[#da3633] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums">
              -{discount}%
            </div>
          </div>
        </div>

        <div className="flex items-end gap-3 mb-3 bg-[#21262d] rounded-md p-2.5 border border-[#30363d]">
          <div>
            <p className="text-[#6e7681] text-[10px] font-medium mb-0.5">Price per slot</p>
            <p className="text-[#e6edf3] text-2xl font-bold tracking-tight leading-none">
              ${listing.discounted_price.toLocaleString()}
            </p>
          </div>
          <div className="pb-0.5">
            <p className="text-[#6e7681] text-[11px] line-through">${listing.original_price.toLocaleString()}</p>
            <p className="text-[#3fb950] text-[11px] font-semibold">Save ${savings.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <DepositStat label="Deposit now" value={`$${depositAmount.toLocaleString()}`} sub="10%" highlight />
          <DepositStat label="Balance direct" value={`$${(listing.discounted_price - depositAmount).toLocaleString()}`} sub="90%" />
          <DepositStat
            label="Slots left"
            value={`${listing.slots_remaining}`}
            sub={isScarce ? 'scarce' : 'avail.'}
            warn={isScarce}
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {listing.media_type === 'newsletter' && (
            <>
              <Metric label="Subscribers" value={fmt(listing.subscribers || 0)} />
              <Metric label="Open rate" value={listing.open_rate || '—'} highlight />
              <Metric label="CTR" value={listing.ctr || '—'} />
            </>
          )}
          {listing.media_type === 'podcast' && (
            <>
              <Metric label="Downloads/ep" value={fmt(listing.downloads || 0)} />
              <Metric label="Ad type" value={listing.ad_type || '—'} highlight />
              <Metric label="Location" value={listing.location.split('/')[0].trim()} />
            </>
          )}
          {listing.media_type === 'influencer' && (
            <>
              <Metric label="Followers" value={fmt(listing.followers || 0)} />
              <Metric label="Engagement" value={listing.engagement_rate || '—'} highlight />
              <Metric label="Deliverable" value={listing.deliverable || '—'} />
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mb-2.5 text-[11px] text-[#8b949e]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#6e7681]" />
            {listing.location}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#30363d]" />
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-[#6e7681]" />
            <span className="truncate">{listing.audience}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2.5">
          <BarChart2 className="w-3 h-3 text-[#6e7681]" />
          <span className="text-[11px] text-[#8b949e]">{listing.slot_type}</span>
          <span className="w-1 h-1 rounded-full bg-[#30363d]" />
          <span className="text-[11px] text-[#8b949e]">{listing.date_label}</span>
        </div>

        {listing.past_advertisers.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Shield className="w-3 h-3 text-[#6e7681] flex-shrink-0" />
            <p className="text-[#6e7681] text-[11px]">Used by</p>
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

        <div className="flex flex-col gap-2 mt-auto pt-2">
          <div className="flex gap-2">
            <button
              onClick={() => !isSecured && onSecure(listing)}
              disabled={isSecured}
              className={`flex-1 font-medium text-sm py-2 rounded-md transition-all flex items-center justify-center gap-1.5 border
                ${isSecured
                  ? 'bg-[#21262d] text-[#6e7681] border-[#30363d] cursor-not-allowed'
                  : 'bg-[#238636] hover:bg-[#2ea043] text-white border-[#2ea043]/40'
                }`}
            >
              {!isSecured && <Lock className="w-3.5 h-3.5" />}
              {isSecured ? sc.label : 'Secure Slot'}
            </button>
            <button
              onClick={() => onDetails(listing)}
              className="flex items-center justify-center gap-1.5 border border-[#30363d] hover:border-[#484f58] hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium px-3 py-2 rounded-md transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
          {!isSecured && (
            <div className="flex items-center justify-center gap-3 text-[10px] text-[#6e7681]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                Reserve with 10% deposit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30363d]" />
                Balance paid direct to creator
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#21262d] rounded-md p-1.5 border border-[#30363d] text-center">
      <p className={`text-xs font-semibold ${highlight ? 'text-[#58a6ff]' : 'text-[#e6edf3]'}`}>{value}</p>
      <p className="text-[#6e7681] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">{label}</p>
    </div>
  );
}

function DepositStat({ label, value, sub, highlight, warn }: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-md p-1.5 border text-center ${
      highlight
        ? 'bg-[#3fb950]/8 border-[#3fb950]/20'
        : warn
        ? 'bg-[#da3633]/8 border-[#da3633]/20'
        : 'bg-[#21262d] border-[#30363d]'
    }`}>
      <p className={`text-xs font-semibold ${highlight ? 'text-[#3fb950]' : warn ? 'text-[#f85149]' : 'text-[#e6edf3]'}`}>{value}</p>
      <p className={`text-[10px] mt-0.5 font-medium leading-tight ${highlight ? 'text-[#3fb950]/60' : warn ? 'text-[#f85149]/60' : 'text-[#6e7681]'}`}>{sub}</p>
      <p className="text-[#484f58] text-[9px] uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}
