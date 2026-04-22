// Admin import uses the same canonical CSV format as seller dashboard uploads.
// The only operational difference is that admin can select/create a publisher
// account explicitly, while seller uploads are scoped to their own account.

import type { CsvRow, ValidationError } from '../CsvUpload/types';
export type { CsvRow, ValidationError };

export type ImportTag = 'new' | 'updated' | 'unchanged' | 'duplicate';

export interface ImportRow extends CsvRow {
  // Diff / comparison fields added during batch comparison
  fingerprint: string;
  importTag: ImportTag;
  previousSlotId: string | null;
  changedFields: string[];
}

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
  validation_errors: ValidationError[];
  admin_notes: string;
  listing_id: string | null;
  slot_fingerprint: string;
  import_tag: ImportTag;
  previous_slot_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreviousSlotSnapshot {
  id: string;
  fingerprint: string;
  send_date: string;
  deadline: string;
  price: string;
  sponsorship_type: string;
  slots_available: string;
  status: string;
}
