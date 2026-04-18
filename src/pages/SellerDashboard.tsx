import { useState, useEffect, useCallback } from 'react';
import { BarChart2, CheckCircle, DollarSign, Plus, RefreshCw, ChevronRight, User, Building2, Mail, Phone, Globe, Loader2, X, LogOut, CreditCard as Edit3, Save, Package, Link, Twitter, Instagram, Youtube, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import SubmitByEmail from '../components/SubmitByEmail';
import CsvUpload from '../components/CsvUpload';
import type { Listing, ListingStatus, DepositBooking, BookingStatus } from '../types';

interface SellerDashboardProps {
  onBack: () => void;
  onListSlot: () => void;
}

type DashTab = 'listings' | 'bookings' | 'profile';

const LISTING_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  live: { label: 'Live', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  securing: { label: 'Being Secured', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  pending_review: { label: 'Pending Review', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  secured: { label: 'Secured', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  in_progress: { label: 'In Progress', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  completed_off_platform: { label: 'Completed', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  expired: { label: 'Expired', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  cancelled: { label: 'Cancelled', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
};

const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  secured: { label: 'Secured', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  in_progress: { label: 'In Progress', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  completed_off_platform: { label: 'Completed', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  refund_requested: { label: 'Refund Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  refunded: { label: 'Refunded', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
  cancelled: { label: 'Cancelled', color: 'text-[#6e6e73]', bg: 'bg-[#f5f5f7] border-black/[0.08]' },
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#1d1d1f] font-semibold text-base tracking-[-0.01em]">Seller Dashboard</h1>
            <p className="text-[#6e6e73] text-xs mt-0.5">
              {profile?.display_name} · {user?.email}
            </p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="w-4 h-4 text-[#86868b]" />} label="Total Listings" value={stats.totalListings} />
          <StatCard icon={<BarChart2 className="w-4 h-4 text-green-600" />} label="Live Now" value={stats.liveListings} green />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Bookings Received" value={stats.totalBookings} green />
          <StatCard icon={<DollarSign className="w-4 h-4 text-[#86868b]" />} label="Pending Payouts" value={`$${stats.pendingPayouts.toLocaleString()}`} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit">
            {([['listings', 'My Listings'], ['bookings', 'Bookings'], ['profile', 'Profile']] as [DashTab, string][]).map(([key, label]) => (
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
              </button>
            ))}
          </div>

          {tab === 'listings' && (
            <button
              onClick={onListSlot}
              className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              List a Slot
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
          </div>
        ) : tab === 'listings' ? (
          listings.length === 0 ? (
            <div className="space-y-6">
              <EmptyState
                icon={<Package className="w-8 h-8 text-[#aeaeb2]" />}
                title="No listings yet"
                description="List your first slot to start receiving bookings."
                action={{ label: 'List a Slot', onClick: onListSlot }}
              />
              <SubmitByEmail variant="compact" />
              <CsvUpload variant="compact" />
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <ListingCard key={l.id} listing={l} onClick={() => setSelectedListing(l)} />
              ))}
              <div className="pt-2 space-y-3">
                <SubmitByEmail variant="compact" />
                <CsvUpload variant="compact" />
              </div>
            </div>
          )
        ) : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-8 h-8 text-[#aeaeb2]" />}
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
      className="w-full text-left bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md hover:shadow-black/[0.06] rounded-2xl p-4 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
            <span className="bg-[#f5f5f7] border border-black/[0.08] text-[#1d1d1f] text-[10px] font-bold px-2 py-0.5 rounded-lg">
              -{discount}%
            </span>
          </div>
          <h3 className="text-[#1d1d1f] font-semibold text-sm truncate">{listing.property_name}</h3>
          <p className="text-[#6e6e73] text-xs mt-0.5">{listing.media_company_name} · {listing.slot_type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[#1d1d1f] font-bold">${listing.discounted_price.toLocaleString()}</p>
          <p className="text-[#aeaeb2] text-xs line-through">${listing.original_price.toLocaleString()}</p>
          <ChevronRight className="w-4 h-4 text-[#aeaeb2] group-hover:text-[#6e6e73] ml-auto mt-1 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/[0.04]">
        <Pill label="Slots remaining" value={`${listing.slots_remaining}/${listing.slots_total || '?'}`} />
        <Pill label="Ad slot date" value={listing.date_label} />
        <Pill label="Claim deadline" value={hoursLeft < 24 ? `${hoursLeft}h left` : `${Math.floor(hoursLeft / 24)}d left`} urgent={hoursLeft < 24} />
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#1d1d1f] font-semibold">Listing Details</h2>
            <p className="text-[#6e6e73] text-xs mt-0.5 capitalize">{listing.media_type}</p>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
                {sc.label}
              </span>
            </div>
            <h3 className="text-[#1d1d1f] font-semibold text-lg">{listing.property_name}</h3>
            <p className="text-[#6e6e73] text-sm">{listing.media_company_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Discounted price" value={`$${listing.discounted_price.toLocaleString()}`} green />
            <InfoBlock label="Original price" value={`$${listing.original_price.toLocaleString()}`} />
            <InfoBlock label="Discount" value={`-${discount}%`} />
            <InfoBlock label="Slots remaining" value={`${listing.slots_remaining} / ${listing.slots_total || '?'}`} />
          </div>

          <div className="bg-[#f5f5f7] rounded-2xl border border-black/[0.06] p-4">
            <p className="text-[#86868b] text-xs font-semibold mb-3 uppercase tracking-wider">Audience & Reach</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#86868b] text-xs">Audience</p><p className="text-[#1d1d1f] text-sm">{listing.audience}</p></div>
              <div><p className="text-[#86868b] text-xs">Location</p><p className="text-[#1d1d1f] text-sm">{listing.location}</p></div>
              <div><p className="text-[#86868b] text-xs">Slot type</p><p className="text-[#1d1d1f] text-sm">{listing.slot_type}</p></div>
              <div><p className="text-[#86868b] text-xs">Date</p><p className="text-[#1d1d1f] text-sm">{listing.date_label}</p></div>
              {listing.subscribers && <div><p className="text-[#86868b] text-xs">Subscribers</p><p className="text-[#1d1d1f] text-sm">{listing.subscribers.toLocaleString()}</p></div>}
              {listing.open_rate && <div><p className="text-[#86868b] text-xs">Open rate</p><p className="text-[#1d1d1f] text-sm">{listing.open_rate}</p></div>}
              {listing.downloads && <div><p className="text-[#86868b] text-xs">Downloads/ep</p><p className="text-[#1d1d1f] text-sm">{listing.downloads.toLocaleString()}</p></div>}
              {listing.followers && <div><p className="text-[#86868b] text-xs">Followers</p><p className="text-[#1d1d1f] text-sm">{listing.followers.toLocaleString()}</p></div>}
            </div>
          </div>

          {listing.past_advertisers.length > 0 && (
            <div>
              <p className="text-[#86868b] text-xs font-semibold mb-2">Past advertisers</p>
              <div className="flex flex-wrap gap-1.5">
                {listing.past_advertisers.map(a => (
                  <span key={a} className="text-xs text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.08] px-2 py-0.5 rounded-lg">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Update listing status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as ListingStatus)}
              className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
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
              className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Status
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-2xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all">
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
    <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-[#6e6e73] font-semibold">{booking.reference_number}</span>
            <span className={`inline-flex items-center gap-1 border text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
              {sc.label}
            </span>
          </div>
          <p className="text-[#1d1d1f] font-semibold text-sm">{listing?.property_name}</p>
          <p className="text-[#6e6e73] text-xs mt-0.5">{booking.buyer_name} · {booking.buyer_company}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-green-600 font-bold text-base">${booking.balance_amount.toLocaleString()}</p>
          <p className="text-[#aeaeb2] text-xs">your payout</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/[0.04]">
        <Pill label="Deposit (platform)" value={`$${booking.deposit_amount.toLocaleString()}`} />
        <Pill label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
        <Pill label="Slots" value={`${booking.slots_count}`} />
        <Pill label="Buyer email" value={booking.buyer_email} />
      </div>

      <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2">
        <Mail className="w-3 h-3 text-[#aeaeb2]" />
        <a href={`mailto:${booking.buyer_email}`} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
          Contact buyer: {booking.buyer_email}
        </a>
        {booking.buyer_phone && (
          <>
            <span className="text-[#d2d2d7]">·</span>
            <Phone className="w-3 h-3 text-[#aeaeb2]" />
            <span className="text-xs text-[#6e6e73]">{booking.buyer_phone}</span>
          </>
        )}
      </div>

      {booking.message_to_creator && (
        <div className="mt-3 bg-[#f5f5f7] rounded-xl border border-black/[0.06] p-3">
          <p className="text-[#86868b] text-[10px] font-semibold mb-1">Message from buyer</p>
          <p className="text-[#6e6e73] text-xs">{booking.message_to_creator}</p>
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
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    company: profile?.company || '',
    phone: profile?.phone || '',
    website: profile?.website || '',
    bio: profile?.bio || '',
    seller_bio: profile?.seller_bio || '',
    seller_website_url: profile?.seller_website_url || '',
    seller_company_url: profile?.seller_company_url || '',
    seller_linkedin_url: profile?.seller_linkedin_url || '',
    seller_twitter_url: profile?.seller_twitter_url || '',
    seller_instagram_url: profile?.seller_instagram_url || '',
    seller_youtube_url: profile?.seller_youtube_url || '',
    seller_tiktok_url: profile?.seller_tiktok_url || '',
    seller_podcast_url: profile?.seller_podcast_url || '',
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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!profile) return null;

  const hasLinks = form.seller_website_url || form.seller_linkedin_url || form.seller_twitter_url ||
    form.seller_instagram_url || form.seller_youtube_url || form.seller_tiktok_url || form.seller_podcast_url;

  return (
    <div className="max-w-2xl space-y-5">
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Profile saved. Your info will be used on all future listings.
        </div>
      )}

      <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-[#1d1d1f] font-semibold">{profile.display_name || 'Your Profile'}</h3>
              <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize">
                Seller
              </span>
            </div>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-xl text-sm transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wider mb-3">Account</p>
            <div className="space-y-3">
              <ProfileField label="Email" icon={<Mail className="w-3.5 h-3.5" />} value={userEmail || ''} editing={false} />
              <ProfileField label="Display name" icon={<User className="w-3.5 h-3.5" />} value={form.display_name} editing={editing} onChange={v => setForm(p => ({ ...p, display_name: v }))} />
              <ProfileField label="Company / Media name" icon={<Building2 className="w-3.5 h-3.5" />} value={form.company} editing={editing} onChange={v => setForm(p => ({ ...p, company: v }))} />
              <ProfileField label="Phone" icon={<Phone className="w-3.5 h-3.5" />} value={form.phone} editing={editing} onChange={v => setForm(p => ({ ...p, phone: v }))} />
            </div>
          </div>

          <div className="border-t border-black/[0.04] pt-5">
            <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wider mb-3">
              Seller bio &amp; profile
              <span className="ml-2 text-[#aeaeb2] font-normal normal-case">Shown on all your listings</span>
            </p>
            <div className="space-y-3">
              {editing ? (
                <div>
                  <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Short bio</label>
                  <textarea
                    value={form.seller_bio}
                    onChange={e => setForm(p => ({ ...p, seller_bio: e.target.value }))}
                    rows={3}
                    placeholder="Describe your newsletter, podcast, or audience in 1–2 sentences..."
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
                  />
                </div>
              ) : (
                (form.seller_bio || form.bio) ? (
                  <div>
                    <p className="text-xs text-[#86868b] font-semibold mb-1">Bio</p>
                    <p className="text-[#6e6e73] text-sm leading-relaxed">{form.seller_bio || form.bio}</p>
                  </div>
                ) : (
                  <p className="text-[#aeaeb2] text-xs italic">No bio added yet. Click Edit profile to add one.</p>
                )
              )}
            </div>
          </div>

          <div className="border-t border-black/[0.04] pt-5">
            <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wider mb-3">
              Links &amp; social
              <span className="ml-2 text-[#aeaeb2] font-normal normal-case">Help buyers verify your credibility</span>
            </p>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ProfileField label="Personal website" icon={<Globe className="w-3.5 h-3.5" />} value={form.seller_website_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_website_url: v }))} type="url" placeholder="https://yoursite.com" />
                <ProfileField label="Company page" icon={<Building2 className="w-3.5 h-3.5" />} value={form.seller_company_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_company_url: v }))} type="url" placeholder="https://yourcompany.com" />
                <ProfileField label="LinkedIn" icon={<Link className="w-3.5 h-3.5" />} value={form.seller_linkedin_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_linkedin_url: v }))} type="url" placeholder="https://linkedin.com/in/you" />
                <ProfileField label="Twitter / X" icon={<Twitter className="w-3.5 h-3.5" />} value={form.seller_twitter_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_twitter_url: v }))} type="url" placeholder="https://x.com/yourhandle" />
                <ProfileField label="Instagram" icon={<Instagram className="w-3.5 h-3.5" />} value={form.seller_instagram_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_instagram_url: v }))} type="url" placeholder="https://instagram.com/yourhandle" />
                <ProfileField label="YouTube" icon={<Youtube className="w-3.5 h-3.5" />} value={form.seller_youtube_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_youtube_url: v }))} type="url" placeholder="https://youtube.com/@yourchannel" />
                <ProfileField label="TikTok" icon={<Link className="w-3.5 h-3.5" />} value={form.seller_tiktok_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_tiktok_url: v }))} type="url" placeholder="https://tiktok.com/@yourhandle" />
                <ProfileField label="Podcast" icon={<Mic className="w-3.5 h-3.5" />} value={form.seller_podcast_url} editing={editing} onChange={v => setForm(p => ({ ...p, seller_podcast_url: v }))} type="url" placeholder="https://open.spotify.com/show/..." />
              </div>
            ) : hasLinks ? (
              <div className="flex flex-wrap gap-2">
                {form.seller_website_url && <LinkBadge icon={<Globe className="w-3 h-3" />} label="Website" url={form.seller_website_url} />}
                {form.seller_company_url && <LinkBadge icon={<Building2 className="w-3 h-3" />} label="Company" url={form.seller_company_url} />}
                {form.seller_linkedin_url && <LinkBadge icon={<Link className="w-3 h-3" />} label="LinkedIn" url={form.seller_linkedin_url} />}
                {form.seller_twitter_url && <LinkBadge icon={<Twitter className="w-3 h-3" />} label="Twitter" url={form.seller_twitter_url} />}
                {form.seller_instagram_url && <LinkBadge icon={<Instagram className="w-3 h-3" />} label="Instagram" url={form.seller_instagram_url} />}
                {form.seller_youtube_url && <LinkBadge icon={<Youtube className="w-3 h-3" />} label="YouTube" url={form.seller_youtube_url} />}
                {form.seller_tiktok_url && <LinkBadge icon={<Link className="w-3 h-3" />} label="TikTok" url={form.seller_tiktok_url} />}
                {form.seller_podcast_url && <LinkBadge icon={<Mic className="w-3 h-3" />} label="Podcast" url={form.seller_podcast_url} />}
              </div>
            ) : (
              <p className="text-[#aeaeb2] text-xs italic">No links added yet. Click Edit profile to add social and website links.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
        <p className="text-[#86868b] text-xs font-semibold mb-2 uppercase tracking-wider">Seller tips</p>
        <ul className="space-y-1.5 text-xs text-[#6e6e73]">
          <li>· Your name, company, bio, and links are automatically applied to all new listings you create.</li>
          <li>· Respond to buyer enquiries promptly to maintain a high completion rate.</li>
          <li>· Keep your listing's deadline accurate — expired listings are automatically hidden.</li>
        </ul>
      </div>
    </div>
  );
}

function LinkBadge({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-white border border-black/[0.08] hover:border-black/[0.15] px-2.5 py-1.5 rounded-xl transition-all"
    >
      {icon}
      {label}
    </a>
  );
}

function ProfileField({ label, icon, value, editing, onChange, type = 'text', placeholder }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  if (editing && onChange) {
    return (
      <div>
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2]">{icon}</div>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl pl-9 pr-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all placeholder-[#aeaeb2]"
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

function StatCard({ icon, label, value, green }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  green?: boolean;
}) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-[#6e6e73] text-xs">{label}</p></div>
      <p className={`text-2xl font-bold tracking-[-0.02em] ${green ? 'text-green-600' : 'text-[#1d1d1f]'}`}>
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

function Pill({ label, value, urgent }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div>
      <p className="text-[9px] text-[#86868b] uppercase tracking-wide font-semibold">{label}</p>
      <p className={`text-xs font-medium ${urgent ? 'text-orange-600' : 'text-[#6e6e73]'}`}>{value}</p>
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
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="w-14 h-14 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[#1d1d1f] font-semibold text-sm mb-1">{title}</p>
        <p className="text-[#6e6e73] text-sm mb-4">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-5 py-2.5 rounded-2xl transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
