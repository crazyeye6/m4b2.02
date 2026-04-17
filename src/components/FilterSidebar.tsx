import {
  Mail, Mic, Instagram, MapPin, Tag, DollarSign, TrendingDown, Clock,
  LayoutGrid, Check, X, ChevronDown, ChevronUp, SlidersHorizontal,
  ArrowUpDown, Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { FilterState, SortOption, ViewMode, Tag as TagType } from '../types';
import { TagFilterInput } from './TagInput/TagFilterInput';
import type { GridColumns } from './ListingsGrid';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  total: number;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  columns: GridColumns;
  onColumnsChange: (c: GridColumns) => void;
  onReset: () => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All types', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-3.5 h-3.5" /> },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-3.5 h-3.5" /> },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-3.5 h-3.5" /> },
];

const DISCOUNT_OPTIONS = [20, 30, 40, 50];
const PRICE_RANGES = [
  { label: 'Under $250', min: 0, max: 250 },
  { label: '$250 – $500', min: 250, max: 500 },
  { label: '$500 – $1,000', min: 500, max: 1000 },
  { label: '$1,000 – $2,500', min: 1000, max: 2500 },
  { label: '$2,500+', min: 2500, max: 0 },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'deadline_asc', label: 'Ending soonest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount_desc', label: 'Biggest discount' },
  { value: 'audience_desc', label: 'Largest audience' },
  { value: 'newest', label: 'Newest listings' },
];

