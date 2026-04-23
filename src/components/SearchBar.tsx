import { Search, X, Tag, Hash } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Tag as TagType } from '../types';

interface SearchBarProps {
  searchQuery: string;
  selectedTags: string[];
  onSearchChange: (query: string) => void;
  onTagsChange: (tags: string[]) => void;
}

export default function SearchBar({ searchQuery, selectedTags, onSearchChange, onTagsChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase
        .from('tags')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(200);
      if (data) setAllTags(data as TagType[]);
    }
    fetchTags();
  }, []);

  const updateSuggestions = useCallback((value: string) => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = allTags
      .filter(t => !selectedTags.includes(t.name) && t.name.includes(lower))
      .slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [allTags, selectedTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    updateSuggestions(val);
    if (!val.trim()) {
      onSearchChange('');
    }
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
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectTag(suggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        commitSearch(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const selectTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearchChange('');
    inputRef.current?.focus();
  };

  const commitSearch = (query: string) => {
    onSearchChange(query);
    setShowSuggestions(false);
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  const clearAll = () => {
    onTagsChange([]);
    onSearchChange('');
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        if (inputValue.trim()) {
          commitSearch(inputValue.trim());
        }
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [inputValue]);

  const hasContent = selectedTags.length > 0 || searchQuery || inputValue;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center flex-wrap gap-1.5 min-h-[46px] px-4 py-2 bg-white border-2 rounded-2xl transition-all cursor-text
          ${showSuggestions ? 'border-[#1d1d1f] shadow-lg shadow-black/[0.08]' : 'border-black/[0.1] hover:border-black/[0.2]'}`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="w-4 h-4 text-[#aeaeb2] flex-shrink-0 mr-0.5" />

        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-[#1d1d1f] text-white flex-shrink-0"
          >
            <Hash className="w-3 h-3 opacity-60" />
            {tag}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {searchQuery && !inputValue && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.08] flex-shrink-0">
            <Search className="w-3 h-3 opacity-60" />
            {searchQuery}
            <button
              onClick={(e) => { e.stopPropagation(); onSearchChange(''); }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (inputValue) updateSuggestions(inputValue); }}
          placeholder={hasContent ? '' : 'Search by keyword or tag — e.g. SaaS, mid-roll, US audience…'}
          className="flex-1 min-w-[160px] bg-transparent outline-none text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] py-0.5"
        />

        {hasContent && (
          <button
            onClick={(e) => { e.stopPropagation(); clearAll(); }}
            className="flex-shrink-0 text-[#aeaeb2] hover:text-[#ff3b30] transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-2xl shadow-xl shadow-black/[0.1] z-50 overflow-hidden">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-widest">Matching Tags</p>
          </div>
          <ul className="pb-1.5">
            {suggestions.map((tag, idx) => (
              <li key={tag.id}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                    ${highlightedIndex === idx ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'}`}
                  onMouseDown={(e) => { e.preventDefault(); selectTag(tag.name); }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1d1d1f] flex-shrink-0">
                    <Tag className="w-3.5 h-3.5 text-white" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">#{tag.name}</span>
                  </div>
                  <span className="text-[11px] text-[#aeaeb2] font-medium flex-shrink-0">
                    {tag.usage_count} {tag.usage_count === 1 ? 'listing' : 'listings'}
                  </span>
                </button>
              </li>
            ))}
            {inputValue && (
              <li>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f5f5f7] transition-colors border-t border-black/[0.04] mt-1"
                  onMouseDown={(e) => { e.preventDefault(); commitSearch(inputValue.trim()); setInputValue(''); }}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f5f5f7] flex-shrink-0">
                    <Search className="w-3.5 h-3.5 text-[#6e6e73]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#6e6e73]">Search for </span>
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">"{inputValue}"</span>
                  </div>
                  <span className="text-[11px] text-[#aeaeb2] font-medium flex-shrink-0">free search</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
