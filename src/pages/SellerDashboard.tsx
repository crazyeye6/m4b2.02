import { useState, useEffect, useCallback } from 'react';
import { BarChart2, CheckCircle, DollarSign, Plus, RefreshCw, ChevronRight, User, Building2, Mail, Phone, Globe, Loader2, X, LogOut, CreditCard as Edit3, Save, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Listing, ListingStatus, DepositBooking, BookingStatus } from '../types';

interface SellerDashboardProps {
  onBack: () => void;
  onListSlot: () => void;
}

type DashTab = 'listings' | 'bookings' | 'profile';

const LISTING_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  live: { label: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  securing: { label: 'Being Secured', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  pending_review: { label: 'Pending Review', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  secured: { label: 'Secured', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  completed_off_platform: { label: 'Completed', color: 'text-[#6e7681]', bg: 'bg-[#21262d] border-[#30363d]' },
  expired: { label: 'Expired', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-[#484f58]', bg: 'bg-[#21262d] border-[#30363d]' },
};

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  secured: { label: 'Secured', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  completed_off_platform: { label: 'Completed', color: 'text-[#6e7681]', bg: 'bg-[#21262d] border-[#30363d]' },
  refund_requested: { label: 'Refund Requested', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  refunded: { label: 'Refunded', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-[#484f58]', bg: 'bg-[#21262d] border-[#30363d]' },
};

export default function SellerDashboard({ onBack, onListSlot }: SellerDashboardProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<DashTab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<DepositBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    const [listingsRes, bookingsRes] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .or(`seller_user_id.eq.${user.id},seller_email.eq.${user.email}`)
        .order('created_at', { ascending: false }),
      supabase
        .from('deposit_bookings')
        .select('*, listing:listings(property_name, media_owner_name, media_type, date_label)')
        .eq('seller_email', user.email)
        .order('created_at', { ascending: false }),
    ]);

    if (listingsRes.data) setListings(listingsRes.data as Listing[]);
    if (bookingsRes.data) setBookings(bookingsRes.data as DepositBooking[]);
    setLoading(false);
  }, [user?.email, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalEarned = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((s, b) => s + b.balance_amount, 0);

  const stats = {
    totalListings: listings.length,
    liveListings: listings.filter(l => l.status === 'live').length,
    totalBookings: bookings.length,
    pendingPayouts: totalEarned,
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#e6edf3] font-bold text-lg">Seller Dashboard</h1>
            <p className="text-[#6e7681] text-xs mt-0.5">
              {profile?.display_name} · {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 text-[#6e7681] hover:text-[#e6edf3] text-sm border border-[#30363d] hover:border-[#484f58] px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={onBack}
              className="text-[#6e7681] hover:text-[#e6edf3] text-sm transition-colors"
            >
              Back to site
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-[#6e7681] hover:text-yellow-400 text-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="w-4 h-4 text-[#6e7681]" />} label="Total Listings" value={stats.totalListings} />
          <StatCard icon={<BarChart2 className="w-4 h-4 text-emerald-400" />} label="Live Now" value={stats.liveListings} green />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-blue-400" />} label="Bookings Received" value={stats.totalBookings} blue />
          <StatCard icon={<DollarSign className="w-4 h-4 text-amber-400" />} label="Pending Payouts" value={`$${stats.pendingPayouts.toLocaleString()}`} amber />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-xl p-1 w-fit">
            {([['listings', 'My Listings'], ['bookings', 'Bookings'], ['profile', 'Profile']] as [DashTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? 'bg-[#30363d] text-[#e6edf3]'
                    : 'text-[#6e7681] hover:text-[#8b949e]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'listings' && (
            <button
              onClick={onListSlot}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2 rounded-lg border border-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              List a Slot
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
        ) : tab === 'listings' ? (
          listings.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-[#6e7681]" />}
              title="No listings yet"
              description="List your first slot to start receiving bookings."
              action={{ label: 'List a Slot', onClick: onListSlot }}
            />
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={() => setSelectedListing(l)} />
              ))}
            </div>
          )
        ) : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-8 h-8 text-[#6e7681]" />}
              title="No bookings yet"
              description="Bookings will appear here once buyers secure your slots."
            />
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <SellerBookingCard key={b.id} booking={b} />
              ))}
            </div>
          )
        ) : (
          <SellerProfilePanel profile={profile} userEmail={user?.email} onSaved={refreshProfile} />
        )}
      </div>

      {selectedListing && (
        <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} onRefetch={fetchData} />
      )}
    </div>
  );
}

function ListingCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  const sc = LISTING_STATUS_CONFIG[listing.status] || LISTING_STATUS_CONFIG.live;
  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const deadline = new Date(listing.deadline_at);
  const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 3600000));

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#161b22] border border-[#30363d] hover:border-[#484f58] rounded-xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
            <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
              -{discount}%
            </span>
          </div>
          <h3 className="text-[#e6edf3] font-bold text-sm truncate">{listing.property_name}</h3>
          <p className="text-[#6e7681] text-xs mt-0.5">{listing.media_company_name} · {listing.slot_type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[#e6edf3] font-bold">${listing.discounted_price.toLocaleString()}</p>
          <p className="text-[#6e7681] text-xs line-through">${listing.original_price.toLocaleString()}</p>
          <ChevronRight className="w-4 h-4 text-[#484f58] group-hover:text-[#8b949e] ml-auto mt-1 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#21262d]">
        <Pill label="Slots remaining" value={`${listing.slots_remaining}/${listing.slots_total || '?'}`} />
        <Pill label="Audience" value={listing.audience} />
        <Pill label="Closes" value={hoursLeft < 24 ? `${hoursLeft}h left` : listing.date_label} urgent={hoursLeft < 24} />
        <Pill label="Location" value={listing.location} />
      </div>
    </button>
  );
}

