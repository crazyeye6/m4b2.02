import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DepositBooking, RefundRequest, BookingStatus, RefundStatus } from '../types';
import {
  Shield, AlertTriangle, CheckCircle, RefreshCw, X, ChevronDown, Users,
  DollarSign, FileText, RotateCcw, Ban, Play, Loader2, Eye, Settings, Key, Save, EyeOff,
  Mail, Clock, XCircle, ThumbsUp, ThumbsDown, ExternalLink, Upload,
  Zap, AlertCircle, Send, BarChart2, Globe, Percent, UserPlus, BookOpen, List, Copy,
} from 'lucide-react';
import { parseEmailBody, confidenceLabel, fieldConfidenceColor } from '../lib/emailParser';
import { sendAdminSlotPublishedEmail } from '../lib/email';
import AdminPublisherImport from '../components/AdminPublisherImport';
import { useAuth } from '../context/AuthContext';

interface EmailSubmission {
  id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  raw_body: string;
  slot_count: number;
  created_at: string;
}

interface EmailSubmissionSlot {
  id: string;
  submission_id: string;
  status: 'pending_review' | 'parsed_ok' | 'needs_review' | 'approved' | 'rejected' | 'published' | 'expired';
  slot_index: number;
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
  raw_slot_text: string;
  admin_notes: string;
  reviewed_by: string;
  reviewed_at: string | null;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
  open_rate?: string;
  geography?: string;
  placement_type?: string;
  send_date?: string;
  deadline_date?: string;
  sample_link?: string;
  past_advertisers_text?: string;
  publisher_name?: string;
  confidence_score?: number;
  field_confidence?: Record<string, number>;
  missing_fields?: string[];
  submission?: EmailSubmission;
}

