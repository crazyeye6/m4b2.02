import {
  SlidersHorizontal, Mail, Mic, Instagram, Flame, TrendingDown, Star,
  ChevronUp, X, Calendar, MapPin, Tag, DollarSign, ChevronDown, LayoutGrid,
  Columns2, Columns3,
} from 'lucide-react';
import { useState, useMemo } from 'react';
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
  { value: 'all', label: 'All Types', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" /> },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-3.5 h-3.5" /> },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-3.5 h-3.5" /> },
];

const SORT_OPTIONS = [
  { value: 'ending_soon', label: 'Ending Soon', icon: <Flame className="w-3.5 h-3.5 text-yellow-400" /> },
  { value: 'biggest_discount', label: 'Biggest Discount', icon: <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> },
  { value: 'best_value', label: 'Best Value', icon: <Star className="w-3.5 h-3.5 text-sky-400" /> },
];

const GEOGRAPHIES = ['', 'US', 'UK', 'Europe', 'Ireland', 'Global'];
const NICHES = ['', 'SaaS', 'eCommerce', 'Fintech', 'Startup', 'Marketing', 'Fitness', 'Beauty', 'Travel'];
const DISCOUNT_OPTIONS = [0, 20, 30, 40, 50];
const PRICE_MAX_OPTIONS = [0, 500, 1000, 2500, 5000];

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

