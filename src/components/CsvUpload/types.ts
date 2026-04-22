export const CSV_COLUMNS = [
  { key: 'newsletter_name', label: 'newsletter_name', required: true },
  { key: 'subscriber_count', label: 'subscriber_count', required: true },
  { key: 'niche', label: 'niche', required: true },
  { key: 'audience_description', label: 'audience_description', required: false },
  { key: 'sponsorship_type', label: 'sponsorship_type', required: true },
  { key: 'original_price', label: 'original_price', required: true },
  { key: 'discount_price', label: 'discount_price', required: true },
  { key: 'slots_available', label: 'slots_available', required: false },
  { key: 'deadline', label: 'deadline', required: true },
  { key: 'booking_url', label: 'booking_url', required: false },
  { key: 'description', label: 'description', required: false },
] as const;

export type CsvColumnKey = typeof CSV_COLUMNS[number]['key'];

export interface CsvRow {
  rowIndex: number;
  newsletter_name: string;
  subscriber_count: string;
  niche: string;
  audience_description: string;
  sponsorship_type: string;
  original_price: string;
  discount_price: string;
  slots_available: string;
  deadline: string;
  booking_url: string;
  description: string;
  errors: ValidationError[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export interface ValidationError {
  field: CsvColumnKey | 'general';
  severity: 'error' | 'warning';
  message: string;
}

export type UploadStep = 'idle' | 'preview' | 'submitting' | 'done' | 'error';
