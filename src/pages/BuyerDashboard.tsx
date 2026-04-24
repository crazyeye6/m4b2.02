import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Clock, CheckCircle, RotateCcw, XCircle, RefreshCw, ChevronRight, User, Building2, Mail, Phone, Globe, DollarSign, Loader2, X, LogOut, CreditCard as Edit3, Save, Bell, BellOff, Sparkles, Tag, Search, Zap, Info, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useBuyerPreferences } from '../hooks/useBuyerPreferences';
import RecommendedSection from '../components/RecommendedSection';
import PreferencesModal from '../components/PreferencesModal';
import type { DepositBooking, BookingStatus, RefundReasonCategory, Listing } from '../types';
import type { DigestPreferences, UserProfile } from '../context/AuthContext';

interface BuyerDashboardProps {
  onBack: () => void;
  onViewListing?: (listing: Listing) => void;
}

type DashTab = 'recommended' | 'bookings' | 'alerts' | 'profile';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> },
  secured: { label: 'Secured', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  in_progress: { label: 'In Progress', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <Clock className="w-3.5 h-3.5" /> },
  completed_off_platform: { label: 'Completed', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  refund_requested: { label: 'Refund Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  refunded: { label: 'Refunded', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]', icon: <XCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const REFUND_CATEGORIES: { value: RefundReasonCategory; label: string }[] = [
  { value: 'seller_cannot_provide', label: 'Seller cannot provide the slot' },
  { value: 'seller_changed_terms', label: 'Seller changed key terms' },
  { value: 'slot_unavailable', label: 'Slot is no longer available' },
  { value: 'platform_error', label: 'Platform or payment error' },
  { value: 'booking_cannot_proceed', label: 'Booking cannot proceed' },
  { value: 'other', label: 'Other reason' },
];

export default function BuyerDashboard({ onBack, onViewListing }: BuyerDashboardProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<DashTab>('recommended');
  const [bookings, setBookings] = useState<DepositBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DepositBooking | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const { prefs, setPrefs } = useBuyerPreferences();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, media_profile:media_profiles(*), newsletter:newsletters(*)')
      .eq('status', 'live')
      .order('deadline_at', { ascending: true })
      .then(({ data }) => {
        if (data) setListings(data as Listing[]);
      });
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const orFilter = user.email
      ? `buyer_user_id.eq.${user.id},buyer_email.eq.${user.email}`
      : `buyer_user_id.eq.${user.id}`;
    const { data } = await supabase
      .from('deposit_bookings')
      .select('*, listing:listings(property_name, media_owner_name, media_company_name, media_type, slot_type, date_label, deadline_at)')
      .or(orFilter)
      .order('created_at', { ascending: false });
    if (data) setBookings(data as DepositBooking[]);
    setLoading(false);
  }, [user]);

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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#1d1d1f] font-semibold text-base tracking-[-0.01em]">Buyer Dashboard</h1>
            <p className="text-[#6e6e73] text-xs mt-0.5">
              {profile?.display_name} · {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
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
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-[#6e6e73] hover:text-red-500 text-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BuyerWelcomeBanner onSetAlerts={() => setTab('alerts')} onBrowse={onBack} hasBookings={bookings.length > 0} hasPrefs={prefs.hasCompletedOnboarding} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ShoppingBag className="w-4 h-4 text-[#86868b]" />} label="Total Bookings" value={stats.total} />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Active" value={stats.active} green />
          <StatCard icon={<DollarSign className="w-4 h-4 text-[#86868b]" />} label="Deposits Paid" value={`$${stats.totalSpent.toLocaleString()}`} />
          <StatCard icon={<Clock className="w-4 h-4 text-orange-500" />} label="Pending Payment" value={stats.pending} warn={stats.pending > 0} />
        </div>

        <div className="flex items-center gap-1 mb-6 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit flex-wrap">
          {([['recommended', 'Recommended'], ['bookings', 'My Bookings'], ['alerts', 'Alert Preferences'], ['profile', 'Profile']] as [DashTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-white text-[#1d1d1f] shadow-sm shadow-black/[0.06]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              {key === 'recommended' && <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
              {label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="space-y-4">
              <BuyerSectionHeader
                icon={<ShoppingBag className="w-4 h-4" />}
                title="My Bookings"
                desc="When you secure a slot, it appears here. You pay a small deposit at checkout — the balance goes directly to the podcast host when the episode airs."
                tip="Deposits confirm your intent. The creator's contact details are shared with you immediately after booking."
              />
              <EmptyState
                icon={<ShoppingBag className="w-8 h-8 text-[#aeaeb2]" />}
                title="No bookings yet"
                description="Browse open slots in the live feed and secure your first placement."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <BuyerSectionHeader
                icon={<ShoppingBag className="w-4 h-4" />}
                title="My Bookings"
                desc="Track all your secured slots here. Click any booking to see the creator's contact details and manage your campaign."
                tip="Once secured, contact the creator directly to share your ad copy and campaign brief."
              />
              <div className="space-y-3">
                {bookings.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onClick={() => setSelectedBooking(b)}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {tab === 'recommended' && (
          prefs.hasCompletedOnboarding && listings.length > 0 ? (
            <div className="space-y-4">
              <BuyerSectionHeader
                icon={<Sparkles className="w-4 h-4" />}
                title="Recommended for you"
                desc="Slots matched to your preferences — ranked by how well they fit your audience targets, niche, and location. The higher the match score, the more relevant it is for your campaigns."
                tip="Edit your preferences anytime to retune your recommendations."
                accent="emerald"
              />
              <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                <RecommendedSection
                  listings={listings}
                  prefs={prefs}
                  onView={(listing) => {
                    if (onViewListing) {
                      onViewListing(listing);
                    } else {
                      onBack();
                    }
                  }}
                  onEditPrefs={() => setShowPrefsModal(true)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <BuyerSectionHeader
                icon={<Sparkles className="w-4 h-4" />}
                title="Recommended for you"
                desc="Once you set your preferences, we rank every live slot by how well it matches your audience, niche, and goals — so you spend less time searching and more time buying."
                accent="emerald"
              />
              <div className="bg-white border border-black/[0.06] rounded-3xl p-8 text-center max-w-md mx-auto">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-[#1d1d1f] font-semibold mb-1">Set your preferences first</p>
                <p className="text-[#6e6e73] text-sm mb-5">
                  Tell us what you're looking for — niche, location, format — and we'll surface the best-fit slots every week.
                </p>
                <button
                  onClick={() => setTab('alerts')}
                  className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all mx-auto"
                >
                  <Bell className="w-4 h-4" />
                  Set my preferences
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}

        {tab === 'alerts' && (
          <div className="space-y-4">
            <BuyerSectionHeader
              icon={<Bell className="w-4 h-4" />}
              title="Alert Preferences"
              desc="We send you a personalised digest of matching podcast ad slots based on these settings. The more specific you are, the better your recommendations and alerts will be."
              tip="Selecting nothing in a category means 'include all' — you'll still get alerts, just without that filter applied."
            />
            <AlertPreferencesPanel profile={profile} onSaved={refreshProfile} />
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-4">
            <BuyerSectionHeader
              icon={<User className="w-4 h-4" />}
              title="Your Profile"
              desc="Your name and company are shared with newsletter owners when you secure a booking. Keep these up to date so creators know who they're working with."
              tip="Your email address cannot be changed here — contact support if you need to update it."
            />
            <ProfilePanel profile={profile} userEmail={user?.email} onSaved={refreshProfile} />
          </div>
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

      {showPrefsModal && (
        <PreferencesModal
          prefs={prefs}
          onSave={(partial) => setPrefs(partial)}
          onClose={() => setShowPrefsModal(false)}
        />
      )}
    </div>
  );
}

// ── Buyer orientation components ──────────────────────────────────────────────

function BuyerSectionHeader({ icon, title, desc, tip, accent }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tip?: string;
  accent?: 'emerald';
}) {
  const iconBg = accent === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73]';
  return (
    <div className="flex items-start gap-3 bg-white border border-black/[0.06] rounded-2xl px-5 py-4">
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[#1d1d1f] font-semibold text-sm">{title}</p>
        <p className="text-[#6e6e73] text-xs mt-0.5 leading-relaxed">{desc}</p>
        {tip && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Info className="w-3 h-3 text-[#aeaeb2] shrink-0" />
            <p className="text-[#aeaeb2] text-[11px]">{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BuyerWelcomeBanner({ onSetAlerts, onBrowse, hasBookings, hasPrefs }: {
  onSetAlerts: () => void;
  onBrowse: () => void;
  hasBookings: boolean;
  hasPrefs: boolean;
}) {
  if (hasBookings) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* How it works */}
      <div className="bg-white border border-black/[0.06] rounded-3xl px-6 py-5">
        <p className="text-[10px] font-bold text-[#aeaeb2] uppercase tracking-widest mb-4">How it works</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Search className="w-4 h-4" />, step: '01', title: 'Browse live slots', desc: 'Find podcast ad slots across dozens of shows', color: 'bg-blue-50 border-blue-100 text-blue-600' },
            { icon: <Zap className="w-4 h-4" />, step: '02', title: 'Get matched', desc: 'Set your preferences and we surface the best-fit open slots from the live feed', color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
            { icon: <DollarSign className="w-4 h-4" />, step: '03', title: 'Secure with a deposit', desc: 'Pay a small deposit to lock in the slot — balance goes to the creator', color: 'bg-amber-50 border-amber-100 text-amber-600' },
            { icon: <CheckCircle className="w-4 h-4" />, step: '04', title: 'Run your campaign', desc: "Contact the creator directly and deliver your ad — it's that simple", color: 'bg-green-50 border-green-100 text-green-600' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${s.color}`}>
                  {s.icon}
                </div>
                <span className="text-[10px] font-bold text-[#aeaeb2] font-mono">{s.step}</span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#1d1d1f] leading-snug mb-0.5">{s.title}</p>
                <p className="text-[11px] text-[#86868b] leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onBrowse}
          className="text-left bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl px-5 py-4 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Search className="w-4 h-4 text-[#6e6e73]" />
            <p className="text-[13px] font-semibold text-[#1d1d1f]">Browse all live slots</p>
          </div>
          <p className="text-[12px] text-[#86868b]">See every open podcast ad slot in the live feed — closing this week.</p>
          <p className="text-[11px] font-semibold text-[#aeaeb2] group-hover:text-[#1d1d1f] mt-2 transition-colors">Browse open slots →</p>
        </button>
        <button
          onClick={onSetAlerts}
          className={`text-left rounded-2xl px-5 py-4 hover:shadow-sm transition-all group border ${hasPrefs ? 'bg-white border-black/[0.06] hover:border-black/[0.12]' : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'}`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Bell className={`w-4 h-4 ${hasPrefs ? 'text-[#6e6e73]' : 'text-emerald-600'}`} />
            <p className="text-[13px] font-semibold text-[#1d1d1f]">{hasPrefs ? 'Update your preferences' : 'Set your alert preferences'}</p>
          </div>
          <p className="text-[12px] text-[#86868b]">{hasPrefs ? 'Fine-tune your matching criteria to get better recommendations.' : 'Tell us your niche, location, and format — we\'ll match you to the best slots each week.'}</p>
          <p className={`text-[11px] font-semibold mt-2 transition-colors ${hasPrefs ? 'text-[#aeaeb2] group-hover:text-[#1d1d1f]' : 'text-emerald-600 group-hover:text-emerald-700'}`}>{hasPrefs ? 'Edit preferences →' : 'Set preferences →'}</p>
        </button>
      </div>
    </div>
  );
}

function BookingCard({ booking, onClick }: { booking: DepositBooking; onClick: () => void }) {
  const sc = STATUS_CONFIG[booking.status];
  const listing = booking.listing as any;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md hover:shadow-black/[0.06] rounded-2xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-[#6e6e73] font-semibold">{booking.reference_number}</span>
            <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
              {sc.icon}
              {sc.label}
            </span>
          </div>
          <h3 className="text-[#1d1d1f] font-semibold text-sm truncate">
            {listing?.property_name || 'Unknown listing'}
          </h3>
          <p className="text-[#6e6e73] text-xs mt-0.5">
            {listing?.media_owner_name} · {listing?.date_label}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-green-600 font-bold text-base">${booking.deposit_amount.toLocaleString()}</p>
          <p className="text-[#aeaeb2] text-xs">deposit</p>
          <ChevronRight className="w-4 h-4 text-[#aeaeb2] group-hover:text-[#6e6e73] ml-auto mt-1 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/[0.04]">
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#1d1d1f] font-semibold">Booking Details</h2>
            <p className="text-[#6e6e73] text-xs font-mono mt-0.5">{booking.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`inline-flex items-center gap-2 border px-3 py-1.5 rounded-xl text-sm font-semibold ${sc.bg} ${sc.color}`}>
            {sc.icon}
            {sc.label}
          </div>

          <div className="bg-[#f5f5f7] rounded-2xl border border-black/[0.06] p-4">
            <p className="text-[#86868b] text-xs font-semibold mb-0.5">Opportunity</p>
            <p className="text-[#1d1d1f] font-semibold">{listing?.property_name}</p>
            <p className="text-[#6e6e73] text-sm">{listing?.media_owner_name} · {listing?.date_label}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Deposit paid" value={`$${booking.deposit_amount.toLocaleString()}`} green />
            <InfoBlock label="Balance to creator" value={`$${booking.balance_amount.toLocaleString()}`} />
            <InfoBlock label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
            <InfoBlock label="Slots booked" value={`${booking.slots_count}`} />
          </div>

          {(booking.seller_email || booking.seller_phone || booking.seller_website) && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-green-700 text-xs font-semibold mb-2">Creator Contact</p>
              <div className="space-y-1.5">
                {booking.seller_name && <p className="text-[#1d1d1f] text-sm font-medium">{booking.seller_name}</p>}
                {booking.seller_email && (
                  <a href={`mailto:${booking.seller_email}`} className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    {booking.seller_email}
                  </a>
                )}
                {booking.seller_phone && (
                  <p className="flex items-center gap-1.5 text-[#6e6e73] text-sm">
                    <Phone className="w-3.5 h-3.5" />
                    {booking.seller_phone}
                  </p>
                )}
                {booking.seller_website && (
                  <a href={booking.seller_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                    {booking.seller_website}
                  </a>
                )}
              </div>
            </div>
          )}

          {booking.message_to_creator && (
            <div className="bg-[#f5f5f7] rounded-2xl border border-black/[0.06] p-4">
              <p className="text-[#86868b] text-xs font-semibold mb-2">Your message to creator</p>
              <p className="text-[#6e6e73] text-sm">{booking.message_to_creator}</p>
            </div>
          )}

          <div className="bg-[#f5f5f7] rounded-2xl border border-black/[0.06] p-4">
            <p className="text-[#86868b] text-xs font-semibold mb-2">Your details</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#86868b]">Company</span><p className="text-[#1d1d1f] mt-0.5">{booking.buyer_company}</p></div>
              <div><span className="text-[#86868b]">Country</span><p className="text-[#1d1d1f] mt-0.5">{booking.buyer_country}</p></div>
              {booking.buyer_website && <div className="col-span-2"><span className="text-[#86868b]">Website</span><p className="text-[#1d1d1f] mt-0.5">{booking.buyer_website}</p></div>}
            </div>
          </div>

          <p className="text-[#aeaeb2] text-[10px]">
            Booked {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>

          {canRefund && (
            <div className="pt-2 border-t border-black/[0.06]">
              <button
                onClick={onRequestRefund}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Request a refund
              </button>
              <p className="text-[#aeaeb2] text-[10px] mt-1">Only available where seller cannot fulfil or terms have changed.</p>
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-md shadow-2xl shadow-black/[0.12] overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
          <h2 className="text-[#1d1d1f] font-semibold">Request Refund</h2>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-[#1d1d1f] font-semibold mb-1">Refund request submitted</h3>
            <p className="text-[#6e6e73] text-sm mb-4">We'll review your request and get back to you within 2 business days.</p>
            <button onClick={onClose} className="bg-[#f5f5f7] border border-black/[0.08] text-[#1d1d1f] text-sm font-semibold px-6 py-2.5 rounded-2xl hover:border-black/[0.15] transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3">
              <p className="text-orange-700 text-xs font-semibold">{booking.reference_number}</p>
              <p className="text-[#6e6e73] text-sm mt-0.5">Deposit paid: ${booking.deposit_amount.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Reason category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as RefundReasonCategory)}
                className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
              >
                {REFUND_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Explain in detail</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                rows={4}
                required
                className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Submit Refund Request
            </button>

            <p className="text-[#aeaeb2] text-[10px] text-center">Refunds are reviewed within 2 business days. Platform policy applies.</p>
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
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-[#1d1d1f] font-semibold">{profile.display_name || 'Your Profile'}</h3>
              <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize">
                {profile.role}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all"
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
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Bio (optional)</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
              />
            </div>
          )}

          {!editing && profile.bio && (
            <div>
              <p className="text-[11px] text-[#86868b] font-semibold mb-1">Bio</p>
              <p className="text-[#6e6e73] text-sm">{profile.bio}</p>
            </div>
          )}

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-2xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
        <p className="text-[#86868b] text-xs font-semibold mb-2 uppercase tracking-wider">Account info</p>
        <div className="space-y-1.5 text-xs text-[#6e6e73]">
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
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2]">{icon}</div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl pl-9 pr-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="text-[#aeaeb2]">{icon}</div>
      <div>
        <p className="text-[10px] text-[#86868b] font-semibold">{label}</p>
        <p className="text-[#1d1d1f] text-sm">{value || '—'}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, green, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  green?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-2xl p-4 ${warn ? 'border-orange-200' : 'border-black/[0.06]'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-[#6e6e73] text-xs">{label}</p></div>
      <p className={`text-2xl font-bold tracking-[-0.02em] ${green ? 'text-green-600' : warn ? 'text-orange-600' : 'text-[#1d1d1f]'}`}>
        {value}
      </p>
    </div>
  );
}

function InfoBlock({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3">
      <p className="text-[#86868b] text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${green ? 'text-green-600' : 'text-[#1d1d1f]'}`}>{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[#1d1d1f] font-semibold text-sm mb-1">{title}</p>
        <p className="text-[#6e6e73] text-sm">{description}</p>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-[#86868b] uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-[#6e6e73] text-xs font-medium">{value}</p>
    </div>
  );
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'podcast', label: 'Podcast', active: 'bg-sky-50 border-sky-200 text-sky-700' },
];

const LOCATION_OPTIONS = ['Global', 'US', 'UK', 'EU', 'Canada', 'Australia', 'Asia', 'Latin America'];

const POPULAR_TAGS = [
  'B2B', 'B2C', 'SaaS', 'E-commerce', 'Finance', 'Health & Wellness', 'Tech',
  'Marketing', 'Entrepreneurship', 'Productivity', 'AI', 'Crypto', 'Design',
  'HR & Recruiting', 'Sales', 'Startups', 'Climate & Sustainability',
];

function AlertPreferencesPanel({ profile, onSaved }: {
  profile: UserProfile | null;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dbTags, setDbTags] = useState<string[]>([]);
  const [form, setForm] = useState<DigestPreferences>({
    digest_enabled: profile?.digest_enabled ?? true,
    digest_frequency: profile?.digest_frequency ?? 'weekly',
    digest_media_types: profile?.digest_media_types ?? [],
    digest_locations: profile?.digest_locations ?? [],
    digest_tags: profile?.digest_tags ?? [],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        digest_enabled: profile.digest_enabled ?? true,
        digest_frequency: profile.digest_frequency ?? 'weekly',
        digest_media_types: profile.digest_media_types ?? [],
        digest_locations: profile.digest_locations ?? [],
        digest_tags: profile.digest_tags ?? [],
      });
    }
  }, [profile]);

  useEffect(() => {
    supabase
      .from('tags')
      .select('name')
      .order('usage_count', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data && data.length > 0) setDbTags(data.map((t: { name: string }) => t.name));
      });
  }, []);

  const tagList = dbTags.length > 0 ? dbTags : POPULAR_TAGS;

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('user_profiles').update({
      ...form,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id);
    await onSaved();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!profile) return null;

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-[#1d1d1f] font-semibold text-sm">Open Slot Alert Preferences</h3>
            <p className="text-[#6e6e73] text-xs mt-0.5">
              We send you a personalised digest of matching open slots based on these preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl">
          <div className="flex items-center gap-2.5">
            {form.digest_enabled
              ? <Bell className="w-4 h-4 text-green-600" />
              : <BellOff className="w-4 h-4 text-[#aeaeb2]" />
            }
            <div>
              <p className="text-[#1d1d1f] text-sm font-semibold">
                {form.digest_enabled ? 'Alerts enabled' : 'Alerts disabled'}
              </p>
              <p className="text-[#aeaeb2] text-xs">Receive digest emails with matching open slots</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, digest_enabled: !p.digest_enabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.digest_enabled ? 'bg-green-500' : 'bg-[#d1d1d6]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.digest_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {form.digest_enabled && (
          <>
            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                {(['daily', 'weekly'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, digest_frequency: f }))}
                    className={`py-2.5 rounded-2xl text-[13px] font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      form.digest_frequency === f
                        ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
                    }`}
                  >
                    {form.digest_frequency === f && <CheckCircle className="w-3.5 h-3.5" />}
                    {f === 'daily' ? 'Daily' : 'Weekly'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">Media type</label>
              <div className="flex flex-wrap gap-2">
                {MEDIA_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, digest_media_types: toggle(p.digest_media_types, opt.value) }))}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                      form.digest_media_types.includes(opt.value)
                        ? opt.active
                        : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.digest_media_types.length === 0 && (
                <p className="text-[11px] text-[#aeaeb2] mt-1.5">None selected = all types included in digest</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">Audience location</label>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, digest_locations: toggle(p.digest_locations, loc) }))}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                      form.digest_locations.includes(loc)
                        ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              {form.digest_locations.length === 0 && (
                <p className="text-[11px] text-[#aeaeb2] mt-1.5">None selected = all locations included</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">
                <Tag className="w-3 h-3 inline mr-1" />
                Topics &amp; niches
              </label>
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                {tagList.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, digest_tags: toggle(p.digest_tags, tag) }))}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                      form.digest_tags.includes(tag)
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {form.digest_tags.length > 0 ? (
                <p className="text-[11px] text-green-600 mt-1.5 font-medium">{form.digest_tags.length} selected</p>
              ) : (
                <p className="text-[11px] text-[#aeaeb2] mt-1.5">None selected = all topics included</p>
              )}
            </div>
          </>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save preferences
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Saved
            </span>
          )}
        </div>

        {profile.digest_last_sent_at && (
          <p className="text-[#aeaeb2] text-[11px]">
            Last digest sent {new Date(profile.digest_last_sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}
