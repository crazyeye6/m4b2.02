import { useEffect, useState } from 'react';
import {
  ArrowLeft, MapPin, Users, BarChart2, Shield, Mail, Mic, Instagram,
  ExternalLink, Clock, Lock, Info, ChevronDown, ChevronUp, Globe,
  Linkedin, Twitter, Youtube, Share2, Copy, Check, Loader2, Flame,
  TrendingDown, AlertTriangle, MessageCircle, FileText, Star, Zap,
  BookOpen, Phone,
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

const MEDIA_CONFIG = {
  newsletter: { icon: <Mail className="w-4 h-4" />, label: 'Newsletter', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
  podcast: { icon: <Mic className="w-4 h-4" />, label: 'Podcast', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
  influencer: { icon: <Instagram className="w-4 h-4" />, label: 'Influencer', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
};

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
            <h2 className="text-[#1d1d1f] font-semibold text-[15px]">Inquire about this slot</h2>
            <p className="text-[#aeaeb2] text-[11px] mt-0.5">{listing.property_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors text-[#aeaeb2]">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-10 text-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-[#1d1d1f] font-semibold text-[16px]">Inquiry sent</p>
              <p className="text-[#6e6e73] text-[13px] leading-relaxed">We'll follow up at <span className="font-medium text-[#1d1d1f]">{form.email}</span> within one business day.</p>
              <button onClick={onClose} className="mt-2 bg-[#1d1d1f] text-white font-semibold px-6 py-2.5 rounded-2xl text-[14px] transition-all hover:bg-[#3a3a3c]">Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-1">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-1">Company</label>
                  <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Acme Inc."
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-1">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@company.com"
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-1">Message</label>
                <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell the publisher about your brand, campaign goals, or any questions about this slot..."
                  rows={4}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] focus:border-black/[0.18] focus:bg-white rounded-xl px-3 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all resize-none" />
              </div>
              {status === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-[12px] text-red-700">Something went wrong. Please try again.</p>
                </div>
              )}
              <div className="flex gap-2 pb-2">
                <button type="submit" disabled={status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-50 text-white font-semibold py-3 rounded-2xl text-[14px] transition-all">
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  {status === 'loading' ? 'Sending…' : 'Send inquiry'}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-3 rounded-2xl border border-black/[0.08] text-[#6e6e73] text-[14px] font-medium hover:bg-[#f5f5f7] transition-all">
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
        .select('*, media_profile:media_profiles(*)')
        .eq('id', listingId)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setListing(data as Listing);
      }
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
          <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
          <p className="text-[#6e6e73] text-[13px]">Loading listing…</p>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#1d1d1f] font-semibold text-[17px] mb-2">Listing not found</p>
          <p className="text-[#6e6e73] text-[14px] mb-6">This listing may have been removed or expired.</p>
          <button onClick={onBack} className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-5 py-2.5 rounded-2xl text-[14px] transition-all">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const { formatPrice } = useLocale();
  const mc = MEDIA_CONFIG[listing.media_type];
  const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at);
  const { currentPrice, discountPct, savings, tier, urgencyLabel } = pricing;
  const tierStyle = TIER_STYLES[tier];
  const hasDiscount = discountPct > 0;
  const depositAmount = Math.round(currentPrice * 0.05);
  const balanceAmount = currentPrice - depositAmount;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled';

  const hasMediaKit = listing.media_profile?.media_kit_url || listing.media_profile?.sample_issue_url || listing.media_profile?.website_url;
  const hasSocialLinks = listing.seller_website_url || listing.seller_company_url || listing.seller_linkedin_url || listing.seller_twitter_url || listing.seller_instagram_url || listing.seller_youtube_url || listing.seller_tiktok_url || listing.seller_podcast_url;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] pt-[52px]">
      {showInquire && <InquireModal listing={listing} onClose={() => setShowInquire(false)} />}

      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-[52px] z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] font-medium border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all bg-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2.5 py-1.5 rounded-full uppercase tracking-wide ${mc.bg} ${mc.color}`}>
              {mc.icon}
              {mc.label}
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
            {listing.status === 'securing' && (
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> Being secured
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] mb-1 tracking-[-0.02em]">{listing.property_name}</h1>
          {listing.media_profile_id && onViewMediaProfile ? (
            <button
              onClick={() => onViewMediaProfile(listing.media_profile_id!)}
              className="text-sky-600 hover:text-sky-700 hover:underline text-[15px] text-left transition-colors"
            >
              {listing.media_company_name}
            </button>
          ) : (
            <p className="text-[#6e6e73] text-[15px]">{listing.media_company_name}</p>
          )}
          {listing.media_profile?.tagline && (
            <p className="text-[#aeaeb2] text-[13px] mt-1 italic">"{listing.media_profile.tagline}"</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`bg-white border rounded-3xl p-5 shadow-sm ${hasDiscount ? tierStyle.border : 'border-black/[0.06]'}`}>
                <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold mb-2">Price per slot</p>
                <p className="text-[#1d1d1f] text-4xl font-semibold mb-1 tracking-[-0.02em]">{formatPrice(currentPrice)}</p>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {hasDiscount && (
                    <>
                      <span className="text-[#aeaeb2] text-[13px] line-through">{formatPrice(listing.original_price)}</span>
                      <span className={`text-white text-[11px] font-bold px-2 py-0.5 rounded-lg ${tierStyle.badge}`}>-{discountPct}%</span>
                      <span className="text-green-600 text-[12px] font-semibold">Save {formatPrice(savings)}</span>
                    </>
                  )}
                </div>
                {hasDiscount && (
                  <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-3 ${tierStyle.bg} border ${tierStyle.border}`}>
                    <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" />
                    <p className={`text-[11px] font-medium leading-snug ${tier === 'last_chance' ? 'text-red-700' : tier === 'mid' ? 'text-orange-700' : 'text-amber-700'}`}>
                      {tier === 'last_chance'
                        ? 'Final 30% discount — this slot closes in under 24 hours. Act now.'
                        : tier === 'mid'
                        ? '20% off automatically applied — 3–5 days remaining.'
                        : '10% early-bird discount applied — more than 5 days remaining.'}
                    </p>
                  </div>
                )}
                <div className="space-y-2 border-t border-black/[0.06] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 text-[12px] font-semibold">Deposit due now (5%)</span>
                    <span className="text-green-600 font-semibold text-[14px]">{formatPrice(depositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6e6e73] text-[12px]">Balance direct to creator (95%)</span>
                    <span className="text-[#1d1d1f] text-[12px] font-medium">{formatPrice(balanceAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm">
                <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold mb-1">Time to claim</p>
                <p className="text-[#aeaeb2] text-[11px] mb-3">Register interest before this closes</p>
                <div className="mb-4">
                  <CountdownTimer deadline={listing.deadline_at} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[#6e6e73] text-[12px]">Ad slot date: <span className="text-[#1d1d1f] font-semibold">{listing.date_label}</span></p>
                  <p className="text-[#6e6e73] text-[12px]">Slots left: <span className={`font-semibold ${listing.slots_remaining === 1 ? 'text-orange-500' : 'text-[#1d1d1f]'}`}>{listing.slots_remaining}</span></p>
                  {listing.slot_type && (
                    <p className="text-[#6e6e73] text-[12px]">Format: <span className="text-[#1d1d1f] font-semibold">{listing.slot_type}</span></p>
                  )}
                </div>
              </div>
            </div>

            {listing.deliverables_detail && (
              <PageSection title="What you get" icon={<BookOpen className="w-4 h-4 text-[#1d1d1f]" />}>
                <p className="text-[#3a3a3c] text-[14px] leading-relaxed whitespace-pre-wrap">{listing.deliverables_detail}</p>
              </PageSection>
            )}

            <PageSection title="Audience breakdown" icon={<Users className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {listing.media_type === 'newsletter' && (
                  <>
                    <StatTile label="Subscribers" value={fmt(listing.media_profile?.subscriber_count ?? listing.subscribers ?? 0)} />
                    <StatTile label="Open rate" value={listing.media_profile?.open_rate || listing.open_rate || '—'} highlight />
                    <StatTile label="CTR" value={listing.ctr || '—'} highlight />
                  </>
                )}
                {listing.media_type === 'podcast' && (
                  <>
                    <StatTile label="Downloads/ep" value={fmt(listing.downloads || 0)} />
                    <StatTile label="Ad type" value={listing.ad_type || '—'} />
                  </>
                )}
                {listing.media_type === 'influencer' && (
                  <>
                    <StatTile label="Followers" value={fmt(listing.followers || 0)} />
                    <StatTile label="Engagement" value={listing.engagement_rate || '—'} highlight />
                    <StatTile label="Deliverable" value={listing.deliverable || '—'} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#aeaeb2]" />
                    <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold">Geography</p>
                  </div>
                  <p className="text-[#1d1d1f] text-[14px] font-semibold">{listing.media_profile?.primary_geography || listing.location}</p>
                </div>
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users className="w-3.5 h-3.5 text-[#aeaeb2]" />
                    <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold">Audience</p>
                  </div>
                  <p className="text-[#1d1d1f] text-[14px] font-semibold">{listing.media_profile?.audience_type ? `${listing.media_profile.audience_type}` : listing.audience}</p>
                  {listing.media_profile?.audience_type && listing.audience !== listing.media_profile.audience_type && (
                    <p className="text-[#6e6e73] text-[12px] mt-0.5">{listing.audience}</p>
                  )}
                </div>
              </div>

              {listing.media_profile?.audience_summary && (
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-1.5">Audience summary</p>
                  <p className="text-[#3a3a3c] text-[13px] leading-relaxed">{listing.media_profile.audience_summary}</p>
                </div>
              )}

              {listing.media_profile?.publishing_frequency && (
                <div className="mt-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#aeaeb2]" />
                  <span className="text-[12px] text-[#6e6e73]">Publishing frequency: <span className="text-[#1d1d1f] font-semibold">{listing.media_profile.publishing_frequency}</span></span>
                </div>
              )}
            </PageSection>

            <PageSection title="Placement details" icon={<BarChart2 className="w-4 h-4 text-[#1d1d1f]" />}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-1">Slot type</p>
                  <p className="text-[#1d1d1f] text-[14px] font-semibold">{listing.slot_type}</p>
                </div>
                <div className="bg-[#f5f5f7] rounded-2xl p-4">
                  <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-1">Ad runs</p>
                  <p className="text-[#1d1d1f] text-[14px] font-semibold">{listing.date_label}</p>
                </div>
              </div>
              {listing.media_profile?.ad_formats && listing.media_profile.ad_formats.length > 0 && (
                <div className="mb-3 bg-[#f5f5f7] rounded-2xl p-4">
                  <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-2">Ad formats available</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.media_profile.ad_formats.map(f => (
                      <span key={f} className="text-[12px] text-[#3a3a3c] font-medium bg-white border border-black/[0.06] px-3 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-[#f5f5f7] rounded-2xl p-4">
                <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-1.5">Booking terms</p>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                  Claim your interest before the deadline closes. Ad copy must be submitted to the creator once your slot is confirmed.
                  {listing.response_time ? ` Typical response time: ${listing.response_time}.` : ''}
                </p>
              </div>
            </PageSection>

            {hasMediaKit && (
              <PageSection title="Media kit &amp; links" icon={<FileText className="w-4 h-4 text-[#1d1d1f]" />}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {listing.media_profile?.media_kit_url && (
                    <a href={listing.media_profile.media_kit_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 bg-[#f5f5f7] hover:bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl px-4 py-3 transition-all group">
                      <FileText className="w-4 h-4 text-[#aeaeb2] group-hover:text-[#1d1d1f] flex-shrink-0 transition-colors" />
                      <div>
                        <p className="text-[12px] font-semibold text-[#1d1d1f]">Media Kit</p>
                        <p className="text-[10px] text-[#aeaeb2]">Download PDF</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#aeaeb2] ml-auto flex-shrink-0" />
                    </a>
                  )}
                  {listing.media_profile?.sample_issue_url && (
                    <a href={listing.media_profile.sample_issue_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 bg-[#f5f5f7] hover:bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl px-4 py-3 transition-all group">
                      <Mail className="w-4 h-4 text-[#aeaeb2] group-hover:text-[#1d1d1f] flex-shrink-0 transition-colors" />
                      <div>
                        <p className="text-[12px] font-semibold text-[#1d1d1f]">Sample Issue</p>
                        <p className="text-[10px] text-[#aeaeb2]">See example</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#aeaeb2] ml-auto flex-shrink-0" />
                    </a>
                  )}
                  {listing.media_profile?.website_url && (
                    <a href={listing.media_profile.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 bg-[#f5f5f7] hover:bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl px-4 py-3 transition-all group">
                      <Globe className="w-4 h-4 text-[#aeaeb2] group-hover:text-[#1d1d1f] flex-shrink-0 transition-colors" />
                      <div>
                        <p className="text-[12px] font-semibold text-[#1d1d1f]">Website</p>
                        <p className="text-[10px] text-[#aeaeb2] truncate">{listing.media_profile.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#aeaeb2] ml-auto flex-shrink-0" />
                    </a>
                  )}
                </div>
              </PageSection>
            )}

            <PageSection title="About the publisher" icon={<Shield className="w-4 h-4 text-[#1d1d1f]" />}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {listing.media_profile?.logo_url ? (
                    <img
                      src={listing.media_profile.logo_url}
                      alt={listing.property_name}
                      className="w-12 h-12 rounded-2xl object-cover border border-black/[0.06] flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-semibold text-lg flex-shrink-0">
                      {listing.media_owner_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {listing.media_profile_id && onViewMediaProfile ? (
                      <button
                        onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                        className="text-[#1d1d1f] font-semibold text-[15px] hover:text-sky-600 transition-colors text-left"
                      >
                        {listing.media_owner_name}
                      </button>
                    ) : (
                      <p className="text-[#1d1d1f] font-semibold text-[15px]">{listing.media_owner_name}</p>
                    )}
                    <p className="text-[#6e6e73] text-[13px]">{listing.media_company_name}</p>
                    <p className="text-[#aeaeb2] text-[12px] mt-0.5">{listing.location}</p>
                    {listing.media_profile_id && onViewMediaProfile && (
                      <button
                        onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View full publisher profile
                      </button>
                    )}
                  </div>
                </div>

                {listing.seller_bio && (
                  <p className="text-[#3a3a3c] text-[13px] leading-relaxed bg-[#f5f5f7] rounded-2xl px-4 py-3">
                    {listing.seller_bio}
                  </p>
                )}

                {hasSocialLinks && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-2">Online presence</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.seller_website_url && <SellerLink href={listing.seller_website_url} icon={<Globe className="w-3.5 h-3.5" />} label="Website" />}
                      {listing.seller_company_url && <SellerLink href={listing.seller_company_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="Company" />}
                      {listing.seller_linkedin_url && <SellerLink href={listing.seller_linkedin_url} icon={<Linkedin className="w-3.5 h-3.5" />} label="LinkedIn" />}
                      {listing.seller_twitter_url && <SellerLink href={listing.seller_twitter_url} icon={<Twitter className="w-3.5 h-3.5" />} label="X / Twitter" />}
                      {listing.seller_instagram_url && <SellerLink href={listing.seller_instagram_url} icon={<Instagram className="w-3.5 h-3.5" />} label="Instagram" />}
                      {listing.seller_youtube_url && <SellerLink href={listing.seller_youtube_url} icon={<Youtube className="w-3.5 h-3.5" />} label="YouTube" />}
                      {listing.seller_tiktok_url && <SellerLink href={listing.seller_tiktok_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="TikTok" />}
                      {listing.seller_podcast_url && <SellerLink href={listing.seller_podcast_url} icon={<Mic className="w-3.5 h-3.5" />} label="Podcast" />}
                    </div>
                  </div>
                )}

                {listing.portfolio_links && listing.portfolio_links.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-2">Past work &amp; portfolio</p>
                    <div className="space-y-1.5">
                      {listing.portfolio_links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[13px] text-[#3a3a3c] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-2xl px-4 py-2.5 transition-all group"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#aeaeb2] group-hover:text-[#6e6e73] flex-shrink-0 transition-colors" />
                          <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!listing.seller_bio && !hasSocialLinks && (!listing.portfolio_links || listing.portfolio_links.length === 0) && (
                  <p className="text-[#aeaeb2] text-[12px]">No additional profile information provided by this seller.</p>
                )}
              </div>
            </PageSection>

            {listing.past_advertisers.length > 0 && (
              <PageSection title="Past advertisers" icon={<Star className="w-4 h-4 text-[#1d1d1f]" />}>
                <p className="text-[#6e6e73] text-[12px] mb-3">Brands that have previously sponsored this newsletter</p>
                <div className="flex flex-wrap gap-2">
                  {listing.past_advertisers.map(a => (
                    <span key={a} className="text-[13px] text-[#3a3a3c] font-medium bg-white border border-black/[0.06] px-3 py-1.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </PageSection>
            )}

            <PageSection title="How pricing works" icon={<TrendingDown className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="space-y-3">
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">
                  Prices are set by publishers and then reduced automatically as the booking deadline approaches. No negotiation needed — the discount is applied for you.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Full price', sub: 'More than 5 days left', color: 'bg-[#f5f5f7] text-[#1d1d1f]' },
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
                    Waiting for a deeper discount risks losing the slot to another buyer. Book early to be certain.
                  </p>
                </div>
              </div>
            </PageSection>

            <PageSection title="How booking works" icon={<Info className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: '1', title: 'Pay 5% deposit', desc: 'Locks your slot instantly. Collected by EndingThisWeek.', icon: <Lock className="w-4 h-4 text-green-600" /> },
                    { step: '2', title: 'Get contact details', desc: 'Publisher details released immediately after deposit.', icon: <Phone className="w-4 h-4 text-sky-600" /> },
                    { step: '3', title: 'Pay balance direct', desc: '95% paid directly to the publisher. We stay out of the way.', icon: <Zap className="w-4 h-4 text-teal-600" /> },
                  ].map(item => (
                    <div key={item.step} className="bg-[#f5f5f7] rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-white border border-black/[0.06] rounded-full flex items-center justify-center text-[10px] font-bold text-[#1d1d1f]">{item.step}</div>
                        {item.icon}
                      </div>
                      <p className="text-[#1d1d1f] text-[12px] font-semibold mb-1">{item.title}</p>
                      <p className="text-[#6e6e73] text-[11px] leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </PageSection>

            <PageSection title="FAQ" icon={<ChevronDown className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <FaqItem
                    key={i}
                    q={item.q}
                    a={item.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </PageSection>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[108px] space-y-3">
              <div className={`bg-white border rounded-3xl p-5 shadow-sm ${hasDiscount ? tierStyle.border : 'border-black/[0.06]'}`}>
                <p className="text-[#1d1d1f] font-semibold text-2xl mb-0.5 tracking-[-0.02em]">{formatPrice(currentPrice)}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {hasDiscount && (
                    <>
                      <span className="text-[#aeaeb2] text-[13px] line-through">{formatPrice(listing.original_price)}</span>
                      <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-lg ${tierStyle.badge}`}>-{discountPct}%</span>
                    </>
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
                      ? 'bg-[#f5f5f7] text-[#aeaeb2] cursor-not-allowed border border-black/[0.06]'
                      : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm'
                    }`}
                >
                  {!isSecured && <Lock className="w-4 h-4" />}
                  {isSecured ? 'Not available' : 'Secure Slot'}
                  {!isSecured && <Zap className="w-4 h-4 fill-white opacity-80" />}
                </button>

                {!isSecured && (
                  <button
                    onClick={() => setShowInquire(true)}
                    className="w-full font-semibold py-3 rounded-2xl transition-all text-[14px] flex items-center justify-center gap-2 mb-3 border border-black/[0.08] hover:border-black/[0.15] text-[#1d1d1f] hover:bg-[#f5f5f7] bg-white"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact / Inquire
                  </button>
                )}

                {!isSecured && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#aeaeb2]" />
                    <p className="text-[#aeaeb2] text-[11px] text-center">5% deposit · Balance direct to creator</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#6e6e73]" />
                  <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold">Claim deadline</p>
                </div>
                <CountdownTimer deadline={listing.deadline_at} compact />
                <p className="text-[#aeaeb2] text-[10px] mt-2">Ad slot date: {listing.date_label}</p>
              </div>

              <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold mb-2">Share listing</p>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.06] text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-2xl transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Link copied!' : 'Copy shareable link'}
                </button>
              </div>

              {listing.media_profile && (
                <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                  <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold mb-3">Publisher</p>
                  <div className="flex items-center gap-3 mb-2">
                    {listing.media_profile.logo_url ? (
                      <img src={listing.media_profile.logo_url} alt={listing.property_name} className="w-9 h-9 rounded-xl object-cover border border-black/[0.06]" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-9 h-9 bg-[#f5f5f7] rounded-xl flex items-center justify-center text-[#1d1d1f] font-semibold text-sm">{listing.media_owner_name[0]}</div>
                    )}
                    <div>
                      <p className="text-[#1d1d1f] text-[13px] font-semibold leading-tight">{listing.media_owner_name}</p>
                      {listing.media_profile.category && (
                        <span className="text-[10px] text-[#6e6e73] font-medium">{listing.media_profile.category}</span>
                      )}
                    </div>
                  </div>
                  {listing.media_profile_id && onViewMediaProfile && (
                    <button
                      onClick={() => onViewMediaProfile(listing.media_profile_id!)}
                      className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-sky-600 hover:text-sky-700 py-2 border border-sky-100 hover:border-sky-200 rounded-xl bg-sky-50 hover:bg-sky-100 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View full profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-[#1d1d1f] text-[12px] font-semibold uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      {children}
    </div>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] rounded-2xl p-3 text-center">
      <p className={`font-semibold text-[16px] tracking-[-0.01em] ${highlight ? 'text-green-600' : 'text-[#1d1d1f]'}`}>{value}</p>
      <p className="text-[#aeaeb2] text-[10px] mt-0.5 uppercase tracking-wide font-medium">{label}</p>
    </div>
  );
}

function SellerLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#3a3a3c] bg-[#f5f5f7] border border-black/[0.06] hover:border-black/[0.12] hover:text-[#1d1d1f] px-3 py-1.5 rounded-full transition-all"
    >
      {icon}
      {label}
      <ExternalLink className="w-2.5 h-2.5 text-[#aeaeb2]" />
    </a>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-black/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors"
      >
        <span className="text-[#1d1d1f] text-[13px] font-medium pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#aeaeb2] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#aeaeb2] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 bg-white">
          <p className="text-[#6e6e73] text-[13px] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'What does the deposit do?', a: 'The 5% deposit reserves your slot and prevents it being taken by another buyer. It confirms your intent to the creator and activates the booking process.' },
  { q: 'Who gets the deposit?', a: 'The deposit is collected by EndingThisWeek.media. It is not paid directly to the creator at this stage.' },
  { q: 'When do I pay the creator?', a: 'After your deposit is confirmed, the creator or seller will contact you directly to arrange the remaining 95% balance using normal commercial practice for their niche.' },
  { q: 'How do refunds work?', a: 'Deposit refunds are assessed case by case. You may be eligible if the seller cannot fulfil, changes key terms, or if the booking cannot proceed. Refunds are not available if you change your mind or fail to complete the booking.' },
  { q: 'What happens after I secure the slot?', a: "You receive a booking confirmation with the creator's contact details. You then contact the creator directly, finalise campaign details, and arrange the remaining balance." },
  { q: 'Can I inquire before committing?', a: 'Yes. Use the "Contact / Inquire" button to send a message to the EndingThisWeek team with questions about the slot. We will connect you with the publisher.' },
];
