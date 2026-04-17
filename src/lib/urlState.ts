import type { FilterState, SortOption, ViewMode } from '../types';

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  selectedNiches: [],
  selectedGeographies: [],
  priceMin: 0,
  priceMax: 0,
  discountMin: 0,
  endingThisWeek: true,
  verified: false,
  searchQuery: '',
  selectedTags: [],
  sort: 'deadline_asc',
};

export function encodeFiltersToUrl(filters: FilterState, viewMode: ViewMode, columns: number): void {
  const url = new URL(window.location.href);
  const p = url.searchParams;

  const d = DEFAULT_FILTERS;

  if (filters.category !== d.category) p.set('cat', filters.category); else p.delete('cat');
  if (filters.selectedNiches.length > 0) p.set('niche', filters.selectedNiches.join(',')); else p.delete('niche');
  if (filters.selectedGeographies.length > 0) p.set('geo', filters.selectedGeographies.join(',')); else p.delete('geo');
  if (filters.priceMin > 0) p.set('pmin', String(filters.priceMin)); else p.delete('pmin');
  if (filters.priceMax > 0) p.set('pmax', String(filters.priceMax)); else p.delete('pmax');
  if (filters.discountMin > 0) p.set('disc', String(filters.discountMin)); else p.delete('disc');
  if (!filters.endingThisWeek) p.set('etw', '0'); else p.delete('etw');
  if (filters.searchQuery) p.set('q', filters.searchQuery); else p.delete('q');
  if (filters.selectedTags.length > 0) p.set('tags', filters.selectedTags.join(',')); else p.delete('tags');
  if (filters.sort !== d.sort) p.set('sort', filters.sort); else p.delete('sort');
  if (viewMode !== 'grid') p.set('view', viewMode); else p.delete('view');
  if (columns !== 2) p.set('cols', String(columns)); else p.delete('cols');

  window.history.replaceState({}, '', url.toString());
}

export function decodeFiltersFromUrl(): { filters: FilterState; viewMode: ViewMode; columns: number } {
  const p = new URLSearchParams(window.location.search);

  const filters: FilterState = {
    category: (p.get('cat') as FilterState['category']) || DEFAULT_FILTERS.category,
    selectedNiches: p.get('niche') ? p.get('niche')!.split(',').filter(Boolean) : [],
    selectedGeographies: p.get('geo') ? p.get('geo')!.split(',').filter(Boolean) : [],
    priceMin: Number(p.get('pmin')) || 0,
    priceMax: Number(p.get('pmax')) || 0,
    discountMin: Number(p.get('disc')) || 0,
    endingThisWeek: p.get('etw') === '0' ? false : DEFAULT_FILTERS.endingThisWeek,
    verified: false,
    searchQuery: p.get('q') || '',
    selectedTags: p.get('tags') ? p.get('tags')!.split(',').filter(Boolean) : [],
    sort: (p.get('sort') as SortOption) || DEFAULT_FILTERS.sort,
  };

  const viewMode: ViewMode = p.get('view') === 'list' ? 'list' : 'grid';
  const colsRaw = Number(p.get('cols'));
  const columns = colsRaw === 1 || colsRaw === 2 || colsRaw === 3 ? colsRaw : 2;

  return { filters, viewMode, columns };
}

export { DEFAULT_FILTERS };
