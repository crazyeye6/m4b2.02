// Canonical CSV column definition for the unified newsletter sponsorship format.
// This same template and column set is used by both seller dashboard uploads
// and admin publisher imports. Do not create separate incompatible formats.

export const CSV_COLUMNS = [
  { key: 'publisher_name',   label: 'publisher_name',   required: true  },
  { key: 'newsletter_name',  label: 'newsletter_name',  required: true  },
  { key: 'subscriber_count', label: 'subscriber_count', required: true  },
  { key: 'niche',            label: 'niche',            required: true  },
  { key: 'sponsorship_type', label: 'sponsorship_type', required: true  },
  { key: 'price',            label: 'price',            required: true  },
  { key: 'slots_available',  label: 'slots_available',  required: false },
  { key: 'send_date',        label: 'send_date',        required: false },
  { key: 'deadline',         label: 'deadline',         required: true  },
  { key: 'booking_url',      label: 'booking_url',      required: false },
  { key: 'description',      label: 'description',      required: false },
] as const;

export type CsvColumnKey = typeof CSV_COLUMNS[number]['key'];

export interface CsvRow {
  rowIndex: number;
  publisher_name: string;
  newsletter_name: string;
  subscriber_count: string;
  niche: string;
  sponsorship_type: string;
  price: string;
  slots_available: string;
  send_date: string;
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
