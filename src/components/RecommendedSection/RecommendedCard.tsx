import { useState, useRef } from 'react';
import { Users, MapPin, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import type { ScoredListing } from '../../lib/matchScore';
import type { Listing } from '../../types';
import MatchScoreBadge from './MatchScoreBadge';
import WhyMatchPopover from './WhyMatchPopover';
import { useLocale } from '../../context/LocaleContext';
import { formatCountdown } from '../../lib/dateUtils';

interface Props {
  scored: ScoredListing;
  onView: (listing: Listing) => void;
}

function compactNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function RecommendedCard({ scored, onView }: Props) {
  const { listing, score, label, reasons } = scored;
  const { formatPrice } = useLocale();
  const [showWhy, setShowWhy] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const whyBtnRef = useRef<HTMLButtonElement>(null);

  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);

  const borderColor =
    score >= 90 ? 'border-emerald-200' :
    score >= 75 ? 'border-teal-200' :
    'border-slate-200';

  const toggleWhy = () => {
    if (showWhy) { setShowWhy(false); return; }
    setAnchorRect(whyBtnRef.current?.getBoundingClientRect() ?? null);
    setShowWhy(true);
  };

  return (
    <div className={`relative bg-white rounded-2xl border ${borderColor} shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col`}>
      {/* Top strip accent */}
      {score >= 90 && (
        <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[14px] font-bold text-slate-600 flex-shrink-0">
              {listing.property_name?.[0] ?? listing.media_owner_name?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900 leading-tight">{listing.property_name}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{listing.media_company_name || listing.media_owner_name}</p>
            </div>
          </div>
          <MatchScoreBadge score={score} label={label} />
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(listing.tags ?? []).slice(0, 3).map(tag => (
            <span key={tag.id} className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              {tag.display_name ?? tag.name}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-slate-700">
              {listing.subscribers ? compactNum(listing.subscribers) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-600 truncate">{listing.location || '—'}</span>
          </div>
          {listing.open_rate && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400">Open</span>
              <span className="text-[11px] font-semibold text-slate-700 ml-1">{listing.open_rate}</span>
            </div>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[11px] text-slate-400 line-through">{formatPrice(listing.original_price)}</p>
            <p className="text-[22px] font-bold text-slate-900 leading-none">{formatPrice(listing.discounted_price)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" />-{discount}%
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatCountdown(listing.deadline_at)}</span>
            </div>
          </div>
        </div>

        {/* Match reason pill */}
        {reasons[0] && (
          <div className="mb-4 px-3 py-2 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <p className="text-[11px] text-emerald-700 font-medium">{reasons[0]}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={() => onView(listing)}
            className="flex-1 group inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-[13px] transition-all duration-150 shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.22)]"
          >
            View Opportunity
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-100" />
          </button>
          <button
            ref={whyBtnRef}
            onClick={toggleWhy}
            className="text-[12px] text-slate-500 hover:text-slate-800 font-medium px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-150 whitespace-nowrap"
          >
            Why this?
          </button>
        </div>
      </div>

      {showWhy && (
        <WhyMatchPopover reasons={reasons} onClose={() => setShowWhy(false)} anchorRect={anchorRect} />
      )}
    </div>
  );
}
