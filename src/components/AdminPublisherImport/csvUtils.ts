import type { ImportRow, ImportError, PreviousSlotSnapshot } from './types';
import { ADMIN_CSV_COLUMNS } from './types';

// ── CSV parsing ───────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
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

function isValidUrl(val: string): boolean {
  try { new URL(val); return true; } catch { return false; }
}

function isValidDate(val: string): boolean {
  if (!val) return false;
  return !isNaN(new Date(val).getTime());
}

// ── Fingerprinting ────────────────────────────────────────────────────────────
// Fingerprint = the slot's identity key. Two slots with the same fingerprint
// are considered "the same slot" across weekly uploads.
// Key: publisher context is already scoped at the batch level (media_profile_id).
// Within a publisher, a slot is identified by send_date + sponsorship_type.

export function buildFingerprint(send_date: string, sponsorship_type: string): string {
  const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, '_').trim();
  return `${normalise(send_date)}__${normalise(sponsorship_type)}`;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateRawRow(raw: Record<string, string>, rowIndex: number): Omit<ImportRow, 'fingerprint' | 'importTag' | 'previousSlotId' | 'changedFields'> {
  const errors: ImportError[] = [];
  const get = (key: string) => (raw[key] ?? '').trim();

  const newsletter_name  = get('newsletter_name');
  const subscriber_count = get('subscriber_count');
  const niche            = get('niche');
  const sponsorship_type = get('sponsorship_type');
  const price            = get('price');
  const slots_available  = get('slots_available');
  const send_date        = get('send_date');
  const deadline         = get('deadline');
  const booking_url      = get('booking_url');
  const description      = get('description');

  if (!newsletter_name)  errors.push({ field: 'newsletter_name',  severity: 'error',   message: 'Newsletter name is required' });
  if (!niche)            errors.push({ field: 'niche',            severity: 'error',   message: 'Niche is required' });
  if (!sponsorship_type) errors.push({ field: 'sponsorship_type', severity: 'error',   message: 'Sponsorship type is required' });

  if (!price) {
    errors.push({ field: 'price', severity: 'error', message: 'Price is required' });
  } else {
    const parsed = parseFloat(price.replace(/[€$£,]/g, ''));
    if (isNaN(parsed) || parsed < 0) errors.push({ field: 'price', severity: 'error', message: 'Price must be a valid positive number' });
  }

  if (!deadline) {
    errors.push({ field: 'deadline', severity: 'error',   message: 'Deadline is required' });
  } else if (!isValidDate(deadline)) {
    errors.push({ field: 'deadline', severity: 'error',   message: 'Deadline must be a valid date (YYYY-MM-DD)' });
  }

  if (!send_date) {
    errors.push({ field: 'send_date', severity: 'warning', message: 'Send date is recommended' });
  } else if (!isValidDate(send_date)) {
    errors.push({ field: 'send_date', severity: 'warning', message: 'Send date does not appear to be a valid date' });
  }

  if (subscriber_count && isNaN(parseInt(subscriber_count.replace(/[,k]/gi, '')))) {
    errors.push({ field: 'subscriber_count', severity: 'warning', message: 'Subscriber count should be numeric' });
  }

  if (slots_available && isNaN(parseInt(slots_available))) {
    errors.push({ field: 'slots_available', severity: 'warning', message: 'Slots available should be a whole number' });
  }

  if (booking_url && !isValidUrl(booking_url)) {
    errors.push({ field: 'booking_url', severity: 'warning', message: 'Booking URL does not look like a valid URL' });
  }

  return {
    rowIndex,
    newsletter_name, subscriber_count, niche, sponsorship_type,
    price, slots_available, send_date, deadline, booking_url, description,
    errors,
    hasErrors: errors.some(e => e.severity === 'error'),
    hasWarnings: errors.some(e => e.severity === 'warning'),
  };
}

// ── Batch comparison ──────────────────────────────────────────────────────────

export function applyBatchComparison(
  rows: Omit<ImportRow, 'fingerprint' | 'importTag' | 'previousSlotId' | 'changedFields'>[],
  previousSlots: PreviousSlotSnapshot[],
): ImportRow[] {
  // Build lookup: fingerprint → previous slot
  const prevByFp = new Map<string, PreviousSlotSnapshot>();
  for (const s of previousSlots) prevByFp.set(s.fingerprint, s);

  // Track fingerprints seen in this upload to detect intra-upload duplicates
  const seenInUpload = new Map<string, number>(); // fp → first rowIndex

  return rows.map(row => {
    const fp = buildFingerprint(row.send_date, row.sponsorship_type);
    const prev = prevByFp.get(fp);

    // Intra-upload duplicate
    if (seenInUpload.has(fp)) {
      return { ...row, fingerprint: fp, importTag: 'duplicate', previousSlotId: null, changedFields: [] };
    }
    seenInUpload.set(fp, row.rowIndex);

    if (!prev) {
      return { ...row, fingerprint: fp, importTag: 'new', previousSlotId: null, changedFields: [] };
    }

    // Compare mutable fields to detect updates
    const changedFields: string[] = [];
    const normPrice = (s: string) => parseFloat(s.replace(/[€$£,\s]/g, '')) || 0;

    if (normPrice(row.price) !== normPrice(prev.price))              changedFields.push('price');
    if (row.deadline.trim()         !== prev.deadline.trim())        changedFields.push('deadline');
    if (row.slots_available.trim()  !== prev.slots_available.trim()) changedFields.push('slots_available');

    // If the previous was published/approved and nothing changed → unchanged
    const prevActive = prev.status === 'published' || prev.status === 'approved';
    if (prevActive && changedFields.length === 0) {
      return { ...row, fingerprint: fp, importTag: 'unchanged', previousSlotId: prev.id, changedFields: [] };
    }

    return { ...row, fingerprint: fp, importTag: 'updated', previousSlotId: prev.id, changedFields };
  });
}

// ── Full parse pipeline ───────────────────────────────────────────────────────

export function parseAdminCSV(
  text: string,
  previousSlots: PreviousSlotSnapshot[] = [],
): { rows: ImportRow[]; headerError: string | null } {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], headerError: 'CSV file appears to be empty or has no data rows.' };

  const rawHeaders = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_').trim());

  const requiredCols = ['newsletter_name', 'niche', 'sponsorship_type', 'price', 'deadline'];
  const missing = requiredCols.filter(col => !rawHeaders.includes(col));
  if (missing.length > 0) {
    return { rows: [], headerError: `Missing required columns: ${missing.join(', ')}` };
  }

  const validated = lines.slice(1).map((line, i) => {
    const values = parseCSVLine(line);
    const raw: Record<string, string> = {};
    rawHeaders.forEach((h, idx) => { raw[h] = values[idx] ?? ''; });
    return validateRawRow(raw, i + 1);
  });

  const rows = applyBatchComparison(validated, previousSlots);
  return { rows, headerError: null };
}

// ── Template download ─────────────────────────────────────────────────────────

export function downloadAdminTemplate() {
  const headers = ADMIN_CSV_COLUMNS.join(',');
  const examples = [
    'SaaS Insider,62000,B2B SaaS,Sponsored Post,2400,1,2026-05-06,2026-05-04,https://saasinsider.com/advertise,Top placement in weekly SaaS roundup',
    'Founder Weekly,38000,Startups,Dedicated Send,3800,1,2026-05-08,2026-05-05,https://founderweekly.com/sponsor,Solo-sponsored issue to 38k founders',
  ].join('\n');
  const csv = `${headers}\n${examples}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'endingthisweek_publisher_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
