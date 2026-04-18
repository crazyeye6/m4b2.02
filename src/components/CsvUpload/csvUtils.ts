import type { CsvRow, ValidationError, CsvColumnKey } from './types';
import { CSV_COLUMNS } from './types';

const TEMPLATE_ROWS = [
  {
    media_name: 'Irish Startup Weekly',
    media_type: 'Newsletter',
    audience_size: '18000',
    opportunity_type: 'Sponsored Slot',
    original_price: '350',
    discount_price: '250',
    slots_available: '2',
    deadline: 'Friday 6pm',
    category: 'Startups / Business',
    booking_url: 'https://example.com/advertise',
    description: 'Dedicated sponsor slot in this week\'s edition reaching 18k startup founders.',
  },
  {
    media_name: 'Founder Playbook Podcast',
    media_type: 'Podcast',
    audience_size: '25000',
    opportunity_type: 'Mid-roll Ad',
    original_price: '500',
    discount_price: '325',
    slots_available: '1',
    deadline: 'Thursday 5pm',
    category: 'Business / Entrepreneurship',
    booking_url: 'https://example.com/podcast-ads',
    description: 'Mid-roll placement in this week\'s upcoming episode to 25k monthly listeners.',
  },
  {
    media_name: 'Dublin Tech Digest',
    media_type: 'Newsletter',
    audience_size: '9500',
    opportunity_type: 'Banner Ad',
    original_price: '180',
    discount_price: '120',
    slots_available: '3',
    deadline: 'Wednesday 12pm',
    category: 'Technology',
    booking_url: 'https://example.com/advertise',
    description: 'Top-banner placement in our weekly tech digest sent to Dublin\'s tech community.',
  },
];

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
  a.download = 'opportunity-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

function isValidUrl(val: string): boolean {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

export function validateRow(raw: Record<string, string>, rowIndex: number): CsvRow {
  const errors: ValidationError[] = [];

  const get = (key: string) => (raw[key] ?? '').trim();

  const media_name = get('media_name');
  const media_type = get('media_type');
  const audience_size = get('audience_size');
  const opportunity_type = get('opportunity_type');
  const original_price = get('original_price');
  const discount_price = get('discount_price');
  const slots_available = get('slots_available');
  const deadline = get('deadline');
  const category = get('category');
  const booking_url = get('booking_url');
  const description = get('description');

  const required: CsvColumnKey[] = ['media_name', 'media_type', 'audience_size', 'opportunity_type', 'original_price', 'discount_price', 'deadline'];
  for (const field of required) {
    if (!get(field)) {
      errors.push({ field, severity: 'error', message: `${field.replace(/_/g, ' ')} is required` });
    }
  }

  if (original_price && isNaN(parseFloat(original_price.replace(/[€$£,]/g, '')))) {
    errors.push({ field: 'original_price', severity: 'error', message: 'original_price must be a number' });
  }
  if (discount_price && isNaN(parseFloat(discount_price.replace(/[€$£,]/g, '')))) {
    errors.push({ field: 'discount_price', severity: 'error', message: 'discount_price must be a number' });
  }
  if (slots_available && isNaN(parseInt(slots_available))) {
    errors.push({ field: 'slots_available', severity: 'warning', message: 'slots_available should be a whole number' });
  }
  if (booking_url && !isValidUrl(booking_url)) {
    errors.push({ field: 'booking_url', severity: 'warning', message: 'booking_url does not look like a valid URL' });
  }

  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  return {
    rowIndex,
    media_name,
    media_type,
    audience_size,
    opportunity_type,
    original_price,
    discount_price,
    slots_available,
    deadline,
    category,
    booking_url,
    description,
    errors,
    hasErrors,
    hasWarnings,
  };
}

export function parseCSV(text: string): { rows: CsvRow[]; headerError: string | null } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    return { rows: [], headerError: 'CSV must have a header row and at least one data row.' };
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
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
