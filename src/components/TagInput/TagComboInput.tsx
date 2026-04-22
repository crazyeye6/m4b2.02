import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tag } from '../../types';
import { filterAndRankTags, getDisplayName, normalizeSlug } from './utils';

interface TagComboInputProps {
  value: string;
  onChange: (value: string) => void;
  tagType?: 'niche' | 'geography' | 'format' | 'audience' | 'general';
  placeholder?: string;
  className?: string;
  allowFreeText?: boolean;
}

export default function TagComboInput({
  value,
  onChange,
  tagType,
  placeholder = 'Search or type…',
  className = '',
  allowFreeText = true,
}: TagComboInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = value
    ? (allTags.find(t => t.name === value)
        ? getDisplayName(allTags.find(t => t.name === value)!)
        : value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    : '';

  useEffect(() => {
    async function fetchTags() {
      let query = supabase
        .from('tags')
        .select('id, name, display_name, tag_type, usage_count, created_at')
        .order('usage_count', { ascending: false })
        .limit(400);
      if (tagType) query = query.eq('tag_type', tagType);
      const { data } = await query;
      if (data) setAllTags(data as Tag[]);
    }
    fetchTags();
  }, [tagType]);

  const computeSuggestions = useCallback((q: string) => {
    const ranked = filterAndRankTags(allTags, q, [], 10);
    setSuggestions(ranked);
  }, [allTags]);

  const openDropdown = useCallback((q: string) => {
    computeSuggestions(q);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, [computeSuggestions]);

  const selectTag = useCallback((tag: Tag) => {
    onChange(tag.name);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onChange]);

  const commitFreeText = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const slug = normalizeSlug(trimmed);
    const existing = allTags.find(t =>
      t.name === slug || getDisplayName(t).toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      onChange(existing.name);
    } else if (allowFreeText) {
      onChange(trimmed);
    }
    setInputValue('');
    setIsOpen(false);
  }, [allTags, allowFreeText, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    openDropdown(e.target.value);
  };

  const handleFocus = () => {
    setInputValue('');
    openDropdown('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectTag(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        commitFreeText(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (inputValue.trim() && allowFreeText) {
          commitFreeText(inputValue);
        } else {
          setInputValue('');
        }
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [inputValue, allowFreeText, commitFreeText]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 bg-[#f5f5f7] border rounded-2xl px-3 py-2.5 cursor-text transition-all
          ${isOpen ? 'border-black/[0.2] bg-white ring-2 ring-black/[0.04]' : 'border-black/[0.08] hover:border-black/[0.14]'}`}
        onClick={() => { setInputValue(''); inputRef.current?.focus(); openDropdown(''); }}
      >
        {value && !isOpen ? (
          <>
            <span className="flex-1 text-sm text-[#1d1d1f] font-medium truncate">{displayValue}</span>
            <button type="button" onClick={handleClear} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder={value ? displayValue : placeholder}
              className={`flex-1 bg-transparent outline-none text-sm min-w-0 ${value && !isOpen ? 'text-[#1d1d1f] font-medium' : 'text-[#1d1d1f] placeholder:text-[#aeaeb2]'}`}
              autoComplete="off"
            />
            <ChevronDown className={`w-3.5 h-3.5 text-[#aeaeb2] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-lg shadow-black/[0.06] overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((tag, i) => {
            const display = getDisplayName(tag);
            const query = inputValue.toLowerCase();
            const idx = display.toLowerCase().indexOf(query);
            return (
              <button
                key={tag.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); selectTag(tag); }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors text-sm ${
                  highlightedIndex === i ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'
                }`}
              >
                <span className="text-[#1d1d1f]">
                  {query && idx !== -1 ? (
                    <>
                      {display.slice(0, idx)}
                      <strong className="font-semibold">{display.slice(idx, idx + query.length)}</strong>
                      {display.slice(idx + query.length)}
                    </>
                  ) : display}
                </span>
                {tag.usage_count > 0 && (
                  <span className="text-[10px] text-[#aeaeb2] font-medium ml-2 flex-shrink-0">
                    {tag.usage_count} listing{tag.usage_count !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}
          {allowFreeText && inputValue.trim() && !suggestions.some(t => getDisplayName(t).toLowerCase() === inputValue.toLowerCase()) && (
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); commitFreeText(inputValue); }}
              className="w-full text-left px-4 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] flex items-center gap-2 border-t border-black/[0.04]"
            >
              <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Use</span>
              <span className="font-semibold">"{inputValue.trim()}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