function FilterSection({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-[#6e7681]">{icon}</span>
        <span className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-widest">{label}</span>
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
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-all w-full
        ${active
          ? urgent
            ? 'bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30'
            : 'bg-[#21262d] text-[#e6edf3] ring-1 ring-[#484f58]'
          : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
        }`}
    >
      {children}
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

  const activeChips: Array<{ label: string; clear: () => void }> = [];

  if (filters.category !== 'all') {
    const cat = CATEGORIES.find(c => c.value === filters.category);
    activeChips.push({ label: cat?.label ?? filters.category, clear: () => onChange({ category: 'all' }) });
  }
  if (filters.dateRange) {
    const d = dateOptions.find(o => o.value === filters.dateRange);
    activeChips.push({ label: d?.label ?? filters.dateRange, clear: () => onChange({ dateRange: '' }) });
  }
  if (filters.discountMin > 0) {
    activeChips.push({ label: `${filters.discountMin}%+ off`, clear: () => onChange({ discountMin: 0 }) });
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
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top row ── */}
        <div className="flex items-center gap-2 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Category tabs */}
          <div className="flex items-center gap-0.5 bg-[#21262d] border border-[#30363d] rounded-lg p-0.5 flex-shrink-0">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => onChange({ category: c.value as FilterState['category'] })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap
                  ${filters.category === c.value
                    ? 'bg-[#30363d] text-[#e6edf3] shadow-sm'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]/50'
                  }`}
              >
                {c.icon}
                <span className="hidden sm:inline">{c.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[#30363d] flex-shrink-0" />

          {/* Quick: Ending This Week */}
          <button
            onClick={() => onChange({ dateRange: filters.dateRange === 'this_week' ? '' : 'this_week' })}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap
              ${filters.dateRange === 'this_week'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                : 'text-[#8b949e] border-[#30363d] hover:border-[#484f58] hover:text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ending This Week</span>
            <span className="sm:hidden">This Week</span>
          </button>

          {/* Sort dropdown (inline cycle) */}
          <div className="flex-shrink-0 relative group">
            <div className="flex items-center gap-0.5 bg-[#21262d] border border-[#30363d] rounded-lg overflow-hidden">
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] text-[#6e7681] font-semibold uppercase tracking-wider whitespace-nowrap border-r border-[#30363d]">
                Sort
              </span>
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => onChange({ sortBy: o.value as FilterState['sortBy'] })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap
                    ${filters.sortBy === o.value
                      ? 'bg-[#30363d] text-[#e6edf3]'
                      : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]/40'
                    }`}
                >
                  {o.icon}
                  <span className="hidden lg:inline">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[#30363d] flex-shrink-0" />

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap
              ${showAdvanced
                ? 'bg-[#21262d] text-[#e6edf3] border-[#484f58]'
                : hasActive
                  ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'text-[#8b949e] border-[#30363d] hover:border-[#484f58] hover:text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActive && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold leading-none">
                {activeChips.length}
              </span>
            )}
            {showAdvanced
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />
            }
          </button>

          {/* Layout toggle */}
          <div className="flex-shrink-0 hidden sm:flex items-center gap-0.5 bg-[#21262d] border border-[#30363d] rounded-lg p-0.5 ml-auto">
            {COLUMN_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => onColumnsChange(o.value)}
                title={o.title}
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-all
                  ${columns === o.value
                    ? 'bg-[#30363d] text-[#e6edf3] shadow-sm'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]/50'
                  }`}
              >
                {o.icon}
              </button>
            ))}
          </div>

          {/* Spacer + result count */}
          <div className="flex-shrink-0 sm:ml-0 ml-auto flex items-center gap-3">
            {hasActive && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-[#6e7681] hover:text-[#e6edf3] transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
            <span className="text-[#8b949e] text-xs whitespace-nowrap">
              <span className="text-[#e6edf3] font-semibold">{total}</span> results
            </span>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {hasActive && !showAdvanced && (
          <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {activeChips.map(chip => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#21262d] border border-[#30363d] text-[11px] text-[#c9d1d9] whitespace-nowrap flex-shrink-0"
              >
                {chip.label}
                <button
                  onClick={chip.clear}
                  className="text-[#6e7681] hover:text-[#e6edf3] transition-colors ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Advanced panel ── */}
        {showAdvanced && (
          <div className="border-t border-[#30363d] pt-4 pb-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-5">

              {/* Date Range */}
              <FilterSection label="Date Range" icon={<Calendar className="w-3 h-3" />}>
                {dateOptions.map(o => (
                  <OptionBtn
                    key={o.value}
                    active={filters.dateRange === o.value}
                    urgent={o.urgent}
                    onClick={() => onChange({ dateRange: o.value })}
                  >
                    <span className="flex items-center gap-1.5 flex-1 min-w-0">
                      {o.urgent
                        ? <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                        : o.value !== ''
                          ? <span className="w-1.5 h-1.5 rounded-full bg-[#30363d] flex-shrink-0" />
                          : null
                      }
                      <span className="truncate">{o.label}</span>
                    </span>
                    {o.sublabel && (
                      <span className="text-[9px] text-[#6e7681] font-normal flex-shrink-0 ml-2">
                        {o.sublabel}
                      </span>
                    )}
                  </OptionBtn>
                ))}
              </FilterSection>

              {/* Min Discount */}
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

              {/* Max Price */}
              <FilterSection label="Max Price" icon={<DollarSign className="w-3 h-3" />}>
                {PRICE_MAX_OPTIONS.map(v => (
                  <OptionBtn
                    key={v}
                    active={filters.priceMax === v}
                    onClick={() => onChange({ priceMax: v })}
                  >
                    {v === 0 ? 'Any price' : `Up to $${v.toLocaleString()}`}
                  </OptionBtn>
                ))}
              </FilterSection>

              {/* Geography */}
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

              {/* Niche */}
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

            {/* Active chips inside panel */}
            {hasActive && (
              <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                <span className="text-[10px] text-[#6e7681] font-medium uppercase tracking-wider mr-1">Active:</span>
                {activeChips.map(chip => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300"
                  >
                    {chip.label}
                    <button
                      onClick={chip.clear}
                      className="text-emerald-500/60 hover:text-emerald-300 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={reset}
                  className="text-[11px] text-[#6e7681] hover:text-[#e6edf3] transition-colors ml-1 underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Collapse button */}
            <div className="flex justify-center mt-4 mb-1">
              <button
                onClick={() => setShowAdvanced(false)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#21262d] border border-[#30363d] hover:border-[#484f58] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-medium transition-all group"
              >
                <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                Collapse filters — view {total} results
                <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
