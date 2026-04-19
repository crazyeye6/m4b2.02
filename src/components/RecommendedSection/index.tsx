import { useMemo, useState } from 'react';
import { Sparkles, Settings, ChevronDown, Star, TrendingDown, Clock } from 'lucide-react';
import type { Listing } from '../../types';
import type { BuyerPreferences } from '../../hooks/useBuyerPreferences';
import { scoreListings, type ScoredListing } from '../../lib/matchScore';
import RecommendedCard from './RecommendedCard';

type SortMode = 'match' | 'deal' | 'ending';

interface Props {
  listings: Listing[];
  prefs: BuyerPreferences;
  onView: (listing: Listing) => void;
  onEditPrefs: () => void;
}

const PREF_LABEL_MAP: Record<string, string> = {
  UK: 'UK', Ireland: 'IE', US: 'US', Europe: 'Europe', Global: 'Global',
  awareness: 'Awareness', conversions: 'Conversions', lead_generation: 'Lead Gen',
  this_week: 'This week', next_3_days: 'Next 3 days', last_minute: 'Last minute',
  small: 'Niche <30K', mid: 'Mid 10–150K', large: 'Large 50K+',
};

function prefSummary(prefs: BuyerPreferences): string {
  const parts: string[] = [];
  if (prefs.tags?.length) parts.push(prefs.tags.slice(0, 3).join(', '));
  if (prefs.locations.length) parts.push(prefs.locations.slice(0, 2).map(l => PREF_LABEL_MAP[l] ?? l).join(', '));
  if (prefs.budgetMax) parts.push(`$${prefs.budgetMin}–$${prefs.budgetMax}`);
  if (prefs.timing) parts.push(PREF_LABEL_MAP[prefs.timing] ?? prefs.timing);
  return parts.length ? parts.join(' · ') : 'All opportunities';
}

const SORT_OPTIONS: Array<{ value: SortMode; label: string; icon: React.ReactNode }> = [
  { value: 'match', label: 'Best Match', icon: <Star className="w-3.5 h-3.5" /> },
  { value: 'deal', label: 'Best Deal', icon: <TrendingDown className="w-3.5 h-3.5" /> },
  { value: 'ending', label: 'Ending Soon', icon: <Clock className="w-3.5 h-3.5" /> },
];

function sortScored(items: ScoredListing[], mode: SortMode): ScoredListing[] {
  const copy = [...items];
  if (mode === 'match') return copy.sort((a, b) => b.score - a.score);
  if (mode === 'deal') {
    return copy.sort((a, b) => {
      const da = ((a.listing.original_price - a.listing.discounted_price) / a.listing.original_price);
      const db = ((b.listing.original_price - b.listing.discounted_price) / b.listing.original_price);
      return db - da;
    });
  }
  return copy.sort((a, b) => new Date(a.listing.deadline_at).getTime() - new Date(b.listing.deadline_at).getTime());
}

export default function RecommendedSection({ listings, prefs, onView, onEditPrefs }: Props) {
  const [sort, setSort] = useState<SortMode>('match');
  const [showSort, setShowSort] = useState(false);

  const scored = useMemo(() => scoreListings(listings, prefs), [listings, prefs]);
  const sorted = useMemo(() => sortScored(scored, sort), [scored, sort]);

  if (scored.length === 0) return null;

  const summary = prefSummary(prefs);
  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Recommended for You</h2>
            </div>
            <p className="text-[14px] text-slate-500">Matched to your audience, goals, and buying preferences.</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(p => !p)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all"
              >
                {currentSort.icon}
                {currentSort.label}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 z-20 overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSort(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-left transition-colors
                        ${sort === opt.value ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit preferences */}
            <button
              onClick={onEditPrefs}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit Preferences
            </button>
          </div>
        </div>

        {/* Preferences summary pill */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest flex-shrink-0">Based on:</span>
          <span className="text-[12px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
            {summary}
          </span>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map(s => (
            <RecommendedCard key={s.listing.id} scored={s} onView={onView} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-slate-400 font-medium mt-8">
          Scores are calculated from tag, location, budget, timing, and discount relevance.
        </p>
      </div>
    </section>
  );
}
