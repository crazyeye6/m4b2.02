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
  pending_payment: { label: 'Pending Payment', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  secured: { label: 'Secured', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  completed_off_platform: { label: 'Completed', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  refund_requested: { label: 'Refund Requested', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  refunded: { label: 'Refunded', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-500/20' },
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
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="border-b border-white/8 bg-[#0d0d18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base">Admin Dashboard</h1>
              <p className="text-gray-600 text-xs">EndingThisWeek.media</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Back to site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="w-4 h-4 text-gray-400" />} label="Total Bookings" value={stats.total} />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} label="Secured" value={stats.secured} highlight />
          <StatCard icon={<DollarSign className="w-4 h-4 text-amber-400" />} label="Deposits Collected" value={`$${stats.totalDeposits.toLocaleString()}`} amber />
          <StatCard icon={<AlertTriangle className="w-4 h-4 text-orange-400" />} label="Pending Refunds" value={stats.pendingRefunds} warn={stats.pendingRefunds > 0} />
        </div>

        <div className="flex items-center gap-1 mb-6 bg-white/[0.03] border border-white/8 rounded-xl p-1 w-fit">
          {([['bookings', 'Bookings'], ['refunds', 'Refund Requests']] as [AdminTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
              {key === 'refunds' && stats.pendingRefunds > 0 && (
                <span className="ml-2 bg-orange-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {stats.pendingRefunds}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
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
      <div className="text-center py-16 text-gray-600">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Reference</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Buyer</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Opportunity</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Deposit</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map(b => {
              const sc = BOOKING_STATUS_CONFIG[b.status];
              return (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-amber-400 font-semibold">{b.reference_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{b.buyer_name}</p>
                    <p className="text-gray-500 text-xs">{b.buyer_company}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{(b.listing as any)?.property_name || b.listing_id}</p>
                    <p className="text-gray-500 text-xs">{(b.listing as any)?.media_owner_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-bold text-sm">${b.deposit_amount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white text-sm">${b.total_price.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">{new Date(b.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelect(b)}
                      className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors"
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
      <div className="text-center py-16 text-gray-600">
        <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No refund requests</p>
      </div>
    );
  }

  const STATUS_CFG: Record<RefundStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    denied: { label: 'Denied', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  };

  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Reference</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Buyer</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Deposit</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {refunds.map(r => {
              const sc = STATUS_CFG[r.status];
              const booking = bookings.find(b => b.id === r.deposit_booking_id);
              return (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-amber-400 font-semibold">{r.reference_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{booking?.buyer_name || '—'}</p>
                    <p className="text-gray-500 text-xs">{booking?.buyer_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs capitalize">{r.reason_category.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-bold text-sm">${booking?.deposit_amount.toLocaleString() || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 border text-[11px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelect(r)}
                      className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors"
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111118] border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white font-bold">Booking Management</h2>
            <p className="text-amber-400 text-xs font-mono mt-0.5">{booking.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
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
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <p className="text-gray-500 text-xs font-semibold mb-2">Buyer message</p>
              <p className="text-gray-300 text-sm">{booking.message_to_creator}</p>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1.5">Update status</label>
            <div className="relative">
              <select
                value={statusSelect}
                onChange={e => setStatusSelect(e.target.value as BookingStatus)}
                className="w-full bg-[#1a1a28] border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-white text-sm outline-none appearance-none"
              >
                {(Object.keys(BOOKING_STATUS_CONFIG) as BookingStatus[]).map(s => (
                  <option key={s} value={s}>{BOOKING_STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1.5">Admin notes (optional)</label>
            <textarea
              value={adminNotes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Internal notes about this booking..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onStatusChange(statusSelect)}
              disabled={updating || statusSelect === booking.status}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/30 text-black font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Update Status
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-all"
            >
              Cancel
            </button>
          </div>

          {booking.stripe_payment_intent_id && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <p className="text-gray-600 text-xs font-semibold mb-1">Payment reference</p>
              <p className="text-gray-500 text-xs font-mono">{booking.stripe_payment_intent_id}</p>
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111118] border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-white font-bold">Refund Request</h2>
            <p className="text-amber-400 text-xs font-mono mt-0.5">{refund.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {refund.booking && (
            <div className="grid grid-cols-2 gap-3">
              <InfoBlock label="Buyer" value={refund.booking.buyer_name} sub={refund.booking.buyer_email} />
              <InfoBlock label="Deposit paid" value={`$${refund.booking.deposit_amount.toLocaleString()}`} highlight />
            </div>
          )}

          <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-4">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-2">
              Category: {refund.reason_category.replace(/_/g, ' ')}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">{refund.reason}</p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-xs text-gray-500">
            <p className="font-semibold text-gray-400 mb-2">Platform refund policy reminder</p>
            <p>Refund may be granted if: seller cannot provide opportunity, seller changes key terms, slot unavailable due to error, or booking cannot proceed under normal industry practice.</p>
            <p>Refund may NOT be granted if: buyer changes mind, fails to respond, fails seller approval requirements, or requests changes outside original scope.</p>
          </div>

          {refund.status === 'pending' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 font-medium mb-1.5">Decision reason (required)</label>
                <textarea
                  value={decisionReason}
                  onChange={e => onReasonChange(e.target.value)}
                  placeholder="Explain the reason for approving or denying this refund request..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onDecision('approved')}
                  disabled={updating || !decisionReason.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/30 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve Refund
                </button>
                <button
                  onClick={() => onDecision('denied')}
                  disabled={updating || !decisionReason.trim()}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-600/30 text-black font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Deny
                </button>
              </div>
            </>
          )}

          {refund.status !== 'pending' && (
            <div className={`rounded-xl p-4 border ${refund.status === 'approved' ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-yellow-950/30 border-yellow-500/20'}`}>
              <p className={`text-xs font-semibold mb-1 ${refund.status === 'approved' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {refund.status === 'approved' ? 'Refund Approved' : 'Refund Denied'}
              </p>
              {refund.admin_decision_reason && (
                <p className="text-gray-400 text-sm">{refund.admin_decision_reason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, highlight, amber, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  amber?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-[#111118] border rounded-xl p-4 ${warn ? 'border-orange-500/20' : 'border-white/8'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-gray-500 text-xs">{label}</p></div>
      <p className={`text-2xl font-black ${highlight ? 'text-emerald-400' : amber ? 'text-amber-400' : warn ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function InfoBlock({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
      <p className="text-gray-600 text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
