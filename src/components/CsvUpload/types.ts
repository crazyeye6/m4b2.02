export const CSV_COLUMNS = [
  { key: 'media_name', label: 'media_name', required: true },
  { key: 'media_type', label: 'media_type', required: true },
  { key: 'audience_size', label: 'audience_size', required: true },
  { key: 'opportunity_type', label: 'opportunity_type', required: true },
  { key: 'original_price', label: 'original_price', required: true },
  { key: 'discount_price', label: 'discount_price', required: true },
  { key: 'slots_available', label: 'slots_available', required: false },
  { key: 'deadline', label: 'deadline', required: true },
  { key: 'category', label: 'category', required: false },
  { key: 'booking_url', label: 'booking_url', required: false },
  { key: 'description', label: 'description', required: false },
] as const;

export type CsvColumnKey = typeof CSV_COLUMNS[number]['key'];

export interface CsvRow {
  rowIndex: number;
  media_name: string;
  media_type: string;
  audience_size: string;
  opportunity_type: string;
  original_price: string;
  discount_price: string;
  slots_available: string;
  deadline: string;
  category: string;
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
