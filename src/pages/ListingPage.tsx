import { useEffect, useState } from 'react';
import {
  ArrowLeft, MapPin, Users, BarChart2, Shield, Mail, Mic2,
  ExternalLink, Clock, Lock, Info, ChevronDown, ChevronUp, Globe,
  Linkedin, Twitter, Youtube, Share2, Copy, Check, Loader2, Flame,
  TrendingDown, AlertTriangle, MessageCircle, FileText, Zap,
  BookOpen, Phone, Calendar, ChevronRight, Layers, Tag, DollarSign, Download, Sparkles,
} from 'lucide-react';
import type { Listing } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { calcDynamicPrice, TIER_STYLES } from '../lib/dynamicPricing';

interface ListingPageProps {
  listingId: string;
  onBack: () => void;
  onSecure: (listing: Listing) => void;
  onViewMediaProfile?: (profileId: string) => void;
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

interface InquireModalProps {
  listing: Listing;
  onClose: () => void;
}

function InquireModal({ listing, onClose }: InquireModalProps) {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('loading');
    try {
      const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_form',
          to: 'hello@updates.endingthisweek.media',
          data: {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: `Inquiry: ${listing.property_name}`,
            message: `Company: ${form.company.trim() || 'N/A'}\n\nListing: ${listing.property_name} (${listing.id})\n\n${form.message.trim()}`,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to send');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] flex-shrink-0">
          <div>
            <h2 className="text-slate-900 font-semibold text-[15px]">Inquire about this slot</h2>
            <p className="text-slate-300 text-[11px] mt-0.5">{listing.property_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors text-slate-300">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-10 text-center gap-3">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-teal-600" />
              </div>
              <p className="text-slate-900 font-semibold text-[16px]">Inquiry sent</p>
              <p className="text-slate-500 text-[13px] leading-relaxed">We'll follow up at <span className="font-medium text-slate-900">{form.email}</span> within one business day.</p>
              <button onClick={onClose} className="mt-2 bg-slate-900 text-white font-semibold px-6 py-2.5 rounded-2xl text-[14px] transition-all hover:bg-slate-800">Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-300 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Company</label>
                  <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Acme Inc."
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-300 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@company.com"
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-300 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Message</label>
                <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell the publisher about your brand, campaign goals, or any questions about this slot..."
                  rows={4}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-300 outline-none transition-all resize-none" />
              </div>
              {status === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-[12px] text-red-700">Something went wrong. Please try again.</p>
                </div>
              )}
              <div className="flex gap-2 pb-2">
                <button type="submit" disabled={status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl text-[14px] transition-all">
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  {status === 'loading' ? 'Sending…' : 'Send inquiry'}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-3 rounded-2xl border border-black/[0.08] text-slate-500 text-[14px] font-medium hover:bg-[#f5f5f7] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingPage({ listingId, onBack, onSecure, onViewMediaProfile }: ListingPageProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [relatedSlots, setRelatedSlots] = useState<Listing[]>([]);
  const [otherSlots, setOtherSlots] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInquire, setShowInquire] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*, media_profile:media_profiles(*), newsletter:newsletters(*)')
        .eq('id', listingId)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setListing(data as Listing);

      // Fetch related slots: same newsletter or same media_profile, excluding this listing
      const l = data as Listing;
      if (l.media_profile_id) {
        const { data: related } = await supabase
          .from('listings')
          .select('*, newsletter:newsletters(*)')
          .eq('media_profile_id', l.media_profile_id)
          .eq('status', 'live')
          .neq('id', listingId)
          .order('deadline_at', { ascending: true })
          .limit(4);
        setRelatedSlots((related as Listing[]) ?? []);
      }

      // Fetch other opportunities by same niche/category (media_type)
      const { data: other } = await supabase
        .from('listings')
        .select('*, media_profile:media_profiles(newsletter_name, logo_url, category), newsletter:newsletters(*)')
        .eq('status', 'live')
        .eq('media_type', l.media_type)
        .neq('id', listingId)
        .neq('media_profile_id', l.media_profile_id ?? '')
        .order('deadline_at', { ascending: true })
        .limit(3);
      setOtherSlots((other as Listing[]) ?? []);

      setLoading(false);
    }
    fetchListing();
  }, [listingId]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?listing=${listingId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
          <p className="text-slate-500 text-[13px]">Loading slot details…</p>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-900 font-semibold text-[17px] mb-2">Listing not found</p>
          <p className="text-slate-500 text-[14px] mb-6">This listing may have been removed or expired.</p>
          <button onClick={onBack} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-2xl text-[14px] transition-all">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const { formatPrice } = useLocale();
  const autoDiscount = listing.auto_discount_enabled !== false;
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, autoDiscount);
  const { currentPrice, discountPct, savings, tier, urgencyLabel } = pricing;
  const tierStyle = TIER_STYLES[tier];
  const hasDiscount = discountPct > 0;
  const depositAmount = Math.round(currentPrice * 0.05);
  const balanceAmount = currentPrice - depositAmount;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled';

  const newsletter = (listing as any).newsletter as { name: string; publisher_name: string; subscriber_count?: number; avg_open_rate?: string; niche?: string; send_frequency?: string; description?: string } | null;
  const isPodcast = listing.media_type === 'podcast';
  const newsletterName = newsletter?.name || listing.property_name;
  const publisherName = listing.host_name || newsletter?.publisher_name || listing.media_company_name || listing.media_owner_name;

  const hasMediaKit = listing.media_profile?.media_kit_url || listing.media_profile?.sample_issue_url || listing.media_profile?.website_url;
  const hasSocialLinks = listing.seller_website_url || listing.seller_company_url || listing.seller_linkedin_url || listing.seller_twitter_url || listing.seller_instagram_url || listing.seller_youtube_url || listing.seller_tiktok_url || listing.seller_podcast_url;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900 pt-[52px]">
      {showInquire && <InquireModal listing={listing} onClose={() => setShowInquire(false)} />}

      {/* Sticky nav bar */}
      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-[52px] z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-[13px] font-medium border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all bg-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

        {/* Breadcrumb: Publisher → Podcast → Slot */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-4 flex-wrap">
          <span
            className={listing.media_profile_id && onViewMediaProfile ? 'text-sky-600 hover:text-sky-700 cursor-pointer transition-colors' : ''}
            onClick={listing.media_profile_id && onViewMediaProfile ? () => onViewMediaProfile(listing.media_profile_id!) : undefined}
          >
            {listing.media_profile?.newsletter_name || publisherName}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-500">{newsletterName}</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-semibold">{listing.slot_type || 'Sponsorship Slot'}</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 border border-sky-100 bg-sky-50 text-sky-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-full uppercase tracking-wide">
                <Mic2 className="w-3.5 h-3.5" />
                Podcast Sponsorship
              </span>
            {urgencyLabel && (
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full ${tierStyle.badge}`}>
                {tier === 'last_chance' && <Flame className="w-3 h-3" />}
                {urgencyLabel}
              </span>
            )}
            {listing.slots_remaining === 1 && (
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-full">
                Last slot
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-[-0.02em]">
            {listing.slot_type || listing.property_name}
          </h1>

          {/* Podcast + Publisher identity */}
          <div className="flex items-center gap-3 flex-wrap">
            {listing.media_profile?.logo_url && (
              <img
                src={listing.media_profile.logo_url}
                alt={newsletterName}
                className="w-7 h-7 rounded-lg object-cover border border-black/[0.08]"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex items-center gap-1.5 flex-wrap text-sm">
              <span className="text-slate-500">
                <span className="text-slate-700 font-semibold">{newsletterName}</span>
              </span>
              <span className="text-slate-300">·</span>
              {listing.media_profile_id && onViewMediaProfile ? (
                <button
                  onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                  className="text-sky-600 hover:text-sky-700 hover:underline font-medium transition-colors"
                >
                  {publisherName}
                </button>
              ) : (
                <span className="text-slate-500">{publisherName}</span>
              )}
              {listing.media_profile?.category && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-teal-600 text-xs font-semibold">
                    <Tag className="w-3 h-3" />
                    {listing.media_profile.category}
                  </span>
                </>
              )}
            </div>
          </div>

          {listing.media_profile?.tagline && (
            <p className="text-slate-400 text-[13px] mt-2 italic">"{listing.media_profile.tagline}"</p>
          )}
        </div>

        {/* Open slot status bar */}
        <div className="mb-5 flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            Open Slot
          </span>
          <span className="text-[12px] text-slate-500 font-medium">Will default to programmatic advertising if not filled before deadline</span>
        </div>

        {/* Opportunity pitch — hero */}
        {listing.opportunity_description && (
          <div className="mb-6 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-slate-50 border border-sky-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <h2 className="text-sky-700 text-[11px] font-bold uppercase tracking-widest">Why this sponsorship slot</h2>
            </div>
            <p className="text-slate-700 text-[15px] leading-[1.75]">{listing.opportunity_description}</p>
          </div>
        )}

        {/* Main 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Price + timing overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`bg-white border rounded-3xl p-5 shadow-sm ${hasDiscount ? tierStyle.border : 'border-black/[0.06]'}`}>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-2">Price per slot</p>
                <p className="text-slate-900 text-4xl font-bold mb-1 tracking-[-0.02em]">{formatPrice(currentPrice)}</p>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {hasDiscount ? (
                    <>
                      <span className="text-slate-300 text-[13px] line-through">{formatPrice(listing.original_price)}</span>
                      <span className={`text-white text-[11px] font-bold px-2 py-0.5 rounded-lg ${tierStyle.badge}`}>{discountPct}% Off</span>
                      <span className="text-teal-600 text-[12px] font-semibold">Save {formatPrice(savings)}</span>
                    </>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 bg-[#f5f5f7] border border-black/[0.08] px-2.5 py-1 rounded-lg">
                      {autoDiscount ? 'Auto-Discount Enabled' : 'Fixed Price'}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-3 ${tierStyle.bg} border ${tierStyle.border}`}>
                    <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" />
                    <p className={`text-[11px] font-medium leading-snug ${tier === 'last_chance' ? 'text-red-700' : tier === 'mid' ? 'text-orange-700' : 'text-amber-700'}`}>
                      {tier === 'last_chance'
                        ? 'Final 30% discount — closes in under 24 hours.'
                        : tier === 'mid'
                        ? '20% off automatically applied — 3–5 days remaining.'
                        : '10% early discount — more than 5 days remaining.'}
                    </p>
                  </div>
                )}
                <div className="space-y-2 border-t border-black/[0.06] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-600 text-[12px] font-semibold">Deposit due now (5%)</span>
                    <span className="text-teal-600 font-semibold text-[14px]">{formatPrice(depositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[12px]">Balance direct to publisher (95%)</span>
                    <span className="text-slate-900 text-[12px] font-medium">{formatPrice(balanceAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Time to claim</p>
                <p className="text-slate-300 text-[11px] mb-3">Register interest before this closes</p>
                <div className="mb-4">
                  <CountdownTimer deadline={listing.deadline_at} />
                </div>
                <div className="space-y-2">
                  <DetailRow label="Podcast" value={newsletterName} />
                  <DetailRow label="Publisher" value={publisherName} />
                  <DetailRow label="Ad runs" value={listing.date_label} highlight />
                  <DetailRow label="Slots left" value={`${listing.slots_remaining} available`} urgent={listing.slots_remaining <= 2} />
                  {listing.slot_type && <DetailRow label="Format" value={listing.slot_type} />}
                </div>
              </div>
            </div>

            {/* What you get */}
            {listing.deliverables_detail && (
              <PageSection title="What You Get" icon={<BookOpen className="w-4 h-4 text-slate-900" />}>
                <p className="text-slate-600 text-[14px] leading-relaxed whitespace-pre-wrap">{listing.deliverables_detail}</p>
              </PageSection>
            )}

            {/* Media details */}
            <PageSection title="About this Podcast" icon={<Mic2 className="w-4 h-4 text-sky-600" />}>
              <div className="flex items-start gap-4 mb-4">
                {listing.media_profile?.logo_url && (
                  <img
                    src={listing.media_profile.logo_url}
                    alt={newsletterName}
                    className="w-14 h-14 rounded-2xl object-cover border border-black/[0.06] flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-base mb-0.5">{newsletterName}</p>
                  <p className="text-slate-400 text-sm">{publisherName}</p>
                  {newsletter?.niche && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                      <Tag className="w-3 h-3" />
                      {newsletter.niche}
                    </span>
                  )}
                </div>
              </div>

              {(newsletter?.description || listing.media_profile?.audience_summary) && (
                <p className="text-slate-600 text-sm leading-relaxed mb-4 bg-[#f5f5f7] rounded-2xl px-4 py-3">
                  {newsletter?.description || listing.media_profile?.audience_summary}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.subscribers != null && (
                  <StatTile label="Downloads / Ep" value={fmt(listing.subscribers)} />
                )}
                {listing.ctr && (
                  <StatTile label="Audience" value={listing.ctr} highlight />
                )}
                {(listing.media_profile?.primary_geography || listing.location) && (
                  <StatTile label="Geography" value={listing.media_profile?.primary_geography || listing.location} icon={<MapPin className="w-3 h-3" />} />
                )}
                {(listing.media_profile?.audience_type || listing.audience) && (
                  <StatTile label="Audience" value={listing.media_profile?.audience_type || listing.audience} icon={<Users className="w-3 h-3" />} />
                )}
                {(newsletter?.send_frequency || listing.media_profile?.publishing_frequency) && (
                  <StatTile label="Frequency" value={newsletter?.send_frequency || listing.media_profile?.publishing_frequency || '—'} icon={<Clock className="w-3 h-3" />} />
                )}
              </div>

              {listing.media_profile_id && onViewMediaProfile && (
                <button
                  onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View full publisher profile
                </button>
              )}
            </PageSection>

            {/* Sponsorship slot details */}
            <PageSection title="This Sponsorship Slot" icon={<Layers className="w-4 h-4 text-slate-900" />}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <InfoBlock label="Sponsorship type" value={listing.slot_type} />
                <InfoBlock label="Ad runs" value={listing.date_label} highlight />
                <InfoBlock label="Slots available" value={`${listing.slots_remaining}${listing.slots_total ? ` of ${listing.slots_total}` : ''}`} urgent={listing.slots_remaining <= 2} />
                <InfoBlock label="Booking deadline" value={new Date(listing.deadline_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </div>
              {listing.media_profile?.ad_formats && listing.media_profile.ad_formats.length > 0 && (
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">All formats available from this publisher</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.media_profile.ad_formats.map(f => (
                      <span key={f} className="text-[12px] text-slate-600 font-medium bg-white border border-black/[0.06] px-3 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 bg-[#f5f5f7] rounded-2xl px-4 py-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1.5">Booking terms</p>
                <p className="text-slate-500 text-[13px] leading-relaxed">
                  Claim your interest before the deadline closes. Ad copy must be submitted to the publisher once your slot is confirmed.
                  {listing.response_time ? ` Typical response time: ${listing.response_time}.` : ''}
                </p>
              </div>
            </PageSection>

            {/* Why this slot is available + why act now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PageSection title="Why This Slot Is Available" icon={<Info className="w-4 h-4 text-slate-500" />}>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  This is an unsold host-read placement. The creator has made it available for direct booking before the episode records. If not filled, it will be replaced with lower-value programmatic advertising — and the opportunity to reach this audience at this price will be gone.
                </p>
              </PageSection>
              <PageSection title="Why Act Now" icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  This slot is time-sensitive and will expire before the episode release date. Once the deadline passes, the slot closes and the inventory defaults automatically. A 5% deposit secures your position immediately — no further action needed until the host contacts you.
                </p>
              </PageSection>
            </div>

            {/* Media kit */}
            {hasMediaKit && (
              <PageSection title="Media Kit & Links" icon={<FileText className="w-4 h-4 text-slate-900" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {listing.media_profile?.media_kit_url && (
                    <MediaLink href={listing.media_profile.media_kit_url} icon={<FileText className="w-4 h-4 text-slate-400" />} label="Media Kit" sub="Download PDF" />
                  )}
                  {listing.media_profile?.sample_issue_url && (
                    <MediaLink href={listing.media_profile.sample_issue_url} icon={<Mail className="w-4 h-4 text-slate-400" />} label="Sample Issue" sub="See example" />
                  )}
                  {listing.media_profile?.website_url && (
                    <MediaLink href={listing.media_profile.website_url} icon={<Globe className="w-4 h-4 text-slate-400" />} label="Website" sub={listing.media_profile.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')} />
                  )}
                </div>
              </PageSection>
            )}

            {/* Publisher info */}
            <PageSection title="About the Publisher" icon={<Shield className="w-4 h-4 text-slate-900" />}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {listing.media_profile?.logo_url ? (
                    <img src={listing.media_profile.logo_url} alt={publisherName} className="w-12 h-12 rounded-2xl object-cover border border-black/[0.06] flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-12 h-12 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center text-slate-900 font-semibold text-lg flex-shrink-0">
                      {publisherName?.[0] ?? '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {listing.media_profile_id && onViewMediaProfile ? (
                      <button onClick={() => onViewMediaProfile(listing.media_profile_id!)} className="text-slate-900 font-semibold text-[15px] hover:text-sky-600 transition-colors text-left">
                        {publisherName}
                      </button>
                    ) : (
                      <p className="text-slate-900 font-semibold text-[15px]">{publisherName}</p>
                    )}
                    <p className="text-slate-400 text-[12px] mt-0.5">{listing.location}</p>
                    {listing.media_profile_id && onViewMediaProfile && (
                      <button onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        View full publisher profile
                      </button>
                    )}
                  </div>
                </div>

                {listing.seller_bio && (
                  <p className="text-slate-600 text-[13px] leading-relaxed bg-[#f5f5f7] rounded-2xl px-4 py-3">
                    {listing.seller_bio}
                  </p>
                )}

                {hasSocialLinks && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Online presence</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.seller_website_url && <SellerLink href={listing.seller_website_url} icon={<Globe className="w-3.5 h-3.5" />} label="Website" />}
                      {listing.seller_company_url && <SellerLink href={listing.seller_company_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="Company" />}
                      {listing.seller_linkedin_url && <SellerLink href={listing.seller_linkedin_url} icon={<Linkedin className="w-3.5 h-3.5" />} label="LinkedIn" />}
                      {listing.seller_twitter_url && <SellerLink href={listing.seller_twitter_url} icon={<Twitter className="w-3.5 h-3.5" />} label="X / Twitter" />}
                      {listing.seller_youtube_url && <SellerLink href={listing.seller_youtube_url} icon={<Youtube className="w-3.5 h-3.5" />} label="YouTube" />}
                      {listing.seller_podcast_url && <SellerLink href={listing.seller_podcast_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="Podcast" />}
                    </div>
                  </div>
                )}
              </div>
            </PageSection>

            {/* Past advertisers */}
            {(listing.media_profile?.past_advertisers?.length ?? listing.past_advertisers.length) > 0 && (
              <PageSection title="Past Advertisers" icon={<Shield className="w-4 h-4 text-emerald-600" />}>
                <p className="text-slate-400 text-[12px] mb-3">Brands that have previously run campaigns with this publisher.</p>
                <div className="flex flex-wrap gap-2">
                  {(listing.media_profile?.past_advertisers ?? listing.past_advertisers).map(a => (
                    <span key={a} className="text-[13px] text-slate-600 font-medium bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </PageSection>
            )}

            {/* Pricing mechanics */}
            <PageSection title="Pricing" icon={<TrendingDown className="w-4 h-4 text-slate-500" />}>
              {autoDiscount ? (
                <div className="space-y-3">
                  <p className="text-slate-500 text-[13px] leading-relaxed">
                    This publisher has enabled auto-discount. The price reduces automatically as the booking deadline approaches.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Full price', sub: '5+ days left', color: 'bg-[#f5f5f7] text-slate-900' },
                      { label: '−10%', sub: '3–5 days left', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
                      { label: '−20%', sub: '1–3 days left', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
                      { label: '−30%', sub: 'Under 24 hours', color: 'bg-red-50 text-red-700 border border-red-200' },
                    ].map((row, i) => (
                      <div key={i} className={`rounded-2xl p-3 text-center ${row.color}`}>
                        <p className="text-[14px] font-bold">{row.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-70">{row.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 mt-0.5" />
                    <p className="text-[12px] text-amber-700 leading-snug">
                      Waiting for a deeper discount risks losing the slot to another buyer.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-[13px] leading-relaxed">
                  This publisher has set a fixed price. The price will not change before the booking deadline.
                </p>
              )}
            </PageSection>

            {/* How booking works */}
            <PageSection title="How Booking Works" icon={<Info className="w-4 h-4 text-slate-500" />}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { step: '1', title: 'Pay 5% deposit', desc: 'Locks your slot instantly. Collected by EndingThisWeek.', icon: <Lock className="w-4 h-4 text-teal-600" /> },
                  { step: '2', title: 'Get contact details', desc: 'Publisher details released immediately after deposit.', icon: <Phone className="w-4 h-4 text-sky-600" /> },
                  { step: '3', title: 'Pay balance direct', desc: '95% paid directly to the publisher. We stay out of the way.', icon: <Zap className="w-4 h-4 text-amber-500" /> },
                ].map(item => (
                  <div key={item.step} className="bg-[#f5f5f7] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-white border border-black/[0.06] rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900">{item.step}</div>
                      {item.icon}
                    </div>
                    <p className="text-slate-900 text-[12px] font-semibold mb-1">{item.title}</p>
                    <p className="text-slate-500 text-[11px] leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </PageSection>

            {/* FAQ */}
            <PageSection title="Frequently Asked Questions" icon={<ChevronDown className="w-4 h-4 text-slate-500" />}>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
            </PageSection>

            {/* Related slots from same publisher */}
            {relatedSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <h3 className="text-slate-900 font-semibold text-sm">More slots from this publisher</h3>
                </div>
                <div className="space-y-3">
                  {relatedSlots.map(s => <RelatedSlotCard key={s.id} listing={s} formatPrice={formatPrice} onView={() => { window.scrollTo({ top: 0 }); }} />)}
                </div>
              </div>
            )}

            {/* Other similar opportunities */}
            {otherSlots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                  <h3 className="text-slate-900 font-semibold text-sm">Similar open slots</h3>
                </div>
                <div className="space-y-3">
                  {otherSlots.map(s => <RelatedSlotCard key={s.id} listing={s} formatPrice={formatPrice} onView={() => { window.scrollTo({ top: 0 }); }} />)}
                </div>
                <div className="mt-4 text-center">
                  <button onClick={onBack} className="text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors">
                    Browse all open slots →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[108px] space-y-3">
              {/* Booking CTA */}
              <div className={`bg-white border rounded-3xl p-5 shadow-sm ${hasDiscount ? tierStyle.border : 'border-black/[0.06]'}`}>
                <p className="text-slate-900 font-bold text-2xl mb-0.5 tracking-[-0.02em]">{formatPrice(currentPrice)}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {hasDiscount ? (
                    <>
                      <span className="text-slate-300 text-[13px] line-through">{formatPrice(listing.original_price)}</span>
                      <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-lg ${tierStyle.badge}`}>{discountPct}% Off</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-[#f5f5f7] border border-black/[0.08] px-2 py-0.5 rounded-lg">
                      {autoDiscount ? 'Auto-Discount Active' : 'Fixed Price'}
                    </span>
                  )}
                  {urgencyLabel && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tierStyle.badge}`}>
                      {tier === 'last_chance' && <Flame className="w-2.5 h-2.5" />}
                      {urgencyLabel}
                    </span>
                  )}
                </div>

                <button
                  onClick={!isSecured ? () => onSecure(listing) : undefined}
                  disabled={isSecured}
                  className={`w-full font-semibold py-3.5 rounded-2xl transition-all text-[14px] flex items-center justify-center gap-2 mb-2
                    ${isSecured
                      ? 'bg-[#f5f5f7] text-slate-300 cursor-not-allowed border border-black/[0.06]'
                      : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm'
                    }`}
                >
                  {!isSecured && <Lock className="w-4 h-4" />}
                  {isSecured ? 'Not available' : 'Secure This Slot'}
                  {!isSecured && <Zap className="w-4 h-4 fill-white opacity-80" />}
                </button>

                {!isSecured && (
                  <button
                    onClick={() => setShowInquire(true)}
                    className="w-full font-semibold py-3 rounded-2xl transition-all text-[14px] flex items-center justify-center gap-2 mb-3 border border-black/[0.08] hover:border-black/[0.15] text-slate-900 hover:bg-[#f5f5f7] bg-white"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact / Inquire
                  </button>
                )}

                {!isSecured && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <p className="text-slate-400 text-[11px] text-center">5% deposit · Balance direct to publisher</p>
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Booking deadline</p>
                </div>
                <CountdownTimer deadline={listing.deadline_at} compact />
                <p className="text-slate-400 text-[10px] mt-2">Ad slot date: <span className="text-slate-900 font-semibold">{listing.date_label}</span></p>
              </div>

              {/* Publisher mini card */}
              {listing.media_profile && (
                <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-3">Publisher</p>
                  <div className="flex items-center gap-3 mb-3">
                    {listing.media_profile.logo_url ? (
                      <img src={listing.media_profile.logo_url} alt={publisherName} className="w-10 h-10 rounded-xl object-cover border border-black/[0.06]"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 bg-[#f5f5f7] rounded-xl flex items-center justify-center text-slate-900 font-semibold text-sm">{publisherName?.[0] ?? '?'}</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-slate-900 text-[13px] font-semibold leading-tight truncate">{publisherName}</p>
                      <p className="text-sky-600 text-[11px] font-medium truncate">{newsletterName}</p>
                      {listing.media_profile.category && (
                        <span className="text-[10px] text-slate-400">{listing.media_profile.category}</span>
                      )}
                    </div>
                  </div>
                  {listing.media_profile.subscriber_count && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                      <Download className="w-3 h-3" />
                      <span>{fmt(listing.media_profile.subscriber_count)} downloads/ep</span>
                    </div>
                  )}
                  {listing.media_profile_id && onViewMediaProfile && (
                    <button
                      onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                      className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-sky-600 hover:text-sky-700 py-2 border border-sky-100 hover:border-sky-200 rounded-xl bg-sky-50 hover:bg-sky-100 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View full publisher profile
                    </button>
                  )}
                </div>
              )}

              {/* Share */}
              <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-2">Share this slot</p>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.06] text-slate-900 text-[13px] font-medium px-4 py-2.5 rounded-2xl transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-sky-600" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Link copied!' : 'Copy shareable link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatedSlotCard({ listing, formatPrice, onView }: { listing: Listing; formatPrice: (n: number) => string; onView: () => void }) {
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, listing.auto_discount_enabled);
  const { currentPrice, discountPct } = pricing;
  const nl = (listing as any).newsletter as { name?: string } | null;
  const nlName = nl?.name || listing.property_name;
  const pubName = listing.media_profile?.newsletter_name || listing.media_profile?.tagline || listing.media_company_name;

  return (
    <button onClick={onView} className="w-full bg-white rounded-2xl border border-black/[0.06] hover:border-black/[0.12] shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3 text-left group">
      {listing.media_profile?.logo_url && (
        <img src={listing.media_profile.logo_url} alt={nlName} className="w-9 h-9 rounded-xl object-cover border border-black/[0.06] flex-shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 font-semibold text-sm truncate">{nlName}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="truncate">{pubName}</span>
          {listing.slot_type && (
            <>
              <span className="text-slate-200">·</span>
              <span className="truncate">{listing.slot_type}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-slate-900 font-bold text-sm">{formatPrice(currentPrice)}</p>
        {discountPct > 0 && <p className="text-[10px] text-orange-500 font-semibold">-{discountPct}%</p>}
        <div className="flex items-center gap-1 text-xs text-slate-300 justify-end mt-0.5">
          <Calendar className="w-3 h-3" />
          <span>{listing.date_label}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function PageSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-slate-900 text-[12px] font-semibold uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatTile({ label, value, highlight, icon }: { label: string; value: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#f5f5f7] rounded-2xl p-3 text-center">
      {icon && <div className="flex justify-center mb-1 text-slate-300">{icon}</div>}
      <p className={`font-semibold text-[16px] tracking-[-0.01em] ${highlight ? 'text-teal-600' : 'text-slate-900'}`}>{value}</p>
      <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wide font-medium">{label}</p>
    </div>
  );
}

function DetailRow({ label, value, highlight, urgent }: { label: string; value: string; highlight?: boolean; urgent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-[12px]">{label}</span>
      <span className={`text-[12px] font-semibold ${urgent ? 'text-orange-500' : highlight ? 'text-teal-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

function InfoBlock({ label, value, highlight, urgent }: { label: string; value: string; highlight?: boolean; urgent?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] rounded-2xl p-3">
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">{label}</p>
      <p className={`text-[14px] font-semibold ${urgent ? 'text-orange-500' : highlight ? 'text-teal-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function MediaLink({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2.5 bg-[#f5f5f7] hover:bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl px-4 py-3 transition-all group">
      <div className="group-hover:text-slate-900 transition-colors">{icon}</div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-400 truncate">{sub}</p>
      </div>
      <ExternalLink className="w-3 h-3 text-slate-300 ml-auto flex-shrink-0" />
    </a>
  );
}

function SellerLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 bg-[#f5f5f7] border border-black/[0.06] hover:border-black/[0.12] hover:text-slate-900 px-3 py-1.5 rounded-full transition-all">
      {icon}
      {label}
      <ExternalLink className="w-2.5 h-2.5 text-slate-300" />
    </a>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-black/[0.06] rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors">
        <span className="text-slate-900 text-[13px] font-medium pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-300 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 bg-white">
          <p className="text-slate-500 text-[13px] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'What does the deposit do?', a: 'The 5% deposit reserves your podcast ad slot and prevents it being taken by another advertiser. It confirms your intent to the podcast host and activates the booking process.' },
  { q: 'Who gets the deposit?', a: 'The deposit is collected by EndingThisWeek.media. It is not paid directly to the podcast host at this stage.' },
  { q: 'When do I pay the podcast host?', a: 'After your deposit is confirmed, the host will contact you directly to arrange the remaining 95% balance and confirm your ad copy, read style, and any campaign specifics.' },
  { q: 'What ad formats do podcast hosts typically offer?', a: 'Most hosts offer pre-roll, mid-roll, and post-roll placements. Some also offer host-read endorsements, dedicated episodes, or show notes mentions. Check the slot details or ask the host directly.' },
  { q: 'How do refunds work?', a: 'Deposit refunds are assessed case by case. You may be eligible if the host cannot fulfil, changes key terms, or if the booking cannot proceed. Refunds are not available if you change your mind or fail to complete the booking.' },
  { q: 'What happens after I secure the slot?', a: "You receive a booking confirmation with the podcast host's contact details. You then contact the host directly, submit your ad copy or brief, and arrange the remaining balance before the air date." },
  { q: 'Can I inquire before committing?', a: 'Yes. Use the "Contact / Inquire" button to send a message with questions about the slot. We will connect you with the podcast host.' },
  { q: 'What is the difference between the podcast and the publisher?', a: 'A publisher may own and produce multiple podcasts. This page shows a specific sponsorship slot within one podcast episode. The publisher profile page shows all shows and available slots from that publisher.' },
];
