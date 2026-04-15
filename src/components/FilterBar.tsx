import {
  SlidersHorizontal, Mail, Mic, Instagram, Calendar, MapPin, Tag, DollarSign,
  ChevronUp, X, LayoutGrid, Columns2, Columns3, Check, ChevronDown, ChevronLeft, ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  { value: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" /> },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-3.5 h-3.5" /> },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-3.5 h-3.5" /> },
];

const GEOGRAPHIES = ['', 'US', 'UK', 'Europe', 'Ireland', 'Global'];
const NICHES = ['', 'SaaS', 'eCommerce', 'Fintech', 'Startup', 'Marketing', 'Fitness', 'Beauty', 'Travel'];
const DISCOUNT_OPTIONS = [0, 20, 30, 40, 50];
const PRICE_MAX_OPTIONS = [0, 500, 1000, 2500, 5000];
const PRICE_MIN_OPTIONS = [0, 100, 250, 500, 1000];

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function formatDateShort(str: string): string {
  const d = parseDate(str);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarPickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (from: string, to: string) => void;
  onClose: () => void;
}

function CalendarPicker({ dateFrom, dateTo, onChange, onClose }: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = addDays(today, 44);

  const [viewYear, setViewYear] = useState(() => {
    const d = parseDate(dateFrom);
    return (d || today).getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDate(dateFrom);
    return (d || today).getMonth();
  });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<'from' | 'to'>(dateFrom ? 'to' : 'from');

  const fromDate = parseDate(dateFrom);
  const toDate = parseDate(dateTo);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getDaysInMonth = useCallback((year: number, month: number): (Date | null)[] => {
    const first = new Date(year, month, 1);
    const dayOfWeek = first.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));
    return cells;
  }, []);

  const cells = getDaysInMonth(viewYear, viewMonth);

  const canPrevMonth = (() => {
    const firstOfView = new Date(viewYear, viewMonth, 1);
    const firstOfToday = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstOfView > firstOfToday;
  })();

  const canNextMonth = (() => {
    const firstOfNext = new Date(viewYear, viewMonth + 1, 1);
    const firstOfMax = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return firstOfNext <= firstOfMax;
  })();

  const handleDayClick = (d: Date) => {
    const str = toDateStr(d);
    if (selecting === 'from') {
      onChange(str, '');
      setSelecting('to');
    } else {
      if (fromDate && d < fromDate) {
        onChange(str, dateFrom);
        setSelecting('to');
      } else {
        onChange(dateFrom, str);
        setSelecting('from');
      }
    }
  };

  const getCellState = (d: Date): 'start' | 'end' | 'in-range' | 'hover-range' | 'today' | 'disabled' | 'default' => {
    const str = toDateStr(d);
    if (d < today || d > maxDate) return 'disabled';
    if (fromDate && isSameDay(d, fromDate)) return 'start';
    if (toDate && isSameDay(d, toDate)) return 'end';
    const hDate = hovered ? parseDate(hovered) : null;
    if (fromDate && toDate && d > fromDate && d < toDate) return 'in-range';
    if (fromDate && !toDate && hDate && d > fromDate && d < hDate) return 'hover-range';
    if (isSameDay(d, today)) return 'today';
    return 'default';
  };

  const quickRanges = [
    { label: 'Today', from: toDateStr(today), to: toDateStr(today) },
    { label: 'This week', from: toDateStr(today), to: toDateStr(addDays(today, 6 - (today.getDay() === 0 ? 6 : today.getDay() - 1))) },
    { label: 'Next 7 days', from: toDateStr(today), to: toDateStr(addDays(today, 6)) },
    { label: 'Next 14 days', from: toDateStr(today), to: toDateStr(addDays(today, 13)) },
    { label: 'Next 30 days', from: toDateStr(today), to: toDateStr(addDays(today, 29)) },
    { label: 'Next 45 days', from: toDateStr(today), to: toDateStr(maxDate) },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl shadow-black/[0.12] border border-black/[0.06] overflow-hidden w-[340px]">
      <div className="p-4 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-[#aeaeb2] uppercase tracking-wider">Date Range</span>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className={`flex-1 rounded-xl border px-3 py-1.5 text-center text-[13px] font-medium transition-colors cursor-pointer
            ${selecting === 'from' ? 'border-[#1d1d1f] bg-[#f5f5f7] text-[#1d1d1f]' : 'border-black/[0.08] text-[#6e6e73]'}`}
            onClick={() => setSelecting('from')}
          >
            {dateFrom ? formatDateShort(dateFrom) : <span className="text-[#aeaeb2]">Start date</span>}
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#aeaeb2] flex-shrink-0" />
          <div className={`flex-1 rounded-xl border px-3 py-1.5 text-center text-[13px] font-medium transition-colors cursor-pointer
            ${selecting === 'to' ? 'border-[#1d1d1f] bg-[#f5f5f7] text-[#1d1d1f]' : 'border-black/[0.08] text-[#6e6e73]'}`}
            onClick={() => { if (dateFrom) setSelecting('to'); }}
          >
            {dateTo ? formatDateShort(dateTo) : <span className="text-[#aeaeb2]">End date</span>}
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            disabled={!canPrevMonth}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${canPrevMonth ? 'text-[#1d1d1f] hover:bg-[#f5f5f7]' : 'text-[#d2d2d7] cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[14px] font-semibold text-[#1d1d1f]">{MONTHS[viewMonth]} {viewYear}</span>
          <button
            onClick={nextMonth}
            disabled={!canNextMonth}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${canNextMonth ? 'text-[#1d1d1f] hover:bg-[#f5f5f7]' : 'text-[#d2d2d7] cursor-not-allowed'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#aeaeb2] py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;
            const state = getCellState(cell);
            const str = toDateStr(cell);
            const isDisabled = state === 'disabled';
            const isStart = state === 'start';
            const isEnd = state === 'end';
            const isInRange = state === 'in-range' || state === 'hover-range';
            const isToday = state === 'today';

            return (
              <div key={str} className="relative flex items-center justify-center">
                {(isInRange) && (
                  <div className="absolute inset-y-0 inset-x-0 bg-sky-50" />
                )}
                {isStart && toDate && (
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-sky-50" />
                )}
                {isEnd && fromDate && (
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-sky-50" />
                )}
                <button
                  disabled={isDisabled}
                  onClick={() => handleDayClick(cell)}
                  onMouseEnter={() => !isDisabled && setHovered(str)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all
                    ${isDisabled ? 'text-[#d2d2d7] cursor-not-allowed' : ''}
                    ${isStart || isEnd ? 'bg-[#1d1d1f] text-white' : ''}
                    ${isInRange ? 'text-sky-700' : ''}
                    ${isToday && !isStart && !isEnd ? 'text-sky-600 font-bold' : ''}
                    ${state === 'default' && !isDisabled ? 'text-[#1d1d1f] hover:bg-[#f5f5f7]' : ''}
                  `}
                >
                  {cell.getDate()}
                  {isToday && !isStart && !isEnd && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-3 border-t border-black/[0.06] mt-2">
        <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-wider mb-2">Quick select</p>
        <div className="flex flex-wrap gap-1.5">
          {quickRanges.map(r => {
            const isActive = dateFrom === r.from && dateTo === r.to;
            return (
              <button
                key={r.label}
                onClick={() => { onChange(r.from, r.to); setSelecting('from'); }}
                className={`px-2.5 py-1 rounded-full text-[12px] font-medium border transition-all
                  ${isActive
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                    : 'text-[#6e6e73] border-black/[0.08] hover:border-black/[0.15] hover:text-[#1d1d1f]'
                  }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <button
          onClick={() => { onChange('', ''); setSelecting('from'); }}
          className="flex-1 py-2 rounded-xl border border-black/[0.08] text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:border-black/[0.15] transition-all"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-xl bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white text-[13px] font-semibold transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
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
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCalendar) setShowCalendar(false);
        else if (showAdvanced) setShowAdvanced(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAdvanced, showCalendar]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showCalendar &&
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node) &&
        calendarBtnRef.current &&
        !calendarBtnRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCalendar]);

  const hasDateFilter = !!(filters.dateFrom || filters.dateTo);

  const dateLabel = (() => {
    if (filters.dateFrom && filters.dateTo) {
      return `${formatDateShort(filters.dateFrom)} – ${formatDateShort(filters.dateTo)}`;
    }
    if (filters.dateFrom) return `From ${formatDateShort(filters.dateFrom)}`;
    if (filters.dateTo) return `Until ${formatDateShort(filters.dateTo)}`;
    return null;
  })();

  const activeChips: Array<{ label: string; clear: () => void }> = [];

  if (filters.category !== 'all') {
    const cat = CATEGORIES.find(c => c.value === filters.category);
    activeChips.push({ label: cat?.label ?? filters.category, clear: () => onChange({ category: 'all' }) });
  }
  if (hasDateFilter) {
    activeChips.push({ label: dateLabel ?? 'Date range', clear: () => onChange({ dateFrom: '', dateTo: '' }) });
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
      dateFrom: '',
      dateTo: '',
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

          {/* Date range picker button */}
          <div className="relative flex-shrink-0" ref={calendarRef}>
            <button
              ref={calendarBtnRef}
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap
                ${showCalendar
                  ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                  : hasDateFilter
                    ? 'text-sky-600 border-sky-200 bg-sky-50'
                    : 'text-[#6e6e73] border-black/[0.08] hover:border-black/[0.15] hover:text-[#1d1d1f] bg-white'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="max-w-[160px] truncate">
                {dateLabel ?? 'Date range'}
              </span>
              {hasDateFilter && (
                <button
                  onClick={(e) => { e.stopPropagation(); onChange({ dateFrom: '', dateTo: '' }); }}
                  className={`-mr-0.5 transition-colors ${showCalendar ? 'text-white/60 hover:text-white' : 'text-sky-300 hover:text-sky-600'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {!hasDateFilter && (
                showCalendar
                  ? <ChevronUp className="w-3 h-3 ml-0.5" />
                  : <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>

            {showCalendar && (
              <CalendarPicker
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                onChange={(from, to) => onChange({ dateFrom: from, dateTo: to })}
                onClose={() => setShowCalendar(false)}
              />
            )}
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
