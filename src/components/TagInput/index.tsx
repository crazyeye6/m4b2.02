import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tag } from '../../types';
import { TagChip } from './TagChip';
import { SuggestionDropdown } from './SuggestionDropdown';
import { normalizeSlug, filterAndRankTags, isSimilarToExisting, getDisplayName } from './utils';

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  chipVariant?: 'default' | 'filter';
  showHint?: boolean;
}

export default function TagInput({
  selectedTags,
  onChange,
  maxTags = 10,
  placeholder,
  chipVariant = 'default',
  showHint = true,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [tagDisplayMap, setTagDisplayMap] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase
        .from('tags')
        .select('id, name, display_name, usage_count, created_at')
        .order('usage_count', { ascending: false })
        .limit(300);
      if (data) {
        const tags = data as Tag[];
        setAllTags(tags);
        const map: Record<string, string> = {};
        tags.forEach(t => { map[t.name] = getDisplayName(t); });
        setTagDisplayMap(map);
      }
    }
    fetchTags();
  }, []);

  const computeSuggestions = useCallback((query: string) => {
    const ranked = filterAndRankTags(allTags, query, selectedTags, 8);
    setSuggestions(ranked);
  }, [allTags, selectedTags]);

  const openDropdown = useCallback((query: string) => {
    computeSuggestions(query);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  }, [computeSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    openDropdown(val);
  };

  const handleFocus = () => {
    openDropdown(inputValue);
  };

  const addTagBySlug = useCallback(async (slug: string, displayName?: string) => {
    if (!slug || selectedTags.includes(slug) || selectedTags.length >= maxTags) return;

    const existing = allTags.find(t => t.name === slug);
    if (!existing) {
      const resolvedDisplay = displayName || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const { data } = await supabase
        .from('tags')
        .upsert({ name: slug, display_name: resolvedDisplay }, { onConflict: 'name' })
        .select('id, name, display_name, usage_count, created_at')
        .maybeSingle();
      if (data) {
        const newTag = data as Tag;
        setAllTags(prev => [...prev, newTag]);
        setTagDisplayMap(prev => ({ ...prev, [newTag.name]: getDisplayName(newTag) }));
      }
    }

    onChange([...selectedTags, slug]);
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [allTags, selectedTags, maxTags, onChange]);

  const handleSelectSuggestion = useCallback((tag: Tag) => {
    addTagBySlug(tag.name, getDisplayName(tag));
  }, [addTagBySlug]);

  const handleCreateNew = useCallback((raw: string) => {
    const slug = normalizeSlug(raw);
    if (!slug) return;
    addTagBySlug(slug);
  }, [addTagBySlug]);

  const removeTag = (slug: string) => {
    onChange(selectedTags.filter(t => t !== slug));
    inputRef.current?.focus();
  };

  const totalOptions = suggestions.length + (showCreateNewOption ? 1 : 0);

  const slug = normalizeSlug(inputValue);
  const showCreateNewOption = Boolean(
    inputValue.trim() &&
    slug &&
    !selectedTags.includes(slug) &&
    !suggestions.some(s => s.name === slug)
  );

  const similarTag = showCreateNewOption ? isSimilarToExisting(allTags, inputValue) : null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const total = suggestions.length + (showCreateNewOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (highlightedIndex === suggestions.length && showCreateNewOption) {
        handleCreateNew(inputValue);
      } else if (inputValue.trim()) {
        const exactMatch = suggestions.find(s => s.name === slug);
        if (exactMatch) {
          handleSelectSuggestion(exactMatch);
        } else {
          handleCreateNew(inputValue);
        }
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    } else if ((e.key === ',' || e.key === ' ') && inputValue.trim()) {
      e.preventDefault();
      const exactMatch = suggestions.find(s => s.name === slug);
      if (exactMatch) {
        handleSelectSuggestion(exactMatch);
      } else {
        handleCreateNew(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
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

  const canAddMore = selectedTags.length < maxTags;
  const defaultPlaceholder = selectedTags.length === 0
    ? 'Add tags… (e.g. SaaS, ecommerce, B2B)'
    : 'Add another tag…';

  void totalOptions;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-start flex-wrap gap-1.5 min-h-[46px] px-3 py-2 bg-white border rounded-2xl transition-all cursor-text
          ${showDropdown
            ? 'border-[#1d1d1f] ring-2 ring-[#1d1d1f]/10'
            : 'border-[#d1d1d6] hover:border-[#aeaeb2]'
          }`}
        onClick={() => { if (canAddMore) inputRef.current?.focus(); }}
      >
        {selectedTags.map(slug => (
          <TagChip
            key={slug}
            label={tagDisplayMap[slug] || slug}
            onRemove={() => removeTag(slug)}
            variant={chipVariant}
          />
        ))}

        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder ?? defaultPlaceholder}
            className="flex-1 min-w-[160px] bg-transparent outline-none text-[13px] text-[#1d1d1f] placeholder:text-[#aeaeb2] py-0.5"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        )}
      </div>

      {showDropdown && (
        <SuggestionDropdown
          suggestions={suggestions}
          query={inputValue}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelectSuggestion}
          onCreateNew={handleCreateNew}
          onHighlight={setHighlightedIndex}
          showCreateNew={showCreateNewOption}
          similarTag={similarTag}
        />
      )}

      {showHint && (
        <p className="text-[11px] text-[#aeaeb2] mt-1.5">
          Press Enter, comma, or space to add. Up to {maxTags} tags.
        </p>
      )}
    </div>
  );
}
