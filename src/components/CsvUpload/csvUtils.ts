import type { CsvRow, ValidationError, CsvColumnKey } from './types';
import { CSV_COLUMNS } from './types';

const TEMPLATE_ROWS = [
  {
    newsletter_name: 'SaaS Growth Weekly',
    subscriber_count: '48000',
    niche: 'SaaS / B2B',
    sponsorship_type: 'Featured sponsor',
    original_price: '1200',
    discount_price: '840',
    slots_available: '2',
    deadline: 'Wednesday 5pm',
    booking_url: 'https://example.com/advertise',
    description: 'Featured sponsor slot in our Thursday edition reaching 48k SaaS founders and growth marketers.',
  },
  {
    newsletter_name: 'The Founder Brief',
    subscriber_count: '32000',
    niche: 'Startups / Business',
    sponsorship_type: 'Dedicated send',
    original_price: '900',
    discount_price: '630',
    slots_available: '1',
    deadline: 'Sunday 6pm',
    booking_url: 'https://example.com/founder-brief',
    description: 'A dedicated send to 32k early-stage founders. Your brand owns the entire edition.',
  },
  {
    newsletter_name: 'Growth Dispatch',
    subscriber_count: '39000',
    niche: 'Marketing / Growth',
    sponsorship_type: 'Solo blast',
    original_price: '2200',
    discount_price: '1540',
    slots_available: '1',
    deadline: 'Saturday 12pm',
    booking_url: 'https://example.com/growth-dispatch',
    description: 'Solo blast to 39k performance marketers. Entire send is your brand — full creative control.',
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
  a.download = 'newsletter-slots-template.csv';
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

  const newsletter_name = get('newsletter_name');
  const subscriber_count = get('subscriber_count');
  const niche = get('niche');
  const sponsorship_type = get('sponsorship_type');
  const original_price = get('original_price');
  const discount_price = get('discount_price');
  const slots_available = get('slots_available');
  const deadline = get('deadline');
  const booking_url = get('booking_url');
  const description = get('description');

  const required: CsvColumnKey[] = ['newsletter_name', 'subscriber_count', 'niche', 'sponsorship_type', 'original_price', 'discount_price', 'deadline'];
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
    newsletter_name,
    subscriber_count,
    niche,
    sponsorship_type,
    original_price,
    discount_price,
    slots_available,
    deadline,
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