interface CsvUploadBatch {
  id: string;
  seller_email: string;
  filename: string;
  row_count: number;
  status: 'pending_review' | 'needs_review' | 'processed' | 'rejected';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface CsvUploadSlot {
  id: string;
  batch_id: string;
  row_index: number;
  status: 'pending_review' | 'needs_review' | 'approved' | 'rejected' | 'published' | 'expired';
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
  validation_errors: { field: string; severity: string; message: string }[];
  admin_notes: string;
  reviewed_by: string;
  reviewed_at: string | null;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
  batch?: CsvUploadBatch;
}

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = 'overview' | 'bookings' | 'refunds' | 'email_submissions' | 'csv_uploads' | 'publisher_imports' | 'emails' | 'sellers' | 'name_changes' | 'settings';

interface ManagedSeller {
  id: string;
  email: string;
  display_name: string;
  company: string;
  created_by_admin: string | null;
  account_claimed: boolean;
  claimed_at: string | null;
  invite_sent_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  secured: { label: 'Secured', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  in_progress: { label: 'In Progress', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  completed_off_platform: { label: 'Completed', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  refund_requested: { label: 'Refund Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  refunded: { label: 'Refunded', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  cancelled: { label: 'Cancelled', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
};

export default function AdminPage({ onBack }: AdminPageProps) {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [bookings, setBookings] = useState<DepositBooking[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DepositBooking | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<(RefundRequest & { booking?: DepositBooking }) | null>(null);
  const [emailSlots, setEmailSlots] = useState<EmailSubmissionSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<EmailSubmissionSlot | null>(null);
  const [csvSlots, setCsvSlots] = useState<CsvUploadSlot[]>([]);
  const [selectedCsvSlot, setSelectedCsvSlot] = useState<CsvUploadSlot | null>(null);
  const [managedSellers, setManagedSellers] = useState<ManagedSeller[]>([]);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundDecisionReason, setRefundDecisionReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, refundsRes, emailSlotsRes, csvSlotsRes, sellersRes] = await Promise.all([
      supabase
        .from('deposit_bookings')
        .select('*, listing:listings(property_name, media_owner_name, media_company_name, slot_type, date_label)')
        .order('created_at', { ascending: false }),
      supabase
        .from('refund_requests')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('email_submission_slots')
        .select('*, submission:email_submissions(id, sender_email, sender_name, subject, raw_body, created_at)')
        .order('created_at', { ascending: false }),
      supabase
        .from('csv_upload_slots')
        .select('*, batch:csv_upload_batches(id, seller_email, filename, row_count, status, created_at)')
        .order('created_at', { ascending: false }),
      supabase
        .from('managed_sellers')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data as DepositBooking[]);
    if (refundsRes.data) setRefunds(refundsRes.data as RefundRequest[]);
    if (emailSlotsRes.data) setEmailSlots(emailSlotsRes.data as EmailSubmissionSlot[]);
    if (csvSlotsRes.data) setCsvSlots(csvSlotsRes.data as CsvUploadSlot[]);
    if (sellersRes.data) setManagedSellers(sellersRes.data as ManagedSeller[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    setUpdating(true);
    await supabase
      .from('deposit_bookings')
      .update({ status, admin_notes: adminNotes || undefined, updated_at: new Date().toISOString() })
      .eq('id', id);
    await fetchData();
    setSelectedBooking(null);
    setAdminNotes('');
    setUpdating(false);
  };

  const updateRefundStatus = async (id: string, status: RefundStatus) => {
    setUpdating(true);
    await supabase
      .from('refund_requests')
      .update({
        status,
        admin_decision_reason: refundDecisionReason,
        admin_decided_at: new Date().toISOString(),
        admin_decided_by: 'Admin',
      })
      .eq('id', id);

    if (status === 'approved') {
      const refund = refunds.find(r => r.id === id);
      if (refund) {
        await supabase
          .from('deposit_bookings')
          .update({ status: 'refunded', payment_status: 'refunded', updated_at: new Date().toISOString() })
          .eq('id', refund.deposit_booking_id);
      }
    }

    await fetchData();
    setSelectedRefund(null);
    setRefundDecisionReason('');
    setUpdating(false);
  };

  const updateEmailSlotStatus = async (id: string, status: EmailSubmissionSlot['status'], notes?: string, extraFields?: Partial<EmailSubmissionSlot>) => {
    setUpdating(true);
    await supabase
      .from('email_submission_slots')
      .update({
        status,
        admin_notes: notes ?? '',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Admin',
        updated_at: new Date().toISOString(),
        ...(extraFields ?? {}),
      })
      .eq('id', id);
    await fetchData();
    setSelectedSlot(null);
    setUpdating(false);
  };

  const publishEmailSlot = async (id: string, notes?: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('publish_email_slot_to_listing', { slot_id: id });
      if (error) throw error;
      if (notes) {
        await supabase.from('email_submission_slots').update({ admin_notes: notes }).eq('id', id);
      }

      const { data: slot } = await supabase
        .from('email_submission_slots')
        .select('*, submission:email_submissions(sender_email, sender_name), listing_id')
        .eq('id', id)
        .maybeSingle();

      if (slot?.listing_id) {
        const { data: listing } = await supabase
          .from('listings')
          .select('property_name, media_type, original_price, discounted_price, slots_remaining, deadline_at, seller_email')
          .eq('id', slot.listing_id)
          .maybeSingle();

        const senderEmail = (slot.submission as { sender_email?: string } | null)?.sender_email;
        const senderName = (slot.submission as { sender_name?: string } | null)?.sender_name;
        const toEmail = listing?.seller_email || senderEmail;

        if (toEmail && listing) {
          const origPrice = Number(slot.original_price || 0);
          const discPrice = Number(slot.discount_price || 0);
          const discount = origPrice > 0 ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;
          sendAdminSlotPublishedEmail(toEmail, {
            property_name: listing.property_name,
            media_type: listing.media_type,
            original_price: listing.original_price || origPrice,
            discounted_price: listing.discounted_price || discPrice,
            discount,
            slots_remaining: listing.slots_remaining ?? slot.slots_available ?? 1,
            deadline_at: listing.deadline_at || slot.deadline_date || slot.deadline || '',
            seller_name: senderName || '',
            seller_email: toEmail,
            submission_ref: id.slice(0, 8).toUpperCase(),
          });
        }
      }

      await fetchData();
      setSelectedSlot(null);
    } catch (err) {
      console.error('Publish failed:', err);
    }
    setUpdating(false);
  };

  const updateCsvSlotStatus = async (id: string, status: CsvUploadSlot['status'], notes?: string) => {
    setUpdating(true);
    await supabase
      .from('csv_upload_slots')
      .update({
        status,
        admin_notes: notes ?? '',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    await fetchData();
    setSelectedCsvSlot(null);
    setUpdating(false);
  };

  const stats = {
    total: bookings.length,
    secured: bookings.filter(b => b.status === 'secured').length,
    totalDeposits: bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.deposit_amount, 0),
    pendingRefunds: refunds.filter(r => r.status === 'pending').length,
    pendingEmailSlots: emailSlots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length,
    pendingCsvSlots: csvSlots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length,
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.08] rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#1d1d1f]" />
            </div>
            <div>
              <h1 className="text-[#1d1d1f] font-semibold text-base tracking-[-0.01em]">Admin Dashboard</h1>
              <p className="text-[#aeaeb2] text-xs">EndingThisWeek.media</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={onBack}
              className="text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-colors"
            >
              Back to site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={<Users className="w-4 h-4 text-[#86868b]" />} label="Total Bookings" value={stats.total} />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Secured" value={stats.secured} highlight />
          <StatCard icon={<DollarSign className="w-4 h-4 text-[#86868b]" />} label="Deposits Collected" value={`$${stats.totalDeposits.toLocaleString()}`} />
          <StatCard icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} label="Pending Refunds" value={stats.pendingRefunds} warn={stats.pendingRefunds > 0} />
          <StatCard icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email Queue" value={stats.pendingEmailSlots} warn={stats.pendingEmailSlots > 0} />
          <StatCard icon={<Upload className="w-4 h-4 text-[#6e6e73]" />} label="CSV Queue" value={stats.pendingCsvSlots} warn={stats.pendingCsvSlots > 0} />
        </div>

        <div className="flex items-center gap-1 mb-6 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit flex-wrap">
          {([
            ['overview', 'Overview'],
            ['email_submissions', 'Email Inbox'],
            ['bookings', 'Bookings'],
            ['refunds', 'Refund Requests'],
            ['csv_uploads', 'CSV Uploads'],
            ['publisher_imports', 'Publisher Imports'],
            ['emails', 'Resend Emails'],
            ['sellers', 'Managed Sellers'],
            ['name_changes', 'Name Changes'],
            ['settings', 'Settings'],
          ] as [AdminTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.06]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              {label}
              {key === 'refunds' && stats.pendingRefunds > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingRefunds}
                </span>
              )}
              {key === 'email_submissions' && stats.pendingEmailSlots > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingEmailSlots}
                </span>
              )}
              {key === 'csv_uploads' && stats.pendingCsvSlots > 0 && (
                <span className="ml-2 bg-[#6e6e73] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingCsvSlots}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#1d1d1f] animate-spin" />
          </div>
        ) : tab === 'overview' ? (
          <AdminOverviewPanel stats={stats} onNavigate={setTab} />
        ) : tab === 'email_submissions' ? (
          <EmailSubmissionsTable slots={emailSlots} onSelect={setSelectedSlot} />
        ) : tab === 'bookings' ? (
          <BookingsTable bookings={bookings} onSelect={setSelectedBooking} />
        ) : tab === 'refunds' ? (
          <RefundsTable refunds={refunds} bookings={bookings} onSelect={(r) => {
            const booking = bookings.find(b => b.id === r.deposit_booking_id);
            setSelectedRefund({ ...r, booking });
          }} />
        ) : tab === 'csv_uploads' ? (
          <CsvUploadsTable slots={csvSlots} onSelect={setSelectedCsvSlot} />
        ) : tab === 'publisher_imports' ? (
          <AdminPublisherImport onRefreshStats={fetchData} />
        ) : tab === 'emails' ? (
          <EmailsPanel />
        ) : tab === 'sellers' ? (
          <SellersPanel sellers={managedSellers} onRefresh={fetchData} />
        ) : tab === 'name_changes' ? (
          <NameChangeRequestsPanel />
        ) : (
          <SettingsPanel />
        )}
      </div>

      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          adminNotes={adminNotes}
          onNotesChange={setAdminNotes}
          onStatusChange={(s) => updateBookingStatus(selectedBooking.id, s)}
          onClose={() => setSelectedBooking(null)}
          updating={updating}
        />
      )}

      {selectedRefund && (
        <RefundDetailPanel
          refund={selectedRefund}
          decisionReason={refundDecisionReason}
          onReasonChange={setRefundDecisionReason}
          onDecision={(s) => updateRefundStatus(selectedRefund.id, s)}
          onClose={() => setSelectedRefund(null)}
          updating={updating}
        />
      )}

      {selectedSlot && (
        <EmailSlotDetailPanel
          slot={selectedSlot}
          onStatusChange={(status, notes, extraFields) => updateEmailSlotStatus(selectedSlot.id, status, notes, extraFields)}
          onPublish={(notes) => publishEmailSlot(selectedSlot.id, notes)}
          onClose={() => setSelectedSlot(null)}
          updating={updating}
        />
      )}

      {selectedCsvSlot && (
        <CsvSlotDetailPanel
          slot={selectedCsvSlot}
          onStatusChange={(status, notes) => updateCsvSlotStatus(selectedCsvSlot.id, status, notes)}
          onClose={() => setSelectedCsvSlot(null)}
          updating={updating}
        />
      )}
    </div>
  );
}

const EMAIL_SLOT_STATUS_CONFIG: Record<EmailSubmissionSlot['status'], { label: string; color: string; bg: string }> = {
  pending_review: { label: 'New Submission', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  parsed_ok: { label: 'Parsed Draft', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  needs_review: { label: 'Needs Review', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  rejected: { label: 'Rejected', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  published: { label: 'Published', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  expired: { label: 'Expired', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
};

function ConfidencePill({ score }: { score: number }) {
  const { label, color, bg } = confidenceLabel(score);
  return (
    <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-lg ${bg} ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
      {label} {score > 0 ? `· ${score}%` : ''}
    </span>
  );
}

function EmailSubmissionsTable({ slots, onSelect }: { slots: EmailSubmissionSlot[]; onSelect: (s: EmailSubmissionSlot) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | EmailSubmissionSlot['status']>('all');

  const slotsWithParsed = slots.map(slot => {
    if (slot.confidence_score !== undefined && slot.confidence_score > 0) return slot;
    if (!slot.submission?.raw_body) return slot;
    try {
      const parsed = parseEmailBody(slot.submission.raw_body);
      const match = parsed[slot.slot_index - 1] ?? parsed[0];
      if (!match) return slot;
      return {
        ...slot,
        confidence_score: match.confidence_score,
        missing_fields: match.missing_fields,
      };
    } catch {
      return slot;
    }
  });

  const filtered = statusFilter === 'all' ? slotsWithParsed : slotsWithParsed.filter(s => s.status === statusFilter);

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 text-[#aeaeb2]">
        <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium mb-1">No email submissions yet</p>
        <p className="text-xs">Opportunities submitted via slots@endingthisweek.media will appear here</p>
      </div>
    );
  }

  const pendingCount = slots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length;
  const publishedCount = slots.filter(s => s.status === 'published').length;

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        icon={<Mail className="w-4 h-4" />}
        title="Email Inbox"
        desc="Sellers email their slot listings to slots@endingthisweek.media. Each email is parsed automatically into individual slots. Your job: review each slot, fix any errors or missing fields, then publish the good ones to the marketplace."
        tip="Confidence score shows how well the parser understood the email. Low score = more manual review needed."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
          <p className="text-[#86868b] text-xs mb-1">Total Submissions</p>
          <p className="text-[#1d1d1f] font-bold text-xl">{slots.length}</p>
        </div>
        <div className={`bg-white border rounded-2xl p-4 ${pendingCount > 0 ? 'border-blue-200' : 'border-black/[0.06]'}`}>
          <p className="text-[#86868b] text-xs mb-1">Awaiting Review</p>
          <p className={`font-bold text-xl ${pendingCount > 0 ? 'text-blue-600' : 'text-[#1d1d1f]'}`}>{pendingCount}</p>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
          <p className="text-[#86868b] text-xs mb-1">Published Live</p>
          <p className="text-green-600 font-bold text-xl">{publishedCount}</p>
        </div>
        <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
          <p className="text-[#86868b] text-xs mb-1">Unique Senders</p>
          <p className="text-[#1d1d1f] font-bold text-xl">{new Set(slots.map(s => s.submission?.sender_email)).size}</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-blue-700 text-sm font-medium">{pendingCount} submission{pendingCount > 1 ? 's' : ''} awaiting review — click any row to open the review panel</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending_review', 'needs_review', 'parsed_ok', 'approved', 'rejected', 'published'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              statusFilter === s
                ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                : 'bg-white text-[#6e6e73] border-black/[0.08] hover:border-black/[0.16]'
            }`}
          >
            {s === 'all' ? `All (${slots.length})` : EMAIL_SLOT_STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Sender</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Media Brand</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Pricing</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Confidence</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map(slot => {
                const sc = EMAIL_SLOT_STATUS_CONFIG[slot.status];
                const conf = slot.confidence_score ?? 0;
                const missing = slot.missing_fields ?? [];
                return (
                  <tr
                    key={slot.id}
                    className="hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                    onClick={() => onSelect(slot)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-[#1d1d1f] text-sm font-medium">{slot.submission?.sender_name || '—'}</p>
                      <p className="text-[#aeaeb2] text-xs">{slot.submission?.sender_email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#1d1d1f] text-sm font-medium">{slot.media_name || <span className="text-[#aeaeb2]">—</span>}</p>
                      {slot.category && <p className="text-[#aeaeb2] text-xs">{slot.category}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#6e6e73] text-xs capitalize">{slot.media_type || 'newsletter'}</p>
                      <p className="text-[#aeaeb2] text-xs">{slot.opportunity_type || (slot as any).placement_type || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {slot.discount_price ? (
                        <div>
                          <p className="text-green-600 font-bold text-sm">{slot.discount_price}</p>
                          {slot.original_price && (
                            <p className="text-[#aeaeb2] text-xs line-through">{slot.original_price}</p>
                          )}
                        </div>
                      ) : <span className="text-[#aeaeb2] text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <ConfidencePill score={conf} />
                      {missing.length > 0 && (
                        <p className="text-[#aeaeb2] text-[10px] mt-0.5">{missing.length} field{missing.length > 1 ? 's' : ''} missing</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[#aeaeb2] text-xs">{new Date(slot.created_at).toLocaleDateString()}</span>
                      <p className="text-[#aeaeb2] text-[10px]">{new Date(slot.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={e => { e.stopPropagation(); onSelect(slot); }}
                        className="flex items-center gap-1 text-[#6e6e73] hover:text-[#1d1d1f] text-xs transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmailSlotDetailPanel({ slot, onStatusChange, onPublish, onClose, updating }: {
  slot: EmailSubmissionSlot;
  onStatusChange: (status: EmailSubmissionSlot['status'], notes: string, extraFields?: Partial<EmailSubmissionSlot>) => void;
  onPublish: (notes: string) => void;
  onClose: () => void;
  updating: boolean;
}) {
  const [notes, setNotes] = useState(slot.admin_notes || '');
  const [showRaw, setShowRaw] = useState(false);
  const [parsedFields, setParsedFields] = useState<ReturnType<typeof parseEmailBody>[0] | null>(null);
  const sc = EMAIL_SLOT_STATUS_CONFIG[slot.status];

  useEffect(() => {
    if (slot.submission?.raw_body) {
      try {
        const parsed = parseEmailBody(slot.submission.raw_body);
        const match = parsed[slot.slot_index - 1] ?? parsed[0];
        if (match) setParsedFields(match);
      } catch {
        setParsedFields(null);
      }
    }
  }, [slot]);

  const confScore = slot.confidence_score ?? parsedFields?.confidence_score ?? 0;
  const missingFields = slot.missing_fields ?? parsedFields?.missing_fields ?? [];
  const fieldConf = slot.field_confidence ?? parsedFields?.field_confidence ?? {};

  const REQUIRED_FOR_PUBLISH = ['media_name', 'media_type', 'audience_size', 'original_price', 'discount_price', 'deadline_date'];
  const canPublish = REQUIRED_FOR_PUBLISH.every(f =>
    fieldConf[f] > 0 ||
    [slot.media_name, slot.media_type, slot.audience_size, slot.original_price, slot.discount_price, slot.deadline].some(Boolean)
  );

  const displayFields = [
    { label: 'Newsletter Name', value: slot.media_name, key: 'media_name' },
    { label: 'Publisher', value: slot.publisher_name || '', key: 'publisher_name' },
    { label: 'Media Type', value: slot.media_type, key: 'media_type' },
    { label: 'Category', value: slot.category, key: 'category' },
    { label: 'Audience Size', value: slot.audience_size, key: 'audience_size' },
    { label: 'Open Rate', value: slot.open_rate || '', key: 'open_rate' },
    { label: 'Geography', value: slot.geography || '', key: 'geography' },
    { label: 'Placement Type', value: slot.placement_type || slot.opportunity_type, key: 'placement_type' },
    { label: 'Send Date', value: slot.send_date || '', key: 'send_date' },
    { label: 'Deadline', value: slot.deadline_date || slot.deadline, key: 'deadline_date' },
    { label: 'Rate Card Price', value: slot.original_price, key: 'original_price' },
    { label: 'This Week Price', value: slot.discount_price, key: 'discount_price' },
    { label: 'Slots Available', value: slot.slots_available, key: 'slots_available' },
    { label: 'Sample Link', value: slot.sample_link || '', key: 'sample_link' },
    { label: 'Past Advertisers', value: slot.past_advertisers_text || '', key: 'past_advertisers_text' },
    { label: 'Booking URL', value: slot.booking_url, key: 'booking_url' },
  ];

  const isUrl = (val: string) => val.startsWith('http');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-2xl max-h-[94vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.08] rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#1d1d1f]" />
            </div>
            <div>
              <h2 className="text-[#1d1d1f] font-semibold">{slot.media_name || 'Email Submission'} — Slot #{slot.slot_index}</h2>
              <p className="text-[#6e6e73] text-xs mt-0.5">{slot.submission?.sender_email} · {new Date(slot.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
            <ConfidencePill score={confScore} />
            {missingFields.length > 0 && (
              <span className="inline-flex items-center gap-1 border border-red-200 bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                {missingFields.length} required field{missingFields.length > 1 ? 's' : ''} missing
              </span>
            )}
          </div>

          {slot.submission?.subject && (
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl px-4 py-3">
              <p className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wide mb-0.5">Email Subject</p>
              <p className="text-[#1d1d1f] text-sm font-medium">{slot.submission.subject}</p>
            </div>
          )}

          {missingFields.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 font-semibold text-sm mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Missing required fields
              </p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map(f => (
                  <span key={f} className="bg-red-100 border border-red-200 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-lg">
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <p className="text-red-600 text-xs mt-2">These fields are required to publish this listing. Add them manually or flag for seller to resubmit.</p>
            </div>
          )}

          <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
            <p className="text-[#86868b] text-[11px] font-semibold uppercase tracking-wider mb-3">Extracted Fields</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayFields.map(f => {
                const confVal = fieldConf[f.key] ?? (f.value ? 60 : 0);
                const borderClass = fieldConfidenceColor(confVal);
                const hasValue = Boolean(f.value?.trim());
                return (
                  <div key={f.label} className={`bg-white border rounded-xl p-3 ${hasValue ? borderClass : 'border-red-100 bg-red-50/30'}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wide">{f.label}</p>
                      {hasValue && confVal >= 80 && <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />}
                      {hasValue && confVal >= 50 && confVal < 80 && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                      {hasValue && confVal < 50 && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />}
                      {!hasValue && <span className="w-1.5 h-1.5 bg-red-300 rounded-full" />}
                    </div>
                    {hasValue ? (
                      isUrl(f.value) ? (
                        <a href={f.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 break-all">
                          {f.value} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-[#1d1d1f] text-sm font-medium break-words">{f.value}</p>
                      )
                    ) : (
                      <p className="text-red-400 text-xs italic">Not found in email</p>
                    )}
                  </div>
                );
              })}
            </div>

            {slot.description && (
              <div className="mt-2 bg-white border border-black/[0.06] rounded-xl p-3">
                <p className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wide mb-0.5">Description</p>
                <p className="text-[#1d1d1f] text-sm leading-relaxed">{slot.description}</p>
              </div>
            )}
          </div>

          <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#86868b] text-[11px] font-semibold uppercase tracking-wider">Confidence Breakdown</p>
              <span className={`text-xs font-bold ${confScore >= 80 ? 'text-green-600' : confScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {confScore}%
              </span>
            </div>
            <div className="w-full bg-black/[0.06] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${confScore >= 80 ? 'bg-green-500' : confScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${confScore}%` }}
              />
            </div>
            <p className="text-[#aeaeb2] text-[10px] mt-1.5">
              {confScore >= 80 ? 'High confidence — ready for fast-track approval' :
               confScore >= 50 ? 'Medium confidence — review flagged fields before approving' :
               'Low confidence — manual review required before publishing'}
            </p>
          </div>

          {slot.submission?.raw_body && (
            <div>
              <button
                onClick={() => setShowRaw(v => !v)}
                className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-xs font-medium transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRaw ? 'rotate-180' : ''}`} />
                {showRaw ? 'Hide' : 'Show'} source email
              </button>
              {showRaw && (
                <pre className="mt-2 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4 text-xs text-[#6e6e73] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {slot.submission.raw_body}
                </pre>
              )}
            </div>
          )}

          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Admin Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes about this submission..."
              rows={3}
              className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
            />
          </div>

          {slot.status === 'published' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-green-700 font-semibold text-sm">Published to Marketplace</p>
                {slot.listing_id && <p className="text-green-600 text-xs mt-0.5">Listing ID: {slot.listing_id}</p>}
                {slot.reviewed_at && <p className="text-green-600 text-xs">Published {new Date(slot.reviewed_at).toLocaleString()}</p>}
              </div>
            </div>
          ) : slot.status === 'rejected' ? (
            <div className="bg-[#f5f5f7] border border-black/[0.08] rounded-2xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-[#86868b] shrink-0" />
              <div>
                <p className="text-[#6e6e73] font-semibold text-sm">Rejected</p>
                {slot.admin_notes && <p className="text-[#aeaeb2] text-xs mt-0.5">{slot.admin_notes}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {slot.status === 'approved' && (
                <button
                  onClick={() => onPublish(notes)}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm shadow-green-600/20"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish to Marketplace
                </button>
              )}

              <div className={`flex gap-3 ${slot.status === 'approved' ? '' : ''}`}>
                {slot.status !== 'approved' && (
                  <button
                    onClick={() => onStatusChange('approved', notes)}
                    disabled={updating}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                    Approve
                  </button>
                )}
                {slot.status === 'approved' && (
                  <button
                    onClick={() => onStatusChange('needs_review', notes)}
                    disabled={updating}
                    className="flex-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 disabled:opacity-40 text-orange-700 font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Send Back
                  </button>
                )}
                {slot.status !== 'approved' && (
                  <button
                    onClick={() => onStatusChange('needs_review', notes)}
                    disabled={updating}
                    className="flex-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 disabled:opacity-40 text-orange-700 font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Flag Review
                  </button>
                )}
                <button
                  onClick={() => onStatusChange('rejected', notes)}
                  disabled={updating}
                  className="flex-1 bg-[#f5f5f7] hover:bg-white border border-black/[0.08] disabled:opacity-40 text-[#6e6e73] font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CSV_SLOT_STATUS_CONFIG: Record<CsvUploadSlot['status'], { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pending Review', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  needs_review: { label: 'Needs Review', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  rejected: { label: 'Rejected', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  published: { label: 'Published', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  expired: { label: 'Expired', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
};

function CsvUploadsTable({ slots, onSelect }: { slots: CsvUploadSlot[]; onSelect: (s: CsvUploadSlot) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | CsvUploadSlot['status']>('all');
  const filtered = statusFilter === 'all' ? slots : slots.filter(s => s.status === statusFilter);
  const pendingCount = slots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length;

  if (slots.length === 0) {
    return (
      <div className="text-center py-16 text-[#aeaeb2]">
        <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium mb-1">No CSV uploads yet</p>
        <p className="text-xs">Opportunities submitted via CSV upload will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        icon={<Upload className="w-4 h-4" />}
        title="CSV Uploads"
        desc="Sellers upload a CSV file containing all their available slots for the week. Each row is one ad slot. Review rows grouped by newsletter — approve the clean ones, flag or reject rows with issues, then publish approved slots to the marketplace."
        tip="Rows marked 'Needs Review' have validation warnings. You can still approve them manually if the data looks correct."
      />
      {pendingCount > 0 && (
        <div className="bg-[#f5f5f7] border border-black/[0.08] rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#6e6e73] shrink-0" />
          <p className="text-[#1d1d1f] text-sm font-medium">{pendingCount} row{pendingCount > 1 ? 's' : ''} from CSV uploads awaiting review</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending_review', 'needs_review', 'approved', 'rejected', 'published'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              statusFilter === s
                ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                : 'bg-white text-[#6e6e73] border-black/[0.08] hover:border-black/[0.16]'
            }`}
          >
            {s === 'all' ? `All (${slots.length})` : CSV_SLOT_STATUS_CONFIG[s as CsvUploadSlot['status']]?.label || s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Row</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Batch / File</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Media</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Pricing</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Issues</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Uploaded</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map(slot => {
                const sc = CSV_SLOT_STATUS_CONFIG[slot.status];
                const errorCount = slot.validation_errors?.filter(e => e.severity === 'error').length ?? 0;
                const warnCount = slot.validation_errors?.filter(e => e.severity === 'warning').length ?? 0;
                return (
                  <tr key={slot.id} className="hover:bg-[#f5f5f7] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#6e6e73] font-semibold">#{slot.row_index}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <p className="text-[#1d1d1f] text-xs font-medium truncate">{slot.batch?.filename || '—'}</p>
                      <p className="text-[#aeaeb2] text-xs truncate">{slot.batch?.seller_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#1d1d1f] text-sm">{slot.media_name || <span className="text-[#aeaeb2]">—</span>}</p>
                      <p className="text-[#aeaeb2] text-xs capitalize">{slot.media_type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#6e6e73] text-xs">{slot.opportunity_type || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {slot.discount_price ? (
                        <div>
                          <p className="text-green-600 font-bold text-sm">{slot.discount_price}</p>
                          {slot.original_price && <p className="text-[#aeaeb2] text-xs line-through">{slot.original_price}</p>}
                        </div>
                      ) : <span className="text-[#aeaeb2] text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {errorCount > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                          {errorCount} error{errorCount > 1 ? 's' : ''}
                        </span>
                      ) : warnCount > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                          {warnCount} warning{warnCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs">Clean</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#aeaeb2] text-xs">{new Date(slot.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelect(slot)}
                        className="flex items-center gap-1 text-[#6e6e73] hover:text-[#1d1d1f] text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CsvSlotDetailPanel({ slot, onStatusChange, onClose, updating }: {
  slot: CsvUploadSlot;
  onStatusChange: (status: CsvUploadSlot['status'], notes: string) => void;
  onClose: () => void;
  updating: boolean;
}) {
  const [notes, setNotes] = useState(slot.admin_notes || '');
  const sc = CSV_SLOT_STATUS_CONFIG[slot.status];

  const fields = [
    { label: 'Media Name', value: slot.media_name },
    { label: 'Media Type', value: slot.media_type },
    { label: 'Audience Size', value: slot.audience_size },
    { label: 'Opportunity Type', value: slot.opportunity_type },
    { label: 'Original Price', value: slot.original_price },
    { label: 'Discount Price', value: slot.discount_price },
    { label: 'Slots Available', value: slot.slots_available },
    { label: 'Deadline', value: slot.deadline },
    { label: 'Category', value: slot.category },
    { label: 'Booking URL', value: slot.booking_url },
  ].filter(f => f.value);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.08] rounded-xl flex items-center justify-center">
              <Upload className="w-4 h-4 text-[#1d1d1f]" />
            </div>
            <div>
              <h2 className="text-[#1d1d1f] font-semibold">CSV Upload — Row #{slot.row_index}</h2>
              <p className="text-[#6e6e73] text-xs mt-0.5">{slot.batch?.filename} · {slot.batch?.seller_email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
            <span className="text-[#aeaeb2] text-xs">Received {new Date(slot.created_at).toLocaleString()}</span>
          </div>

          {slot.validation_errors && slot.validation_errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-amber-700 font-semibold text-sm mb-2">Validation issues detected at upload</p>
              <div className="space-y-1">
                {slot.validation_errors.map((e, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs ${e.severity === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                    <span className="font-bold uppercase mt-0.5">{e.severity}</span>
                    <span>{e.field !== 'general' ? <span className="font-semibold">{e.field}: </span> : null}{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
            <p className="text-[#86868b] text-[11px] font-semibold uppercase tracking-wider mb-3">Parsed Fields</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fields.map(f => (
                <div key={f.label} className="bg-white border border-black/[0.06] rounded-xl p-3">
                  <p className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wide mb-0.5">{f.label}</p>
                  <p className="text-[#1d1d1f] text-sm font-medium break-words">
                    {f.label === 'Booking URL' ? (
                      <a href={f.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {f.value} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : f.value}
                  </p>
                </div>
              ))}
            </div>
            {slot.description && (
              <div className="mt-2.5 bg-white border border-black/[0.06] rounded-xl p-3">
                <p className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wide mb-0.5">Description</p>
                <p className="text-[#1d1d1f] text-sm leading-relaxed">{slot.description}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Admin Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes about this row..."
              rows={3}
              className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
            />
          </div>

          {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
            <div className="flex gap-3">
              <button
                onClick={() => onStatusChange('approved', notes)}
                disabled={updating}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={() => onStatusChange('needs_review', notes)}
                disabled={updating}
                className="flex-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 disabled:opacity-40 text-orange-700 font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Needs Review
              </button>
              <button
                onClick={() => onStatusChange('rejected', notes)}
                disabled={updating}
                className="flex-1 bg-[#f5f5f7] hover:bg-white border border-black/[0.08] disabled:opacity-40 text-[#6e6e73] font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {slot.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-green-700 font-semibold text-sm">Approved</p>
                {slot.reviewed_at && <p className="text-green-600 text-xs mt-0.5">Reviewed {new Date(slot.reviewed_at).toLocaleString()}</p>}
              </div>
            </div>
          )}

          {slot.status === 'rejected' && (
            <div className="bg-[#f5f5f7] border border-black/[0.08] rounded-2xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-[#86868b] shrink-0" />
              <div>
                <p className="text-[#6e6e73] font-semibold text-sm">Rejected</p>
                {slot.admin_notes && <p className="text-[#aeaeb2] text-xs mt-0.5">{slot.admin_notes}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsTable({ bookings, onSelect }: { bookings: DepositBooking[]; onSelect: (b: DepositBooking) => void }) {
  if (bookings.length === 0) {
    return (
      <div className="space-y-4">
        <AdminSectionHeader
          icon={<DollarSign className="w-4 h-4" />}
          title="Bookings"
          desc="All buyer bookings in one place. When a buyer secures a slot they pay a deposit at checkout. Track deals from 'Pending Payment' through to 'Completed'. Use the detail panel to update status and add admin notes."
          tip="Deposits are collected at checkout. The balance is paid directly between buyer and seller off-platform."
        />
        <div className="text-center py-16 text-[#aeaeb2]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No bookings yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        icon={<DollarSign className="w-4 h-4" />}
        title="Bookings"
        desc="All buyer bookings in one place. When a buyer secures a slot they pay a deposit at checkout. Track deals from 'Pending Payment' through to 'Completed'. Use the detail panel to update status and add admin notes."
        tip="Deposits are collected at checkout. The balance is paid directly between buyer and seller off-platform."
      />
    <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06] bg-[#fafafa]">
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Reference</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Buyer</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Opportunity</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Deposit</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {bookings.map(b => {
              const sc = BOOKING_STATUS_CONFIG[b.status];
              return (
                <tr key={b.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[#6e6e73] font-semibold">{b.reference_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#1d1d1f] text-sm font-medium">{b.buyer_name}</p>
                    <p className="text-[#aeaeb2] text-xs">{b.buyer_company}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#1d1d1f] text-sm">{(b.listing as any)?.property_name || b.listing_id}</p>
                    <p className="text-[#aeaeb2] text-xs">{(b.listing as any)?.media_owner_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-green-600 font-bold text-sm">${b.deposit_amount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#1d1d1f] text-sm">${b.total_price.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#aeaeb2] text-xs">{new Date(b.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelect(b)}
                      className="flex items-center gap-1 text-[#6e6e73] hover:text-[#1d1d1f] text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

function RefundsTable({ refunds, bookings, onSelect }: {
  refunds: RefundRequest[];
  bookings: DepositBooking[];
  onSelect: (r: RefundRequest) => void;
}) {
  if (refunds.length === 0) {
    return (
      <div className="space-y-4">
        <AdminSectionHeader
          icon={<RotateCcw className="w-4 h-4" />}
          title="Refund Requests"
          desc="Buyers submit refund requests after securing a slot. Review the reason, then approve or decline. Approving a refund automatically updates the booking status to 'Refunded'."
          tip="Always check if the seller has already been notified before approving. Add a decision reason — it's sent to the buyer."
        />
        <div className="text-center py-16 text-[#aeaeb2]">
          <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No refund requests</p>
        </div>
      </div>
    );
  }

  const STATUS_CFG: Record<RefundStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    denied: { label: 'Denied', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  };

  return (
    <div className="space-y-4">
      <AdminSectionHeader
        icon={<RotateCcw className="w-4 h-4" />}
        title="Refund Requests"
        desc="Buyers submit refund requests after securing a slot. Review the reason, then approve or decline. Approving a refund automatically updates the booking status to 'Refunded'."
        tip="Always check if the seller has already been notified before approving. Add a decision reason — it's sent to the buyer."
      />
    <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06] bg-[#fafafa]">
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Reference</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Buyer</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Deposit</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {refunds.map(r => {
              const sc = STATUS_CFG[r.status];
              const booking = bookings.find(b => b.id === r.deposit_booking_id);
              return (
                <tr key={r.id} className="hover:bg-[#f5f5f7] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[#6e6e73] font-semibold">{r.reference_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#1d1d1f] text-sm">{booking?.buyer_name || '—'}</p>
                    <p className="text-[#aeaeb2] text-xs">{booking?.buyer_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#6e6e73] text-xs capitalize">{r.reason_category.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-green-600 font-bold text-sm">${booking?.deposit_amount.toLocaleString() || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#aeaeb2] text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelect(r)}
                      className="flex items-center gap-1 text-[#6e6e73] hover:text-[#1d1d1f] text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

function BookingDetailPanel({ booking, adminNotes, onNotesChange, onStatusChange, onClose, updating }: {
  booking: DepositBooking;
  adminNotes: string;
  onNotesChange: (v: string) => void;
  onStatusChange: (s: BookingStatus) => void;
  onClose: () => void;
  updating: boolean;
}) {
  const [statusSelect, setStatusSelect] = useState<BookingStatus>(booking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#1d1d1f] font-semibold">Booking Management</h2>
            <p className="text-[#6e6e73] text-xs font-mono mt-0.5">{booking.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Buyer" value={booking.buyer_name} sub={booking.buyer_company} />
            <InfoBlock label="Email" value={booking.buyer_email} sub={booking.buyer_phone} />
            <InfoBlock label="Deposit paid" value={`$${booking.deposit_amount.toLocaleString()}`} highlight />
            <InfoBlock label="Balance to creator" value={`$${booking.balance_amount.toLocaleString()}`} />
            <InfoBlock label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
            <InfoBlock label="Payment" value={booking.payment_status} />
          </div>

          {booking.message_to_creator && (
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
              <p className="text-[#86868b] text-xs font-semibold mb-2">Buyer message</p>
              <p className="text-[#6e6e73] text-sm">{booking.message_to_creator}</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Update status</label>
            <div className="relative">
              <select
                value={statusSelect}
                onChange={e => setStatusSelect(e.target.value as BookingStatus)}
                className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none appearance-none transition-all [color-scheme:light]"
              >
                {(Object.keys(BOOKING_STATUS_CONFIG) as BookingStatus[]).map(s => (
                  <option key={s} value={s}>{BOOKING_STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Admin notes (optional)</label>
            <textarea
              value={adminNotes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Internal notes about this booking..."
              rows={3}
              className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onStatusChange(statusSelect)}
              disabled={updating || statusSelect === booking.status}
              className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Update Status
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all"
            >
              Cancel
            </button>
          </div>

          {booking.stripe_payment_intent_id && (
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3">
              <p className="text-[#86868b] text-xs font-semibold mb-1">Payment reference</p>
              <p className="text-[#aeaeb2] text-xs font-mono">{booking.stripe_payment_intent_id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RefundDetailPanel({ refund, decisionReason, onReasonChange, onDecision, onClose, updating }: {
  refund: RefundRequest & { booking?: DepositBooking };
  decisionReason: string;
  onReasonChange: (v: string) => void;
  onDecision: (s: RefundStatus) => void;
  onClose: () => void;
  updating: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#1d1d1f] font-semibold">Refund Request</h2>
            <p className="text-[#6e6e73] text-xs font-mono mt-0.5">{refund.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {refund.booking && (
            <div className="grid grid-cols-2 gap-3">
              <InfoBlock label="Buyer" value={refund.booking.buyer_name} sub={refund.booking.buyer_email} />
              <InfoBlock label="Deposit paid" value={`$${refund.booking.deposit_amount.toLocaleString()}`} highlight />
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-orange-700 text-xs font-semibold uppercase tracking-wide mb-2">
              Category: {refund.reason_category.replace(/_/g, ' ')}
            </p>
            <p className="text-[#6e6e73] text-sm leading-relaxed">{refund.reason}</p>
          </div>

          <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4 space-y-2 text-xs text-[#6e6e73]">
            <p className="font-semibold text-[#1d1d1f] mb-2">Platform refund policy reminder</p>
            <p>Refund may be granted if: seller cannot provide opportunity, seller changes key terms, slot unavailable due to error, or booking cannot proceed under normal industry practice.</p>
            <p>Refund may NOT be granted if: buyer changes mind, fails to respond, fails seller approval requirements, or requests changes outside original scope.</p>
          </div>

          {refund.status === 'pending' && (
            <>
              <div>
                <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Decision reason (required)</label>
                <textarea
                  value={decisionReason}
                  onChange={e => onReasonChange(e.target.value)}
                  placeholder="Explain the reason for approving or denying this refund request..."
                  rows={3}
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onDecision('approved')}
                  disabled={updating || !decisionReason.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve Refund
                </button>
                <button
                  onClick={() => onDecision('denied')}
                  disabled={updating || !decisionReason.trim()}
                  className="flex-1 bg-[#f5f5f7] hover:bg-white border border-black/[0.08] disabled:opacity-40 text-[#1d1d1f] font-semibold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Deny
                </button>
              </div>
            </>
          )}

          {refund.status !== 'pending' && (
            <div className={`rounded-2xl p-4 border ${refund.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-[#f5f5f7] border-black/[0.08]'}`}>
              <p className={`text-xs font-semibold mb-1 ${refund.status === 'approved' ? 'text-green-700' : 'text-[#6e6e73]'}`}>
                {refund.status === 'approved' ? 'Refund Approved' : 'Refund Denied'}
              </p>
              {refund.admin_decision_reason && (
                <p className="text-[#6e6e73] text-sm">{refund.admin_decision_reason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function getSessionToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
}

function EmailsPanel() {
  const DIGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-opportunity-digest`;

  const [digestLoading, setDigestLoading] = useState(false);
  const [digestResult, setDigestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [welcomeRole, setWelcomeRole] = useState<'buyer' | 'seller'>('buyer');
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [welcomeResult, setWelcomeResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [bookingId, setBookingId] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ ok: boolean; message: string } | null>(null);

  const triggerDigest = async () => {
    setDigestLoading(true);
    setDigestResult(null);
    try {
      const token = await getSessionToken();
      const res = await fetch(DIGEST_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force_all: true }),
      });
      const text = await res.text();
      setDigestResult({ ok: res.ok, message: res.ok ? 'Digest sent successfully to all eligible buyers.' : `Error: ${text}` });
    } catch (e) {
      setDigestResult({ ok: false, message: `Network error: ${e}` });
    }
    setDigestLoading(false);
  };

  const sendWelcome = async () => {
    if (!buyerEmail.trim()) return;
    setWelcomeLoading(true);
    setWelcomeResult(null);
    try {
      const token = await getSessionToken();
      const type = welcomeRole === 'seller' ? 'welcome_seller' : 'welcome_buyer';
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, to: buyerEmail.trim(), data: { display_name: buyerName.trim() || buyerEmail.trim() } }),
      });
      if (res.ok) {
        setWelcomeResult({ ok: true, message: `Welcome email sent to ${buyerEmail.trim()}.` });
      } else {
        const body = await res.json().catch(() => ({}));
        const detail = body?.error || body?.message || `HTTP ${res.status}`;
        setWelcomeResult({ ok: false, message: `Failed to send email: ${detail}` });
      }
    } catch (e) {
      setWelcomeResult({ ok: false, message: `Network error: ${e}` });
    }
    setWelcomeLoading(false);
  };

  const resendBookingEmails = async () => {
    if (!bookingId.trim()) return;
    setBookingLoading(true);
    setBookingResult(null);
    try {
      const { data: booking, error } = await supabase
        .from('deposit_bookings')
        .select('*, listing:listings(property_name, media_type, original_price, discounted_price, slots_remaining, deadline_at, seller_email)')
        .eq('id', bookingId.trim())
        .maybeSingle();

      if (error || !booking) {
        setBookingResult({ ok: false, message: 'Booking not found. Check the ID.' });
        setBookingLoading(false);
        return;
      }

      const listing = booking.listing as Record<string, unknown> | null;
      const emailData = {
        booking_id: booking.id,
        property_name: listing?.property_name ?? '',
        media_type: listing?.media_type ?? '',
        original_price: listing?.original_price ?? 0,
        discounted_price: listing?.discounted_price ?? 0,
        deposit_amount: booking.deposit_amount,
        balance_due: booking.balance_due,
        slots: booking.slots_count ?? 1,
        deadline_at: listing?.deadline_at ?? '',
        seller_email: listing?.seller_email ?? '',
        buyer_name: booking.buyer_name,
        buyer_company: booking.buyer_company ?? '',
        buyer_email: booking.buyer_email,
        contact_name: booking.contact_name ?? '',
        phone: booking.phone ?? '',
      };

      const token = await getSessionToken();
      const SEND = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const [buyerRes, sellerRes] = await Promise.all([
        fetch(SEND, { method: 'POST', headers, body: JSON.stringify({ type: 'booking_confirmation_buyer', to: booking.buyer_email, data: emailData }) }),
        listing?.seller_email ? fetch(SEND, { method: 'POST', headers, body: JSON.stringify({ type: 'booking_confirmation_seller', to: listing.seller_email, data: emailData }) }) : Promise.resolve(new Response(null, { status: 200 })),
      ]);
      const errors: string[] = [];
      if (!buyerRes.ok) {
        const b = await buyerRes.json().catch(() => ({}));
        errors.push(`Buyer: ${b?.error || `HTTP ${buyerRes.status}`}`);
      }
      if (listing?.seller_email && !sellerRes.ok) {
        const b = await sellerRes.json().catch(() => ({}));
        errors.push(`Seller: ${b?.error || `HTTP ${sellerRes.status}`}`);
      }
      if (errors.length) {
        setBookingResult({ ok: false, message: `Some emails failed — ${errors.join('; ')}` });
      } else {
        setBookingResult({ ok: true, message: `Booking confirmation resent to ${booking.buyer_email}${listing?.seller_email ? ` and ${listing.seller_email}` : ''}.` });
      }
    } catch (e) {
      setBookingResult({ ok: false, message: `Failed to resend booking emails: ${e}` });
    }
    setBookingLoading(false);
  };

  const ResultBadge = ({ result }: { result: { ok: boolean; message: string } }) => (
    <div className={`flex items-start gap-2 mt-3 p-3 rounded-2xl border text-sm ${result.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
      {result.ok ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
      {result.message}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <AdminSectionHeader
        icon={<Send className="w-4 h-4" />}
        title="Resend Emails"
        desc="Manually trigger platform emails. Use the digest blast to push new opportunities to all opted-in buyers. Use the welcome email tool to re-onboard a specific user who missed their original email."
        tip="The digest blast is safe to run at any time — it only sends to buyers who opted in. Run it after publishing a new batch of slots."
      />

      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-sm">Opportunity Digest Blast</h2>
            <p className="text-[#aeaeb2] text-xs">Trigger the digest email to all buyers with digest enabled</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[#6e6e73] text-sm mb-4">
            This sends the opportunity digest to every buyer who has digest emails enabled, regardless of their last sent time. Use this after adding new listings or when you want to push a manual campaign.
          </p>
          <button
            onClick={triggerDigest}
            disabled={digestLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all text-sm"
          >
            {digestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {digestLoading ? 'Sending...' : 'Send Digest to All Buyers'}
          </button>
          {digestResult && <ResultBadge result={digestResult} />}
        </div>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
            <Mail className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-sm">Resend Welcome Email</h2>
            <p className="text-[#aeaeb2] text-xs">Re-send the onboarding welcome email to a specific user</p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider block mb-1">Email Address</label>
              <input
                type="email"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-4 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider block mb-1">Display Name</label>
              <input
                type="text"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-4 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider block mb-1">Role</label>
            <div className="flex gap-2">
              {(['buyer', 'seller'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setWelcomeRole(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${welcomeRole === r ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.08] hover:text-[#1d1d1f]'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={sendWelcome}
            disabled={welcomeLoading || !buyerEmail.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all text-sm"
          >
            {welcomeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {welcomeLoading ? 'Sending...' : 'Send Welcome Email'}
          </button>
          {welcomeResult && <ResultBadge result={welcomeResult} />}
        </div>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-sm">Resend Booking Confirmation</h2>
            <p className="text-[#aeaeb2] text-xs">Re-send booking confirmation to buyer and seller for a specific booking</p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider block mb-1">Booking ID</label>
            <input
              type="text"
              value={bookingId}
              onChange={e => setBookingId(e.target.value)}
              placeholder="Paste the booking UUID here"
              className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-4 py-2.5 text-[#1d1d1f] text-sm font-mono placeholder-[#aeaeb2] outline-none transition-all"
            />
            <p className="text-[#aeaeb2] text-xs mt-1">You can find the booking ID in the Bookings tab by clicking a booking.</p>
          </div>
          <button
            onClick={resendBookingEmails}
            disabled={bookingLoading || !bookingId.trim()}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all text-sm"
          >
            {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {bookingLoading ? 'Resending...' : 'Resend Booking Emails'}
          </button>
          {bookingResult && <ResultBadge result={bookingResult} />}
        </div>
      </div>

    </div>
  );
}

function SettingsPanel() {
  const [stripeKey, setStripeKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'stripe_publishable_key')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setStripeKey(data.value);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('platform_settings')
      .upsert({ key: 'stripe_publishable_key', value: stripeKey.trim(), updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const maskedKey = stripeKey
    ? stripeKey.slice(0, 8) + '••••••••••••••••' + stripeKey.slice(-4)
    : '';

  return (
    <div className="max-w-xl">
      <AdminSectionHeader
        icon={<Settings className="w-4 h-4" />}
        title="Settings"
        desc="Platform configuration — payment keys and integration settings. Only change these when updating payment providers or adding new integrations. Incorrect keys will break checkout."
        tip="The Stripe publishable key starts with pk_live_ (production) or pk_test_ (test mode). Do not use the secret key here."
      />
      <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.08] rounded-xl flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#1d1d1f]" />
          </div>
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-sm">Platform Settings</h2>
            <p className="text-[#aeaeb2] text-xs">Configure payment and integration keys</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-3.5 h-3.5 text-[#86868b]" />
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">
                Stripe Publishable Key
              </label>
            </div>
            <p className="text-[#aeaeb2] text-xs mb-3">
              Your Stripe publishable key starts with <span className="font-mono font-semibold text-[#6e6e73]">pk_live_</span> (live) or <span className="font-mono font-semibold text-[#6e6e73]">pk_test_</span> (test). Find it in your{' '}
              <span className="text-[#1d1d1f] font-medium">Stripe Dashboard &rarr; Developers &rarr; API Keys</span>.
            </p>

            {loading ? (
              <div className="h-11 bg-[#f5f5f7] rounded-2xl animate-pulse" />
            ) : (
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={stripeKey}
                  onChange={e => setStripeKey(e.target.value)}
                  placeholder="pk_live_... or pk_test_..."
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-4 py-3 text-[#1d1d1f] text-sm font-mono placeholder-[#aeaeb2] outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {stripeKey && !showKey && (
              <p className="mt-2 text-[#aeaeb2] text-xs font-mono">{maskedKey}</p>
            )}
          </div>

          <div className="pt-2 border-t border-black/[0.06] flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !stripeKey.trim()}
              className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-2xl transition-all text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Key'}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Saved successfully
              </div>
            )}
          </div>

          <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
            <p className="text-[#86868b] text-xs font-semibold mb-2">How to find your Stripe key</p>
            <ol className="text-[#6e6e73] text-xs space-y-1 list-decimal list-inside">
              <li>Go to <span className="font-semibold text-[#1d1d1f]">stripe.com</span> and log in</li>
              <li>Click <span className="font-semibold text-[#1d1d1f]">Developers</span> in the top navigation</li>
              <li>Click <span className="font-semibold text-[#1d1d1f]">API Keys</span></li>
              <li>Copy the <span className="font-semibold text-[#1d1d1f]">Publishable key</span> (starts with pk_)</li>
              <li>Paste it into the field above and click Save</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared admin section header ───────────────────────────────────────────────

function AdminSectionHeader({ icon, title, desc, tip }: { icon: React.ReactNode; title: string; desc: string; tip?: string }) {
  return (
    <div className="flex items-start gap-3 bg-white border border-black/[0.06] rounded-2xl px-5 py-4 mb-5">
      <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.06] rounded-xl flex items-center justify-center text-[#6e6e73] shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[#1d1d1f] font-semibold text-sm">{title}</p>
        <p className="text-[#6e6e73] text-xs mt-0.5 leading-relaxed">{desc}</p>
        {tip && (
          <div className="flex items-center gap-1.5 mt-2">
            <Info className="w-3 h-3 text-[#aeaeb2] shrink-0" />
            <p className="text-[#aeaeb2] text-[11px]">{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Overview Panel ──────────────────────────────────────────────────────

interface OverviewStats {
  total: number;
  secured: number;
  totalDeposits: number;
  pendingRefunds: number;
  pendingEmailSlots: number;
  pendingCsvSlots: number;
}

function AdminOverviewPanel({ stats, onNavigate }: { stats: OverviewStats; onNavigate: (tab: AdminTab) => void }) {
  const dailyTasks = [
    { tab: 'email_submissions' as AdminTab, icon: <Mail className="w-4 h-4" />, title: 'Email Inbox', badge: stats.pendingEmailSlots, badgeColor: 'bg-blue-500', desc: 'Sellers email in their slots. We parse them automatically. Review each one, fix errors, then publish the good ones to the marketplace.', urgency: stats.pendingEmailSlots > 0 ? 'action' : 'clear' },
    { tab: 'csv_uploads' as AdminTab, icon: <Upload className="w-4 h-4" />, title: 'CSV Uploads', badge: stats.pendingCsvSlots, badgeColor: 'bg-[#6e6e73]', desc: 'Sellers upload a CSV of their weekly slots. Review rows grouped by newsletter, approve or reject individual slots, then publish.', urgency: stats.pendingCsvSlots > 0 ? 'action' : 'clear' },
    { tab: 'refunds' as AdminTab, icon: <RotateCcw className="w-4 h-4" />, title: 'Refund Requests', badge: stats.pendingRefunds, badgeColor: 'bg-orange-500', desc: 'Buyers request refunds after securing a slot. Review the reason, approve or decline, and the booking status updates automatically.', urgency: stats.pendingRefunds > 0 ? 'warn' : 'clear' },
    { tab: 'name_changes' as AdminTab, icon: <FileText className="w-4 h-4" />, title: 'Name Changes', badge: 0, badgeColor: '', desc: 'Sellers cannot directly rename their newsletters or publisher profiles. Requests come here for you to approve or reject and apply.', urgency: 'clear' },
  ];

  const weeklyTasks = [
    { tab: 'publisher_imports' as AdminTab, icon: <List className="w-4 h-4" />, title: 'Publisher Imports', desc: 'The primary tool for bulk-importing publisher slot data. Upload a CSV on behalf of a publisher, review the structured preview, then publish batches live.' },
    { tab: 'sellers' as AdminTab, icon: <UserPlus className="w-4 h-4" />, title: 'Managed Sellers', desc: 'Add newsletter owners to the platform before they sign up. Create their profile, add newsletters and listings on their behalf, then invite them to claim the account.' },
    { tab: 'emails' as AdminTab, icon: <Send className="w-4 h-4" />, title: 'Resend Emails', desc: 'Trigger the weekly opportunity digest to all buyers who opted in. Also use this to re-send welcome emails to specific users.' },
  ];

  const systemTasks = [
    { tab: 'bookings' as AdminTab, icon: <DollarSign className="w-4 h-4" />, title: 'Bookings', desc: 'All buyer bookings in one place. Deposits are collected at checkout. Update booking status as deals progress through to completion.' },
    { tab: 'settings' as AdminTab, icon: <Settings className="w-4 h-4" />, title: 'Settings', desc: 'Platform configuration — Stripe publishable key and other integration settings. Change these only when updating payment providers.' },
  ];

  return (
    <div className="max-w-4xl space-y-8">

      {/* Hero orientation */}
      <div className="bg-white border border-black/[0.06] rounded-3xl px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-base mb-1">Welcome to the Admin Dashboard</h2>
            <p className="text-[#6e6e73] text-sm leading-relaxed max-w-2xl">
              This dashboard is the operational hub for EndingThisWeek.media. Your job is to keep the marketplace running smoothly — reviewing and publishing seller content, managing bookings, handling refunds, and maintaining seller accounts. Use the tabs above to navigate. Start with the daily queue below.
            </p>
          </div>
        </div>
      </div>

      {/* Daily queue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f]" />
          <p className="text-[11px] font-bold text-[#1d1d1f] uppercase tracking-widest">Daily queue — check these every day</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dailyTasks.map(t => (
            <button
              key={t.tab}
              onClick={() => onNavigate(t.tab)}
              className={`text-left bg-white border rounded-2xl p-4 hover:shadow-sm transition-all group ${t.urgency === 'action' ? 'border-blue-200 hover:border-blue-300' : t.urgency === 'warn' ? 'border-orange-200 hover:border-orange-300' : 'border-black/[0.06] hover:border-black/[0.12]'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${t.urgency === 'action' ? 'bg-blue-50 text-blue-600' : t.urgency === 'warn' ? 'bg-orange-50 text-orange-600' : 'bg-[#f5f5f7] text-[#6e6e73]'}`}>
                    {t.icon}
                  </div>
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">{t.title}</p>
                </div>
                {t.badge > 0 && (
                  <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full shrink-0 ${t.badgeColor}`}>
                    {t.badge} pending
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">{t.desc}</p>
              <p className="text-[11px] font-semibold text-[#aeaeb2] group-hover:text-[#1d1d1f] mt-2 transition-colors">Open →</p>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly tasks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6e6e73]" />
          <p className="text-[11px] font-bold text-[#6e6e73] uppercase tracking-widest">Weekly tasks</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {weeklyTasks.map(t => (
            <button
              key={t.tab}
              onClick={() => onNavigate(t.tab)}
              className="text-left bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl p-4 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-[#f5f5f7] rounded-xl flex items-center justify-center text-[#6e6e73] shrink-0">
                  {t.icon}
                </div>
                <p className="text-[13px] font-semibold text-[#1d1d1f]">{t.title}</p>
              </div>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">{t.desc}</p>
              <p className="text-[11px] font-semibold text-[#aeaeb2] group-hover:text-[#1d1d1f] mt-2 transition-colors">Open →</p>
            </button>
          ))}
        </div>
      </div>

      {/* System / reference */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#aeaeb2]" />
          <p className="text-[11px] font-bold text-[#aeaeb2] uppercase tracking-widest">System &amp; reference</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {systemTasks.map(t => (
            <button
              key={t.tab}
              onClick={() => onNavigate(t.tab)}
              className="text-left bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl p-4 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-[#f5f5f7] rounded-xl flex items-center justify-center text-[#aeaeb2] shrink-0">
                  {t.icon}
                </div>
                <p className="text-[13px] font-semibold text-[#1d1d1f]">{t.title}</p>
              </div>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">{t.desc}</p>
              <p className="text-[11px] font-semibold text-[#aeaeb2] group-hover:text-[#1d1d1f] mt-2 transition-colors">Open →</p>
            </button>
          ))}
        </div>
      </div>

      {/* How the platform works */}
      <div className="bg-[#1d1d1f] rounded-3xl px-6 py-6">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">How the platform works</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {[
            { n: '1', title: 'Sellers list their slots', desc: 'Via email submission, CSV upload, or the listing form. All come to you for review before going live.' },
            { n: '2', title: 'You publish approved slots', desc: 'Once reviewed, slots become live listings on the marketplace — visible to all buyers.' },
            { n: '3', title: 'Buyers secure slots', desc: 'Buyers pay a deposit at checkout. You get notified and can track progress in the Bookings tab.' },
            { n: '4', title: 'Deals complete off-platform', desc: 'Buyer and seller finalise the deal directly. You mark the booking as complete.' },
          ].map(s => (
            <div key={s.n} className="flex gap-3">
              <span className="text-[11px] font-mono font-bold text-white/20 shrink-0 pt-0.5">{s.n}</span>
              <div>
                <p className="text-[12px] font-semibold text-white mb-0.5">{s.title}</p>
                <p className="text-[11px] text-white/40 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

interface NameChangeRequest {
  id: string;
  entity_type: 'publisher' | 'newsletter';
  entity_id: string;
  current_name: string;
  requested_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  seller_user_id: string;
  seller_email: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

function NameChangeRequestsPanel() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<NameChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('name_change_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data as NameChangeRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    setReviewing(id);
    const req = requests.find(r => r.id === id);
    if (!req) return;

    await supabase.from('name_change_requests').update({
      status,
      admin_notes: adminNotes.trim() || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.email ?? '',
    }).eq('id', id);

    if (status === 'approved') {
      if (req.entity_type === 'publisher') {
        await supabase.from('media_profiles').update({ newsletter_name: req.requested_name }).eq('id', req.entity_id);
      } else {
        await supabase.from('newsletters').update({ name: req.requested_name }).eq('id', req.entity_id);
      }
    }

    setReviewing(null);
    setAdminNotes('');
    await fetchRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#1d1d1f] animate-spin" />
      </div>
    );
  }

  const pending = requests.filter(r => r.status === 'pending');
  const decided = requests.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-[#1d1d1f] font-semibold text-base mb-0.5">Name Change Requests</h2>
        <p className="text-[#6e6e73] text-sm">Review and approve or reject seller requests to change publisher or newsletter names.</p>
      </div>

      {pending.length === 0 && (
        <div className="bg-white border border-black/[0.06] rounded-3xl px-6 py-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-[#1d1d1f] font-semibold text-sm">All caught up</p>
          <p className="text-[#6e6e73] text-sm mt-1">No pending name change requests.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Pending ({pending.length})</p>
          {pending.map(req => (
            <div key={req.id} className="bg-white border border-orange-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-black/[0.06] flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                        {req.entity_type === 'publisher' ? 'Publisher name' : 'Newsletter name'}
                      </span>
                      <span className="text-[#aeaeb2] text-xs">{req.seller_email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[#6e6e73] text-sm line-through">{req.current_name}</span>
                      <span className="text-[#aeaeb2] text-xs">→</span>
                      <span className="text-[#1d1d1f] text-sm font-semibold">{req.requested_name}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[#aeaeb2] text-xs shrink-0">{new Date(req.created_at).toLocaleDateString()}</span>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-1">Reason</p>
                  <p className="text-[#1d1d1f] text-sm">{req.reason}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5">Admin notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    rows={2}
                    placeholder="Add a note visible to the seller..."
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => decide(req.id, 'approved')}
                    disabled={reviewing === req.id}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                  >
                    {reviewing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                    Approve &amp; Apply
                  </button>
                  <button
                    onClick={() => decide(req.id, 'rejected')}
                    disabled={reviewing === req.id}
                    className="flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.18] disabled:opacity-40 text-[#6e6e73] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">History ({decided.length})</p>
          {decided.map(req => (
            <div key={req.id} className="bg-white border border-black/[0.06] rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${req.status === 'approved' ? 'bg-green-100' : 'bg-[#f5f5f7]'}`}>
                {req.status === 'approved'
                  ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  : <XCircle className="w-3.5 h-3.5 text-[#aeaeb2]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#aeaeb2]">
                    {req.entity_type === 'publisher' ? 'Publisher' : 'Newsletter'}
                  </span>
                  <span className="text-[#6e6e73] text-sm line-through truncate">{req.current_name}</span>
                  <span className="text-[#aeaeb2] text-xs">→</span>
                  <span className="text-[#1d1d1f] text-sm font-medium truncate">{req.requested_name}</span>
                </div>
                <p className="text-[#aeaeb2] text-xs mt-0.5">{req.seller_email} · {new Date(req.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-[#f5f5f7] text-[#aeaeb2]'}`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-2xl p-4 ${warn ? 'border-orange-200' : 'border-black/[0.06]'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-[#6e6e73] text-xs">{label}</p></div>
      <p className={`text-2xl font-bold tracking-[-0.02em] ${highlight ? 'text-green-600' : warn ? 'text-orange-600' : 'text-[#1d1d1f]'}`}>
        {value}
      </p>
    </div>
  );
}

function InfoBlock({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3">
      <p className="text-[#86868b] text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-green-600' : 'text-[#1d1d1f]'}`}>{value}</p>
      {sub && <p className="text-[#aeaeb2] text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

const NEWSLETTER_NICHES = [
  'B2B SaaS', 'Marketing', 'Finance', 'Fintech', 'Startup', 'Tech', 'AI',
  'eCommerce', 'Health & Wellness', 'Education', 'Crypto', 'General',
];

const GEOGRAPHIES = [
  'US', 'UK', 'US / UK', 'Europe', 'Global', 'APAC', 'Canada', 'Australia',
];

const SEND_FREQUENCIES = ['Daily', 'Weekdays', 'Weekly', 'Bi-weekly', 'Monthly'];

const SLOT_TYPES = [
  'Sponsored post', 'Dedicated send', 'Banner ad', 'Classified ad',
  'Podcast ad', 'Social post', 'Product feature', 'Newsletter mention', 'Other',
];

interface SellersPanelProps {
  sellers: ManagedSeller[];
  onRefresh: () => void;
}

type SellerView = 'list' | 'create_seller' | 'seller_detail';

function SellersPanel({ sellers, onRefresh }: SellersPanelProps) {
  const [view, setView] = useState<SellerView>('list');
  const [selectedSeller, setSelectedSeller] = useState<ManagedSeller | null>(null);
  const [saving, setSaving] = useState(false);
  const [inviteSending, setInviteSending] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [sellerForm, setSellerForm] = useState({ email: '', display_name: '', company: '', notes: '' });
  const [newsletterForm, setNewsletterForm] = useState({
    name: '', publisher_name: '', subscriber_count: '', avg_open_rate: '',
    niche: '', primary_geography: '', send_frequency: '', description: '', website_url: '',
  });
  const [listingForm, setListingForm] = useState({
    property_name: '', slot_type: 'Sponsored post', date_label: '', deadline_at: '',
    original_price: '', audience: '', location: '', subscribers: '', open_rate: '',
    auto_discount_enabled: true, deliverables_detail: '',
  });
  const [subView, setSubView] = useState<'overview' | 'add_newsletter' | 'add_listing'>('overview');
  const [sellerNewsletters, setSellerNewsletters] = useState<any[]>([]);
  const [sellerListings, setSellerListings] = useState<any[]>([]);

  const fetchSellerData = async (email: string) => {
    const [nlRes, lstRes] = await Promise.all([
      supabase.from('newsletters').select('*').eq('seller_email', email).order('created_at', { ascending: false }),
      supabase.from('listings').select('*, newsletter:newsletters(name)').eq('seller_email', email).order('created_at', { ascending: false }),
    ]);
    setSellerNewsletters(nlRes.data ?? []);
    setSellerListings(lstRes.data ?? []);
  };

  const openSellerDetail = (seller: ManagedSeller) => {
    setSelectedSeller(seller);
    setSubView('overview');
    fetchSellerData(seller.email);
    setView('seller_detail');
  };

  const createSeller = async () => {
    if (!sellerForm.email.trim() || !sellerForm.display_name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('managed_sellers').insert({
      email: sellerForm.email.trim().toLowerCase(),
      display_name: sellerForm.display_name.trim(),
      company: sellerForm.company.trim(),
      notes: sellerForm.notes.trim(),
    });
    if (!error) {
      setSellerForm({ email: '', display_name: '', company: '', notes: '' });
      onRefresh();
      setView('list');
    }
    setSaving(false);
  };

  const sendInvite = async (seller: ManagedSeller) => {
    setInviteSending(seller.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-seller-invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: seller.id, email: seller.email, display_name: seller.display_name, company: seller.company }),
      });
      const json = await res.json();
      if (json.claim_url) {
        await navigator.clipboard.writeText(json.claim_url).catch(() => {});
        setCopiedUrl(json.claim_url);
        setTimeout(() => setCopiedUrl(null), 4000);
      }
      onRefresh();
    } catch { /* silent */ }
    setInviteSending(null);
  };

  const createNewsletter = async () => {
    if (!selectedSeller || !newsletterForm.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('newsletters').insert({
      seller_email: selectedSeller.email,
      seller_user_id: null,
      name: newsletterForm.name.trim(),
      publisher_name: newsletterForm.publisher_name.trim() || selectedSeller.company,
      subscriber_count: newsletterForm.subscriber_count ? parseInt(newsletterForm.subscriber_count, 10) : null,
      avg_open_rate: newsletterForm.avg_open_rate.trim() || null,
      niche: newsletterForm.niche || null,
      primary_geography: newsletterForm.primary_geography || null,
      send_frequency: newsletterForm.send_frequency || null,
      description: newsletterForm.description.trim() || null,
      website_url: newsletterForm.website_url.trim() || null,
      is_active: true,
    });
    if (!error) {
      setNewsletterForm({ name: '', publisher_name: '', subscriber_count: '', avg_open_rate: '', niche: '', primary_geography: '', send_frequency: '', description: '', website_url: '' });
      await fetchSellerData(selectedSeller.email);
      setSubView('overview');
    }
    setSaving(false);
  };

  const createListing = async () => {
    if (!selectedSeller || !listingForm.property_name.trim() || !listingForm.deadline_at || !listingForm.original_price) return;
    setSaving(true);
    const price = Math.round(Number(listingForm.original_price));
    const { error } = await supabase.from('listings').insert({
      media_type: 'newsletter',
      seller_user_id: null,
      seller_email: selectedSeller.email,
      media_owner_name: selectedSeller.display_name,
      media_company_name: selectedSeller.company,
      property_name: listingForm.property_name.trim(),
      slot_type: listingForm.slot_type,
      date_label: listingForm.date_label.trim(),
      deadline_at: new Date(listingForm.deadline_at).toISOString(),
      original_price: price,
      discounted_price: price,
      audience: listingForm.audience || 'General',
      location: listingForm.location || 'Global',
      subscribers: listingForm.subscribers ? parseInt(listingForm.subscribers, 10) : null,
      open_rate: listingForm.open_rate.trim() || null,
      auto_discount_enabled: listingForm.auto_discount_enabled,
      deliverables_detail: listingForm.deliverables_detail.trim() || null,
      slots_remaining: 1,
      slots_total: 1,
      status: 'live',
    });
    if (!error) {
      setListingForm({ property_name: '', slot_type: 'Sponsored post', date_label: '', deadline_at: '', original_price: '', audience: '', location: '', subscribers: '', open_rate: '', auto_discount_enabled: true, deliverables_detail: '' });
      await fetchSellerData(selectedSeller.email);
      setSubView('overview');
    }
    setSaving(false);
  };

  const inputCls = "w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all";
  const selectCls = inputCls + " [color-scheme:light]";
  const labelCls = "block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5";

  if (view === 'create_seller') {
    return (
      <div className="max-w-lg">
        <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm mb-6 transition-colors">
          ← Back to sellers
        </button>
        <h2 className="text-[#1d1d1f] font-semibold text-lg mb-1">Create seller account</h2>
        <p className="text-[#6e6e73] text-sm mb-6">Add a newsletter owner. You can then create newsletters and listings on their behalf, and invite them to claim the account.</p>
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-4">
          <div>
            <label className={labelCls}>Email address <span className="text-red-400">*</span></label>
            <input type="email" value={sellerForm.email} onChange={e => setSellerForm(p => ({ ...p, email: e.target.value }))} placeholder="publisher@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Display name <span className="text-red-400">*</span></label>
            <input type="text" value={sellerForm.display_name} onChange={e => setSellerForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Jane Smith" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Company / Publisher</label>
            <input type="text" value={sellerForm.company} onChange={e => setSellerForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. B2B Growth Co." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Admin notes</label>
            <textarea value={sellerForm.notes} onChange={e => setSellerForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Internal notes about this seller…" className={inputCls + " resize-none"} />
          </div>
          <button onClick={createSeller} disabled={saving || !sellerForm.email.trim() || !sellerForm.display_name.trim()} className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create seller account
          </button>
        </div>
      </div>
    );
  }

  if (view === 'seller_detail' && selectedSeller) {
    return (
      <div>
        <button onClick={() => { setView('list'); setSelectedSeller(null); }} className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm mb-6 transition-colors">
          ← Back to sellers
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-lg">{selectedSeller.display_name}</h2>
            <p className="text-[#6e6e73] text-sm">{selectedSeller.email}{selectedSeller.company ? ` · ${selectedSeller.company}` : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${selectedSeller.account_claimed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {selectedSeller.account_claimed ? 'Claimed' : 'Unclaimed'}
            </span>
            <button
              onClick={() => sendInvite(selectedSeller)}
              disabled={!!inviteSending}
              className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-all"
            >
              {inviteSending === selectedSeller.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send invite
            </button>
          </div>
        </div>

        {copiedUrl && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-green-800 text-sm font-semibold">Invite sent! Claim URL copied to clipboard.</p>
              <p className="text-green-700 text-xs mt-0.5 truncate">{copiedUrl}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(copiedUrl); }} className="flex-shrink-0">
              <Copy className="w-3.5 h-3.5 text-green-600" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 mb-6 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit">
          {([['overview', 'Overview'], ['add_newsletter', 'Add Newsletter'], ['add_listing', 'Add Listing']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSubView(key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${subView === key ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}>{label}</button>
          ))}
        </div>

        {subView === 'overview' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#1d1d1f] font-semibold text-sm flex items-center gap-2"><BookOpen className="w-4 h-4" /> Newsletters ({sellerNewsletters.length})</h3>
                <button onClick={() => setSubView('add_newsletter')} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08] px-2.5 py-1 rounded-lg transition-all">+ Add</button>
              </div>
              {sellerNewsletters.length === 0 ? (
                <p className="text-[#aeaeb2] text-sm">No newsletters yet.</p>
              ) : (
                <div className="space-y-2">
                  {sellerNewsletters.map(nl => (
                    <div key={nl.id} className="bg-white border border-black/[0.06] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[#1d1d1f] font-semibold text-sm">{nl.name}</p>
                        <p className="text-[#6e6e73] text-xs">{[nl.niche, nl.primary_geography, nl.subscriber_count ? `${Number(nl.subscriber_count).toLocaleString()} subs` : null].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#1d1d1f] font-semibold text-sm flex items-center gap-2"><List className="w-4 h-4" /> Listings ({sellerListings.length})</h3>
                <button onClick={() => setSubView('add_listing')} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08] px-2.5 py-1 rounded-lg transition-all">+ Add</button>
              </div>
              {sellerListings.length === 0 ? (
                <p className="text-[#aeaeb2] text-sm">No listings yet.</p>
              ) : (
                <div className="space-y-2">
                  {sellerListings.map(l => (
                    <div key={l.id} className="bg-white border border-black/[0.06] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[#1d1d1f] font-semibold text-sm">{l.property_name}</p>
                        <p className="text-[#6e6e73] text-xs">{l.slot_type} · {l.date_label} · ${Number(l.original_price).toLocaleString()}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${l.status === 'live' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.08]'}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {subView === 'add_newsletter' && (
          <div className="max-w-lg bg-white border border-black/[0.06] rounded-3xl p-6 space-y-4">
            <h3 className="text-[#1d1d1f] font-semibold text-sm">Add newsletter for {selectedSeller.display_name}</h3>
            <div>
              <label className={labelCls}>Newsletter name <span className="text-red-400">*</span></label>
              <input type="text" value={newsletterForm.name} onChange={e => setNewsletterForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. SaaS Insider" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Publisher</label>
                <input type="text" value={newsletterForm.publisher_name} onChange={e => setNewsletterForm(p => ({ ...p, publisher_name: e.target.value }))} placeholder={selectedSeller.company} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subscribers</label>
                <input type="number" value={newsletterForm.subscriber_count} onChange={e => setNewsletterForm(p => ({ ...p, subscriber_count: e.target.value }))} placeholder="e.g. 45000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Avg open rate</label>
                <input type="text" value={newsletterForm.avg_open_rate} onChange={e => setNewsletterForm(p => ({ ...p, avg_open_rate: e.target.value }))} placeholder="e.g. 42%" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Niche</label>
                <select value={newsletterForm.niche} onChange={e => setNewsletterForm(p => ({ ...p, niche: e.target.value }))} className={selectCls}>
                  <option value="">Select…</option>
                  {NEWSLETTER_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Geography</label>
                <select value={newsletterForm.primary_geography} onChange={e => setNewsletterForm(p => ({ ...p, primary_geography: e.target.value }))} className={selectCls}>
                  <option value="">Select…</option>
                  {GEOGRAPHIES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Send frequency</label>
                <select value={newsletterForm.send_frequency} onChange={e => setNewsletterForm(p => ({ ...p, send_frequency: e.target.value }))} className={selectCls}>
                  <option value="">Select…</option>
                  {SEND_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Website URL</label>
              <input type="url" value={newsletterForm.website_url} onChange={e => setNewsletterForm(p => ({ ...p, website_url: e.target.value }))} placeholder="https://yournewsletter.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={newsletterForm.description} onChange={e => setNewsletterForm(p => ({ ...p, description: e.target.value }))} rows={2} className={inputCls + " resize-none"} placeholder="Brief audience description…" />
            </div>
            <div className="flex gap-2">
              <button onClick={createNewsletter} disabled={saving || !newsletterForm.name.trim()} className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                Save newsletter
              </button>
              <button onClick={() => setSubView('overview')} className="text-[#6e6e73] hover:text-[#1d1d1f] text-sm px-4 py-2.5 rounded-xl border border-black/[0.08] transition-all">Cancel</button>
            </div>
          </div>
        )}

        {subView === 'add_listing' && (
          <div className="max-w-lg bg-white border border-black/[0.06] rounded-3xl p-6 space-y-4">
            <h3 className="text-[#1d1d1f] font-semibold text-sm">Add listing for {selectedSeller.display_name}</h3>
            <div>
              <label className={labelCls}>Newsletter / Property name <span className="text-red-400">*</span></label>
              {sellerNewsletters.length > 0 ? (
                <select value={listingForm.property_name} onChange={e => {
                  const nl = sellerNewsletters.find(n => n.name === e.target.value);
                  setListingForm(p => ({
                    ...p,
                    property_name: e.target.value,
                    audience: nl?.niche ?? p.audience,
                    location: nl?.primary_geography ?? p.location,
                    subscribers: nl?.subscriber_count?.toString() ?? p.subscribers,
                    open_rate: nl?.avg_open_rate ?? p.open_rate,
                  }));
                }} className={selectCls}>
                  <option value="">Select newsletter…</option>
                  {sellerNewsletters.map(nl => <option key={nl.id} value={nl.name}>{nl.name}</option>)}
                </select>
              ) : (
                <input type="text" value={listingForm.property_name} onChange={e => setListingForm(p => ({ ...p, property_name: e.target.value }))} placeholder="e.g. SaaS Insider" className={inputCls} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Slot type <span className="text-red-400">*</span></label>
                <select value={listingForm.slot_type} onChange={e => setListingForm(p => ({ ...p, slot_type: e.target.value }))} className={selectCls}>
                  {SLOT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Price (USD) <span className="text-red-400">*</span></label>
                <input type="number" value={listingForm.original_price} onChange={e => setListingForm(p => ({ ...p, original_price: e.target.value }))} placeholder="e.g. 1500" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Issue date label <span className="text-red-400">*</span></label>
                <input type="text" value={listingForm.date_label} onChange={e => setListingForm(p => ({ ...p, date_label: e.target.value }))} placeholder="e.g. May 12 issue" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Booking deadline <span className="text-red-400">*</span></label>
                <input type="datetime-local" value={listingForm.deadline_at} onChange={e => setListingForm(p => ({ ...p, deadline_at: e.target.value }))} className={selectCls} />
              </div>
              <div>
                <label className={labelCls}>Niche / Audience</label>
                <select value={listingForm.audience} onChange={e => setListingForm(p => ({ ...p, audience: e.target.value }))} className={selectCls}>
                  <option value="">Select…</option>
                  {NEWSLETTER_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Geography</label>
                <select value={listingForm.location} onChange={e => setListingForm(p => ({ ...p, location: e.target.value }))} className={selectCls}>
                  <option value="">Select…</option>
                  {GEOGRAPHIES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Subscriber count</label>
                <input type="number" value={listingForm.subscribers} onChange={e => setListingForm(p => ({ ...p, subscribers: e.target.value }))} placeholder="e.g. 45000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Avg open rate</label>
                <input type="text" value={listingForm.open_rate} onChange={e => setListingForm(p => ({ ...p, open_rate: e.target.value }))} placeholder="e.g. 42%" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Deliverables detail</label>
              <textarea value={listingForm.deliverables_detail} onChange={e => setListingForm(p => ({ ...p, deliverables_detail: e.target.value }))} rows={2} className={inputCls + " resize-none"} placeholder="Word count, placement, format…" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={listingForm.auto_discount_enabled} onChange={e => setListingForm(p => ({ ...p, auto_discount_enabled: e.target.checked }))} className="w-4 h-4 rounded accent-[#1d1d1f]" />
                <span className="text-sm text-[#1d1d1f] font-medium">Enable auto-discount</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={createListing} disabled={saving || !listingForm.property_name.trim() || !listingForm.deadline_at || !listingForm.original_price} className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Publish listing
              </button>
              <button onClick={() => setSubView('overview')} className="text-[#6e6e73] hover:text-[#1d1d1f] text-sm px-4 py-2.5 rounded-xl border border-black/[0.08] transition-all">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <AdminSectionHeader
        icon={<UserPlus className="w-4 h-4" />}
        title="Managed Sellers"
        desc="Create seller accounts for newsletter owners before they sign up. Build out their profile — add newsletters and listings on their behalf — then send them an invite link to claim the account. They take over from there."
        tip="Once a seller claims their account they can log in and manage everything themselves. You still have full admin access."
      />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#1d1d1f] font-semibold text-base">Managed Sellers</h2>
          <p className="text-[#6e6e73] text-sm mt-0.5">Create and manage seller accounts on behalf of newsletter owners.</p>
        </div>
        <button onClick={() => setView('create_seller')} className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all">
          <UserPlus className="w-4 h-4" />
          Add seller
        </button>
      </div>

      {sellers.length === 0 ? (
        <div className="text-center py-16 text-[#aeaeb2]">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No managed sellers yet</p>
          <p className="text-xs">Create a seller account to manage newsletters and listings on their behalf.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map(seller => (
            <div key={seller.id} className="bg-white border border-black/[0.06] rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-sm text-[#1d1d1f]">{seller.display_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#1d1d1f] font-semibold text-sm">{seller.display_name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${seller.account_claimed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {seller.account_claimed ? 'Claimed' : 'Unclaimed'}
                  </span>
                </div>
                <p className="text-[#6e6e73] text-xs truncate">{seller.email}{seller.company ? ` · ${seller.company}` : ''}</p>
                {seller.invite_sent_at && (
                  <p className="text-[#aeaeb2] text-[10px] mt-0.5">Invite sent {new Date(seller.invite_sent_at).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => sendInvite(seller)} disabled={!!inviteSending} className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-xs border border-black/[0.08] hover:border-black/[0.15] px-2.5 py-1.5 rounded-lg transition-all">
                  {inviteSending === seller.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send invite
                </button>
                <button onClick={() => openSellerDetail(seller)} className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
                  <Eye className="w-3 h-3" />
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {copiedUrl && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1d1d1f] text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Invite sent · Claim URL copied to clipboard
        </div>
      )}
    </div>
  );
}

const _unused = { BarChart2, Globe, Percent, Zap };
