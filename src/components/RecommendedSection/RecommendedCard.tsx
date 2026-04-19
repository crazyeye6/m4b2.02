import { useState } from 'react';
import { Users, MapPin, TrendingDown, Clock, ArrowRight, ChevronDown, Sparkles, Zap } from 'lucide-react';
import type { ScoredListing } from '../../lib/matchScore';
import type { Listing } from '../../types';
import MatchScoreBadge from './MatchScoreBadge';
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
  const { listing, score, label, reasons, explanationLine, dealScore } = scored;
  const { formatPrice } = useLocale();
  const [showWhy, setShowWhy] = useState(false);

  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);

  const borderColor =
    score >= 85 ? 'border-emerald-200' :
    score >= 65 ? 'border-teal-200' :
    'border-slate-200';

  const topBarColor =
    score >= 85 ? 'from-emerald-400 to-teal-400' :
    score >= 65 ? 'from-teal-400 to-cyan-400' :
    'from-slate-300 to-slate-400';

  const dealLabel =
    dealScore >= 80 ? 'Exceptional Deal' :
    dealScore >= 60 ? 'Strong Deal' :
    dealScore >= 40 ? 'Good Deal' :
    'Fair Deal';

  const dealColors =
    dealScore >= 80 ? 'bg-orange-50 border-orange-200 text-orange-700' :
    dealScore >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' :
    'bg-slate-50 border-slate-200 text-slate-600';

  const dealDotColor =
    dealScore >= 80 ? 'bg-orange-400' :
    dealScore >= 60 ? 'bg-amber-400' :
    'bg-slate-400';

  const whyIconColor =
    score >= 85 ? 'text-emerald-500' :
    score >= 65 ? 'text-teal-500' :
    'text-slate-400';

  const whyBg =
    score >= 85 ? 'bg-emerald-50 border-emerald-100' :
    score >= 65 ? 'bg-teal-50 border-teal-100' :
    'bg-slate-50 border-slate-100';

  const whyTextColor =
    score >= 85 ? 'text-emerald-700' :
    score >= 65 ? 'text-teal-700' :
    'text-slate-600';

  const whyDotColor =
    score >= 85 ? 'bg-emerald-400' :
    score >= 65 ? 'bg-teal-400' :
    'bg-slate-400';

  return (
    <div className={`relative bg-white rounded-2xl border ${borderColor} shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col`}>
      <div className={`h-0.5 bg-gradient-to-r ${topBarColor}`} />

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

        {/* Explanation line */}
        <div className="mb-3 flex items-start gap-1.5">
          <Sparkles className={`w-3 h-3 ${whyIconColor} flex-shrink-0 mt-0.5`} />
          <p className={`text-[11px] font-medium leading-snug ${whyTextColor}`}>{explanationLine}</p>
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

        {/* Price + Deal Score row */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[11px] text-slate-400 line-through">{formatPrice(listing.original_price)}</p>
            <p className="text-[22px] font-bold text-slate-900 leading-none">{formatPrice(listing.discounted_price)}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" />-{discount}%
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${dealColors}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dealDotColor}`} />
              {dealScore} · {dealLabel}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatCountdown(listing.deadline_at)}</span>
            </div>
          </div>
        </div>

        {/* Why this match — expandable inline */}
        <div className={`mb-4 rounded-xl border overflow-hidden ${whyBg}`}>
          <button
            onClick={() => setShowWhy(p => !p)}
            className="w-full flex items-center justify-between px-3 py-2 hover:brightness-95 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3 h-3 ${whyIconColor}`} />
              <span className="text-[11px] font-semibold text-slate-700">Why this match?</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${whyTextColor} bg-white/60`}>
                {reasons.length} reason{reasons.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showWhy ? 'rotate-180' : ''}`} />
          </button>
          {showWhy && (
            <ul className="px-3 py-2.5 space-y-2 bg-white/70 border-t border-white/50">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${whyDotColor}`} />
                  <p className="text-[11px] text-slate-700 leading-snug font-medium">{r}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action */}
        <div className="mt-auto">
          <button
            onClick={() => onView(listing)}
            className="w-full group inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl text-[13px] transition-all duration-150 shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.22)]"
          >
            View Opportunity
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-100" />
          </button>
        </div>
      </div>
    </div>
  );
}
