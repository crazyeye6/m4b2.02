export interface ImportRow {
  rowIndex: number;
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
  errors: ImportError[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export interface ImportError {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

export const ADMIN_CSV_COLUMNS = [
  'newsletter_name',
  'subscriber_count',
  'niche',
  'sponsorship_type',
  'price',
  'slots_available',
  'send_date',
  'deadline',
  'booking_url',
  'description',
] as const;

export type AdminCsvColumnKey = typeof ADMIN_CSV_COLUMNS[number];

export type ImportStep = 'select_publisher' | 'upload' | 'preview' | 'review' | 'done';

export interface PublisherProfile {
  id: string;
  newsletter_name: string;
  category: string;
  subscriber_count: number | null;
  seller_email: string;
  logo_url: string;
  website_url: string;
  tagline: string;
  audience_summary: string;
  primary_geography: string;
  is_active: boolean;
  updated_at: string;
}

export interface ImportBatch {
  id: string;
  publisher_name: string;
  media_profile_id: string | null;
  filename: string;
  row_count: number;
  status: string;
  admin_notes: string;
  import_week: string | null;
  uploaded_by_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImportSlot {
  id: string;
  batch_id: string;
  row_index: number;
  status: 'pending_review' | 'needs_review' | 'approved' | 'rejected' | 'published' | 'expired';
  media_name: string;
  media_profile_id: string | null;
  audience_size: string;
  opportunity_type: string;
  original_price: string;
  discount_price: string;
  slots_available: string;
  send_date: string;
  deadline: string;
  category: string;
  booking_url: string;
  description: string;
  validation_errors: ImportError[];
  admin_notes: string;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
}
