import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DepositBooking, RefundRequest, BookingStatus, RefundStatus } from '../types';
import {
  Shield, AlertTriangle, CheckCircle, RefreshCw, X, ChevronDown, Users,
  DollarSign, FileText, RotateCcw, Ban, Play, Loader2, Eye, Settings, Key, Save, EyeOff,
  Mail, Clock, XCircle, ThumbsUp, ThumbsDown, ExternalLink,
} from 'lucide-react';

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
  submission?: EmailSubmission;
}

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = 'bookings' | 'refunds' | 'email_submissions' | 'settings';

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
  const [tab, setTab] = useState<AdminTab>('bookings');
  const [bookings, setBookings] = useState<DepositBooking[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DepositBooking | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<(RefundRequest & { booking?: DepositBooking }) | null>(null);
  const [emailSlots, setEmailSlots] = useState<EmailSubmissionSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<EmailSubmissionSlot | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundDecisionReason, setRefundDecisionReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, refundsRes, emailSlotsRes] = await Promise.all([
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
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data as DepositBooking[]);
    if (refundsRes.data) setRefunds(refundsRes.data as RefundRequest[]);
    if (emailSlotsRes.data) setEmailSlots(emailSlotsRes.data as EmailSubmissionSlot[]);
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

  const updateEmailSlotStatus = async (id: string, status: EmailSubmissionSlot['status'], notes?: string) => {
    setUpdating(true);
    await supabase
      .from('email_submission_slots')
      .update({
        status,
        admin_notes: notes ?? '',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Admin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    await fetchData();
    setSelectedSlot(null);
    setUpdating(false);
  };

  const stats = {
    total: bookings.length,
    secured: bookings.filter(b => b.status === 'secured').length,
    totalDeposits: bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.deposit_amount, 0),
    pendingRefunds: refunds.filter(r => r.status === 'pending').length,
    pendingEmailSlots: emailSlots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length,
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Users className="w-4 h-4 text-[#86868b]" />} label="Total Bookings" value={stats.total} />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Secured" value={stats.secured} highlight />
          <StatCard icon={<DollarSign className="w-4 h-4 text-[#86868b]" />} label="Deposits Collected" value={`$${stats.totalDeposits.toLocaleString()}`} />
          <StatCard icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} label="Pending Refunds" value={stats.pendingRefunds} warn={stats.pendingRefunds > 0} />
          <StatCard icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email Queue" value={stats.pendingEmailSlots} warn={stats.pendingEmailSlots > 0} />
        </div>

        <div className="flex items-center gap-1 mb-6 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit flex-wrap">
          {([['bookings', 'Bookings'], ['refunds', 'Refund Requests'], ['email_submissions', 'Email Submissions'], ['settings', 'Settings']] as [AdminTab, string][]).map(([key, label]) => (
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
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#1d1d1f] animate-spin" />
          </div>
        ) : tab === 'bookings' ? (
          <BookingsTable bookings={bookings} onSelect={setSelectedBooking} />
        ) : tab === 'refunds' ? (
          <RefundsTable refunds={refunds} bookings={bookings} onSelect={(r) => {
            const booking = bookings.find(b => b.id === r.deposit_booking_id);
            setSelectedRefund({ ...r, booking });
          }} />
        ) : tab === 'email_submissions' ? (
          <EmailSubmissionsTable slots={emailSlots} onSelect={setSelectedSlot} />
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
          onStatusChange={(status, notes) => updateEmailSlotStatus(selectedSlot.id, status, notes)}
          onClose={() => setSelectedSlot(null)}
          updating={updating}
        />
      )}
    </div>
  );
}

const EMAIL_SLOT_STATUS_CONFIG: Record<EmailSubmissionSlot['status'], { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pending Review', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  parsed_ok: { label: 'Parsed OK', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  needs_review: { label: 'Needs Review', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  rejected: { label: 'Rejected', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  published: { label: 'Published', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  expired: { label: 'Expired', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
};

function EmailSubmissionsTable({ slots, onSelect }: { slots: EmailSubmissionSlot[]; onSelect: (s: EmailSubmissionSlot) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | EmailSubmissionSlot['status']>('all');

  const filtered = statusFilter === 'all' ? slots : slots.filter(s => s.status === statusFilter);

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

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-blue-700 text-sm font-medium">{pendingCount} slot{pendingCount > 1 ? 's' : ''} awaiting review</p>
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
              <tr className="border-b border-black/[0.06]">
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Slot</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Sender</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Media</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Pricing</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map(slot => {
                const sc = EMAIL_SLOT_STATUS_CONFIG[slot.status];
                return (
                  <tr key={slot.id} className="hover:bg-[#f5f5f7] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#6e6e73] font-semibold">#{slot.slot_index}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#1d1d1f] text-sm font-medium">{slot.submission?.sender_name || '—'}</p>
                      <p className="text-[#aeaeb2] text-xs">{slot.submission?.sender_email}</p>
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
                          {slot.original_price && (
                            <p className="text-[#aeaeb2] text-xs line-through">{slot.original_price}</p>
                          )}
                        </div>
                      ) : <span className="text-[#aeaeb2] text-xs">—</span>}
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

function EmailSlotDetailPanel({ slot, onStatusChange, onClose, updating }: {
  slot: EmailSubmissionSlot;
  onStatusChange: (status: EmailSubmissionSlot['status'], notes: string) => void;
  onClose: () => void;
  updating: boolean;
}) {
  const [notes, setNotes] = useState(slot.admin_notes || '');
  const [showRaw, setShowRaw] = useState(false);
  const sc = EMAIL_SLOT_STATUS_CONFIG[slot.status];

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
              <Mail className="w-4 h-4 text-[#1d1d1f]" />
            </div>
            <div>
              <h2 className="text-[#1d1d1f] font-semibold">Email Submission — Slot #{slot.slot_index}</h2>
              <p className="text-[#6e6e73] text-xs mt-0.5">{slot.submission?.sender_email}</p>
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

          {(slot.status === 'pending_review' || slot.status === 'parsed_ok' || slot.status === 'needs_review') && (
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
      <div className="text-center py-16 text-[#aeaeb2]">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06]">
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
  );
}

function RefundsTable({ refunds, bookings, onSelect }: {
  refunds: RefundRequest[];
  bookings: DepositBooking[];
  onSelect: (r: RefundRequest) => void;
}) {
  if (refunds.length === 0) {
    return (
      <div className="text-center py-16 text-[#aeaeb2]">
        <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No refund requests</p>
      </div>
    );
  }

  const STATUS_CFG: Record<RefundStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    denied: { label: 'Denied', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  };

  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06]">
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
