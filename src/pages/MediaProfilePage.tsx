import { useState, useEffect } from 'react';
import {
  ArrowLeft, Globe, Mail, Users, BarChart2, BookOpen, Zap,
  MapPin, Tag, ExternalLink, Shield, Clock, ChevronRight,
  FileText, Calendar, DollarSign, Layers, TrendingUp, Lock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MediaProfile, Listing } from '../types';
import { calcDynamicPrice } from '../lib/dynamicPricing';
import { useLocale } from '../context/LocaleContext';

interface MediaProfilePageProps {
  profileId: string;
  onBack: () => void;
  onViewListing: (listing: Listing) => void;
}

function fmtCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

function fmtDeadline(iso: string): string {
  const d = new Date(iso);
  const diff = d.getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d left`;
}

export default function MediaProfilePage({ profileId, onBack, onViewListing }: MediaProfilePageProps) {
  const { formatPrice } = useLocale();
  const [profile, setProfile] = useState<MediaProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'slots'>('overview');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [profileRes, listingsRes] = await Promise.all([
        supabase
          .from('media_profiles')
          .select('*')
          .eq('id', profileId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('*, newsletter:newsletters(*)')
          .eq('media_profile_id', profileId)
          .eq('status', 'live')
          .order('deadline_at', { ascending: true }),
      ]);

      if (profileRes.error || !profileRes.data) {
        setNotFound(true);
      } else {
        setProfile(profileRes.data as MediaProfile);
        setListings((listingsRes.data as Listing[]) ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-[52px]">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-[52px]">
        <p className="text-slate-900 font-semibold text-lg">Publisher not found</p>
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  const totalSlots = listings.reduce((s, l) => s + l.slots_remaining, 0);
  const lowestPrice = listings.length > 0
    ? Math.min(...listings.map(l => calcDynamicPrice(l.original_price, l.deadline_at, l.auto_discount_enabled).currentPrice))
    : null;

  // Group listings by newsletter name
  const byNewsletter = listings.reduce<Record<string, Listing[]>>((acc, l) => {
    const name = (l as any).newsletter?.name || l.property_name;
    if (!acc[name]) acc[name] = [];
    acc[name].push(l);
    return acc;
  }, {});

  const newsletterNames = Object.keys(byNewsletter);

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-[52px]">
      {/* Hero / Header */}
      <div className="bg-white border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to listings
          </button>

          {/* Cover image */}
          {profile.cover_image_url && (
            <div className="h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-slate-100 to-slate-200">
              <img
                src={profile.cover_image_url}
                alt=""
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="flex items-start gap-5 mb-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-[#f5f5f7] border border-black/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.newsletter_name}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <BookOpen className="w-9 h-9 text-slate-300" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              {/* Publisher breadcrumb */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Media Publisher</p>
              <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">{profile.newsletter_name}</h1>
              {profile.tagline && (
                <p className="text-slate-500 text-base leading-snug mb-3">{profile.tagline}</p>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2">
                {profile.category && (
                  <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Tag className="w-3 h-3" />
                    {profile.category}
                  </span>
                )}
                {profile.primary_geography && (
                  <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {profile.primary_geography}
                  </span>
                )}
                {profile.audience_type && (
                  <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Users className="w-3 h-3" />
                    {profile.audience_type}
                  </span>
                )}
                {profile.publishing_frequency && (
                  <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {profile.publishing_frequency}
                  </span>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0 pt-1">
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors border border-sky-100 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl">
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {profile.sample_issue_url && (
                <a href={profile.sample_issue_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors border border-sky-100 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl">
                  <Mail className="w-3.5 h-3.5" />
                  Sample issue
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {profile.media_kit_url && (
                <a href={profile.media_kit_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors border border-sky-100 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl">
                  <FileText className="w-3.5 h-3.5" />
                  Media kit
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Key stats row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-black/[0.06] rounded-2xl overflow-hidden border border-black/[0.06] mb-0">
            {profile.subscriber_count != null && (
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-slate-900 text-lg font-bold tracking-tight">{fmtCompact(profile.subscriber_count)}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Subscribers</p>
              </div>
            )}
            {profile.open_rate && (
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-teal-600 text-lg font-bold">{profile.open_rate}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Open Rate</p>
              </div>
            )}
            {profile.ctr && (
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-sky-600 text-lg font-bold">{profile.ctr}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mt-0.5">CTR</p>
              </div>
            )}
            <div className="bg-white px-4 py-3 text-center">
              <p className="text-slate-900 text-lg font-bold">{listings.length}</p>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Active Slots</p>
            </div>
            {lowestPrice != null && (
              <div className="bg-white px-4 py-3 text-center">
                <p className="text-slate-900 text-lg font-bold">from {formatPrice(lowestPrice)}</p>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mt-0.5">Price / slot</p>
              </div>
            )}
          </div>

          {/* Tab nav */}
          <div className="flex gap-0 mt-6 border-b border-black/[0.06]">
            {(['overview', 'slots'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors capitalize ${
                  activeTab === t
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {t === 'slots' ? `Sponsorship Slots (${listings.length})` : 'Overview'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* About */}
              {profile.audience_summary && (
                <Section title="About this Publisher" icon={<BookOpen className="w-4 h-4 text-teal-600" />}>
                  <p className="text-slate-600 text-sm leading-relaxed">{profile.audience_summary}</p>
                </Section>
              )}

              {/* Audience snapshot */}
              <Section title="Audience Snapshot" icon={<Users className="w-4 h-4 text-sky-600" />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.subscriber_count != null && (
                    <StatBlock label="Subscribers" value={fmtCompact(profile.subscriber_count)} accent="teal" />
                  )}
                  {profile.open_rate && (
                    <StatBlock label="Avg. Open Rate" value={profile.open_rate} accent="teal" />
                  )}
                  {profile.ctr && (
                    <StatBlock label="Click-Through Rate" value={profile.ctr} accent="sky" />
                  )}
                  {profile.primary_geography && (
                    <StatBlock label="Primary Geography" value={profile.primary_geography} />
                  )}
                  {profile.audience_type && (
                    <StatBlock label="Audience Type" value={profile.audience_type} />
                  )}
                  {profile.publishing_frequency && (
                    <StatBlock label="Send Frequency" value={profile.publishing_frequency} />
                  )}
                </div>
              </Section>

              {/* Ad formats */}
              {profile.ad_formats.length > 0 && (
                <Section title="Sponsorship Formats Available" icon={<Zap className="w-4 h-4 text-amber-500" />}>
                  <div className="flex flex-wrap gap-2">
                    {profile.ad_formats.map(f => (
                      <span key={f} className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.06] text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Zap className="w-3 h-3 text-amber-400" />
                        {f}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Past advertisers */}
              {profile.past_advertisers.length > 0 && (
                <Section title="Past Advertisers" icon={<Shield className="w-4 h-4 text-emerald-600" />}>
                  <p className="text-slate-500 text-xs mb-3">Brands that have previously run campaigns with this publisher.</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.past_advertisers.map(a => (
                      <span key={a} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Newsletters / hierarchy note */}
              {newsletterNames.length > 0 && (
                <Section title="Shows & Properties" icon={<Layers className="w-4 h-4 text-slate-500" />}>
                  <p className="text-slate-500 text-xs mb-4">This publisher has the following shows and properties with active sponsorship slots.</p>
                  <div className="space-y-3">
                    {newsletterNames.map(name => {
                      const nlListings = byNewsletter[name];
                      const firstListing = nlListings[0];
                      const nl = (firstListing as any).newsletter;
                      return (
                        <div key={name} className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-slate-900 text-sm font-semibold truncate">{name}</p>
                                {nl?.niche && <p className="text-slate-400 text-xs truncate">{nl.niche}</p>}
                              </div>
                            </div>
                            <span className="flex-shrink-0 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                              {nlListings.length} slot{nlListings.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Quick CTA */}
              {listings.length > 0 && (
                <div className="bg-slate-900 text-white rounded-3xl p-5 sticky top-20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Advertise Here</p>
                  </div>
                  <p className="text-white text-base font-semibold mb-1">
                    {totalSlots} slot{totalSlots !== 1 ? 's' : ''} available
                  </p>
                  {lowestPrice != null && (
                    <p className="text-white/60 text-sm mb-4">Starting from {formatPrice(lowestPrice)}</p>
                  )}
                  <button
                    onClick={() => setActiveTab('slots')}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    View Open Slots
                  </button>
                  <p className="text-white/40 text-[10px] text-center mt-2">5% deposit to secure · Balance direct to publisher</p>
                </div>
              )}

              {/* Links on mobile */}
              <div className="sm:hidden bg-white border border-black/[0.06] rounded-2xl p-4 flex flex-col gap-2">
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sky-600 text-sm font-medium">
                    <Globe className="w-4 h-4" />Website<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                )}
                {profile.sample_issue_url && (
                  <a href={profile.sample_issue_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sky-600 text-sm font-medium">
                    <Mail className="w-4 h-4" />Sample issue<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                )}
                {profile.media_kit_url && (
                  <a href={profile.media_kit_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sky-600 text-sm font-medium">
                    <FileText className="w-4 h-4" />Media kit<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                )}
              </div>

              {/* Stats card */}
              {(profile.subscriber_count || profile.open_rate || profile.ctr) && (
                <div className="bg-white border border-black/[0.06] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Performance</p>
                  </div>
                  <div className="space-y-2.5">
                    {profile.subscriber_count != null && (
                      <PerfRow label="Subscribers" value={fmtCompact(profile.subscriber_count)} />
                    )}
                    {profile.open_rate && (
                      <PerfRow label="Open rate" value={profile.open_rate} highlight />
                    )}
                    {profile.ctr && (
                      <PerfRow label="CTR" value={profile.ctr} highlight />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div>
            {listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl border border-black/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-900 font-semibold mb-1">No open slots right now</p>
                <p className="text-slate-400 text-sm">Check back soon or browse other publishers.</p>
                <button onClick={onBack} className="mt-4 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors">
                  ← Browse all opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Publisher → Newsletter → Slots tree */}
                {newsletterNames.map(name => {
                  const nlListings = byNewsletter[name];
                  const firstListing = nlListings[0];
                  const nl = (firstListing as any).newsletter;
                  return (
                    <div key={name}>
                      {/* Newsletter header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] shadow-sm flex items-center justify-center flex-shrink-0">
                          {profile.logo_url ? (
                            <img src={profile.logo_url} alt={name} className="w-full h-full rounded-xl object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <Mail className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold text-base">{name}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-slate-400 text-xs">{profile.newsletter_name}</span>
                            {nl?.niche && <span className="text-teal-600 text-xs font-semibold">{nl.niche}</span>}
                            {profile.subscriber_count && (
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {fmtCompact(profile.subscriber_count)} subscribers
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="ml-auto flex-shrink-0 text-xs font-semibold bg-teal-50 border border-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
                          {nlListings.length} slot{nlListings.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Slots */}
                      <div className="space-y-3 pl-0 sm:pl-13">
                        {nlListings.map(listing => (
                          <SlotCard
                            key={listing.id}
                            listing={listing}
                            formatPrice={formatPrice}
                            onView={() => onViewListing(listing)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotCard({ listing, formatPrice, onView }: { listing: Listing; formatPrice: (n: number) => string; onView: () => void }) {
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, listing.auto_discount_enabled);
  const { currentPrice, discountPct } = pricing;
  const deadline = fmtDeadline(listing.deadline_at);
  const isCritical = deadline === 'Today' || deadline === 'Tomorrow';
  const sendDate = listing.date_label;
  const slotsLeft = listing.slots_remaining;
  const isScarce = slotsLeft <= 2;

  return (
    <button
      onClick={onView}
      className="w-full bg-white rounded-2xl border border-black/[0.06] hover:border-black/[0.12] hover:shadow-md shadow-sm transition-all p-4 sm:p-5 flex items-start gap-4 text-left group"
    >
      <div className="flex-1 min-w-0">
        {/* Slot name + type */}
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-slate-900 font-semibold text-sm truncate">{listing.slot_type || listing.property_name}</p>
          {discountPct > 0 && (
            <span className="flex-shrink-0 text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md">
              -{discountPct}% off
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          {sendDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Runs {sendDate}
            </span>
          )}
          <span className={`flex items-center gap-1 ${isCritical ? 'text-orange-500 font-semibold' : ''}`}>
            <Clock className="w-3 h-3" />
            {isCritical ? `Closes ${deadline.toLowerCase()}` : `${deadline} to book`}
          </span>
          {isScarce && (
            <span className="flex items-center gap-1 text-orange-500 font-semibold">
              <DollarSign className="w-3 h-3" />
              {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        {/* Description snippet */}
        {listing.deliverables_detail && (
          <p className="text-slate-400 text-xs mt-2 line-clamp-1">{listing.deliverables_detail}</p>
        )}
      </div>

      {/* Price + CTA */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-slate-900 font-bold text-base">{formatPrice(currentPrice)}</p>
          {discountPct > 0 && (
            <p className="text-slate-300 text-xs line-through">{formatPrice(listing.original_price)}</p>
          )}
        </div>
        <span className="flex items-center gap-1 text-teal-600 text-xs font-semibold group-hover:text-teal-700 transition-colors">
          View details
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-slate-900 font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: 'teal' | 'sky' }) {
  const valueColor = accent === 'teal' ? 'text-teal-600' : accent === 'sky' ? 'text-sky-600' : 'text-slate-900';
  return (
    <div className="bg-[#f5f5f7] rounded-2xl px-4 py-3 text-center">
      <p className={`text-xl font-bold tracking-tight ${valueColor}`}>{value}</p>
      <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mt-0.5">{label}</p>
    </div>
  );
}

function PerfRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-teal-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}
