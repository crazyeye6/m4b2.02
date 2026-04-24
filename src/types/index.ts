export type MediaType = 'newsletter' | 'podcast';

export type ListingStatus =
  | 'live'
  | 'securing'
  | 'pending_review'
  | 'secured'
  | 'in_progress'
  | 'completed_off_platform'
  | 'expired'
  | 'cancelled';

export type BookingStatus =
  | 'pending_payment'
  | 'secured'
  | 'in_progress'
  | 'completed_off_platform'
  | 'refund_requested'
  | 'refunded'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type RefundStatus = 'pending' | 'approved' | 'denied';

export type RefundReasonCategory =
  | 'seller_cannot_provide'
  | 'seller_changed_terms'
  | 'slot_unavailable'
  | 'platform_error'
  | 'booking_cannot_proceed'
  | 'other';

export interface Listing {
  id: string;
  media_type: MediaType;
  media_owner_name: string;
  media_company_name: string;
  property_name: string;
  audience: string;
  location: string;
  subscribers?: number | null;
  open_rate?: string | null;
  ctr?: string | null;
  downloads?: number | null;
  ad_type?: string | null;
  followers?: number | null;
  engagement_rate?: string | null;
  deliverable?: string | null;
  slot_type: string;
  date_label: string;
  deadline_at: string;
  original_price: number;
  discounted_price: number;
  slots_remaining: number;
  slots_total?: number;
  past_advertisers: string[];
  status: ListingStatus;
  hold_expires_at?: string | null;
  seller_email?: string | null;
  seller_phone?: string | null;
  seller_website?: string | null;
  posting_date_start?: string | null;
  posting_date_end?: string | null;
  posting_time?: string | null;
  deliverables_detail?: string | null;
  refund_notes?: string | null;
  response_time?: string | null;
  seller_bio?: string | null;
  seller_website_url?: string | null;
  seller_company_url?: string | null;
  seller_linkedin_url?: string | null;
  seller_twitter_url?: string | null;
  seller_instagram_url?: string | null;
  seller_youtube_url?: string | null;
  seller_tiktok_url?: string | null;
  seller_podcast_url?: string | null;
  portfolio_links?: string[] | null;
  host_name?: string | null;
  ad_slot_position?: string | null;
  auto_discount_enabled: boolean;
  newsletter_id?: string | null;
  newsletter?: Newsletter | null;
  media_profile_id?: string | null;
  media_profile?: MediaProfile | null;
  created_at: string;
  tags?: Tag[];
}

export interface DepositBooking {
  id: string;
  reference_number: string;
  listing_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_company: string;
  buyer_website?: string;
  buyer_phone?: string;
  buyer_country: string;
  message_to_creator?: string;
  booking_notes?: string;
  slots_count: number;
  price_per_slot: number;
  total_price: number;
  deposit_amount: number;
  balance_amount: number;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  payment_status: PaymentStatus;
  status: BookingStatus;
  seller_name?: string;
  seller_email?: string;
  seller_phone?: string;
  seller_website?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  listing?: Listing;
}

export interface RefundRequest {
  id: string;
  deposit_booking_id: string;
  reference_number: string;
  reason: string;
  reason_category: RefundReasonCategory;
  status: RefundStatus;
  admin_decision_reason?: string;
  admin_decided_at?: string;
  admin_decided_by?: string;
  created_at: string;
}

export interface SlotBooking {
  listing_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  campaign_name: string;
  campaign_url: string;
  brief: string;
  budget_confirmed: boolean;
  creative_ready: boolean;
  booking_type: 'review' | 'proceed';
}

export interface Newsletter {
  id: string;
  seller_user_id: string;
  seller_email: string;
  name: string;
  publisher_name: string;
  subscriber_count: number | null;
  avg_open_rate: string | null;
  niche: string | null;
  primary_geography: string | null;
  send_frequency: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaProfile {
  id: string;
  seller_user_id: string;
  seller_email: string;
  newsletter_name: string;
  tagline: string;
  category: string;
  audience_summary: string;
  primary_geography: string;
  audience_type: string;
  subscriber_count: number | null;
  open_rate: string;
  ctr: string | null;
  publishing_frequency: string;
  ad_formats: string[];
  past_advertisers: string[];
  media_kit_url: string;
  sample_issue_url: string;
  website_url: string;
  logo_url: string;
  cover_image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  display_name: string | null;
  tag_type: 'niche' | 'geography' | 'audience' | 'format' | 'general';
  usage_count: number;
  created_at: string;
}

export type SortOption = 'deadline_asc' | 'price_asc' | 'price_desc' | 'discount_desc' | 'audience_desc' | 'newest' | 'best_stats' | 'recommended';

export type ViewMode = 'grid' | 'list';

export type DeadlineWindow = 'today' | '3days' | '1week' | '2weeks' | null;

export type DiscountMode = 'all' | 'discounted_only' | 'no_discount_only';

export interface FilterState {
  category: MediaType | 'all';
  selectedNiches: string[];
  selectedGeographies: string[];
  priceMin: number;
  priceMax: number;
  audienceMin: number;
  discountMin: number;
  deadlineWindow: DeadlineWindow;
  verified: boolean;
  searchQuery: string;
  selectedTags: string[];
  sort: SortOption;
  slotDate: string | null;
  discountMode: DiscountMode;
}

export type PurchaseType = 'business' | 'individual';

export interface VatInfo {
  applies: boolean;
  rate: number;
  reverseCharge: boolean;
  vatNumber: string;
  vatValid: boolean | null;
  countryCode: string;
  currency: string;
  currencySymbol: string;
}

export interface BuyerFormData {
  purchase_type: PurchaseType;
  buyer_email: string;
  buyer_country: string;
  buyer_country_code: string;
  buyer_name: string;
  buyer_company: string;
  buyer_vat_number: string;
  brand_name: string;
  campaign_start_date: string;
  campaign_note: string;
  buyer_website: string;
  buyer_phone: string;
  message_to_creator: string;
  booking_notes: string;
}
