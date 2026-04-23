// Shared CSV parsing, validation, and template utilities for the unified
// podcast sponsorship CSV format. Used by both seller dashboard uploads
// and admin publisher imports.

import type { CsvRow, ValidationError, CsvColumnKey } from './types';
import { CSV_COLUMNS } from './types';

// ── Template example rows ─────────────────────────────────────────────────────

const TEMPLATE_ROWS = [
  {
    publisher_name:        'Meridian Audio',
    podcast_name:          'The SaaS Operator',
    downloads_per_episode: '28000',
    niche:                 'B2B SaaS',
    sponsorship_type:      'Mid-roll',
    price:                 '1200',
    slots_available:       '2',
    air_date:              '2026-05-06',
    deadline:              '2026-05-04',
    booking_url:           'https://example.com/book/tso',
    description:           'Mid-roll sponsorship in a weekly B2B SaaS podcast reaching 28k operators.',
  },
  {
    publisher_name:        'Meridian Audio',
    podcast_name:          'Dev Unlocked',
    downloads_per_episode: '45000',
    niche:                 'Dev & Engineering',
    sponsorship_type:      'Pre-roll',
    price:                 '800',
    slots_available:       '1',
    air_date:              '2026-05-08',
    deadline:              '2026-05-06',
    booking_url:           'https://example.com/book/du',
    description:           'Pre-roll slot in a weekly developer podcast with 45k downloads per episode.',
  },
  {
    publisher_name:        'Atlas Podcast Group',
    podcast_name:          'AI Frontier Pod',
    downloads_per_episode: '19000',
    niche:                 'AI',
    sponsorship_type:      'Host-read ad',
    price:                 '950',
    slots_available:       '1',
    air_date:              '2026-05-07',
    deadline:              '2026-05-05',
    booking_url:           'https://example.com/book/afp',
    description:           'Host-read sponsor mention in this week\'s AI-focused episode.',
  },
];

// ── Template download ─────────────────────────────────────────────────────────

export function downloadTemplate() {
  const headers = CSV_COLUMNS.map(c => c.key).join(',');
  const rows = TEMPLATE_ROWS.map(r =>
    CSV_COLUMNS.map(c => {
      const val = r[c.key as keyof typeof r] ?? '';
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'podcast-sponsorship-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV line parser (RFC 4180 compliant) ──────────────────────────────────────

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Field validation helpers ──────────────────────────────────────────────────

function isValidUrl(val: string): boolean {
  try { new URL(val); return true; } catch { return false; }
}

function isValidDate(val: string): boolean {
  if (!val) return false;
  return !isNaN(new Date(val).getTime());
}

// ── Row validation ────────────────────────────────────────────────────────────

export function validateRow(raw: Record<string, string>, rowIndex: number): CsvRow {
  const errors: ValidationError[] = [];
  const get = (key: string) => (raw[key] ?? '').trim();

  const publisher_name        = get('publisher_name');
  const podcast_name          = get('podcast_name');
  const downloads_per_episode = get('downloads_per_episode');
  const niche                 = get('niche');
  const sponsorship_type      = get('sponsorship_type');
  const price                 = get('price');
  const slots_available       = get('slots_available');
  const air_date              = get('air_date');
  const deadline              = get('deadline');
  const booking_url           = get('booking_url');
  const description           = get('description');

  // Required field checks
  const required: CsvColumnKey[] = ['publisher_name', 'podcast_name', 'niche', 'sponsorship_type', 'price', 'deadline'];
  for (const field of required) {
    if (!get(field)) {
      errors.push({ field, severity: 'error', message: `${field.replace(/_/g, ' ')} is required` });
    }
  }

  // Numeric validation
  if (price && isNaN(parseFloat(price.replace(/[€$£,]/g, '')))) {
    errors.push({ field: 'price', severity: 'error', message: 'price must be a valid number' });
  }
  if (downloads_per_episode && isNaN(parseInt(downloads_per_episode.replace(/,/g, '')))) {
    errors.push({ field: 'downloads_per_episode', severity: 'warning', message: 'downloads_per_episode should be a whole number' });
  }
  if (slots_available && isNaN(parseInt(slots_available))) {
    errors.push({ field: 'slots_available', severity: 'warning', message: 'slots_available should be a whole number' });
  }

  // Date validation
  if (deadline && !isValidDate(deadline)) {
    errors.push({ field: 'deadline', severity: 'error', message: 'deadline must be a valid date (YYYY-MM-DD recommended)' });
  }
  if (air_date && !isValidDate(air_date)) {
    errors.push({ field: 'air_date', severity: 'warning', message: 'air_date does not look like a valid date' });
  }

  // URL validation
  if (booking_url && !isValidUrl(booking_url)) {
    errors.push({ field: 'booking_url', severity: 'warning', message: 'booking_url does not look like a valid URL' });
  }

  return {
    rowIndex, publisher_name, podcast_name, downloads_per_episode, niche,
    sponsorship_type, price, slots_available, air_date, deadline,
    booking_url, description,
    errors,
    hasErrors: errors.some(e => e.severity === 'error'),
    hasWarnings: errors.some(e => e.severity === 'warning'),
  };
}

// ── Full CSV parser ───────────────────────────────────────────────────────────

export function parseCSV(text: string): { rows: CsvRow[]; headerError: string | null } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    return { rows: [], headerError: 'CSV must have a header row and at least one data row.' };
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const requiredHeaders = CSV_COLUMNS.filter(c => c.required).map(c => c.key);
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      headerError: `Missing required columns: ${missing.join(', ')}. Download the template to see the correct format.`,
    };
  }

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => { raw[h] = values[idx] ?? ''; });
    rows.push(validateRow(raw, i));
  }

  return { rows, headerError: null };
}
