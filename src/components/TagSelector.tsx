import { Tag, X, Plus, Hash } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Tag as TagType } from '../types';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export default function TagSelector({ selectedTags, onChange, maxTags = 10 }: TagSelectorProps) {
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
      setSuggestions(allTags.filter(t => !selectedTags.includes(t.name)).slice(0, 8));
      setShowSuggestions(true);
      return;
    }
    const lower = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    const filtered = allTags
      .filter(t => !selectedTags.includes(t.name) && t.name.includes(lower))
      .slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }, [allTags, selectedTags]);

  const normalizeTag = (raw: string) =>
    raw.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const addTag = async (raw: string) => {
    const name = normalizeTag(raw);
    if (!name || selectedTags.includes(name) || selectedTags.length >= maxTags) return;

    const existing = allTags.find(t => t.name === name);
    if (!existing) {
      const { data } = await supabase
        .from('tags')
        .upsert({ name }, { onConflict: 'name' })
        .select()
        .maybeSingle();
      if (data) setAllTags(prev => [...prev, data as TagType]);
    }

    onChange([...selectedTags, name]);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (name: string) => {
    onChange(selectedTags.filter(t => t !== name));
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
        addTag(suggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if ((e.key === ',' || e.key === ' ') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const canAddMore = selectedTags.length < maxTags;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-start flex-wrap gap-1.5 min-h-[44px] px-3 py-2 bg-white border rounded-xl transition-all cursor-text
          ${showSuggestions ? 'border-[#1d1d1f] ring-2 ring-[#1d1d1f]/10' : 'border-[#d1d1d6] hover:border-[#aeaeb2]'}`}
        onClick={() => { if (canAddMore) inputRef.current?.focus(); }}
      >
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-[#1d1d1f] text-white"
          >
            <Hash className="w-3 h-3 opacity-60" />
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); updateSuggestions(e.target.value); }}
            onKeyDown={handleKeyDown}
            onFocus={() => updateSuggestions(inputValue)}
            placeholder={selectedTags.length === 0 ? 'Add tags (e.g. saas, ecommerce, us-audience)…' : 'Add another tag…'}
            className="flex-1 min-w-[160px] bg-transparent outline-none text-[13px] text-[#1d1d1f] placeholder:text-[#aeaeb2] py-0.5"
          />
        )}

        {inputValue && canAddMore && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[12px] font-medium text-[#1d1d1f] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-xl shadow-xl shadow-black/[0.1] z-50 overflow-hidden">
          {suggestions.length > 0 ? (
            <>
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[10px] text-[#aeaeb2] font-bold uppercase tracking-widest">
                  {inputValue ? 'Matching Tags' : 'Popular Tags'}
                </p>
              </div>
              <ul className="pb-1.5">
                {suggestions.map((tag, idx) => (
                  <li key={tag.id}>
                    <button
                      type="button"
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                        ${highlightedIndex === idx ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'}`}
                      onMouseDown={(e) => { e.preventDefault(); addTag(tag.name); }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#1d1d1f] flex-shrink-0">
                        <Tag className="w-3 h-3 text-white" />
                      </span>
                      <span className="text-[13px] font-semibold text-[#1d1d1f] flex-1">#{tag.name}</span>
                      <span className="text-[11px] text-[#aeaeb2]">{tag.usage_count} listings</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : inputValue ? (
            <div className="px-3 py-3">
              <button
                type="button"
                className="w-full flex items-center gap-2 text-[13px] text-[#1d1d1f] hover:text-green-600 transition-colors font-medium"
                onMouseDown={(e) => { e.preventDefault(); addTag(inputValue); }}
              >
                <Plus className="w-4 h-4" />
                Create new tag "#{normalizeTag(inputValue)}"
              </button>
            </div>
          ) : null}
        </div>
      )}

      <p className="text-[11px] text-[#aeaeb2] mt-1.5">
        Press Enter, comma, or space to add. Up to {maxTags} tags. Tags help buyers discover your listing.
      </p>
    </div>
  );
}
