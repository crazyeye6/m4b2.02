import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Tag as TagIcon, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tag } from '../../types';
import { filterAndRankTags, getDisplayName, highlightMatch } from './utils';

interface TagFilterInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilterInput({ selectedTags, onChange }: TagFilterInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase
        .from('tags')
        .select('id, name, display_name, usage_count, created_at')
        .order('usage_count', { ascending: false })
        .limit(300);
      if (data) setAllTags(data as Tag[]);
    }
    fetchTags();
  }, []);

  const computeSuggestions = useCallback((query: string) => {
    const ranked = filterAndRankTags(allTags, query, selectedTags, 10);
    setSuggestions(ranked);
  }, [allTags, selectedTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    computeSuggestions(val);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    computeSuggestions(inputValue);
    setShowDropdown(true);
  };

  const selectTag = useCallback((tag: Tag) => {
    if (!selectedTags.includes(tag.name)) {
      onChange([...selectedTags, tag.name]);
    }
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [selectedTags, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectTag(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        selectTag(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasSelections = selectedTags.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center gap-1.5 px-3 py-2 bg-white border rounded-2xl transition-all
        ${showDropdown ? 'border-[#1d1d1f] ring-2 ring-[#1d1d1f]/10' : 'border-[#d1d1d6] hover:border-[#aeaeb2]'}
        ${hasSelections ? 'border-teal-300 bg-teal-50/50' : ''}`}
      >
        <Search className="w-3.5 h-3.5 text-[#aeaeb2] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={hasSelections ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected…` : 'Filter by tag…'}
          className={`flex-1 min-w-[100px] bg-transparent outline-none text-[13px] placeholder:text-[#aeaeb2]
            ${hasSelections ? 'text-teal-700 placeholder:text-teal-400' : 'text-[#1d1d1f]'}`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {hasSelections && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex-shrink-0">
            {selectedTags.length}
          </span>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-xl shadow-black/[0.08] z-50 overflow-hidden min-w-[200px]">
          <div className="px-3.5 pt-3 pb-1">
            <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-widest">
              {inputValue.trim() ? 'Matching tags' : 'Popular tags'}
            </p>
          </div>
          <ul className="pb-1.5">
            {suggestions.map((tag, idx) => {
              const display = getDisplayName(tag);
              const parts = highlightMatch(display, inputValue);
              const isHighlighted = highlightedIndex === idx;

              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors
                      ${isHighlighted ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'}`}
                    onMouseDown={(e) => { e.preventDefault(); selectTag(tag); }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#1d1d1f] flex-shrink-0">
                      <TagIcon className="w-2.5 h-2.5 text-white" />
                    </span>
                    <span className="flex-1 text-[13px] font-medium text-[#1d1d1f]">
                      {parts.map((p, i) =>
                        p.highlight
                          ? <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm px-0.5 not-italic">{p.text}</mark>
                          : <span key={i}>{p.text}</span>
                      )}
                    </span>
                    {tag.usage_count > 0 && (
                      <span className="text-[11px] text-[#aeaeb2] flex-shrink-0 tabular-nums">
                        {tag.usage_count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showDropdown && !inputValue.trim() && suggestions.length === 0 && allTags.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-xl z-50 px-4 py-3">
          <p className="text-[12px] text-[#aeaeb2]">No tags yet</p>
        </div>
      )}

      {hasSelections && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selectedTags.map(slug => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 border border-teal-200 text-teal-700"
            >
              <Hash className="w-2 h-2 opacity-70" />
              {slug}
              <button
                type="button"
                className="flex items-center justify-center w-3 h-3 rounded-full hover:bg-teal-200 transition-colors"
                onClick={() => onChange(selectedTags.filter(t => t !== slug))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
