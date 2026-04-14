import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Clock, CheckCircle, RotateCcw, XCircle, RefreshCw, ChevronRight, User, Building2, Mail, Phone, Globe, DollarSign, Loader2, X, LogOut, CreditCard as Edit3, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { DepositBooking, BookingStatus, RefundReasonCategory } from '../types';

interface BuyerDashboardProps {
  onBack: () => void;
}

type DashTab = 'bookings' | 'profile';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  secured: { label: 'Secured', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  completed_off_platform: { label: 'Completed', color: 'text-[#8b949e]', bg: 'bg-[#21262d] border-[#30363d]', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  refund_requested: { label: 'Refund Requested', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  refunded: { label: 'Refunded', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: <XCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'text-[#8b949e]', bg: 'bg-[#21262d] border-[#30363d]', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const REFUND_CATEGORIES: { value: RefundReasonCategory; label: string }[] = [
  { value: 'seller_cannot_provide', label: 'Seller cannot provide the slot' },
  { value: 'seller_changed_terms', label: 'Seller changed key terms' },
  { value: 'slot_unavailable', label: 'Slot is no longer available' },
  { value: 'platform_error', label: 'Platform or payment error' },
  { value: 'booking_cannot_proceed', label: 'Booking cannot proceed' },
  { value: 'other', label: 'Other reason' },
];

export default function BuyerDashboard({ onBack }: BuyerDashboardProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<DashTab>('bookings');
  const [bookings, setBookings] = useState<DepositBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DepositBooking | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    const { data } = await supabase
      .from('deposit_bookings')
      .select('*, listing:listings(property_name, media_owner_name, media_company_name, media_type, slot_type, date_label, deadline_at)')
      .eq('buyer_email', user.email)
      .order('created_at', { ascending: false });
    if (data) setBookings(data as DepositBooking[]);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => ['secured', 'in_progress'].includes(b.status)).length,
    totalSpent: bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.deposit_amount, 0),
    pending: bookings.filter(b => b.status === 'pending_payment').length,
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#e6edf3] font-bold text-lg">Buyer Dashboard</h1>
            <p className="text-[#8b949e] text-xs mt-0.5">
              {profile?.display_name} · {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] text-sm border border-[#30363d] hover:border-[#484f58] px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={onBack}
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors"
            >
              Back to site
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-[#8b949e] hover:text-yellow-400 text-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ShoppingBag className="w-4 h-4 text-[#8b949e]" />} label="Total Bookings" value={stats.total} />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} label="Active" value={stats.active} green />
          <StatCard icon={<DollarSign className="w-4 h-4 text-amber-400" />} label="Deposits Paid" value={`$${stats.totalSpent.toLocaleString()}`} amber />
          <StatCard icon={<Clock className="w-4 h-4 text-orange-400" />} label="Pending Payment" value={stats.pending} warn={stats.pending > 0} />
        </div>

        <div className="flex items-center gap-1 mb-6 bg-[#161b22] border border-[#30363d] rounded-xl p-1 w-fit">
          {([['bookings', 'My Bookings'], ['profile', 'Profile']] as [DashTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-[#30363d] text-[#e6edf3]'
                  : 'text-[#8b949e] hover:text-[#8b949e]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8 text-[#8b949e]" />}
              title="No bookings yet"
              description="Browse opportunities and secure your first slot."
            />
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onClick={() => setSelectedBooking(b)}
                />
              ))}
            </div>
          )
        )}

        {tab === 'profile' && (
          <ProfilePanel profile={profile} userEmail={user?.email} onSaved={refreshProfile} />
        )}
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRequestRefund={() => { setShowRefundModal(true); }}
        />
      )}

      {showRefundModal && selectedBooking && (
        <RefundRequestModal
          booking={selectedBooking}
          onClose={() => { setShowRefundModal(false); setSelectedBooking(null); fetchBookings(); }}
        />
      )}
    </div>
  );
}

function BookingCard({ booking, onClick }: { booking: DepositBooking; onClick: () => void }) {
  const sc = STATUS_CONFIG[booking.status];
  const listing = booking.listing as any;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#161b22] border border-[#30363d] hover:border-[#484f58] rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-amber-400 font-semibold">{booking.reference_number}</span>
            <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>
              {sc.icon}
              {sc.label}
            </span>
          </div>
          <h3 className="text-[#e6edf3] font-semibold text-sm truncate">
            {listing?.property_name || 'Unknown listing'}
          </h3>
          <p className="text-[#8b949e] text-xs mt-0.5">
            {listing?.media_owner_name} · {listing?.date_label}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-emerald-400 font-bold text-base">${booking.deposit_amount.toLocaleString()}</p>
          <p className="text-[#8b949e] text-xs">deposit</p>
          <ChevronRight className="w-4 h-4 text-[#8b949e] group-hover:text-[#8b949e] ml-auto mt-1 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#21262d]">
        <Pill label="Slots" value={`${booking.slots_count}`} />
        <Pill label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
        <Pill label="Balance to creator" value={`$${booking.balance_amount.toLocaleString()}`} />
        <Pill label="Booked" value={new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
      </div>
    </button>
  );
}

