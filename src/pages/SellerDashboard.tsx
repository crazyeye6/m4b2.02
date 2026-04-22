import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, CheckCircle, DollarSign, Plus, RefreshCw, ChevronRight, User, Building2,
  Mail, Phone, Globe, Loader2, X, LogOut, CreditCard as Edit3, Save, Package, Link,
  Twitter, Instagram, Youtube, Mic, TrendingUp, ShieldCheck, Sparkles, TrendingDown,
  Info, BookOpen, Copy, Upload, Zap, Eye, Send, Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import SubmitByEmail from '../components/SubmitByEmail';
import MediaProfileEditor from '../components/MediaProfileEditor';
import SellerCsvUpload from '../components/SellerCsvUpload';
import NewsletterManager from '../components/NewsletterManager';
import type { Listing, ListingStatus, DepositBooking, BookingStatus, MediaProfile, Newsletter } from '../types';
import { calcDynamicPrice, TIER_STYLES } from '../lib/dynamicPricing';

interface SellerDashboardProps {
  onBack: () => void;
  onListSlot: (newsletterId?: string) => void;
}

type DashTab = 'listings' | 'newsletters' | 'bookings' | 'media' | 'csv_upload' | 'profile';

interface MarketInsights {
  avgPrice: number;
  avgDiscount: number;
  topCategories: { label: string; count: number }[];
  totalActiveListings: number;
}

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
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mediaProfiles, setMediaProfiles] = useState<MediaProfile[]>([]);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    const [listingsRes, bookingsRes, insightsRes, mediaProfilesRes] = await Promise.all([
      supabase
        .from('listings')
        .select('*, media_profile:media_profiles(*), newsletter:newsletters(*)')
        .or(`seller_user_id.eq.${user.id},seller_email.eq.${user.email}`)
        .order('created_at', { ascending: false }),
      supabase
        .from('deposit_bookings')
        .select('*, listing:listings(property_name, media_owner_name, media_type, date_label)')
        .eq('seller_email', user.email)
        .order('created_at', { ascending: false }),
      supabase
        .from('listings')
        .select('discounted_price, original_price, media_type, status')
        .eq('status', 'live'),
      supabase
        .from('media_profiles')
        .select('*')
        .or(`seller_user_id.eq.${user.id},seller_email.eq.${user.email}`)
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
    ]);

    if (listingsRes.data) setListings(listingsRes.data as Listing[]);
    if (bookingsRes.data) setBookings(bookingsRes.data as DepositBooking[]);
    if (mediaProfilesRes.data) setMediaProfiles(mediaProfilesRes.data as MediaProfile[]);

    if (insightsRes.data && insightsRes.data.length > 0) {
      const live = insightsRes.data;
      const avgPrice = Math.round(live.reduce((s: number, l: any) => s + l.discounted_price, 0) / live.length);
      const avgDiscount = Math.round(
        live.reduce((s: number, l: any) => s + ((l.original_price - l.discounted_price) / l.original_price) * 100, 0) / live.length
      );
      const catCounts: Record<string, number> = {};
      live.forEach((l: any) => {
        const cat = l.media_type || 'Other';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
      const topCategories = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, count]) => ({ label, count }));

      setInsights({ avgPrice, avgDiscount, topCategories, totalActiveListings: live.length });
    }

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

  const handleDuplicate = async (listing: Listing) => {
    if (!user) return;
    setDuplicating(listing.id);
    const { id, created_at, media_profile, newsletter, ...rest } = listing as any;
    await supabase.from('listings').insert({
      ...rest,
      status: 'live',
      seller_user_id: user.id,
      seller_email: user.email,
      property_name: `${listing.property_name} (copy)`,
    });
    await fetchData();
    setDuplicating(null);
  };

  const tabs: [DashTab, string][] = [
    ['listings', 'My Listings'],
    ['newsletters', 'Newsletters'],
    ['bookings', 'Bookings'],
    ['media', 'Media Profiles'],
    ['csv_upload', 'Weekly Upload'],
    ['profile', 'Profile'],
  ];

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
            <button onClick={onBack} className="text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-colors">
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
        <CuratedPlatformBanner onListSlot={() => onListSlot()} />

        {!loading && mediaProfiles.length === 0 && tab === 'listings' && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-amber-900 font-semibold text-sm">Add your media profile to build buyer trust</p>
              <p className="text-amber-700 text-xs mt-0.5 leading-snug">Buyers convert faster when they can see your full newsletter stats, audience, and past advertisers.</p>
            </div>
            <button onClick={() => setTab('media')} className="flex-shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-white border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-xl transition-all">
              Set up now
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="w-4 h-4 text-[#86868b]" />} label="Total Listings" value={stats.totalListings} />
          <StatCard icon={<BarChart2 className="w-4 h-4 text-green-600" />} label="Live Now" value={stats.liveListings} green />
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Bookings Received" value={stats.totalBookings} green />
          <StatCard icon={<DollarSign className="w-4 h-4 text-[#86868b]" />} label="Pending Payouts" value={`$${stats.pendingPayouts.toLocaleString()}`} />
        </div>

        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-1 w-fit flex-wrap">
            {tabs.map(([key, label]) => (
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
              onClick={() => onListSlot()}
              className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              New Listing
            </button>
          )}
          {tab === 'newsletters' && (
            <button
              onClick={() => onListSlot()}
              className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              New Listing
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
          </div>
        ) : tab === 'listings' ? (
          <ListingsTab
            listings={listings}
            duplicating={duplicating}
            onSelect={setSelectedListing}
            onListSlot={() => onListSlot()}
            onDuplicate={handleDuplicate}
            insights={insights}
          />
        ) : tab === 'newsletters' ? (
          <div className="max-w-3xl">
            <NewsletterManager
              onCreateListingForNewsletter={nl => onListSlot(nl.id)}
            />
          </div>
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
        ) : tab === 'media' ? (
          <div className="max-w-3xl">
            <MediaProfileBanner onListSlot={() => onListSlot()} hasProfiles={mediaProfiles.length > 0} />
            <MediaProfileEditor onProfilesChanged={setMediaProfiles} />
          </div>
        ) : tab === 'csv_upload' ? (
          <div className="space-y-6">
            <CsvWorkflowBanner />
            <SellerCsvUpload />
          </div>
        ) : (
          <SellerProfilePanel profile={profile} userEmail={user?.email} onSaved={refreshProfile} />
        )}
      </div>

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onRefetch={fetchData}
          onDuplicate={handleDuplicate}
          duplicating={duplicating === selectedListing.id}
        />
      )}
    </div>
  );
}

