// Admin import CSV utilities.
// Re-uses the shared parseCSV and validateRow from CsvUpload/csvUtils so both
// admin and seller uploads use identical parsing, validation, and field names.

import { parseCSV as parseSharedCSV, parseCSVLine } from '../CsvUpload/csvUtils';
import type { CsvRow } from '../CsvUpload/types';
import type { ImportRow, PreviousSlotSnapshot } from './types';

// Re-export the unified template download (same template for admin + seller)
export { downloadTemplate as downloadAdminTemplate } from '../CsvUpload/csvUtils';

// ── Fingerprinting ────────────────────────────────────────────────────────────
// Fingerprint = slot identity key within a publisher's inventory.
// Two slots with the same fingerprint across weekly uploads = same slot.
// Key: (send_date, sponsorship_type) — scoped to publisher by media_profile_id.

export function buildFingerprint(send_date: string, sponsorship_type: string): string {
  const n = (s: string) => s.toLowerCase().replace(/\s+/g, '_').trim();
  return `${n(send_date)}__${n(sponsorship_type)}`;
}

// ── Batch comparison ──────────────────────────────────────────────────────────

export function applyBatchComparison(
  rows: CsvRow[],
  previousSlots: PreviousSlotSnapshot[],
): ImportRow[] {
  const prevByFp = new Map<string, PreviousSlotSnapshot>();
  for (const s of previousSlots) prevByFp.set(s.fingerprint, s);

  const seenInUpload = new Map<string, number>();

  return rows.map(row => {
    const fp = buildFingerprint(row.send_date, row.sponsorship_type);
    const prev = prevByFp.get(fp);

    if (seenInUpload.has(fp)) {
      return { ...row, fingerprint: fp, importTag: 'duplicate' as const, previousSlotId: null, changedFields: [] };
    }
    seenInUpload.set(fp, row.rowIndex);

    if (!prev) {
      return { ...row, fingerprint: fp, importTag: 'new' as const, previousSlotId: null, changedFields: [] };
    }

    const changedFields: string[] = [];
    const normPrice = (s: string) => parseFloat(s.replace(/[€$£,\s]/g, '')) || 0;

    if (normPrice(row.price) !== normPrice(prev.price))              changedFields.push('price');
    if (row.deadline.trim()         !== prev.deadline.trim())        changedFields.push('deadline');
    if (row.slots_available.trim()  !== prev.slots_available.trim()) changedFields.push('slots_available');

    const prevActive = prev.status === 'published' || prev.status === 'approved';
    if (prevActive && changedFields.length === 0) {
      return { ...row, fingerprint: fp, importTag: 'unchanged' as const, previousSlotId: prev.id, changedFields: [] };
    }

    return { ...row, fingerprint: fp, importTag: 'updated' as const, previousSlotId: prev.id, changedFields };
  });
}

// ── Full admin CSV parse pipeline ─────────────────────────────────────────────

export function parseAdminCSV(
  text: string,
  previousSlots: PreviousSlotSnapshot[] = [],
): { rows: ImportRow[]; headerError: string | null } {
  const { rows: baseRows, headerError } = parseSharedCSV(text);
  if (headerError) return { rows: [], headerError };
  const rows = applyBatchComparison(baseRows, previousSlots);
  return { rows, headerError: null };
}
