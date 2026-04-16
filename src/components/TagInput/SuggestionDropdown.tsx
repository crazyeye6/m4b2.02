import { Tag as TagIcon, Plus, AlertTriangle } from 'lucide-react';
import type { Tag } from '../../types';
import { getDisplayName, highlightMatch, normalizeSlug } from './utils';

interface SuggestionDropdownProps {
  suggestions: Tag[];
  query: string;
  highlightedIndex: number;
  onSelect: (tag: Tag) => void;
  onCreateNew: (raw: string) => void;
  onHighlight: (idx: number) => void;
  showCreateNew: boolean;
  similarTag: Tag | null;
}

export function SuggestionDropdown({
  suggestions,
  query,
  highlightedIndex,
  onSelect,
  onCreateNew,
  onHighlight,
  showCreateNew,
  similarTag,
}: SuggestionDropdownProps) {
  const hasItems = suggestions.length > 0 || showCreateNew;
  if (!hasItems) return null;

  const slug = normalizeSlug(query);
  const createLabel = slug || query.trim();

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-xl shadow-black/[0.08] z-50 overflow-hidden">

      {suggestions.length > 0 && (
        <>
          <div className="px-3.5 pt-3 pb-1">
            <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-widest">
              {query.trim() ? 'Suggested tags' : 'Popular tags'}
            </p>
          </div>
          <ul className="pb-1">
            {suggestions.map((tag, idx) => {
              const display = getDisplayName(tag);
              const parts = highlightMatch(display, query);
              const isHighlighted = highlightedIndex === idx;

              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors
                      ${isHighlighted ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'}`}
                    onMouseDown={(e) => { e.preventDefault(); onSelect(tag); }}
                    onMouseEnter={() => onHighlight(idx)}
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1d1d1f] flex-shrink-0">
                      <TagIcon className="w-3 h-3 text-white" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">
                        {parts.map((p, i) =>
                          p.highlight
                            ? <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm px-0.5 not-italic">{p.text}</mark>
                            : <span key={i}>{p.text}</span>
                        )}
                      </span>
                      {tag.name !== display.toLowerCase().replace(/\s+/g, '-') && (
                        <span className="text-[10px] text-[#aeaeb2] ml-2">#{tag.name}</span>
                      )}
                    </span>
                    {tag.usage_count > 0 && (
                      <span className="text-[11px] text-[#aeaeb2] flex-shrink-0 tabular-nums">
                        {tag.usage_count} {tag.usage_count === 1 ? 'listing' : 'listings'}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {showCreateNew && createLabel && (
        <>
          {suggestions.length > 0 && <div className="mx-3.5 border-t border-black/[0.06] my-1" />}

          {similarTag && (
            <div className="mx-3.5 mb-2 mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-snug">
                A similar tag <strong>#{getDisplayName(similarTag)}</strong> already exists. Select it above to keep tags consistent.
              </p>
            </div>
          )}

          <div className="pb-2 px-1">
            <button
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors
                ${highlightedIndex === suggestions.length ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'}`}
              onMouseDown={(e) => { e.preventDefault(); onCreateNew(query); }}
              onMouseEnter={() => onHighlight(suggestions.length)}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#f0fdf4] border border-green-200 flex-shrink-0">
                <Plus className="w-3.5 h-3.5 text-green-600" />
              </span>
              <span className="text-[13px] text-[#1d1d1f] font-medium">
                Create <span className="font-bold">#{createLabel}</span>
              </span>
              <span className="ml-auto text-[11px] text-[#aeaeb2]">New tag</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
