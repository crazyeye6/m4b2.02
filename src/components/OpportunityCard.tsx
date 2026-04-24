import { MapPin, Shield, Clock, Lock, Zap, CalendarClock, Flame, TrendingDown, ChevronRight, Mic2, Download, BarChart3, Users } from 'lucide-react';
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

const POSITION_COLORS: Record<string, string> = {
  'Pre-roll': 'bg-amber-50 text-amber-700 border-amber-200',
  'Mid-roll': 'bg-sky-50 text-sky-700 border-sky-200',
  'Post-roll': 'bg-slate-100 text-slate-600 border-slate-200',
};

function avatarGradient(name: string): string {
  const gradients = [
    'from-sky-500 to-blue-600',
    'from-teal-500 to-emerald-500',
    'from-amber-500 to-orange-500',
    'from-slate-500 to-slate-700',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-sky-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

function makeInitials(name: string): string {
  return name
    .split(/[\s\-_]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function OpportunityCard({ listing, onSecure, onDetails, onViewMediaProfile }: OpportunityCardProps) {
  const { formatPrice, browserLocale } = useLocale();
  const tx = useTranslations();

  const newsletter = (listing as any).newsletter as Newsletter | null;

  const podcastName = newsletter?.name || listing.property_name;
  const publisherName = listing.host_name || newsletter?.publisher_name || listing.media_company_name || listing.media_owner_name;

  // Niche: prefer media_profile category, then newsletter niche, then listing audience
  const niche = listing.media_profile?.category || newsletter?.niche || listing.audience || null;

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
  const isHot = tier === 'last_chance' || tier === 'mid';

  const { weekday, calDate } = resolvePublishDate(listing, browserLocale);
  const deadlineFormatted = formatDeadlineDate(listing.deadline_at, browserLocale);

  // Episode date display: prefer weekday + calDate, fall back to date_label (which may have episode info)
  const episodeDateLabel = weekday
    ? weekday
    : calDate || listing.date_label || '—';
  const episodeDateSub = weekday ? calDate : null;

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

  const geography = listing.media_profile?.primary_geography || listing.location;
  const pastAdvertisers = listing.media_profile?.past_advertisers ?? listing.past_advertisers;
  const canViewProfile = !!(listing.media_profile_id && onViewMediaProfile);

  const adPosition = listing.ad_slot_position || listing.slot_type;
  const positionClass = adPosition ? (POSITION_COLORS[adPosition] || 'bg-slate-100 text-slate-600 border-slate-200') : null;

  // Downloads: prefer explicit downloads field, then media_profile subscriber_count, then subscribers
  const rawDownloads = listing.downloads ?? listing.media_profile?.subscriber_count ?? listing.subscribers;
  const downloadsValue = rawDownloads ? fmtCompact(rawDownloads, browserLocale) : '—';

  // Audience description: prefer media_profile audience_type, then listing audience
  const audienceDesc = listing.media_profile?.audience_type || listing.audience || null;

  // Slot format label (e.g. "Host-read 60s", "Pre-roll 30s", or slot_type)
  const slotFormat = listing.deliverable || listing.slot_type || adPosition || '—';

  const cardOpacity = (() => {
    if (listing.status === 'secured') return 'opacity-50';
    if (listing.status === 'expired') return 'opacity-35';
    if (deadlinePassed && listing.status !== 'secured' && listing.status !== 'expired' && listing.status !== 'cancelled') return 'opacity-40';
    return '';
  })();

  const logoUrl = listing.media_profile?.logo_url;
  const gradient = avatarGradient(podcastName || 'P');
  const initStr = makeInitials(podcastName || 'P');

  return (
    <div
      className={`relative bg-white rounded-2xl flex flex-col overflow-hidden border transition-all duration-200
        ${isLive
          ? tier === 'last_chance' ? 'border-red-200 shadow-[0_4px_24px_rgba(239,68,68,0.10)]'
          : tier === 'mid' ? 'border-orange-200 shadow-[0_4px_24px_rgba(249,115,22,0.08)]'
          : 'border-sky-200 shadow-[0_4px_24px_rgba(14,165,233,0.10)]'
          : 'border-black/[0.06] shadow-sm'}
        ${isLive ? 'hover:shadow-xl hover:-translate-y-px' : ''}
        ${cardOpacity}
      `}
    >
      {/* Urgency accent stripe */}
      {isLive && (
        <div className={`h-[3px] w-full ${
          tier === 'last_chance' ? 'bg-gradient-to-r from-red-500 to-orange-400'
          : tier === 'mid' ? 'bg-gradient-to-r from-orange-400 to-amber-400'
          : 'bg-gradient-to-r from-sky-400 to-blue-500'
        }`} />
      )}

      {/* Open slot badge */}
      {isLive && (
        <div className="px-5 pt-4 pb-0 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            Open Slot
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Defaults to programmatic if unfilled</span>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-4 flex items-start gap-3.5">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={podcastName}
              className="w-12 h-12 rounded-2xl object-cover border border-black/[0.08]"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
              <span className="text-white text-[13px] font-bold">{initStr}</span>
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-[15px] font-bold text-slate-900 leading-tight line-clamp-1">{podcastName}</h3>
            {isHot && isLive && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-red-50 border border-red-200 text-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                <Flame className="w-2.5 h-2.5" />Hot
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {positionClass && adPosition && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${positionClass}`}>
                <Mic2 className="w-2.5 h-2.5" />{adPosition}
              </span>
            )}
            {niche && (
              <span className="text-[11px] text-slate-400 font-medium truncate">{niche}</span>
            )}
          </div>
          {publisherName && (
            <button
              onClick={canViewProfile ? (e) => { e.stopPropagation(); onViewMediaProfile!(listing.media_profile_id!); } : undefined}
              disabled={!canViewProfile}
              className={`flex items-center gap-0.5 text-[11px] font-medium mt-0.5 ${canViewProfile ? 'text-sky-600 hover:text-sky-700 hover:underline cursor-pointer' : 'text-slate-400 cursor-default'} transition-colors`}
            >
              {publisherName}
              {canViewProfile && <ChevronRight className="w-3 h-3 opacity-60" />}
            </button>
          )}
        </div>

        {/* Slots indicator */}
        {isLive && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(listing.slots_total || 3, 5) }).map((_, i) => (
                <span key={i} className={`block w-2 h-2 rounded-full ${i < listing.slots_remaining ? (isScarce ? 'bg-orange-400' : 'bg-sky-400') : 'bg-[#e5e5ea]'}`} />
              ))}
            </div>
            <span className={`text-[10px] font-semibold ${isScarce ? 'text-orange-500' : 'text-slate-400'}`}>
              {listing.slots_remaining} {listing.slots_remaining === 1 ? tx.card.slot : tx.card.slots}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Opportunity pitch */}
        {listing.opportunity_description && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Why this slot</p>
            <p className="text-[12.5px] text-slate-600 leading-[1.6] line-clamp-4">{listing.opportunity_description}</p>
          </div>
        )}

        {/* Stats grid — 4 tiles with icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatTile
            icon={<Download className="w-3.5 h-3.5 text-slate-400" />}
            label="Downloads/Ep"
            value={downloadsValue}
          />
          <StatTile
            icon={<Mic2 className="w-3.5 h-3.5 text-sky-500" />}
            label="Format"
            value={slotFormat}
            accent
          />
          <StatTile
            icon={<CalendarClock className="w-3.5 h-3.5 text-teal-500" />}
            label="Episode Date"
            value={episodeDateLabel}
            sub={episodeDateSub ?? undefined}
          />
          <StatTile
            icon={<BarChart3 className="w-3.5 h-3.5 text-orange-400" />}
            label="Slots Left"
            value={isLive ? `${listing.slots_remaining} of ${listing.slots_total || 3}` : '—'}
          />
        </div>

        {/* Audience + deadline row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {audienceDesc && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span className="text-[12px] font-medium text-slate-500 truncate max-w-[180px]">{audienceDesc}</span>
            </div>
          )}
          {isLive && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0 ml-auto
              ${isHot ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
              <Clock className="w-3 h-3" />
              {urgencyLabel || `Book by ${deadlineFormatted}`}
            </div>
          )}
        </div>

        {/* Geography */}
        {geography && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" />
            {geography}
          </div>
        )}

        {/* Discount banner */}
        {hasDiscount && isLive && (
          <div className={`flex items-start gap-2 rounded-xl px-3 py-2 ${tierStyle.bg} border ${tierStyle.border}`}>
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

        {/* Past advertisers */}
        {pastAdvertisers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Shield className="w-3 h-3 text-slate-300 flex-shrink-0" />
            <p className="text-slate-400 text-[11px] flex-shrink-0">{tx.card.usedBy}</p>
            {pastAdvertisers.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] text-slate-500 font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">
                {a}
              </span>
            ))}
            {pastAdvertisers.length > 3 && (
              <span className="text-[10px] text-slate-300 font-medium">+{pastAdvertisers.length - 3}</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">{formatPrice(currentPrice)}</span>
                {hasDiscount && (
                  <span className="text-slate-300 text-sm line-through">{formatPrice(listing.original_price)}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[11px] text-sky-600 font-semibold">5% deposit · {formatPrice(depositAmount)} now</span>
                {hasDiscount && savings > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                    tier === 'last_chance' ? 'bg-red-100 text-red-700' : tier === 'mid' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  }`}>Save {formatPrice(savings)}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => !isSecured && onSecure(listing)}
              disabled={isSecured}
              className={`flex items-center gap-2 font-bold text-[14px] px-5 py-3 rounded-xl transition-all duration-200 flex-shrink-0
                ${isSecured
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-md hover:shadow-lg hover:-translate-y-px'
                }`}
            >
              {!isSecured && <Lock className="w-4 h-4" />}
              {isSecured ? statusLabel || tx.card.closed : 'Request to Secure'}
              {!isSecured && <Zap className="w-4 h-4 fill-white" />}
            </button>
          </div>
        </div>

        {/* Countdown + details link */}
        {isLive && <CountdownTimer deadline={listing.deadline_at} compact />}
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
  );
}

function StatTile({ icon, label, value, accent, sub }: { icon: React.ReactNode; label: string; value: string; accent?: boolean; sub?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl py-3 px-2 text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className={`text-[13px] font-bold leading-tight truncate ${accent ? 'text-sky-600' : 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-[9px] text-slate-400 font-medium leading-tight truncate">{sub}</p>}
      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