function BookingDetailModal({ booking, onClose, onRequestRefund }: {
  booking: DepositBooking;
  onClose: () => void;
  onRequestRefund: () => void;
}) {
  const sc = STATUS_CONFIG[booking.status];
  const listing = booking.listing as any;
  const canRefund = ['secured', 'in_progress'].includes(booking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#e6edf3] font-bold">Booking Details</h2>
            <p className="text-amber-400 text-xs font-mono mt-0.5">{booking.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm font-semibold ${sc.bg} ${sc.color}`}>
            {sc.icon}
            {sc.label}
          </div>

          <div className="bg-[#0d1117] rounded-xl border border-[#30363d] p-4">
            <p className="text-[#8b949e] text-xs font-medium mb-0.5">Opportunity</p>
            <p className="text-[#e6edf3] font-bold">{listing?.property_name}</p>
            <p className="text-[#8b949e] text-sm">{listing?.media_owner_name} · {listing?.date_label}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Deposit paid" value={`$${booking.deposit_amount.toLocaleString()}`} green />
            <InfoBlock label="Balance to creator" value={`$${booking.balance_amount.toLocaleString()}`} />
            <InfoBlock label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
            <InfoBlock label="Slots booked" value={`${booking.slots_count}`} />
          </div>

          {(booking.seller_email || booking.seller_phone || booking.seller_website) && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-400 text-xs font-semibold mb-2">Creator Contact</p>
              <div className="space-y-1.5">
                {booking.seller_name && <p className="text-[#e6edf3] text-sm font-medium">{booking.seller_name}</p>}
                {booking.seller_email && (
                  <a href={`mailto:${booking.seller_email}`} className="flex items-center gap-1.5 text-[#8b949e] hover:text-emerald-400 text-sm transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    {booking.seller_email}
                  </a>
                )}
                {booking.seller_phone && (
                  <p className="flex items-center gap-1.5 text-[#8b949e] text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    {booking.seller_phone}
                  </p>
                )}
                {booking.seller_website && (
                  <a href={booking.seller_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#8b949e] hover:text-emerald-400 text-sm transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                    {booking.seller_website}
                  </a>
                )}
              </div>
            </div>
          )}

          {booking.message_to_creator && (
            <div className="bg-[#21262d] rounded-xl border border-[#30363d] p-4">
              <p className="text-[#8b949e] text-xs font-semibold mb-2">Your message to creator</p>
              <p className="text-[#8b949e] text-sm">{booking.message_to_creator}</p>
            </div>
          )}

          <div className="bg-[#21262d] rounded-xl border border-[#30363d] p-4">
            <p className="text-[#8b949e] text-xs font-semibold mb-2">Your details</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#8b949e]">Company</span><p className="text-[#8b949e] mt-0.5">{booking.buyer_company}</p></div>
              <div><span className="text-[#8b949e]">Country</span><p className="text-[#8b949e] mt-0.5">{booking.buyer_country}</p></div>
              {booking.buyer_website && <div className="col-span-2"><span className="text-[#8b949e]">Website</span><p className="text-[#8b949e] mt-0.5">{booking.buyer_website}</p></div>}
            </div>
          </div>

          <p className="text-[#8b949e] text-[10px]">
            Booked {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>

          {canRefund && (
            <div className="pt-2 border-t border-[#30363d]">
              <button
                onClick={onRequestRefund}
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Request a refund
              </button>
              <p className="text-[#8b949e] text-[10px] mt-1">Only available where seller cannot fulfil or terms have changed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RefundRequestModal({ booking, onClose }: { booking: DepositBooking; onClose: () => void }) {
  const [category, setCategory] = useState<RefundReasonCategory>('seller_cannot_provide');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);

    await supabase.from('refund_requests').insert({
      deposit_booking_id: booking.id,
      reference_number: booking.reference_number,
      reason,
      reason_category: category,
    });

    await supabase.from('deposit_bookings').update({
      status: 'refund_requested',
      updated_at: new Date().toISOString(),
    }).eq('id', booking.id);

    setDone(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <h2 className="text-[#e6edf3] font-bold">Request Refund</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-[#e6edf3] font-bold mb-1">Refund request submitted</h3>
            <p className="text-[#8b949e] text-sm mb-4">We'll review your request and get back to you within 2 business days.</p>
            <button onClick={onClose} className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm font-medium px-6 py-2.5 rounded-lg hover:border-[#484f58] transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3">
              <p className="text-orange-400 text-xs font-semibold">{booking.reference_number}</p>
              <p className="text-[#8b949e] text-sm mt-0.5">Deposit paid: ${booking.deposit_amount.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] font-medium mb-1.5">Reason category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as RefundReasonCategory)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm outline-none"
              >
                {REFUND_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] font-medium mb-1.5">Explain in detail</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                rows={4}
                required
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/30 text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Submit Refund Request
            </button>

            <p className="text-[#8b949e] text-[10px] text-center">Refunds are reviewed within 2 business days. Platform policy applies.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function ProfilePanel({ profile, userEmail, onSaved }: {
  profile: ReturnType<typeof useAuth>['profile'];
  userEmail?: string;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    company: profile?.company || '',
    phone: profile?.phone || '',
    website: profile?.website || '',
    bio: profile?.bio || '',
  });

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('user_profiles').update({
      ...form,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id);
    await onSaved();
    setSaving(false);
    setEditing(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[#e6edf3] font-bold">{profile.display_name || 'Your Profile'}</h3>
              <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
                {profile.role}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] text-sm border border-[#30363d] hover:border-[#484f58] px-3 py-1.5 rounded-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <ProfileField
            label="Email"
            icon={<Mail className="w-3.5 h-3.5" />}
            value={userEmail || ''}
            editing={false}
          />
          <ProfileField
            label="Full name"
            icon={<User className="w-3.5 h-3.5" />}
            value={form.display_name}
            editing={editing}
            onChange={v => setForm(p => ({ ...p, display_name: v }))}
          />
          <ProfileField
            label="Company"
            icon={<Building2 className="w-3.5 h-3.5" />}
            value={form.company}
            editing={editing}
            onChange={v => setForm(p => ({ ...p, company: v }))}
          />
          <ProfileField
            label="Phone"
            icon={<Phone className="w-3.5 h-3.5" />}
            value={form.phone}
            editing={editing}
            onChange={v => setForm(p => ({ ...p, phone: v }))}
          />
          <ProfileField
            label="Website"
            icon={<Globe className="w-3.5 h-3.5" />}
            value={form.website}
            editing={editing}
            onChange={v => setForm(p => ({ ...p, website: v }))}
          />

          {editing && (
            <div>
              <label className="block text-xs text-[#8b949e] font-medium mb-1.5">Bio (optional)</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-colors resize-none"
              />
            </div>
          )}

          {!editing && profile.bio && (
            <div>
              <p className="text-xs text-[#8b949e] font-medium mb-1">Bio</p>
              <p className="text-[#8b949e] text-sm">{profile.bio}</p>
            </div>
          )}

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <p className="text-[#8b949e] text-xs font-semibold mb-2 uppercase tracking-wide">Account info</p>
        <div className="space-y-1.5 text-xs text-[#8b949e]">
          <p>Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Role: <span className="capitalize">{profile.role}</span></p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label, icon, value, editing, onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
}) {
  if (editing && onChange) {
    return (
      <div>
        <label className="block text-xs text-[#8b949e] font-medium mb-1.5">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">{icon}</div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg pl-9 pr-3 py-2.5 text-[#e6edf3] text-sm outline-none transition-colors"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="text-[#8b949e]">{icon}</div>
      <div>
        <p className="text-[10px] text-[#8b949e] font-medium">{label}</p>
        <p className="text-[#8b949e] text-sm">{value || '—'}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, green, amber, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  green?: boolean;
  amber?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-[#161b22] border rounded-xl p-4 ${warn ? 'border-orange-500/20' : 'border-[#30363d]'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-[#8b949e] text-xs">{label}</p></div>
      <p className={`text-2xl font-black ${green ? 'text-emerald-400' : amber ? 'text-amber-400' : warn ? 'text-orange-400' : 'text-[#e6edf3]'}`}>
        {value}
      </p>
    </div>
  );
}

function InfoBlock({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-3">
      <p className="text-[#8b949e] text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${green ? 'text-emerald-400' : 'text-[#e6edf3]'}`}>{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 bg-[#21262d] border border-[#30363d] rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[#e6edf3] font-semibold text-sm mb-1">{title}</p>
        <p className="text-[#8b949e] text-sm">{description}</p>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-[#8b949e] uppercase tracking-wide font-medium">{label}</p>
      <p className="text-[#8b949e] text-xs font-medium">{value}</p>
    </div>
  );
}

