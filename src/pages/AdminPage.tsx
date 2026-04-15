import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DepositBooking, RefundRequest, BookingStatus, RefundStatus } from '../types';
import {
  Shield, AlertTriangle, CheckCircle, RefreshCw, X, ChevronDown, Users,
  DollarSign, FileText, RotateCcw, Ban, Play, Loader2, Eye,
} from 'lucide-react';

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = 'bookings' | 'refunds';

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
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundDecisionReason, setRefundDecisionReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, refundsRes] = await Promise.all([
      supabase
        .from('deposit_bookings')
        .select('*, listing:listings(property_name, media_owner_name, media_company_name, slot_type, date_label)')
        .order('created_at', { ascending: false }),
      supabase
        .from('refund_requests')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data as DepositBooking[]);
    if (refundsRes.data) setRefunds(refundsRes.data as RefundRequest[]);
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

  const stats = {
    total: bookings.length,
    secured: bookings.filter(b => b.status === 'secured').length,
    totalDeposits: bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.deposit_amount, 0),
    pendingRefunds: refunds.filter(r => r.status === 'pending').length,
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="w-4 h-4 text-[#86868b]" />} label="Total Bookings" value={stats.total} />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Secured" value={stats.secured} highlight />
          <StatCard icon={<DollarSign className="w-4 h-4 text-[#86868b]" />} label="Deposits Collected" value={`$${stats.totalDeposits.toLocaleString()}`} />
          <StatCard icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} label="Pending Refunds" value={stats.pendingRefunds} warn={stats.pendingRefunds > 0} />
        </div>

        <div className="flex items-center gap-1 mb-6 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit">
          {([['bookings', 'Bookings'], ['refunds', 'Refund Requests']] as [AdminTab, string][]).map(([key, label]) => (
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
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#1d1d1f] animate-spin" />
          </div>
        ) : tab === 'bookings' ? (
          <BookingsTable bookings={bookings} onSelect={setSelectedBooking} />
        ) : (
          <RefundsTable refunds={refunds} bookings={bookings} onSelect={(r) => {
            const booking = bookings.find(b => b.id === r.deposit_booking_id);
            setSelectedRefund({ ...r, booking });
          }} />
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