function ListingsTab({ listings, duplicating, onSelect, onListSlot, onDuplicate, insights }: {
  listings: Listing[];
  duplicating: string | null;
  onSelect: (l: Listing) => void;
  onListSlot: () => void;
  onDuplicate: (l: Listing) => void;
  insights: MarketInsights | null;
}) {
  const activeListings = listings.filter(l => l.status !== 'expired' && l.status !== 'cancelled');
  const expiredListings = listings.filter(l => l.status === 'expired' || l.status === 'cancelled');

  if (listings.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Package className="w-8 h-8 text-[#aeaeb2]" />}
          title="No listings yet"
          description="List your first slot to start receiving bookings."
          action={{ label: 'New Listing', onClick: onListSlot }}
        />
        <SubmitByEmail variant="compact" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeListings.length > 0 && (
        <div className="space-y-3">
          <AutoPricingBanner />
          <ListingsTable listings={activeListings} duplicating={duplicating} onSelect={onSelect} onDuplicate={onDuplicate} />
        </div>
      )}
      {expiredListings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[#1d1d1f] font-semibold text-sm">Expired & Cancelled</h3>
            <span className="text-[#6e6e73] text-xs bg-[#f5f5f7] border border-black/[0.06] px-2 py-0.5 rounded-lg">{expiredListings.length}</span>
          </div>
          <p className="text-[#86868b] text-xs">These slots have passed their deadline. Click a listing to edit and re-publish with a new date.</p>
          <ListingsTable listings={expiredListings} duplicating={duplicating} onSelect={onSelect} onDuplicate={onDuplicate} />
        </div>
      )}
      <div className="pt-2">
        <SubmitByEmail variant="compact" />
      </div>
      {insights && <MarketInsightsPanel insights={insights} />}
    </div>
  );
}

