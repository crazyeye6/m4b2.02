import {
  Search, X, Hash, Mail, Mic, Instagram, LayoutGrid,
  ChevronDown, ChevronUp, Check, MapPin, Users, DollarSign,
  Zap, ArrowUpDown, Tag as TagIcon, Columns2, Columns3, TrendingUp, Calendar, Star,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import type { FilterState, Tag as TagType, SortOption, ViewMode, DeadlineWindow } from '../types';
import type { GridColumns } from './ListingsGrid';
import { filterAndRankTags, getDisplayName, highlightMatch } from './TagInput/utils';

interface SmartFilterBarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  total: number;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  columns: GridColumns;
  onColumnsChange: (c: GridColumns) => void;
  onReset: () => void;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; desc: string }> = [
  { value: 'deadline_asc', label: 'Ending soonest', desc: 'Act before slots close' },
  { value: 'best_stats', label: 'Best stats', desc: 'Top reach, discount & value combined' },
  { value: 'discount_desc', label: 'Biggest saving', desc: 'Best % off original rate' },
  { value: 'audience_desc', label: 'Largest reach', desc: 'Max impressions first' },
  { value: 'price_asc', label: 'Lowest price', desc: 'Entry-level budgets first' },
  { value: 'price_desc', label: 'Premium first', desc: 'Top-tier placements first' },
  { value: 'newest', label: 'Just listed', desc: 'Fresh inventory' },
];

const DISCOUNT_OPTIONS = [
  { label: 'Any discount', value: 0 },
  { label: '10%+ off', value: 10 },
  { label: '20%+ off', value: 20 },
  { label: '30%+ off', value: 30 },
  { label: '40%+ off', value: 40 },
  { label: '50%+ off', value: 50 },
];

const DEADLINE_OPTIONS: Array<{ label: string; value: DeadlineWindow }> = [
  { label: 'Ending today', value: 'today' },
  { label: 'Next 3 days', value: '3days' },
  { label: 'This week', value: '1week' },
  { label: 'Next 2 weeks', value: '2weeks' },
];

const PRICE_RANGES = [
  { label: 'Under $250', min: 0, max: 250 },
  { label: '$250–$500', min: 250, max: 500 },
  { label: '$500–$1k', min: 500, max: 1000 },
  { label: '$1k–$2.5k', min: 1000, max: 2500 },
  { label: '$2.5k+', min: 2500, max: 0 },
];

const AUDIENCE_RANGES = [
  { label: '1k+', min: 1_000 },
  { label: '5k+', min: 5_000 },
  { label: '10k+', min: 10_000 },
  { label: '50k+', min: 50_000 },
  { label: '100k+', min: 100_000 },
  { label: '500k+', min: 500_000 },
];

type PanelId = 'price' | 'reach' | 'discount' | 'deadline' | 'sort' | 'best_stats' | null;

interface PortalPanelProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  align?: 'left' | 'right';
  children: React.ReactNode;
  onClose: () => void;
  minWidth?: number;
}