function getDisplayName(tag: TagType) {
  return tag.display_name || tag.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function Section({
  label,
  icon,
  count,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-black/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 text-left group"
      >
        <span className="text-[#aeaeb2] group-hover:text-[#6e6e73] transition-colors">{icon}</span>
        <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors">
          {label}
        </span>
        {count !== undefined && count > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold">
            {count}
          </span>
        )}
        {open
          ? <ChevronUp className="w-3 h-3 text-[#aeaeb2]" />
          : <ChevronDown className="w-3 h-3 text-[#aeaeb2]" />
        }
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function CheckRow({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-[13px] transition-all text-left
        ${active
          ? 'bg-teal-50 text-teal-700 font-semibold'
          : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] font-medium'
        }`}
    >
      <span className={`flex items-center justify-center w-4 h-4 rounded-md border flex-shrink-0 transition-all
        ${active
          ? 'bg-teal-600 border-teal-600'
          : 'border-[#d1d1d6] bg-white'
        }`}
      >
        {active && <Check className="w-2.5 h-2.5 text-white" />}
      </span>
      {icon && <span className="flex-shrink-0 text-[#aeaeb2]">{icon}</span>}
      <span className="flex-1 min-w-0 truncate">{children}</span>
    </button>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  total,
  viewMode,
  onViewModeChange,
  columns,
  onColumnsChange,
  onReset,
}: FilterSidebarProps) {
  const [geoTags, setGeoTags] = useState<TagType[]>([]);
  const [nicheTags, setNicheTags] = useState<TagType[]>([]);

  useEffect(() => {
    async function fetchTypedTags() {
      const { data } = await supabase
        .from('tags')
        .select('id, name, display_name, tag_type, usage_count, created_at')
        .in('tag_type', ['geography', 'niche'])
        .order('usage_count', { ascending: false });

      if (data) {
        setGeoTags(data.filter((t: TagType) => t.tag_type === 'geography'));
        setNicheTags(data.filter((t: TagType) => t.tag_type === 'niche'));
      }
    }
    fetchTypedTags();
  }, []);

  const toggleGeo = (slug: string) => {
    const current = filters.selectedGeographies ?? [];
    onChange({
      selectedGeographies: current.includes(slug) ? current.filter(g => g !== slug) : [...current, slug],
    });
  };

  const toggleNiche = (slug: string) => {
    const current = filters.selectedNiches ?? [];
    onChange({
      selectedNiches: current.includes(slug) ? current.filter(n => n !== slug) : [...current, slug],
    });
  };

  const activeCount = [
    filters.category !== 'all',
    (filters.selectedNiches?.length ?? 0) > 0,
    (filters.selectedGeographies?.length ?? 0) > 0,
    filters.priceMin > 0 || filters.priceMax > 0,
    filters.discountMin > 0,
    filters.endingThisWeek,
    (filters.selectedTags?.length ?? 0) > 0,
  ].filter(Boolean).length;

  const matchedPriceRange = PRICE_RANGES.find(
    r => r.min === filters.priceMin && r.max === filters.priceMax
  );

  const setPriceRange = (min: number, max: number) => {
    if (filters.priceMin === min && filters.priceMax === max) {
      onChange({ priceMin: 0, priceMax: 0 });
    } else {
      onChange({ priceMin: min, priceMax: max });
    }
  };

  return (
    <aside className="w-56 flex-shrink-0 self-start sticky top-[184px]">
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm shadow-black/[0.03] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6e6e73]" />
            <span className="text-[12px] font-bold text-[#1d1d1f]">Filters</span>
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-[11px] text-[#aeaeb2] hover:text-[#ff3b30] transition-colors font-medium"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        <div className="px-3 py-1">

          {/* Sort */}
          <Section label="Sort by" icon={<ArrowUpDown className="w-3.5 h-3.5" />} defaultOpen>
            <div className="flex flex-col gap-0.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ sort: opt.value })}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-[12px] transition-all text-left
                    ${filters.sort === opt.value
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] font-medium'
                    }`}
                >
                  {opt.label}
                  {filters.sort === opt.value && <Check className="w-3 h-3 text-teal-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </Section>

          {/* Media Type */}
          <Section label="Media type" icon={<LayoutGrid className="w-3.5 h-3.5" />} count={filters.category !== 'all' ? 1 : 0} defaultOpen>
            <div className="flex flex-col gap-0.5">
              {CATEGORIES.map(c => (
                <CheckRow
                  key={c.value}
                  active={filters.category === c.value}
                  onClick={() => onChange({ category: c.value as FilterState['category'] })}
                  icon={c.icon}
                >
                  {c.label}
                </CheckRow>
              ))}
            </div>
          </Section>

          {/* Availability */}
          <Section label="Availability" icon={<Clock className="w-3.5 h-3.5" />} count={filters.endingThisWeek ? 1 : 0} defaultOpen={false}>
            <CheckRow
              active={filters.endingThisWeek}
              onClick={() => onChange({ endingThisWeek: !filters.endingThisWeek })}
            >
              Ending this week
            </CheckRow>
          </Section>

          {/* Price range */}
          <Section
            label="Price range"
            icon={<DollarSign className="w-3.5 h-3.5" />}
            count={(filters.priceMin > 0 || filters.priceMax > 0) ? 1 : 0}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-0.5">
              {PRICE_RANGES.map(r => (
                <CheckRow
                  key={r.label}
                  active={!!(matchedPriceRange && matchedPriceRange.label === r.label)}
                  onClick={() => setPriceRange(r.min, r.max)}
                >
                  {r.label}
                </CheckRow>
              ))}
            </div>
          </Section>

          {/* Discount */}
          <Section
            label="Min discount"
            icon={<TrendingDown className="w-3.5 h-3.5" />}
            count={filters.discountMin > 0 ? 1 : 0}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-0.5">
              <CheckRow
                active={filters.discountMin === 0}
                onClick={() => onChange({ discountMin: 0 })}
              >
                Any discount
              </CheckRow>
              {DISCOUNT_OPTIONS.map(v => (
                <CheckRow
                  key={v}
                  active={filters.discountMin === v}
                  onClick={() => onChange({ discountMin: filters.discountMin === v ? 0 : v })}
                >
                  {v}%+ off
                </CheckRow>
              ))}
            </div>
          </Section>

          {/* Geography */}
          <Section
            label="Location"
            icon={<MapPin className="w-3.5 h-3.5" />}
            count={(filters.selectedGeographies?.length ?? 0)}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-0.5">
              <CheckRow
                active={(filters.selectedGeographies?.length ?? 0) === 0}
                onClick={() => onChange({ selectedGeographies: [] })}
              >
                Any location
              </CheckRow>
              {geoTags.map(tag => (
                <CheckRow
                  key={tag.name}
                  active={(filters.selectedGeographies ?? []).includes(tag.name)}
                  onClick={() => toggleGeo(tag.name)}
                >
                  {getDisplayName(tag)}
                </CheckRow>
              ))}
            </div>
          </Section>

          {/* Niche */}
          <Section
            label="Niche"
            icon={<Users className="w-3.5 h-3.5" />}
            count={(filters.selectedNiches?.length ?? 0)}
            defaultOpen={false}
          >
            <div className="flex flex-col gap-0.5">
              <CheckRow
                active={(filters.selectedNiches?.length ?? 0) === 0}
                onClick={() => onChange({ selectedNiches: [] })}
              >
                Any niche
              </CheckRow>
              {nicheTags.map(tag => (
                <CheckRow
                  key={tag.name}
                  active={(filters.selectedNiches ?? []).includes(tag.name)}
                  onClick={() => toggleNiche(tag.name)}
                >
                  {getDisplayName(tag)}
                </CheckRow>
              ))}
            </div>
          </Section>

          {/* Tags */}
          <Section
            label="Tags"
            icon={<Tag className="w-3.5 h-3.5" />}
            count={(filters.selectedTags?.length ?? 0) > 0 ? filters.selectedTags.length : 0}
            defaultOpen={false}
          >
            <TagFilterInput
              selectedTags={filters.selectedTags ?? []}
              onChange={(tags) => onChange({ selectedTags: tags })}
            />
          </Section>

        </div>

        {/* Footer: view + result count */}
        <div className="px-4 py-3 border-t border-black/[0.06] bg-[#fafafa]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] text-[#aeaeb2] font-medium">View</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onViewModeChange('grid')}
                title="Grid view"
                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all
                  ${viewMode === 'grid' ? 'bg-[#1d1d1f] text-white' : 'text-[#aeaeb2] hover:text-[#1d1d1f]'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                title="List view"
                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all
                  ${viewMode === 'list' ? 'bg-[#1d1d1f] text-white' : 'text-[#aeaeb2] hover:text-[#1d1d1f]'}`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="2" y1="4" x2="14" y2="4" />
                  <line x1="2" y1="8" x2="14" y2="8" />
                  <line x1="2" y1="12" x2="14" y2="12" />
                </svg>
              </button>
            </div>
          </div>
          {viewMode === 'grid' && (
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] text-[#aeaeb2] font-medium">Columns</span>
              <div className="flex items-center gap-1">
                {([1, 2, 3] as GridColumns[]).map(n => (
                  <button
                    key={n}
                    onClick={() => onColumnsChange(n)}
                    className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-all
                      ${columns === n ? 'bg-[#1d1d1f] text-white' : 'text-[#aeaeb2] hover:text-[#1d1d1f]'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="text-center pt-1">
            <span className="text-[#1d1d1f] font-bold text-[15px] tabular-nums">{total}</span>
            <span className="text-[#aeaeb2] text-[11px] ml-1">result{total !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
