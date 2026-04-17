import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Users, BarChart2, Shield, Mail, Mic, Instagram, ExternalLink, Clock, Lock, Info, ChevronDown, ChevronUp, Globe, Linkedin, Twitter, Youtube, Share2, Copy, Check, Loader2 } from 'lucide-react';
import type { Listing } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';

interface ListingPageProps {
  listingId: string;
  onBack: () => void;
  onSecure: (listing: Listing) => void;
}

const MEDIA_CONFIG = {
  newsletter: { icon: <Mail className="w-4 h-4" />, label: 'Newsletter', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
  podcast: { icon: <Mic className="w-4 h-4" />, label: 'Podcast', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
  influencer: { icon: <Instagram className="w-4 h-4" />, label: 'Influencer', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export default function ListingPage({ listingId, onBack, onSecure }: ListingPageProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
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
          <p className="text-[#6e6e73] text-[13px]">Loading listing...</p>
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
          <button
            onClick={onBack}
            className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-5 py-2.5 rounded-2xl text-[14px] transition-all"
          >
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const { formatPrice } = useLocale();
  const mc = MEDIA_CONFIG[listing.media_type];
  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const savings = listing.original_price - listing.discounted_price;
  const depositAmount = Math.round(listing.discounted_price * 0.1);
  const balanceAmount = listing.discounted_price - depositAmount;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-[52px] z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
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
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className={`inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2.5 py-1.5 rounded-full uppercase tracking-wide ${mc.bg} ${mc.color}`}>
              {mc.icon}
              {mc.label}
            </span>
            {listing.slots_remaining === 1 && (
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-full">
                Last slot
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] mb-1 tracking-[-0.02em]">{listing.property_name}</h1>
          <p className="text-[#6e6e73] text-[15px]">{listing.media_company_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm">
                <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold mb-2">Price per slot</p>
                <p className="text-[#1d1d1f] text-4xl font-semibold mb-1 tracking-[-0.02em]">{formatPrice(listing.discounted_price)}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#aeaeb2] text-[13px] line-through">{formatPrice(listing.original_price)}</span>
                  <span className="bg-[#1d1d1f] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
                  <span className="text-green-600 text-[12px] font-semibold">Save {formatPrice(savings)}</span>
                </div>
                <div className="space-y-2 border-t border-black/[0.06] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 text-[12px] font-semibold">Deposit due now (10%)</span>
                    <span className="text-green-600 font-semibold text-[14px]">{formatPrice(depositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6e6e73] text-[12px]">Balance direct to creator (90%)</span>
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
                </div>
              </div>
            </div>

            <PageSection title="Audience breakdown" icon={<Users className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {listing.media_type === 'newsletter' && (
                  <>
                    <StatTile label="Subscribers" value={fmt(listing.subscribers || 0)} />
                    <StatTile label="Open rate" value={listing.open_rate || '—'} highlight />
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
              <div className="flex flex-wrap items-start gap-6 bg-[#f5f5f7] rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#aeaeb2] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-0.5">Geography</p>
                    <p className="text-[#1d1d1f] text-[13px] font-medium">{listing.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-0.5">Audience</p>
                  <p className="text-[#1d1d1f] text-[13px] font-medium">{listing.audience}</p>
                </div>
              </div>
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
              <div className="bg-[#f5f5f7] rounded-2xl p-4">
                <p className="text-[10px] text-[#86868b] uppercase tracking-widest font-semibold mb-1.5">Booking terms</p>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">Claim your interest before the deadline closes. Ad copy must be submitted to the creator once your slot is confirmed. Hold period: {listing.status === 'securing' ? '6h' : '24h'}.</p>
              </div>
            </PageSection>

            <PageSection title="About the seller" icon={<Shield className="w-4 h-4 text-[#1d1d1f]" />}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-semibold text-lg flex-shrink-0">
                    {listing.media_owner_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1d1d1f] font-semibold text-[15px]">{listing.media_owner_name}</p>
                    <p className="text-[#6e6e73] text-[13px]">{listing.media_company_name}</p>
                    <p className="text-[#aeaeb2] text-[12px] mt-0.5">{listing.location}</p>
                  </div>
                </div>

                {listing.seller_bio && (
                  <p className="text-[#3a3a3c] text-[13px] leading-relaxed bg-[#f5f5f7] rounded-2xl px-4 py-3">
                    {listing.seller_bio}
                  </p>
                )}

                {(listing.seller_website_url || listing.seller_company_url || listing.seller_linkedin_url || listing.seller_twitter_url || listing.seller_instagram_url || listing.seller_youtube_url || listing.seller_tiktok_url || listing.seller_podcast_url) && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#86868b] uppercase tracking-widest mb-2">Online presence</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.seller_website_url && <SellerLink href={listing.seller_website_url} icon={<Globe className="w-3.5 h-3.5" />} label="Website" />}
                      {listing.seller_company_url && <SellerLink href={listing.seller_company_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="Company page" />}
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

                {!listing.seller_bio && !listing.seller_website_url && !listing.seller_company_url && !listing.seller_linkedin_url && !listing.seller_twitter_url && !listing.seller_instagram_url && !listing.seller_youtube_url && !listing.seller_tiktok_url && !listing.seller_podcast_url && (!listing.portfolio_links || listing.portfolio_links.length === 0) && (
                  <p className="text-[#aeaeb2] text-[12px]">No additional profile information provided by this seller.</p>
                )}
              </div>
            </PageSection>

            {listing.past_advertisers.length > 0 && (
              <PageSection title="Past advertisers" icon={<Shield className="w-4 h-4 text-[#1d1d1f]" />}>
                <div className="flex flex-wrap gap-2">
                  {listing.past_advertisers.map(a => (
                    <span key={a} className="text-[13px] text-[#3a3a3c] font-medium bg-white border border-black/[0.06] px-3 py-1.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </PageSection>
            )}

            <PageSection title="How booking works" icon={<Info className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-3xl p-5 space-y-4">
                <div>
                  <p className="text-[#1d1d1f] text-[12px] font-semibold mb-2">Pay 10% deposit today</p>
                  <ul className="space-y-1.5">
                    {[
                      'Your deposit is collected by EndingThisWeek.media',
                      'The creator handles the remaining 90% directly',
                      'The seller will invoice you after confirmation',
                      'Seller contact details released after deposit',
                    ].map((item, i) => (
                      <li key={i} className="text-[12px] text-[#6e6e73] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#aeaeb2] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-black/[0.06] pt-3">
                  <p className="text-[#1d1d1f] text-[12px] font-semibold mb-2">Why this works</p>
                  <ul className="space-y-1.5">
                    {[
                      'Fast way to reserve time-sensitive opportunities',
                      'Prevents losing the slot while details are finalized',
                      'Keeps final campaign handling direct and flexible',
                    ].map((item, i) => (
                      <li key={i} className="text-[12px] text-[#6e6e73] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d2d2d7] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
              <div className="bg-white border border-black/[0.06] rounded-3xl p-5 shadow-sm">
                <p className="text-[#1d1d1f] font-semibold text-2xl mb-0.5 tracking-[-0.02em]">{formatPrice(listing.discounted_price)}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#aeaeb2] text-[13px] line-through">{formatPrice(listing.original_price)}</span>
                  <span className="bg-[#1d1d1f] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
                </div>
                <button
                  onClick={!isSecured ? () => onSecure(listing) : undefined}
                  disabled={isSecured}
                  className={`w-full font-semibold py-3.5 rounded-2xl transition-all text-[14px] flex items-center justify-center gap-2 mb-3
                    ${isSecured
                      ? 'bg-[#f5f5f7] text-[#aeaeb2] cursor-not-allowed border border-black/[0.06]'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  {!isSecured && <Lock className="w-4 h-4" />}
                  {isSecured ? 'Not available' : 'Secure Slot'}
                </button>
                {!isSecured && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#aeaeb2]" />
                    <p className="text-[#aeaeb2] text-[11px] text-center">10% deposit · Balance to creator</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold mb-2">Share this listing</p>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.06] text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-2xl transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Link copied!' : 'Copy shareable link'}
                </button>
              </div>

              <div className="bg-white border border-black/[0.06] rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#6e6e73]" />
                  <p className="text-[#86868b] text-[10px] uppercase tracking-widest font-semibold">Claim deadline</p>
                </div>
                <CountdownTimer deadline={listing.deadline_at} compact />
                <p className="text-[#aeaeb2] text-[10px] mt-2">Ad slot date: {listing.date_label}</p>
              </div>
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
        <h3 className="text-[#1d1d1f] text-[12px] font-semibold uppercase tracking-widest">{title}</h3>
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
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#aeaeb2] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#aeaeb2] flex-shrink-0" />
        )}
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
  {
    q: 'What does the deposit do?',
    a: 'The 10% deposit reserves your slot and prevents it being taken by another buyer. It confirms your intent to the creator and activates the booking process.',
  },
  {
    q: 'Who gets the deposit?',
    a: 'The deposit is collected by EndingThisWeek.media. It is not paid directly to the creator at this stage.',
  },
  {
    q: 'When do I pay the creator?',
    a: 'After your deposit is confirmed, the creator or seller will contact you directly to arrange the remaining 90% balance using normal commercial practice for their niche.',
  },
  {
    q: 'How do refunds work?',
    a: 'Deposit refunds are assessed case by case. You may be eligible if the seller cannot fulfil, changes key terms, or if the booking cannot proceed. Refunds are not available if you change your mind or fail to complete the booking.',
  },
  {
    q: 'What happens after I secure the slot?',
    a: "You receive a booking confirmation with the creator's contact details. You then contact the creator directly, finalise campaign details, and arrange the remaining balance.",
  },
];
