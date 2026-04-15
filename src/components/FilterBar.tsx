import {
  SlidersHorizontal, Mail, Mic, Instagram, MapPin, Tag, DollarSign,
  ChevronUp, X, LayoutGrid, Columns2, Columns3, Check, ChevronDown,
  TrendingDown, Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FilterState } from '../types';
import type { GridColumns } from './ListingsGrid';

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  total: number;
  columns: GridColumns;
  onColumnsChange: (c: GridColumns) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" />, activeClass: 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.08]' },
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" />, activeClass: 'bg-sky-50 text-sky-600 border border-sky-100 shadow-sm' },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-3.5 h-3.5" />, activeClass: 'bg-violet-50 text-violet-600 border border-violet-100 shadow-sm' },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-3.5 h-3.5" />, activeClass: 'bg-rose-50 text-rose-500 border border-rose-100 shadow-sm' },
];

const GEOGRAPHIES = ['', 'US', 'UK', 'Europe', 'Ireland', 'Global'];
const NICHES = ['', 'SaaS', 'eCommerce', 'Fintech', 'Startup', 'Marketing', 'Fitness', 'Beauty', 'Travel'];
const DISCOUNT_OPTIONS = [0, 20, 30, 40, 50];
const PRICE_MAX_OPTIONS = [0, 500, 1000, 2500, 5000];
const PRICE_MIN_OPTIONS = [0, 100, 250, 500, 1000];

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

function OptionBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-left transition-all w-full
        ${active
          ? 'bg-[#f0fdf4] text-green-700'
          : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
        }`}
    >
      <span className="flex-1 min-w-0">{children}</span>
      {active && <Check className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />}
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAdvanced) setShowAdvanced(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAdvanced]);

  const activeChips: Array<{ label: string; clear: () => void }> = [];

  if (filters.category !== 'all') {
    const cat = CATEGORIES.find(c => c.value === filters.category);
    activeChips.push({ label: cat?.label ?? filters.category, clear: () => onChange({ category: 'all' }) });
  }
  if (filters.endingThisWeek) {
    activeChips.push({ label: 'Ending This Week', clear: () => onChange({ endingThisWeek: false }) });
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
  const advancedActiveCount = [
    filters.discountMin > 0,
    filters.priceMin > 0,
    filters.priceMax > 0,
    !!filters.geography,
    !!filters.niche,
  ].filter(Boolean).length;

  const reset = () =>
    onChange({
      category: 'all',
      endingThisWeek: false,
      discountMin: 0,
      priceMin: 0,
      priceMax: 0,
      niche: '',
      geography: '',
    });

  return (
    <div className="bg-white border-b border-black/[0.06] sticky top-[72px] z-40 shadow-sm shadow-black/[0.03]">
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
                    ? c.activeClass
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-black/[0.08] flex-shrink-0" />

          {/* Ending This Week toggle */}
          <button
            onClick={() => onChange({ endingThisWeek: !filters.endingThisWeek })}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap
              ${filters.endingThisWeek
                ? 'bg-green-600 text-white border-green-600'
                : 'text-[#6e6e73] border-black/[0.08] hover:border-green-300 hover:text-green-600 bg-white'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ending This Week</span>
          </button>

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
                <span className="hidden sm:inline">Clear all</span>
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap flex-shrink-0 border bg-teal-50 border-teal-100 text-teal-700"
              >
                {chip.label}
                <button onClick={chip.clear} className="ml-0.5 text-teal-300 hover:text-teal-700 transition-colors">
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
          <div className="border-t border-black/[0.06] pt-5 pb-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-5">

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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium border bg-teal-50 border-teal-100 text-teal-700"
                  >
                    {chip.label}
                    <button onClick={chip.clear} className="text-teal-300 hover:text-teal-700 transition-colors">
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
