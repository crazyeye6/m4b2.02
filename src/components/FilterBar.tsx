import {
  SlidersHorizontal, Mail, Mic, Instagram, Flame, TrendingDown, Star,
  ChevronUp, X, Calendar, MapPin, Tag, DollarSign, ChevronDown, LayoutGrid,
  Columns2, Columns3, Check, Zap,
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { FilterState, DateRangeOption } from '../types';
import type { GridColumns } from './ListingsGrid';

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  total: number;
  columns: GridColumns;
  onColumnsChange: (c: GridColumns) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" /> },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-3.5 h-3.5" /> },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-3.5 h-3.5" /> },
];

const SORT_OPTIONS = [
  { value: 'ending_soon', label: 'Ending Soon', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
  { value: 'biggest_discount', label: 'Biggest Discount', icon: <TrendingDown className="w-3.5 h-3.5 text-sky-500" /> },
  { value: 'best_value', label: 'Best Value', icon: <Star className="w-3.5 h-3.5 text-orange-400" /> },
];

const GEOGRAPHIES = ['', 'US', 'UK', 'Europe', 'Ireland', 'Global'];
const NICHES = ['', 'SaaS', 'eCommerce', 'Fintech', 'Startup', 'Marketing', 'Fitness', 'Beauty', 'Travel'];
const DISCOUNT_OPTIONS = [0, 20, 30, 40, 50];
const PRICE_MAX_OPTIONS = [0, 500, 1000, 2500, 5000];
const PRICE_MIN_OPTIONS = [0, 100, 250, 500, 1000];

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
  return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getTomorrowLabel(): string {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return t.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getMonthRangeLabel(): string {
  const s = new Date();
  const e = new Date(); e.setDate(e.getDate() + 30);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function FilterSection({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[#aeaeb2]">{icon}</span>
        <span className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function OptionBtn({
  active, urgent, onClick, children,
}: { active: boolean; urgent?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-left transition-all w-full group
        ${active
          ? urgent
            ? 'bg-orange-50 text-orange-600'
            : 'bg-[#f0fdf4] text-green-700'
          : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
        }`}
    >
      <span className="flex-1 min-w-0">{children}</span>
      {active && (
        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${urgent ? 'text-orange-500' : 'text-green-600'}`} />
      )}
    </button>
  );
}

const COLUMN_OPTIONS: Array<{ value: GridColumns; icon: React.ReactNode; title: string }> = [
  { value: 1, icon: <LayoutGrid className="w-3.5 h-3.5" />, title: '1 per row' },
  { value: 2, icon: <Columns2 className="w-3.5 h-3.5" />, title: '2 per row' },
  { value: 3, icon: <Columns3 className="w-3.5 h-3.5" />, title: '3 per row' },
];

export default function FilterBar({ filters, onChange, total, columns, onColumnsChange }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAdvanced) setShowAdvanced(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAdvanced]);

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

  const activeChips: Array<{ label: string; clear: () => void; urgent?: boolean }> = [];

  if (filters.category !== 'all') {
    const cat = CATEGORIES.find(c => c.value === filters.category);
    activeChips.push({ label: cat?.label ?? filters.category, clear: () => onChange({ category: 'all' }) });
  }
  if (filters.dateRange) {
    const d = dateOptions.find(o => o.value === filters.dateRange);
    const isUrgent = d?.urgent;
    activeChips.push({ label: d?.label ?? filters.dateRange, clear: () => onChange({ dateRange: '' }), urgent: isUrgent });
  }
  if (filters.discountMin > 0) {
    activeChips.push({ label: `${filters.discountMin}%+ off`, clear: () => onChange({ discountMin: 0 }) });
  }
  if (filters.priceMin > 0) {
    activeChips.push({ label: `From $${filters.priceMin.toLocaleString()}`, clear: () => onChange({ priceMin: 0 }) });
  }
  if (filters.priceMax > 0) {
    activeChips.push({ label: `Up to $${filters.priceMax.toLocaleString()}`, clear: () => onChange({ priceMax: 0 }) });
  }
  if (filters.geography) {
    activeChips.push({ label: filters.geography, clear: () => onChange({ geography: '' }) });
  }
  if (filters.niche) {
    activeChips.push({ label: filters.niche, clear: () => onChange({ niche: '' }) });
  }

  const hasActive = activeChips.length > 0;
  const advancedActiveCount = activeChips.filter(c =>
    !['Newsletter', 'Podcast', 'Influencer'].includes(c.label)
  ).length;

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
    <div className="bg-white border-b border-black/[0.06] sticky top-[52px] z-40 shadow-sm shadow-black/[0.03]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-2 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Category segmented control */}
          <div className="flex items-center gap-0.5 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 flex-shrink-0">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => onChange({ category: c.value as FilterState['category'] })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap
                  ${filters.category === c.value
                    ? 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.08]'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-black/[0.08] flex-shrink-0" />

          {/* Quick date filters */}
          <button
            onClick={() => onChange({ dateRange: filters.dateRange === 'today' ? '' : 'today' })}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap
              ${filters.dateRange === 'today'
                ? 'bg-orange-50 text-orange-600 border-orange-200'
                : 'text-[#6e6e73] border-black/[0.08] hover:border-black/[0.15] hover:text-[#1d1d1f] bg-white'
              }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            onClick={() => onChange({ dateRange: filters.dateRange === 'this_week' ? '' : 'this_week' })}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap
              ${filters.dateRange === 'this_week'
                ? 'bg-orange-50 text-orange-600 border-orange-200'
                : 'text-[#6e6e73] border-black/[0.08] hover:border-black/[0.15] hover:text-[#1d1d1f] bg-white'
              }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ending This Week</span>
            <span className="sm:hidden">This Week</span>
          </button>

          <div className="w-px h-5 bg-black/[0.08] flex-shrink-0" />

          {/* Sort segmented control */}
          <div className="flex-shrink-0 flex items-center gap-0 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
            <span className="flex items-center px-3 py-1.5 text-[10px] text-[#aeaeb2] font-bold uppercase tracking-wider whitespace-nowrap border-r border-black/[0.06]">
              Sort
            </span>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => onChange({ sortBy: o.value as FilterState['sortBy'] })}
                title={o.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-all whitespace-nowrap border-r border-black/[0.04] last:border-0
                  ${filters.sortBy === o.value
                    ? 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.06]'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/60'
                  }`}
              >
                {o.icon}
                <span className="hidden xl:inline">{o.label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-black/[0.08] flex-shrink-0" />

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap
              ${showAdvanced
                ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                : advancedActiveCount > 0
                  ? 'text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100'
                  : 'text-[#6e6e73] border-black/[0.08] hover:border-black/[0.15] hover:text-[#1d1d1f] bg-white'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {advancedActiveCount > 0 && (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold leading-none
                ${showAdvanced ? 'bg-white text-[#1d1d1f]' : 'bg-teal-600 text-white'}`}>
                {advancedActiveCount}
              </span>
            )}
            {showAdvanced
              ? <ChevronUp className="w-3 h-3 ml-0.5" />
              : <ChevronDown className="w-3 h-3 ml-0.5" />
            }
          </button>

          {/* Layout toggle */}
          <div className="flex-shrink-0 hidden sm:flex items-center gap-0.5 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 ml-auto">
            {COLUMN_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => onColumnsChange(o.value)}
                title={o.title}
                className={`flex items-center justify-center w-7 h-7 rounded-xl transition-all
                  ${columns === o.value
                    ? 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.08]'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
              >
                {o.icon}
              </button>
            ))}
          </div>

          {/* Result count + clear */}
          <div className="flex-shrink-0 sm:ml-0 ml-auto flex items-center gap-2.5">
            {hasActive && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-[12px] text-[#aeaeb2] hover:text-[#ff3b30] transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <div className="text-right">
              <span className="text-[#1d1d1f] font-semibold text-[14px] tabular-nums">{total}</span>
              <span className="text-[#aeaeb2] text-[12px] ml-1">results</span>
            </div>
          </div>
        </div>

        {/* Active chips row */}
        {hasActive && !showAdvanced && (
          <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <span className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-wider flex-shrink-0 mr-0.5">Active:</span>
            {activeChips.map(chip => (
              <span
                key={chip.label}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap flex-shrink-0 border transition-colors
                  ${chip.urgent
                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                    : 'bg-teal-50 border-teal-100 text-teal-700'
                  }`}
              >
                {chip.label}
                <button
                  onClick={chip.clear}
                  className={`ml-0.5 transition-colors ${chip.urgent ? 'text-orange-300 hover:text-orange-600' : 'text-teal-300 hover:text-teal-700'}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              onClick={reset}
              className="flex-shrink-0 text-[11px] text-[#aeaeb2] hover:text-[#ff3b30] transition-colors ml-1 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Advanced panel */}
        {showAdvanced && (
          <div ref={panelRef} className="border-t border-black/[0.06] pt-5 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-5">

              <FilterSection label="Publish Date" icon={<Calendar className="w-3 h-3" />}>
                {dateOptions.map(o => (
                  <OptionBtn
                    key={o.value}
                    active={filters.dateRange === o.value}
                    urgent={o.urgent}
                    onClick={() => onChange({ dateRange: o.value })}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      {o.urgent
                        ? <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                        : o.value !== ''
                          ? <span className="w-1.5 h-1.5 rounded-full bg-[#d2d2d7] flex-shrink-0" />
                          : <span className="w-1.5 h-1.5 flex-shrink-0" />
                      }
                      <span className="truncate">{o.label}</span>
                      {o.sublabel && (
                        <span className="text-[10px] text-[#aeaeb2] font-normal flex-shrink-0 ml-auto pl-1.5 hidden md:block">
                          {o.sublabel}
                        </span>
                      )}
                    </span>
                  </OptionBtn>
                ))}
              </FilterSection>

              <FilterSection label="Min Discount" icon={<TrendingDown className="w-3 h-3" />}>
                {DISCOUNT_OPTIONS.map(v => (
                  <OptionBtn
                    key={v}
                    active={filters.discountMin === v}
                    onClick={() => onChange({ discountMin: v })}
                  >
                    {v === 0 ? 'Any discount' : `${v}%+ off`}
                  </OptionBtn>
                ))}
              </FilterSection>

              <FilterSection label="Min Price" icon={<DollarSign className="w-3 h-3" />}>
                {PRICE_MIN_OPTIONS.map(v => (
                  <OptionBtn
                    key={v}
                    active={filters.priceMin === v}
                    onClick={() => onChange({ priceMin: v })}
                  >
                    {v === 0 ? 'Any min' : `From $${v.toLocaleString()}`}
                  </OptionBtn>
                ))}
              </FilterSection>

              <FilterSection label="Max Price" icon={<DollarSign className="w-3 h-3" />}>
                {PRICE_MAX_OPTIONS.map(v => (
                  <OptionBtn
                    key={v}
                    active={filters.priceMax === v}
                    onClick={() => onChange({ priceMax: v })}
                  >
                    {v === 0 ? 'Any max' : `Up to $${v.toLocaleString()}`}
                  </OptionBtn>
                ))}
              </FilterSection>

              <FilterSection label="Geography" icon={<MapPin className="w-3 h-3" />}>
                {GEOGRAPHIES.map(v => (
                  <OptionBtn
                    key={v}
                    active={filters.geography === v}
                    onClick={() => onChange({ geography: v })}
                  >
                    {v || 'Any location'}
                  </OptionBtn>
                ))}
              </FilterSection>

              <FilterSection label="Niche" icon={<Tag className="w-3 h-3" />}>
                {NICHES.map(v => (
                  <OptionBtn
                    key={v}
                    active={filters.niche === v}
                    onClick={() => onChange({ niche: v })}
                  >
                    {v || 'Any niche'}
                  </OptionBtn>
                ))}
              </FilterSection>
            </div>

            {hasActive && (
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-black/[0.06] flex-wrap">
                <span className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-wider mr-1">Active filters:</span>
                {activeChips.map(chip => (
                  <span
                    key={chip.label}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium border
                      ${chip.urgent ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-teal-50 border-teal-100 text-teal-700'}`}
                  >
                    {chip.label}
                    <button
                      onClick={chip.clear}
                      className={`transition-colors ${chip.urgent ? 'text-orange-300 hover:text-orange-600' : 'text-teal-300 hover:text-teal-700'}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={reset}
                  className="text-[12px] text-[#aeaeb2] hover:text-[#ff3b30] transition-colors ml-1 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <p className="text-[12px] text-[#aeaeb2]">
                Press <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#f5f5f7] border border-black/[0.08] text-[10px] font-mono text-[#6e6e73]">Esc</kbd> to close
              </p>
              <button
                onClick={() => setShowAdvanced(false)}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white text-[13px] font-semibold transition-all"
              >
                Show {total} result{total !== 1 ? 's' : ''}
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
