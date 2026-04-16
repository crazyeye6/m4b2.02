import type { Tag } from '../../types';

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getDisplayName(tag: Tag): string {
  return tag.display_name || toTitleCase(tag.name.replace(/-/g, ' '));
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function highlightMatch(text: string, query: string): Array<{ text: string; highlight: boolean }> {
  if (!query.trim()) return [{ text, highlight: false }];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().replace(/[^a-z0-9\s-]/g, '');
  if (!lowerQuery) return [{ text, highlight: false }];

  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return [{ text, highlight: false }];

  return [
    { text: text.slice(0, idx), highlight: false },
    { text: text.slice(idx, idx + lowerQuery.length), highlight: true },
    { text: text.slice(idx + lowerQuery.length), highlight: false },
  ].filter(p => p.text.length > 0);
}

export function scoreSuggestion(tag: Tag, query: string): number {
  const display = getDisplayName(tag).toLowerCase();
  const slug = tag.name.toLowerCase();
  const q = query.toLowerCase().trim();

  if (!q) return tag.usage_count;

  if (display === q || slug === q) return 1000 + tag.usage_count;
  if (display.startsWith(q) || slug.startsWith(q)) return 500 + tag.usage_count;
  if (display.includes(q) || slug.includes(q)) return 100 + tag.usage_count;

  return 0;
}

export function filterAndRankTags(
  allTags: Tag[],
  query: string,
  selectedSlugs: string[],
  limit = 8,
): Tag[] {
  const selectedSet = new Set(selectedSlugs);

  return allTags
    .filter(t => !selectedSet.has(t.name))
    .map(t => ({ tag: t, score: scoreSuggestion(t, query) }))
    .filter(({ score }) => score > 0 || !query.trim())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ tag }) => tag);
}

export function isSimilarToExisting(allTags: Tag[], raw: string): Tag | null {
  const slug = normalizeSlug(raw);
  if (!slug) return null;
  return allTags.find(t => t.name === slug) ?? null;
}
