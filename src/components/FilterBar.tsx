import { SlidersHorizontal, Mail, Mic, Instagram, Flame, TrendingDown, Star, ChevronDown, X, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { FilterState, DateRangeOption } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  total: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: null },
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" /> },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-3.5 h-3.5" /> },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-3.5 h-3.5" /> },
];

const SORT_OPTIONS = [
  { value: 'ending_soon', label: 'Ending soon', icon: <Flame className="w-3.5 h-3.5 text-[#f85149]" /> },
  { value: 'biggest_discount', label: 'Biggest discount', icon: <TrendingDown className="w-3.5 h-3.5 text-[#e3b341]" /> },
  { value: 'best_value', label: 'Best value', icon: <Star className="w-3.5 h-3.5 text-[#58a6ff]" /> },
];

function getWeekLabel(offsetWeeks: number): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff + offsetWeeks * 7);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

function getTomorrowLabel(): string {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return t.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

function getMonthRangeLabel(): string {
  const s = new Date();
  const e = new Date(); e.setDate(e.getDate() + 30);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(s)} – ${fmt(e)}`;
}

export default function FilterBar({ filters, onChange, total }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const dateOptions = useMemo((): Array<{ value: DateRangeOption; label: string; sublabel?: string; urgent?: boolean }> => [
    { value: '', label: 'Any date' },
    { value: 'today', label: 'Today', sublabel: getTodayLabel(), urgent: true },
    { value: 'tomorrow', label: 'Tomorrow', sublabel: getTomorrowLabel(), urgent: true },
    { value: 'this_week', label: 'This week', sublabel: getWeekLabel(0), urgent: true },
    { value: 'next_week', label: 'Next week', sublabel: getWeekLabel(1) },
    { value: 'week_3', label: 'Week 3', sublabel: getWeekLabel(2) },
    { value: 'week_4', label: 'Week 4', sublabel: getWeekLabel(3) },
    { value: 'this_month', label: 'Next 30 days', sublabel: getMonthRangeLabel() },
  ], []);

  const isEndingThisWeek = filters.dateRange === 'this_week';

  const hasActive =
    filters.category !== 'all' ||
    filters.dateRange !== '' ||
    filters.discountMin > 0 ||
    !!filters.niche ||
    !!filters.geography;

  const reset = () =>
    onChange({
      category: 'all',
      dateRange: '',
      discountMin: 0,
      priceMin: 0,
      priceMax: 0,
      niche: '',
      geography: '',
    });

  return (
    <div className="bg-[#161b22] border-b border-[#30363d] sticky top-14 z-40">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 bg-[#21262d] border border-[#30363d] rounded-md p-0.5">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => onChange({ category: c.value as FilterState['category'] })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all
                  ${filters.category === c.value
                    ? 'bg-[#30363d] text-[#e6edf3] shadow-sm'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]/50'
                  }`}
              >
                {c.icon}
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onChange({ dateRange: isEndingThisWeek ? '' : 'this_week' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all
              ${isEndingThisWeek
                ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/30'
                : 'text-[#8b949e] border-[#30363d] hover:border-[#484f58] hover:text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Ending This Week
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all
              ${showAdvanced
                ? 'bg-[#21262d] text-[#e6edf3] border-[#484f58]'
                : 'text-[#8b949e] border-[#30363d] hover:border-[#484f58] hover:text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] ml-0.5" />}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            {hasActive && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            <span className="text-[#8b949e] text-xs">
              <span className="text-[#e6edf3] font-semibold">{total}</span> opportunities
            </span>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-[#30363d] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] text-[#8b949e] font-semibold mb-2 uppercase tracking-widest">
                <Calendar className="w-3 h-3" />
                Date range
              </label>
              <div className="flex flex-col gap-0.5">
                {dateOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => onChange({ dateRange: o.value })}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-all
                      ${filters.dateRange === o.value
                        ? o.urgent
                          ? 'bg-[#f85149]/10 text-[#f85149]'
                          : 'bg-[#21262d] text-[#e6edf3]'
                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                      }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {o.urgent && <span className="w-1.5 h-1.5 rounded-full bg-[#f85149] flex-shrink-0" />}
                      {!o.urgent && o.value !== '' && <span className="w-1.5 h-1.5 rounded-full bg-[#30363d] flex-shrink-0" />}
                      {o.label}
                    </span>
                    {o.sublabel && (
                      <span className="text-[10px] font-normal ml-3 flex-shrink-0 text-[#484f58]">
                        {o.sublabel}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#8b949e] font-semibold mb-2 uppercase tracking-widest">Sort by</label>
              <div className="flex flex-col gap-0.5">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => onChange({ sortBy: o.value as FilterState['sortBy'] })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-all
                      ${filters.sortBy === o.value
                        ? 'bg-[#21262d] text-[#e6edf3]'
                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                      }`}
                  >
                    {o.icon}
                    {o.label}
                  </button>
                ))}
              </div>

              <label className="block text-[10px] text-[#8b949e] font-semibold mb-2 mt-5 uppercase tracking-widest">Min discount</label>
              <div className="flex flex-col gap-0.5">
                {[0, 20, 30, 40].map(v => (
                  <button
                    key={v}
                    onClick={() => onChange({ discountMin: v })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-all
                      ${filters.discountMin === v
                        ? 'bg-[#21262d] text-[#e6edf3]'
                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                      }`}
                  >
                    {v === 0 ? 'Any discount' : `${v}%+ off`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#8b949e] font-semibold mb-2 uppercase tracking-widest">Geography</label>
              <div className="flex flex-col gap-0.5">
                {['', 'US', 'UK', 'Europe', 'Ireland', 'Global'].map(v => (
                  <button
                    key={v}
                    onClick={() => onChange({ geography: v })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-all
                      ${filters.geography === v
                        ? 'bg-[#21262d] text-[#e6edf3]'
                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                      }`}
                  >
                    {v || 'Any location'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#8b949e] font-semibold mb-2 uppercase tracking-widest">Niche</label>
              <div className="flex flex-col gap-0.5">
                {['', 'SaaS', 'eCommerce', 'Fintech', 'Startup', 'Marketing', 'Fitness', 'Beauty', 'Travel'].map(v => (
                  <button
                    key={v}
                    onClick={() => onChange({ niche: v })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-all
                      ${filters.niche === v
                        ? 'bg-[#21262d] text-[#e6edf3]'
                        : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                      }`}
                  >
                    {v || 'Any niche'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