function ListingDetailModal({ listing, onClose, onRefetch }: {
  listing: Listing;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const sc = LISTING_STATUS_CONFIG[listing.status] || LISTING_STATUS_CONFIG.live;
  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ListingStatus>(listing.status);

  const updateStatus = async () => {
    setUpdatingStatus(true);
    await supabase.from('listings').update({
      status: newStatus,
    }).eq('id', listing.id);
    await onRefetch();
    onClose();
    setUpdatingStatus(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#e6edf3] font-bold">Listing Details</h2>
            <p className="text-[#6e7681] text-xs mt-0.5 capitalize">{listing.media_type}</p>
          </div>
          <button onClick={onClose} className="text-[#6e7681] hover:text-[#e6edf3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>
                {sc.label}
              </span>
            </div>
            <h3 className="text-[#e6edf3] font-bold text-lg">{listing.property_name}</h3>
            <p className="text-[#6e7681] text-sm">{listing.media_company_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Discounted price" value={`$${listing.discounted_price.toLocaleString()}`} green />
            <InfoBlock label="Original price" value={`$${listing.original_price.toLocaleString()}`} />
            <InfoBlock label="Discount" value={`-${discount}%`} red />
            <InfoBlock label="Slots remaining" value={`${listing.slots_remaining} / ${listing.slots_total || '?'}`} />
          </div>

          <div className="bg-[#0d1117] rounded-xl border border-[#30363d] p-4">
            <p className="text-[#6e7681] text-xs font-semibold mb-3 uppercase tracking-wide">Audience & Reach</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#484f58] text-xs">Audience</p><p className="text-[#8b949e]">{listing.audience}</p></div>
              <div><p className="text-[#484f58] text-xs">Location</p><p className="text-[#8b949e]">{listing.location}</p></div>
              <div><p className="text-[#484f58] text-xs">Slot type</p><p className="text-[#8b949e]">{listing.slot_type}</p></div>
              <div><p className="text-[#484f58] text-xs">Date</p><p className="text-[#8b949e]">{listing.date_label}</p></div>
              {listing.subscribers && <div><p className="text-[#484f58] text-xs">Subscribers</p><p className="text-[#8b949e]">{listing.subscribers.toLocaleString()}</p></div>}
              {listing.open_rate && <div><p className="text-[#484f58] text-xs">Open rate</p><p className="text-[#8b949e]">{listing.open_rate}</p></div>}
              {listing.downloads && <div><p className="text-[#484f58] text-xs">Downloads/ep</p><p className="text-[#8b949e]">{listing.downloads.toLocaleString()}</p></div>}
              {listing.followers && <div><p className="text-[#484f58] text-xs">Followers</p><p className="text-[#8b949e]">{listing.followers.toLocaleString()}</p></div>}
            </div>
          </div>

          {listing.past_advertisers.length > 0 && (
            <div>
              <p className="text-[#6e7681] text-xs font-semibold mb-2">Past advertisers</p>
              <div className="flex flex-wrap gap-1.5">
                {listing.past_advertisers.map(a => (
                  <span key={a} className="text-xs text-[#8b949e] bg-[#21262d] border border-[#30363d] px-2 py-0.5 rounded">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-[#6e7681] font-medium mb-1.5">Update listing status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as ListingStatus)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm outline-none"
            >
              {Object.keys(LISTING_STATUS_CONFIG).map(s => (
                <option key={s} value={s}>{LISTING_STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={updateStatus}
              disabled={updatingStatus || newStatus === listing.status}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/30 text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Status
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-lg border border-[#30363d] text-[#6e7681] hover:text-[#e6edf3] text-sm transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SellerBookingCard({ booking }: { booking: DepositBooking }) {
  const sc = BOOKING_STATUS_CONFIG[booking.status];
  const listing = booking.listing as any;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-amber-400 font-semibold">{booking.reference_number}</span>
            <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
          </div>
          <p className="text-[#e6edf3] font-semibold text-sm">{listing?.property_name}</p>
          <p className="text-[#6e7681] text-xs mt-0.5">{booking.buyer_name} · {booking.buyer_company}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-emerald-400 font-bold text-base">${booking.balance_amount.toLocaleString()}</p>
          <p className="text-[#6e7681] text-xs">your payout</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#21262d]">
        <Pill label="Deposit (platform)" value={`$${booking.deposit_amount.toLocaleString()}`} />
        <Pill label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
        <Pill label="Slots" value={`${booking.slots_count}`} />
        <Pill label="Buyer email" value={booking.buyer_email} />
      </div>

      <div className="mt-3 pt-3 border-t border-[#21262d] flex items-center gap-2">
        <Mail className="w-3 h-3 text-[#484f58]" />
        <a href={`mailto:${booking.buyer_email}`} className="text-xs text-[#6e7681] hover:text-emerald-400 transition-colors">
          Contact buyer: {booking.buyer_email}
        </a>
        {booking.buyer_phone && (
          <>
            <span className="text-[#30363d]">·</span>
            <Phone className="w-3 h-3 text-[#484f58]" />
            <span className="text-xs text-[#6e7681]">{booking.buyer_phone}</span>
          </>
        )}
      </div>

      {booking.message_to_creator && (
        <div className="mt-3 bg-[#21262d] rounded-lg border border-[#30363d] p-3">
          <p className="text-[#484f58] text-[10px] font-semibold mb-1">Message from buyer</p>
          <p className="text-[#6e7681] text-xs">{booking.message_to_creator}</p>
        </div>
      )}
    </div>
  );
}

function SellerProfilePanel({ profile, userEmail, onSaved }: {
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
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-[#e6edf3] font-bold">{profile.display_name || 'Your Profile'}</h3>
              <span className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
                Seller
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[#6e7681] hover:text-[#e6edf3] text-sm border border-[#30363d] hover:border-[#484f58] px-3 py-1.5 rounded-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <ProfileField label="Email" icon={<Mail className="w-3.5 h-3.5" />} value={userEmail || ''} editing={false} />
          <ProfileField label="Display name" icon={<User className="w-3.5 h-3.5" />} value={form.display_name} editing={editing} onChange={v => setForm(p => ({ ...p, display_name: v }))} />
          <ProfileField label="Company / Media name" icon={<Building2 className="w-3.5 h-3.5" />} value={form.company} editing={editing} onChange={v => setForm(p => ({ ...p, company: v }))} />
          <ProfileField label="Phone" icon={<Phone className="w-3.5 h-3.5" />} value={form.phone} editing={editing} onChange={v => setForm(p => ({ ...p, phone: v }))} />
          <ProfileField label="Website" icon={<Globe className="w-3.5 h-3.5" />} value={form.website} editing={editing} onChange={v => setForm(p => ({ ...p, website: v }))} />

          {editing && (
            <div>
              <label className="block text-xs text-[#6e7681] font-medium mb-1.5">Bio / About your media</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                placeholder="Describe your newsletter, podcast, or audience..."
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-colors resize-none"
              />
            </div>
          )}

          {!editing && profile.bio && (
            <div>
              <p className="text-xs text-[#6e7681] font-medium mb-1">Bio</p>
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
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-lg border border-[#30363d] text-[#6e7681] hover:text-[#e6edf3] text-sm transition-all">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <p className="text-[#6e7681] text-xs font-semibold mb-2 uppercase tracking-wide">Seller tips</p>
        <ul className="space-y-1.5 text-xs text-[#484f58]">
          <li>• Ensure your seller email on listings matches your account email so bookings appear here.</li>
          <li>• Respond to buyer enquiries promptly to maintain a high completion rate.</li>
          <li>• Keep your listing's deadline accurate — expired listings are automatically hidden.</li>
        </ul>
      </div>
    </div>
  );
}

function ProfileField({ label, icon, value, editing, onChange }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
}) {
  if (editing && onChange) {
    return (
      <div>
        <label className="block text-xs text-[#6e7681] font-medium mb-1.5">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">{icon}</div>
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
      <div className="text-[#484f58]">{icon}</div>
      <div>
        <p className="text-[10px] text-[#484f58] font-medium">{label}</p>
        <p className="text-[#8b949e] text-sm">{value || '—'}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, green, blue, amber, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  green?: boolean;
  blue?: boolean;
  amber?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-[#161b22] border rounded-xl p-4 ${warn ? 'border-orange-500/20' : 'border-[#30363d]'}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-[#6e7681] text-xs">{label}</p></div>
      <p className={`text-2xl font-black ${green ? 'text-emerald-400' : blue ? 'text-blue-400' : amber ? 'text-amber-400' : warn ? 'text-orange-400' : 'text-[#e6edf3]'}`}>
        {value}
      </p>
    </div>
  );
}

function InfoBlock({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-3">
      <p className="text-[#484f58] text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${green ? 'text-emerald-400' : red ? 'text-yellow-400' : 'text-[#e6edf3]'}`}>{value}</p>
    </div>
  );
}

function Pill({ label, value, urgent }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div>
      <p className="text-[9px] text-[#484f58] uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-xs font-medium ${urgent ? 'text-yellow-400' : 'text-[#6e7681]'}`}>{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 bg-[#21262d] border border-[#30363d] rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[#e6edf3] font-semibold text-sm mb-1">{title}</p>
        <p className="text-[#6e7681] text-sm mb-4">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg border border-emerald-500/30 transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