function ListingsTable({ listings, duplicating, onSelect, onDuplicate }: {
  listings: Listing[];
  duplicating: string | null;
  onSelect: (l: Listing) => void;
  onDuplicate: (l: Listing) => void;
}) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-black/[0.06] bg-[#f5f5f7]">
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Newsletter / Slot</span>
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Issue date</span>
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Price</span>
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Status</span>
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Pricing</span>
        <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider">Actions</span>
      </div>
      {listings.map((l, i) => (
        <ListingTableRow
          key={l.id}
          listing={l}
          isLast={i === listings.length - 1}
          duplicating={duplicating === l.id}
          onSelect={() => onSelect(l)}
          onDuplicate={() => onDuplicate(l)}
        />
      ))}
    </div>
  );
}

function ListingTableRow({ listing, isLast, duplicating, onSelect, onDuplicate }: {
  listing: Listing;
  isLast: boolean;
  duplicating: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
}) {
  const sc = LISTING_STATUS_CONFIG[listing.status] || LISTING_STATUS_CONFIG.live;
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, listing.auto_discount_enabled);
  const { currentPrice, discountPct, urgencyLabel, tier } = pricing;
  const tierStyle = TIER_STYLES[tier];
  const newsletter = (listing as any).newsletter as Newsletter | null;
  const newsletterName = newsletter?.name || listing.property_name;
  const publisher = newsletter?.publisher_name || listing.media_company_name;

  const deadline = new Date(listing.deadline_at);
  const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 3600000));

  return (
    <div className={`px-4 py-3 ${!isLast ? 'border-b border-black/[0.04]' : ''} hover:bg-[#f5f5f7]/50 transition-colors`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[#1d1d1f] font-semibold text-sm truncate">{newsletterName}</p>
            {urgencyLabel && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tierStyle.badge}`}>{urgencyLabel}</span>
            )}
          </div>
          <p className="text-[#86868b] text-xs truncate">{publisher} · {listing.slot_type}</p>
        </div>

        <div className="hidden sm:block flex-shrink-0 text-right w-28">
          <p className="text-[#6e6e73] text-xs">{listing.date_label}</p>
          <p className="text-[#aeaeb2] text-[10px]">
            {hoursLeft < 24 ? `${hoursLeft}h deadline` : `${Math.floor(hoursLeft / 24)}d deadline`}
          </p>
        </div>

        <div className="hidden sm:block flex-shrink-0 text-right w-20">
          <p className="text-[#1d1d1f] font-bold text-sm">${currentPrice.toLocaleString()}</p>
          {discountPct > 0 && (
            <p className="text-[#aeaeb2] text-[10px] line-through">${listing.original_price.toLocaleString()}</p>
          )}
        </div>

        <div className="hidden sm:block flex-shrink-0 w-24">
          <span className={`inline-flex items-center border text-[10px] font-semibold px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>
            {sc.label}
          </span>
        </div>

        <div className="hidden sm:block flex-shrink-0 w-28">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${
            listing.auto_discount_enabled
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.06]'
          }`}>
            {listing.auto_discount_enabled ? 'Auto-Discount' : 'Fixed Price'}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onSelect}
            className="flex items-center gap-1 text-[11px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.08] px-2.5 py-1.5 rounded-xl transition-all"
            title="Edit listing"
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            disabled={duplicating}
            className="flex items-center gap-1 text-[11px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.08] px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-40"
            title="Duplicate listing"
          >
            {duplicating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">Duplicate</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaProfileBanner({ onListSlot, hasProfiles }: { onListSlot: () => void; hasProfiles: boolean }) {
  if (hasProfiles) return null;
  return (
    <div className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4.5 h-4.5 text-emerald-700" />
        </div>
        <div className="flex-1">
          <p className="text-emerald-900 font-semibold text-sm mb-1">Set up your media profile once — use it on every listing</p>
          <p className="text-emerald-700 text-xs leading-relaxed">
            Buyers make faster decisions when they can see your full newsletter profile: subscriber count, open rate, audience, past advertisers, and a sample issue.
          </p>
        </div>
      </div>
    </div>
  );
}

function CuratedPlatformBanner({ onListSlot }: { onListSlot: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.02] rounded-full translate-y-1/2 -translate-x-1/4" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Curated Marketplace</span>
        </div>
        <h2 className="text-white text-xl sm:text-2xl font-semibold tracking-[-0.02em] mb-3 max-w-lg">
          We match your opportunities with the right buyers.
        </h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-xl mb-6">
          Simply list your slots and we handle discovery, matching, and introductions on your behalf.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onListSlot}
            className="flex items-center gap-2 bg-white text-slate-900 hover:bg-white/90 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </button>
          <div className="flex items-center gap-4">
            <Feature icon={<Sparkles className="w-3.5 h-3.5" />} label="AI-powered matching" />
            <Feature icon={<TrendingUp className="w-3.5 h-3.5" />} label="Demand-driven discovery" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/50 text-xs">
      {icon}
      {label}
    </div>
  );
}

function MarketInsightsPanel({ insights }: { insights: MarketInsights }) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-[#1d1d1f] font-semibold text-sm">Market Insights</h3>
          <p className="text-[#6e6e73] text-xs">Aggregated, anonymous signals across the platform</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <InsightCard label="Avg. listing price" value={`$${insights.avgPrice.toLocaleString()}`} sub="across live opportunities" />
        <InsightCard label="Typical discount" value={`${insights.avgDiscount}%`} sub="off original rate card" />
        <InsightCard label="Active opportunities" value={`${insights.totalActiveListings}`} sub="live on the platform now" />
      </div>
      {insights.topCategories.length > 0 && (
        <div>
          <p className="text-[#86868b] text-[11px] font-semibold uppercase tracking-wider mb-3">Top demand categories</p>
          <div className="space-y-2">
            {insights.topCategories.map(({ label, count }, i) => {
              const maxCount = insights.topCategories[0].count;
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[#6e6e73] text-xs w-28 capitalize truncate">{label}</span>
                  <div className="flex-1 bg-[#f5f5f7] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%`, opacity: 1 - i * 0.2 }} />
                  </div>
                  <span className="text-[#aeaeb2] text-xs w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <p className="text-[#aeaeb2] text-[10px] mt-4 pt-4 border-t border-black/[0.04]">
        All figures are aggregated across the platform. No individual seller data is revealed.
      </p>
    </div>
  );
}

function InsightCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
      <p className="text-[#86868b] text-xs mb-1">{label}</p>
      <p className="text-[#1d1d1f] text-xl font-bold tracking-[-0.02em]">{value}</p>
      <p className="text-[#aeaeb2] text-[10px] mt-0.5">{sub}</p>
    </div>
  );
}

function ListingDetailModal({ listing, onClose, onRefetch, onDuplicate, duplicating }: {
  listing: Listing;
  onClose: () => void;
  onRefetch: () => void;
  onDuplicate: (l: Listing) => void;
  duplicating: boolean;
}) {
  const { user } = useAuth();
  const sc = LISTING_STATUS_CONFIG[listing.status] || LISTING_STATUS_CONFIG.live;
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, listing.auto_discount_enabled);
  const { currentPrice, discountPct, tier, urgencyLabel } = pricing;
  const tierStyle = TIER_STYLES[tier];
  const hasDiscount = discountPct > 0;
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ListingStatus>(listing.status);
  const [republishDeadline, setRepublishDeadline] = useState('');
  const [republishSlots, setRepublishSlots] = useState(String(listing.slots_remaining));
  const [republishing, setRepublishing] = useState(false);
  const isExpired = listing.status === 'expired' || listing.status === 'cancelled';
  const [sellerProfiles, setSellerProfiles] = useState<MediaProfile[]>([]);
  const [linkedProfileId, setLinkedProfileId] = useState<string | null>(listing.media_profile_id ?? null);
  const [linkingSaving, setLinkingSaving] = useState(false);
  const [linkingSaved, setLinkingSaved] = useState(false);

  const newsletter = (listing as any).newsletter as Newsletter | null;

  useEffect(() => {
    if (!user) return;
    supabase
      .from('media_profiles')
      .select('*')
      .eq('seller_user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => setSellerProfiles((data as MediaProfile[]) ?? []));
  }, [user]);

  const saveProfileLink = async () => {
    setLinkingSaving(true);
    await supabase.from('listings').update({ media_profile_id: linkedProfileId }).eq('id', listing.id);
    setLinkingSaving(false);
    setLinkingSaved(true);
    setTimeout(() => setLinkingSaved(false), 2000);
    onRefetch();
  };

  const profileLinkChanged = linkedProfileId !== (listing.media_profile_id ?? null);

  const updateStatus = async () => {
    setUpdatingStatus(true);
    await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id);
    await onRefetch();
    onClose();
    setUpdatingStatus(false);
  };

  const republish = async () => {
    if (!republishDeadline) return;
    setRepublishing(true);
    await supabase.from('listings').update({
      status: 'live',
      deadline_at: new Date(republishDeadline).toISOString(),
      slots_remaining: parseInt(republishSlots, 10) || listing.slots_remaining,
    }).eq('id', listing.id);
    await onRefetch();
    onClose();
    setRepublishing(false);
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
            <h3 className="text-[#1d1d1f] font-semibold text-lg">
              {newsletter?.name || listing.property_name}
            </h3>
            <p className="text-[#6e6e73] text-sm">
              {newsletter?.publisher_name || listing.media_company_name}
              {listing.slot_type && ` · ${listing.slot_type}`}
            </p>
          </div>

          {newsletter && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-blue-700 text-xs">
                Linked to newsletter: <span className="font-semibold">{newsletter.name}</span>
                {newsletter.subscriber_count && ` · ${newsletter.subscriber_count.toLocaleString()} subscribers`}
                {newsletter.avg_open_rate && ` · ${newsletter.avg_open_rate} open rate`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Current price (live)" value={`$${currentPrice.toLocaleString()}`} green />
            <InfoBlock label="Base price" value={`$${listing.original_price.toLocaleString()}`} />
            <InfoBlock label="Auto-discount" value={listing.auto_discount_enabled ? (hasDiscount ? `-${discountPct}%` : 'Active — no tier yet') : 'Disabled'} />
            <InfoBlock label="Slots remaining" value={`${listing.slots_remaining} / ${listing.slots_total || '?'}`} />
          </div>

          {urgencyLabel && (
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${tierStyle.bg} border ${tierStyle.border}`}>
              <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              <p className={`text-[12px] font-medium ${tier === 'last_chance' ? 'text-red-700' : tier === 'mid' ? 'text-orange-700' : 'text-amber-700'}`}>
                {urgencyLabel}{hasDiscount ? ` — ${discountPct}% auto-discount applied` : ''}
              </p>
            </div>
          )}

          <div className="bg-[#f5f5f7] rounded-2xl border border-black/[0.06] p-4">
            <p className="text-[#86868b] text-xs font-semibold mb-3 uppercase tracking-wider">Audience & Reach</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#86868b] text-xs">Audience</p><p className="text-[#1d1d1f] text-sm">{listing.audience}</p></div>
              <div><p className="text-[#86868b] text-xs">Location</p><p className="text-[#1d1d1f] text-sm">{listing.location}</p></div>
              <div><p className="text-[#86868b] text-xs">Slot type</p><p className="text-[#1d1d1f] text-sm">{listing.slot_type}</p></div>
              <div><p className="text-[#86868b] text-xs">Date</p><p className="text-[#1d1d1f] text-sm">{listing.date_label}</p></div>
              {listing.subscribers && <div><p className="text-[#86868b] text-xs">Subscribers</p><p className="text-[#1d1d1f] text-sm">{listing.subscribers.toLocaleString()}</p></div>}
              {listing.open_rate && <div><p className="text-[#86868b] text-xs">Open rate</p><p className="text-[#1d1d1f] text-sm">{listing.open_rate}</p></div>}
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

          {isExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-amber-800 font-semibold text-sm">Re-publish this listing</p>
              </div>
              <p className="text-amber-700 text-xs">Set a new booking deadline and available slots to make this listing live again.</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-amber-700 font-semibold uppercase tracking-wider mb-1">New booking deadline</label>
                  <input
                    type="datetime-local"
                    value={republishDeadline}
                    onChange={e => setRepublishDeadline(e.target.value)}
                    className="w-full bg-white border border-amber-200 focus:border-amber-400 rounded-xl px-3 py-2 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-700 font-semibold uppercase tracking-wider mb-1">Available slots</label>
                  <input
                    type="number"
                    min="1"
                    value={republishSlots}
                    onChange={e => setRepublishSlots(e.target.value)}
                    className="w-full bg-white border border-amber-200 focus:border-amber-400 rounded-xl px-3 py-2 text-[#1d1d1f] text-sm outline-none transition-all"
                  />
                </div>
              </div>
              <button
                onClick={republish}
                disabled={republishing || !republishDeadline}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {republishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Re-publish Listing
              </button>
            </div>
          )}

          <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#86868b]" />
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Linked media profile</label>
            </div>
            {sellerProfiles.length === 0 ? (
              <p className="text-[#aeaeb2] text-xs italic">No media profiles yet. Go to Media Profiles tab to create one.</p>
            ) : (
              <div className="space-y-2">
                <select
                  value={linkedProfileId ?? ''}
                  onChange={e => setLinkedProfileId(e.target.value || null)}
                  className="w-full bg-white border border-black/[0.08] focus:border-black/[0.2] rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                >
                  <option value="">No profile linked</option>
                  {sellerProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.newsletter_name}</option>
                  ))}
                </select>
                {profileLinkChanged && (
                  <button
                    onClick={saveProfileLink}
                    disabled={linkingSaving}
                    className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-2 rounded-xl text-sm transition-all"
                  >
                    {linkingSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save profile link
                  </button>
                )}
                {linkingSaved && <p className="text-green-600 text-xs text-center font-medium">Profile linked successfully.</p>}
              </div>
            )}
          </div>

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
            <button
              onClick={() => onDuplicate(listing)}
              disabled={duplicating}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all disabled:opacity-40"
              title="Duplicate listing"
            >
              {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              Duplicate
            </button>
            <button onClick={onClose} className="px-4 py-3 rounded-2xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all">
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
        <Pill label="Deposit" value={`$${booking.deposit_amount.toLocaleString()}`} />
        <Pill label="Total value" value={`$${booking.total_price.toLocaleString()}`} />
        <Pill label="Slots" value={`${booking.slots_count}`} />
      </div>
      <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2">
        <Mail className="w-3 h-3 text-[#aeaeb2]" />
        <a href={`mailto:${booking.buyer_email}`} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
          {booking.buyer_email}
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
          Profile saved.
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
              <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize">Seller</span>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all">
              <Edit3 className="w-3.5 h-3.5" />
              Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold px-4 py-1.5 rounded-xl text-sm transition-all">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-all">Cancel</button>
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
            ) : (form.seller_bio || form.bio) ? (
              <p className="text-[#6e6e73] text-sm leading-relaxed">{form.seller_bio || form.bio}</p>
            ) : (
              <p className="text-[#aeaeb2] text-xs italic">No bio added yet.</p>
            )}
          </div>

          <div className="border-t border-black/[0.04] pt-5">
            <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wider mb-3">
              Links &amp; social
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
              <p className="text-[#aeaeb2] text-xs italic">No links added yet.</p>
            )}
          </div>
        </div>
      </div>

      <AutoPricingExplainer />
    </div>
  );
}

function AutoPricingBanner() {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
      <TrendingDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
      <p className="text-[12px] text-slate-600 leading-snug flex-1">
        <span className="font-semibold text-slate-800">Automatic pricing active.</span>{' '}
        Prices automatically reduce as deadlines approach to help fill unsold slots.
      </p>
    </div>
  );
}

function AutoPricingExplainer() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[#1d1d1f] font-semibold text-sm">Automatic time-based pricing</p>
          <p className="text-[#6e6e73] text-xs">Applied to listings with Auto-Discount enabled</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Full price', sub: '5+ days left', style: 'bg-white text-[#1d1d1f] border border-black/[0.08]' },
          { label: '−10%', sub: '3–5 days left', style: 'bg-amber-50 text-amber-700 border border-amber-200' },
          { label: '−20%', sub: '1–3 days left', style: 'bg-orange-50 text-orange-700 border border-orange-200' },
          { label: '−30%', sub: 'Under 24h', style: 'bg-red-50 text-red-700 border border-red-200' },
        ].map((row, i) => (
          <div key={i} className={`rounded-xl p-2.5 text-center ${row.style}`}>
            <p className="text-[13px] font-bold">{row.label}</p>
            <p className="text-[10px] mt-0.5 opacity-70">{row.sub}</p>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 mt-3 bg-white border border-black/[0.06] rounded-xl px-3 py-2">
        <Info className="w-3.5 h-3.5 text-[#86868b] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#6e6e73] leading-snug">
          Discounts are calculated live. Urgency labels (Ending Soon, Last Chance) always show based on time, regardless of pricing mode.
        </p>
      </div>
    </div>
  );
}

function LinkBadge({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-white border border-black/[0.08] hover:border-black/[0.15] px-2.5 py-1.5 rounded-xl transition-all">
      {icon}
      {label}
    </a>
  );
}

function ProfileField({ label, icon, value, editing, onChange, type = 'text', placeholder }: {
  label: string; icon: React.ReactNode; value: string; editing: boolean; onChange?: (v: string) => void; type?: string; placeholder?: string;
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

function CsvWorkflowBanner() {
  return (
    <div className="space-y-4 max-w-4xl">
      {/* Hero tagline */}
      <div className="bg-white border border-black/[0.06] rounded-3xl px-6 py-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-[#1d1d1f]" />
        </div>
        <div>
          <p className="text-[#1d1d1f] font-semibold text-sm">Upload your weekly slots in under 2 minutes</p>
          <p className="text-[#6e6e73] text-xs mt-0.5">Designed for newsletter publishers who want to manage sponsorship inventory quickly and efficiently.</p>
        </div>
      </div>

      {/* 4-step flow */}
      <div className="bg-white border border-black/[0.06] rounded-3xl px-5 py-5">
        <p className="text-[10px] font-bold text-[#aeaeb2] uppercase tracking-widest mb-4">How it works</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Upload className="w-4 h-4" />, step: '01', title: 'Upload your weekly slots', desc: 'One CSV file with all your available sponsorship slots', color: 'bg-blue-50 border-blue-100 text-blue-600' },
            { icon: <Zap className="w-4 h-4" />, step: '02', title: 'We structure your listings', desc: 'Slots are automatically grouped by newsletter', color: 'bg-amber-50 border-amber-100 text-amber-600' },
            { icon: <Eye className="w-4 h-4" />, step: '03', title: 'Review and confirm', desc: 'Quickly check and edit before submitting', color: 'bg-teal-50 border-teal-100 text-teal-600' },
            { icon: <Send className="w-4 h-4" />, step: '04', title: 'We publish and promote', desc: 'Slots go live and feature in weekly buyer emails', color: 'bg-green-50 border-green-100 text-green-600' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-2.5">
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
        {/* Arrow connectors for desktop */}
        <div className="hidden sm:flex items-center justify-between mt-4 px-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex-1 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-[#d1d1d6]" />
            </div>
          ))}
        </div>
      </div>

      {/* Why this works */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Clock className="w-3.5 h-3.5" />, title: 'Save time weekly', desc: 'One file instead of managing listings one by one' },
          { icon: <RefreshCw className="w-3.5 h-3.5" />, title: 'Keep inventory fresh', desc: 'Update all your slots each week in minutes' },
          { icon: <CheckCircle className="w-3.5 h-3.5" />, title: 'No duplicate work', desc: 'We structure newsletters and slots automatically' },
          { icon: <Sparkles className="w-3.5 h-3.5" />, title: 'Focus on selling', desc: 'You send your availability — we handle the rest' },
        ].map((b, i) => (
          <div key={i} className="bg-white border border-black/[0.06] rounded-2xl px-4 py-3.5 flex flex-col gap-2">
            <div className="w-6 h-6 bg-[#f5f5f7] border border-black/[0.06] rounded-lg flex items-center justify-center text-[#6e6e73]">
              {b.icon}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#1d1d1f]">{b.title}</p>
              <p className="text-[11px] text-[#86868b] mt-0.5 leading-snug">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, green }: { icon: React.ReactNode; label: string; value: string | number; green?: boolean }) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-[#6e6e73] text-xs">{label}</p></div>
      <p className={`text-2xl font-bold tracking-[-0.02em] ${green ? 'text-green-600' : 'text-[#1d1d1f]'}`}>{value}</p>
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
  icon: React.ReactNode; title: string; description: string; action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="w-14 h-14 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center">{icon}</div>
      <div className="text-center">
        <p className="text-[#1d1d1f] font-semibold text-sm mb-1">{title}</p>
        <p className="text-[#6e6e73] text-sm mb-4">{description}</p>
        {action && (
          <button onClick={action.onClick} className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-5 py-2.5 rounded-2xl transition-all">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
