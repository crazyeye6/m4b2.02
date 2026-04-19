import type { Listing } from '../types';

const ENGLISH_DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function nextDateForDayIndex(idx: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (idx - today.getDay() + 7) % 7 || 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
}

function extractDateFromLabel(label: string): Date | null {
  const clean = label.trim();

  const isoMatch = clean.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return new Date(isoMatch[1] + 'T00:00:00');

  const wordDateMatch = clean.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
  if (wordDateMatch) {
    const parsed = new Date(`${wordDateMatch[1]} ${wordDateMatch[2]} ${wordDateMatch[3]}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const dayIdx = ENGLISH_DAY_NAMES.indexOf(clean.toLowerCase().trim());
  if (dayIdx !== -1) return nextDateForDayIndex(dayIdx);

  return null;
}

export interface ResolvedPublishDate {
  weekday: string;
  calDate: string;
}

export function resolvePublishDate(
  listing: Pick<Listing, 'posting_date_start' | 'date_label'>,
  locale = 'en-GB',
): ResolvedPublishDate {
  let resolvedDate: Date | null = null;

  if (listing.posting_date_start) {
    resolvedDate = new Date(listing.posting_date_start + 'T00:00:00');
  } else if (listing.date_label) {
    resolvedDate = extractDateFromLabel(listing.date_label);
  }

  if (resolvedDate && !isNaN(resolvedDate.getTime())) {
    return {
      weekday: resolvedDate.toLocaleDateString(locale, { weekday: 'long' }),
      calDate: resolvedDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }

  return {
    weekday: '',
    calDate: listing.date_label ?? '',
  };
}

export function formatDeadlineDate(deadline: string, locale = 'en-GB'): string {
  return new Date(deadline).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatCountdown(deadline: string): string {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