function PortalPanel({ anchorRef, align = 'left', children, onClose, minWidth = 200 }: PortalPanelProps) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function compute() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 6;
      const left = align === 'right'
        ? rect.right + window.scrollX - minWidth
        : rect.left + window.scrollX;
      setPos({ top, left });
    }
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [anchorRef, align, minWidth]);

  return createPortal(
    <div
      style={{ top: pos.top, left: pos.left, minWidth, position: 'absolute' }}
      className="bg-white border border-black/[0.08] rounded-2xl shadow-2xl shadow-black/[0.12] z-[9999] overflow-hidden"
    >
      {children}
      <div className="px-3 pb-3">
        <button
          onClick={onClose}
          className="w-full mt-1.5 py-2 rounded-xl bg-[#f5f5f7] text-[12px] font-semibold text-[#6e6e73] hover:bg-[#ebebed] transition-colors"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

function PanelItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors text-left
        ${active ? 'text-teal-700 bg-teal-50' : 'text-[#3a3a3c] hover:bg-[#f5f5f7]'}`}
    >
      <span>{children}</span>
      {active && <Check className="w-3.5 h-3.5 flex-shrink-0 text-teal-600" />}
    </button>
  );
}

export default function SmartFilterBar({
  filters, onChange, total,
  viewMode, onViewModeChange,
  columns, onColumnsChange,
  onReset,
}: SmartFilterBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [geoTags, setGeoTags] = useState<TagType[]>([]);
  const [nicheTags, setNicheTags] = useState<TagType[]>([]);
  const [suggestions, setSuggestions] = useState<TagType[]>([]);
  const [showTagDrop, setShowTagDrop] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [openPanel, setOpenPanel] = useState<PanelId>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const priceBtnRef = useRef<HTMLButtonElement>(null);
  const reachBtnRef = useRef<HTMLButtonElement>(null);
  const discountBtnRef = useRef<HTMLButtonElement>(null);
  const deadlineBtnRef = useRef<HTMLButtonElement>(null);
  const bestStatsBtnRef = useRef<HTMLButtonElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tags')
        .select('id, name, display_name, tag_type, usage_count, created_at')
        .order('usage_count', { ascending: false })
        .limit(300);
      if (data) {
        const all = data as TagType[];
        setAllTags(all);
        setGeoTags(all.filter(t => t.tag_type === 'geography'));
        setNicheTags(all.filter(t => t.tag_type === 'niche'));
      }
    }
    load();
  }, []);

  const allSelected = [
    ...(filters.selectedTags ?? []),
    ...(filters.selectedGeographies ?? []),
    ...(filters.selectedNiches ?? []),
  ];

  const computeSuggestions = useCallback((query: string) => {
    const ranked = filterAndRankTags(allTags, query, allSelected, 8);
    setSuggestions(ranked);
  }, [allTags, allSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    computeSuggestions(val);
    setShowTagDrop(true);
    setHighlightedIdx(-1);
    if (!val.trim()) onChange({ searchQuery: '' });
  };

  const commitSearch = (query: string) => {
    onChange({ searchQuery: query });
    setInputValue('');
    setShowTagDrop(false);
  };

  const selectTag = (tag: TagType) => {
    const slug = tag.name;
    if (tag.tag_type === 'geography') {
      const cur = filters.selectedGeographies ?? [];
      if (!cur.includes(slug)) onChange({ selectedGeographies: [...cur, slug] });
    } else if (tag.tag_type === 'niche') {
      const cur = filters.selectedNiches ?? [];
      if (!cur.includes(slug)) onChange({ selectedNiches: [...cur, slug] });
    } else {
      const cur = filters.selectedTags ?? [];
      if (!cur.includes(slug)) onChange({ selectedTags: [...cur, slug] });
    }
    setInputValue('');
    setSuggestions([]);
    setShowTagDrop(false);
    onChange({ searchQuery: '' });
    inputRef.current?.focus();
  };

  const removeChip = (type: 'tag' | 'geo' | 'niche' | 'search', slug: string) => {
    if (type === 'tag') onChange({ selectedTags: (filters.selectedTags ?? []).filter(t => t !== slug) });
    if (type === 'geo') onChange({ selectedGeographies: (filters.selectedGeographies ?? []).filter(t => t !== slug) });
    if (type === 'niche') onChange({ selectedNiches: (filters.selectedNiches ?? []).filter(t => t !== slug) });
    if (type === 'search') onChange({ searchQuery: '' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIdx >= 0 && suggestions[highlightedIdx]) selectTag(suggestions[highlightedIdx]);
      else if (inputValue.trim()) commitSearch(inputValue.trim());
    } else if (e.key === 'Escape') {
      setShowTagDrop(false);
      setOpenPanel(null);
      inputRef.current?.blur();
    } else if (e.key === 'Backspace' && !inputValue) {
      const tags = filters.selectedTags ?? [];
      const geos = filters.selectedGeographies ?? [];
      const niches = filters.selectedNiches ?? [];
      if (niches.length > 0) onChange({ selectedNiches: niches.slice(0, -1) });
      else if (geos.length > 0) onChange({ selectedGeographies: geos.slice(0, -1) });
      else if (tags.length > 0) onChange({ selectedTags: tags.slice(0, -1) });
      else if (filters.searchQuery) onChange({ searchQuery: '' });
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as Node;
        const isInsidePortal = document.querySelectorAll('[data-filter-panel]');
        let clickedInPanel = false;
        isInsidePortal.forEach(panel => { if (panel.contains(target)) clickedInPanel = true; });
        if (!clickedInPanel) {
          setShowTagDrop(false);
          setOpenPanel(null);
          if (inputValue.trim()) commitSearch(inputValue.trim());
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [inputValue]);

  const togglePanel = (id: PanelId) => {
    setShowTagDrop(false);
    setOpenPanel(p => (p === id ? null : id));
  };

  const setPriceRange = (min: number, max: number) => {
    if (filters.priceMin === min && filters.priceMax === max) onChange({ priceMin: 0, priceMax: 0 });
    else onChange({ priceMin: min, priceMax: max });
  };

  const matchedPriceRange = PRICE_RANGES.find(r => r.min === filters.priceMin && r.max === filters.priceMax);
  const currentSort = SORT_OPTIONS.find(s => s.value === filters.sort);
  const tagCount = (filters.selectedTags ?? []).length;
  const hasPrice = filters.priceMin > 0 || filters.priceMax > 0;
  const hasDiscount = filters.discountMin > 0;
  const hasDeadline = !!filters.deadlineWindow;
  const geoCount = (filters.selectedGeographies ?? []).length;
  const nicheCount = (filters.selectedNiches ?? []).length;
  const hasAnyFilter =
    filters.category !== 'all' || geoCount > 0 || nicheCount > 0 || tagCount > 0 ||
    hasPrice || (filters.audienceMin > 0) || hasDiscount || hasDeadline || !!filters.searchQuery;
  const isBestStats = filters.sort === 'best_stats';
  const matchedDeadline = DEADLINE_OPTIONS.find(d => d.value === filters.deadlineWindow);
  const matchedDiscount = DISCOUNT_OPTIONS.find(d => d.value === filters.discountMin);
  const hasAudience = filters.audienceMin > 0;
  const matchedAud = AUDIENCE_RANGES.find(r => r.min === filters.audienceMin);

  const allChips: Array<{ label: string; type: 'tag' | 'geo' | 'niche' | 'search'; slug: string }> = [
    ...(filters.searchQuery ? [{ label: `"${filters.searchQuery}"`, type: 'search' as const, slug: filters.searchQuery }] : []),
    ...(filters.selectedGeographies ?? []).map(slug => {
      const tag = geoTags.find(t => t.name === slug);
      return { label: tag ? getDisplayName(tag) : slug, type: 'geo' as const, slug };
    }),
    ...(filters.selectedNiches ?? []).map(slug => {
      const tag = nicheTags.find(t => t.name === slug);
      return { label: tag ? getDisplayName(tag) : slug, type: 'niche' as const, slug };
    }),
    ...(filters.selectedTags ?? []).map(slug => ({ label: slug, type: 'tag' as const, slug })),
  ];

  const hasInputContent = inputValue || allChips.length > 0;

  const filterBtnClass = (active: boolean, colorClass?: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap ${
      active
        ? colorClass ?? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
        : 'text-[#6e6e73] border-black/[0.08] bg-white hover:border-black/[0.2] hover:text-[#1d1d1f]'
    }`;

  return (
    <div ref={containerRef} className="bg-white border-b border-black/[0.07] sticky top-[52px] z-50 shadow-sm shadow-black/[0.04]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">

        {/* Row 0: Media type toggles */}
        <div className="flex items-center gap-1.5">
          {([
            { value: 'newsletter' as const, label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" /> },
          ]).map(c => {
            const active = filters.category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onChange({ category: active ? 'all' : c.value })}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap
                  ${active
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                    : 'text-[#6e6e73] border-black/[0.08] bg-white hover:border-black/[0.2] hover:text-[#1d1d1f]'}`}
              >
                {c.icon}
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Row 1: Search + tag input */}
        <div ref={searchBoxRef} className="relative">
          <div
            className={`flex items-center flex-wrap gap-1.5 min-h-[46px] px-4 py-2 bg-white border-2 rounded-2xl transition-all cursor-text
              ${showTagDrop ? 'border-[#1d1d1f] shadow-lg shadow-black/[0.08]' : 'border-black/[0.1] hover:border-black/[0.2]'}`}
            onClick={() => { inputRef.current?.focus(); if (!inputValue) { computeSuggestions(''); setShowTagDrop(true); } }}
          >
            <Search className="w-4 h-4 text-[#aeaeb2] flex-shrink-0 mr-0.5" />

            {allChips.map(chip => (
              <span
                key={`${chip.type}-${chip.slug}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold flex-shrink-0
                  ${chip.type === 'geo' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                    chip.type === 'niche' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    chip.type === 'search' ? 'bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.08]' :
                    'bg-[#1d1d1f] text-white'}`}
              >
                {chip.type === 'search' ? <Search className="w-3 h-3 opacity-50" /> :
                  chip.type === 'geo' ? <MapPin className="w-3 h-3 opacity-60" /> :
                  chip.type === 'niche' ? <Users className="w-3 h-3 opacity-60" /> :
                  <Hash className="w-3 h-3 opacity-60" />}
                {chip.label}
                <button
                  onClick={(e) => { e.stopPropagation(); removeChip(chip.type, chip.slug); }}
                  className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { computeSuggestions(inputValue); setShowTagDrop(true); }}
              placeholder={hasInputContent ? '' : 'Search or filter by tag, location, niche…'}
              className="flex-1 min-w-[180px] bg-transparent outline-none text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] py-0.5"
              autoComplete="off"
              spellCheck={false}
            />

            {hasInputContent && (
              <button
                onClick={(e) => { e.stopPropagation(); onReset(); setInputValue(''); setShowTagDrop(false); }}
                className="flex-shrink-0 text-[#aeaeb2] hover:text-[#ff3b30] transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showTagDrop && (suggestions.length > 0 || inputValue.trim()) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-2xl shadow-black/[0.12] z-50 overflow-hidden">
              {suggestions.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-widest">
                      {inputValue.trim() ? 'Matching tags' : 'Popular tags'}
                    </p>
                  </div>
                  <ul className={inputValue.trim() ? 'pb-1' : 'pb-2'}>
                    {suggestions.map((tag, idx) => {
                      const display = getDisplayName(tag);
                      const parts = highlightMatch(display, inputValue);
                      return (
                        <li key={tag.id}>
                          <button
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                              ${highlightedIdx === idx ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'}`}
                            onMouseDown={(e) => { e.preventDefault(); selectTag(tag); }}
                            onMouseEnter={() => setHighlightedIdx(idx)}
                          >
                            <span className={`flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0
                              ${tag.tag_type === 'geography' ? 'bg-sky-100' :
                                tag.tag_type === 'niche' ? 'bg-emerald-100' : 'bg-[#1d1d1f]'}`}
                            >
                              {tag.tag_type === 'geography'
                                ? <MapPin className="w-3 h-3 text-sky-600" />
                                : tag.tag_type === 'niche'
                                  ? <Users className="w-3 h-3 text-emerald-600" />
                                  : <TagIcon className="w-3 h-3 text-white" />}
                            </span>
                            <span className="flex-1 text-[13px] font-medium text-[#1d1d1f]">
                              {parts.map((p, i) =>
                                p.highlight
                                  ? <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm px-0.5 not-italic">{p.text}</mark>
                                  : <span key={i}>{p.text}</span>
                              )}
                            </span>
                            <span className={`text-[11px] font-semibold flex-shrink-0 px-1.5 py-0.5 rounded-full
                              ${tag.tag_type === 'geography' ? 'bg-sky-50 text-sky-500' :
                                tag.tag_type === 'niche' ? 'bg-emerald-50 text-emerald-600' : 'text-[#aeaeb2]'}`}>
                              {tag.tag_type === 'geography' ? 'location' :
                                tag.tag_type === 'niche' ? 'niche' :
                                tag.usage_count > 0 ? tag.usage_count : ''}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              {inputValue.trim() && (
                <div className={suggestions.length > 0 ? 'border-t border-black/[0.05]' : 'pt-1'}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f7] transition-colors"
                    onMouseDown={(e) => { e.preventDefault(); commitSearch(inputValue.trim()); setInputValue(''); }}
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#f5f5f7] flex-shrink-0">
                      <Search className="w-3 h-3 text-[#6e6e73]" />
                    </span>
                    <span className="flex-1 text-[13px] text-[#6e6e73]">
                      Search <span className="font-semibold text-[#1d1d1f]">"{inputValue}"</span>
                    </span>
                    <span className="text-[11px] text-[#aeaeb2]">keyword search</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Filters + sort + view */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>

          {/* Budget */}
          <button
            ref={priceBtnRef}
            onClick={() => togglePanel('price')}
            className={filterBtnClass(openPanel === 'price' || hasPrice)}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {matchedPriceRange ? matchedPriceRange.label : 'Budget'}
            {openPanel === 'price' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Reach */}
          <button
            ref={reachBtnRef}
            onClick={() => togglePanel('reach')}
            className={filterBtnClass(openPanel === 'reach' || hasAudience)}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {matchedAud ? matchedAud.label : 'Reach'}
            {openPanel === 'reach' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Discount */}
          <button
            ref={discountBtnRef}
            onClick={() => togglePanel('discount')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap ${
              openPanel === 'discount' || hasDiscount
                ? 'bg-orange-500 text-white border-orange-500'
                : 'text-[#6e6e73] border-black/[0.08] bg-white hover:border-orange-200 hover:text-orange-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {matchedDiscount && matchedDiscount.value > 0 ? matchedDiscount.label : 'Discount'}
            {openPanel === 'discount' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Deadline */}
          <button
            ref={deadlineBtnRef}
            onClick={() => togglePanel('deadline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap ${
              openPanel === 'deadline' || hasDeadline
                ? 'bg-red-500 text-white border-red-500'
                : 'text-[#6e6e73] border-black/[0.08] bg-white hover:border-red-200 hover:text-red-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {matchedDeadline ? matchedDeadline.label : 'Deadline'}
            {openPanel === 'deadline' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort */}
          <button
            ref={sortBtnRef}
            onClick={() => togglePanel('sort')}
            className={filterBtnClass(openPanel === 'sort' || !!(filters.sort && filters.sort !== 'deadline_asc'))}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by</span>
            {openPanel === 'sort' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* View mode */}
          <div className="flex-shrink-0 flex items-center gap-0.5 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid"
              className={`flex items-center justify-center w-7 h-7 rounded-xl transition-all
                ${viewMode === 'grid' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#aeaeb2] hover:text-[#1d1d1f]'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="List"
              className={`flex items-center justify-center w-7 h-7 rounded-xl transition-all
                ${viewMode === 'list' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#aeaeb2] hover:text-[#1d1d1f]'}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            </button>
          </div>

          {/* Columns (grid only) */}
          {viewMode === 'grid' && (
            <div className="flex-shrink-0 hidden sm:flex items-center gap-0.5 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-0.5">
              {([1, 2, 3] as GridColumns[]).map(n => (
                <button
                  key={n}
                  onClick={() => onColumnsChange(n)}
                  className={`flex items-center justify-center w-7 h-7 rounded-xl transition-all
                    ${columns === n ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#aeaeb2] hover:text-[#1d1d1f]'}`}
                >
                  {n === 1 ? <LayoutGrid className="w-3.5 h-3.5" /> : n === 2 ? <Columns2 className="w-3.5 h-3.5" /> : <Columns3 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}

          {/* Result count + clear */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {hasAnyFilter && (
              <button
                onClick={() => { onReset(); setInputValue(''); }}
                className="flex items-center gap-1 text-[11px] text-[#aeaeb2] hover:text-[#ff3b30] transition-colors whitespace-nowrap"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            <span className="text-[#1d1d1f] font-semibold text-[13px] tabular-nums whitespace-nowrap">
              {total} <span className="text-[#aeaeb2] font-normal">result{total !== 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Portaled panels — rendered outside overflow container */}
      {openPanel === 'price' && (
        <PortalPanel anchorRef={priceBtnRef} onClose={() => setOpenPanel(null)} minWidth={200}>
          <div data-filter-panel="" className="pt-2">
            <PanelItem active={!hasPrice} onClick={() => onChange({ priceMin: 0, priceMax: 0 })}>Any budget</PanelItem>
            {PRICE_RANGES.map(r => (
              <PanelItem key={r.label} active={!!(matchedPriceRange && matchedPriceRange.label === r.label)} onClick={() => setPriceRange(r.min, r.max)}>
                {r.label}
              </PanelItem>
            ))}
          </div>
        </PortalPanel>
      )}

      {openPanel === 'reach' && (
        <PortalPanel anchorRef={reachBtnRef} onClose={() => setOpenPanel(null)} minWidth={200}>
          <div data-filter-panel="" className="pt-2">
            <PanelItem active={!hasAudience} onClick={() => onChange({ audienceMin: 0 })}>Any size</PanelItem>
            {AUDIENCE_RANGES.map(r => (
              <PanelItem key={r.min} active={filters.audienceMin === r.min} onClick={() => onChange({ audienceMin: filters.audienceMin === r.min ? 0 : r.min })}>
                {r.label} audience
              </PanelItem>
            ))}
          </div>
        </PortalPanel>
      )}

      {openPanel === 'discount' && (
        <PortalPanel anchorRef={discountBtnRef} onClose={() => setOpenPanel(null)} minWidth={200}>
          <div data-filter-panel="" className="pt-2">
            {DISCOUNT_OPTIONS.map(opt => (
              <PanelItem
                key={opt.value}
                active={filters.discountMin === opt.value}
                onClick={() => { onChange({ discountMin: opt.value }); if (opt.value === 0) setOpenPanel(null); }}
              >
                {opt.label}
              </PanelItem>
            ))}
          </div>
        </PortalPanel>
      )}

      {openPanel === 'deadline' && (
        <PortalPanel anchorRef={deadlineBtnRef} onClose={() => setOpenPanel(null)} minWidth={200}>
          <div data-filter-panel="" className="pt-2">
            <PanelItem active={!hasDeadline} onClick={() => { onChange({ deadlineWindow: null }); setOpenPanel(null); }}>
              Any deadline
            </PanelItem>
            {DEADLINE_OPTIONS.map(opt => (
              <PanelItem
                key={opt.value}
                active={filters.deadlineWindow === opt.value}
                onClick={() => { onChange({ deadlineWindow: filters.deadlineWindow === opt.value ? null : opt.value }); }}
              >
                {opt.label}
              </PanelItem>
            ))}
          </div>
        </PortalPanel>
      )}

      {openPanel === 'sort' && (
        <PortalPanel anchorRef={sortBtnRef} align="right" onClose={() => setOpenPanel(null)} minWidth={240}>
          <div data-filter-panel="">
            <div className="px-4 pt-3 pb-1.5">
              <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-widest">Sort by</p>
            </div>
            <div className="pb-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onChange({ sort: opt.value }); setOpenPanel(null); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors
                    ${filters.sort === opt.value ? 'bg-teal-50' : 'hover:bg-[#f5f5f7]'}`}
                >
                  <div>
                    <p className={`text-[13px] font-medium ${filters.sort === opt.value ? 'text-teal-700' : 'text-[#1d1d1f]'}`}>{opt.label}</p>
                    <p className="text-[11px] text-[#aeaeb2] mt-0.5">{opt.desc}</p>
                  </div>
                  {filters.sort === opt.value && <Check className="w-3.5 h-3.5 flex-shrink-0 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>
        </PortalPanel>
      )}
    </div>
  );
}
