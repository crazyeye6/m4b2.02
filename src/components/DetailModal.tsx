import { X, MapPin, Users, BarChart2, Shield, Mail, Mic, Instagram, ExternalLink, Clock, Lock, Info, ChevronDown, ChevronUp, Globe, Linkedin, Twitter, Youtube, Radio, FileText, Tag } from 'lucide-react';
import { useState } from 'react';
import type { Listing, MediaProfile } from '../types';
import CountdownTimer from './CountdownTimer';

interface DetailModalProps {
  listing: Listing;
  onClose: () => void;
  onSecure: () => void;
  onViewMediaProfile?: (profileId: string) => void;
}

const MEDIA_CONFIG = {
  newsletter: { icon: <Mail className="w-4 h-4" />, label: 'Newsletter', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  podcast: { icon: <Mic className="w-4 h-4" />, label: 'Podcast', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  influencer: { icon: <Instagram className="w-4 h-4" />, label: 'Influencer', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export default function DetailModal({ listing, onClose, onSecure, onViewMediaProfile }: DetailModalProps) {
  const mc = MEDIA_CONFIG[listing.media_type];
  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const savings = listing.original_price - listing.discounted_price;
  const depositAmount = Math.round(listing.discounted_price * 0.1);
  const balanceAmount = listing.discounted_price - depositAmount;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-xl ${mc.bg} ${mc.color} text-xs font-semibold`}>
              {mc.icon}
              {mc.label}
            </div>
            <div>
              <h2 className="text-[#1d1d1f] font-bold text-lg leading-tight">{listing.property_name}</h2>
              {listing.media_profile_id && onViewMediaProfile ? (
                <button
                  onClick={() => { onClose(); onViewMediaProfile(listing.media_profile_id!); }}
                  className="text-sky-600 hover:text-sky-700 hover:underline text-sm text-left transition-colors"
                >
                  {listing.media_company_name}
                </button>
              ) : (
                <p className="text-[#6e6e73] text-sm">{listing.media_company_name}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
              <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold mb-2">Price per slot</p>
              <p className="text-[#1d1d1f] text-4xl font-black mb-1">${listing.discounted_price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#aeaeb2] text-sm line-through">${listing.original_price.toLocaleString()}</span>
                <span className="bg-[#1d1d1f] text-white text-xs font-black px-2 py-0.5 rounded-lg">-{discount}%</span>
                <span className="text-green-600 text-xs font-semibold">Save ${savings.toLocaleString()}</span>
              </div>
              <div className="space-y-1.5 border-t border-black/[0.06] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-600 text-xs font-semibold">Deposit due now (10%)</span>
                  <span className="text-green-600 font-bold text-sm">${depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6e6e73] text-xs">Balance direct to creator (90%)</span>
                  <span className="text-[#1d1d1f] text-xs font-medium">${balanceAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
              <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold mb-1">Time to claim this slot</p>
              <p className="text-[#aeaeb2] text-[10px] mb-2">Interest must be registered before this closes. The ad runs on the date below.</p>
              <div className="mb-2">
                <CountdownTimer deadline={listing.deadline_at} />
              </div>
              <p className="text-[#6e6e73] text-xs">Ad slot date: <span className="text-[#1d1d1f] font-medium">{listing.date_label}</span></p>
              <p className="text-[#6e6e73] text-xs mt-1">Slots left: <span className={`font-semibold ${listing.slots_remaining === 1 ? 'text-orange-500' : 'text-orange-500'}`}>{listing.slots_remaining}</span></p>
            </div>
          </div>

          <Section title="Audience breakdown" icon={<Users className="w-4 h-4 text-[#6e6e73]" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listing.media_type === 'newsletter' && (
                <>
                  <StatCard label="Subscribers" value={fmt(listing.subscribers || 0)} />
                  <StatCard label="Open rate" value={listing.open_rate || '—'} highlight />
                  <StatCard label="CTR" value={listing.ctr || '—'} highlight />
                </>
              )}
              {listing.media_type === 'podcast' && (
                <>
                  <StatCard label="Downloads/ep" value={fmt(listing.downloads || 0)} />
                  <StatCard label="Ad type" value={listing.ad_type || '—'} />
                </>
              )}
              {listing.media_type === 'influencer' && (
                <>
                  <StatCard label="Followers" value={fmt(listing.followers || 0)} />
                  <StatCard label="Engagement" value={listing.engagement_rate || '—'} highlight />
                  <StatCard label="Deliverable" value={listing.deliverable || '—'} />
                </>
              )}
            </div>
            <div className="flex items-start gap-3 mt-3 pt-3 border-t border-black/[0.06]">
              <MapPin className="w-3.5 h-3.5 text-[#aeaeb2] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#86868b] uppercase tracking-wide font-semibold mb-0.5">Geography</p>
                <p className="text-[#1d1d1f] text-sm">{listing.location}</p>
              </div>
              <div className="ml-6">
                <p className="text-xs text-[#86868b] uppercase tracking-wide font-semibold mb-0.5">Audience</p>
                <p className="text-[#1d1d1f] text-sm">{listing.audience}</p>
              </div>
            </div>
          </Section>

          <Section title="Placement details" icon={<BarChart2 className="w-4 h-4 text-[#6e6e73]" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-3">
                <p className="text-xs text-[#86868b] mb-1">Slot type</p>
                <p className="text-[#1d1d1f] text-sm font-semibold">{listing.slot_type}</p>
              </div>
              <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-3">
                <p className="text-xs text-[#86868b] mb-1">Ad runs</p>
                <p className="text-[#1d1d1f] text-sm font-semibold">{listing.date_label}</p>
              </div>
            </div>
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-3 mt-3">
              <p className="text-xs text-[#86868b] mb-1">Booking terms</p>
              <p className="text-[#6e6e73] text-sm">Claim your interest before the deadline closes. Ad copy must be submitted to the creator once your slot is confirmed — allow lead time before the ad slot date. Hold period: {listing.status === 'securing' ? '6h' : '24h'}.</p>
            </div>
          </Section>

          {listing.media_profile && (
            <MediaProfileSection
              profile={listing.media_profile}
              onViewProfile={listing.media_profile_id && onViewMediaProfile
                ? () => { onClose(); onViewMediaProfile(listing.media_profile_id!); }
                : undefined}
            />
          )}

          <Section title="About the seller" icon={<Shield className="w-4 h-4 text-[#6e6e73]" />}>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-bold text-lg flex-shrink-0">
                  {listing.media_owner_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  {listing.media_profile_id && onViewMediaProfile ? (
                    <button
                      onClick={() => { onClose(); onViewMediaProfile(listing.media_profile_id!); }}
                      className="text-[#1d1d1f] font-semibold hover:text-sky-600 transition-colors text-left"
                    >
                      {listing.media_owner_name}
                    </button>
                  ) : (
                    <p className="text-[#1d1d1f] font-semibold">{listing.media_owner_name}</p>
                  )}
                  <p className="text-[#6e6e73] text-sm">{listing.media_company_name}</p>
                  <p className="text-[#aeaeb2] text-xs mt-1">{listing.location}</p>
                  {listing.media_profile_id && onViewMediaProfile && (
                    <button
                      onClick={() => { onClose(); onViewMediaProfile(listing.media_profile_id!); }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View full newsletter profile
                    </button>
                  )}
                </div>
              </div>

              {listing.seller_bio && (
                <p className="text-[#6e6e73] text-sm leading-relaxed bg-[#f5f5f7] border border-black/[0.06] rounded-xl px-4 py-3">
                  {listing.seller_bio}
                </p>
              )}

              {(listing.seller_website_url || listing.seller_company_url || listing.seller_linkedin_url || listing.seller_twitter_url || listing.seller_instagram_url || listing.seller_youtube_url || listing.seller_tiktok_url || listing.seller_podcast_url) && (
                <div>
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Online presence</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.seller_website_url && (
                      <SellerLink href={listing.seller_website_url} icon={<Globe className="w-3.5 h-3.5" />} label="Website" />
                    )}
                    {listing.seller_company_url && (
                      <SellerLink href={listing.seller_company_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="Company page" />
                    )}
                    {listing.seller_linkedin_url && (
                      <SellerLink href={listing.seller_linkedin_url} icon={<Linkedin className="w-3.5 h-3.5" />} label="LinkedIn" />
                    )}
                    {listing.seller_twitter_url && (
                      <SellerLink href={listing.seller_twitter_url} icon={<Twitter className="w-3.5 h-3.5" />} label="X / Twitter" />
                    )}
                    {listing.seller_instagram_url && (
                      <SellerLink href={listing.seller_instagram_url} icon={<Instagram className="w-3.5 h-3.5" />} label="Instagram" />
                    )}
                    {listing.seller_youtube_url && (
                      <SellerLink href={listing.seller_youtube_url} icon={<Youtube className="w-3.5 h-3.5" />} label="YouTube" />
                    )}
                    {listing.seller_tiktok_url && (
                      <SellerLink href={listing.seller_tiktok_url} icon={<ExternalLink className="w-3.5 h-3.5" />} label="TikTok" />
                    )}
                    {listing.seller_podcast_url && (
                      <SellerLink href={listing.seller_podcast_url} icon={<Mic className="w-3.5 h-3.5" />} label="Podcast" />
                    )}
                  </div>
                </div>
              )}

              {listing.portfolio_links && listing.portfolio_links.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">Past work &amp; portfolio</p>
                  <div className="space-y-1.5">
                    {listing.portfolio_links.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#1d1d1f] hover:text-blue-600 bg-[#f5f5f7] hover:bg-white border border-black/[0.06] hover:border-black/[0.12] rounded-xl px-3 py-2 transition-all group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#aeaeb2] group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                        <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!listing.seller_bio && !listing.seller_website_url && !listing.seller_company_url && !listing.seller_linkedin_url && !listing.seller_twitter_url && !listing.seller_instagram_url && !listing.seller_youtube_url && !listing.seller_tiktok_url && !listing.seller_podcast_url && (!listing.portfolio_links || listing.portfolio_links.length === 0) && (
                <p className="text-[#aeaeb2] text-xs italic">No additional profile information provided by this seller.</p>
              )}
            </div>
          </Section>

          {listing.past_advertisers.length > 0 && (
            <Section title="Past advertisers" icon={<Shield className="w-4 h-4 text-[#6e6e73]" />}>
              <div className="flex flex-wrap gap-2">
                {listing.past_advertisers.map(a => (
                  <span key={a} className="text-sm text-[#1d1d1f] font-medium bg-[#f5f5f7] border border-black/[0.08] px-3 py-1.5 rounded-xl">
                    {a}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="How booking works" icon={<Info className="w-4 h-4 text-blue-500" />}>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-4">
              <div>
                <p className="text-blue-700 text-xs font-semibold mb-2">Pay 10% deposit today</p>
                <ul className="space-y-1.5">
                  {[
                    'Your deposit is collected by EndingThisWeek.media',
                    'The creator handles the remaining 90% directly',
                    'The seller will invoice you after confirmation',
                    'Seller contact details released after deposit',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-[#6e6e73] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-blue-100 pt-3">
                <p className="text-blue-700 text-xs font-semibold mb-2">Why this works</p>
                <ul className="space-y-1.5">
                  {[
                    'Fast way to reserve time-sensitive opportunities',
                    'Prevents losing the slot while details are finalized',
                    'Keeps final campaign handling direct and flexible',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-[#6e6e73] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="FAQ" icon={<Shield className="w-4 h-4 text-[#6e6e73]" />}>
            <div className="space-y-1">
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
          </Section>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={!isSecured ? onSecure : undefined}
              disabled={isSecured}
              className={`flex-1 font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2
                ${isSecured
                  ? 'bg-[#f5f5f7] text-[#aeaeb2] cursor-not-allowed border border-black/[0.06]'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
              {!isSecured && <Lock className="w-4 h-4" />}
              {isSecured ? 'Not available' : 'Secure Slot'}
            </button>
            <button onClick={onClose} className="px-5 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all">
              Close
            </button>
          </div>
          {!isSecured && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Clock className="w-3 h-3 text-[#aeaeb2]" />
              <p className="text-[#aeaeb2] text-xs text-center">Reserve with 10% deposit · Balance paid direct to creator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-[#1d1d1f] text-sm font-semibold uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-xl p-3 text-center">
      <p className={`font-bold text-lg ${highlight ? 'text-green-600' : 'text-[#1d1d1f]'}`}>{value}</p>
      <p className="text-[#86868b] text-xs mt-0.5 uppercase tracking-wide">{label}</p>
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
    a: 'You receive a booking confirmation with the creator\'s contact details. You then contact the creator directly, finalise campaign details, and arrange the remaining balance.',
  },
];

function SellerLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.15] hover:bg-white px-3 py-1.5 rounded-xl transition-all"
    >
      {icon}
      {label}
      <ExternalLink className="w-2.5 h-2.5 text-[#aeaeb2]" />
    </a>
  );
}

function MediaProfileSection({ profile, onViewProfile }: { profile: MediaProfile; onViewProfile?: () => void }) {
  function fmtSubs(n: number | null): string {
    if (!n) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#6e6e73]" />
          <h3 className="text-[#1d1d1f] text-sm font-semibold uppercase tracking-wide">Newsletter Profile</h3>
        </div>
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            View full profile
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="bg-[#f5f5f7] px-5 py-4 flex items-start gap-4">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={profile.newsletter_name}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-black/[0.06]"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center flex-shrink-0">
              <span className="text-[#6e6e73] font-bold text-xl">{profile.newsletter_name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-[#1d1d1f] font-bold text-base leading-tight">{profile.newsletter_name}</h4>
            {profile.tagline && <p className="text-[#6e6e73] text-sm mt-0.5">{profile.tagline}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {profile.category && (
                <span className="text-[10px] font-semibold text-[#6e6e73] bg-white border border-black/[0.08] px-2 py-0.5 rounded-lg">{profile.category}</span>
              )}
              {profile.primary_geography && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#6e6e73]">
                  <MapPin className="w-2.5 h-2.5" />{profile.primary_geography}
                </span>
              )}
              {profile.publishing_frequency && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#6e6e73]">
                  <Radio className="w-2.5 h-2.5" />{profile.publishing_frequency}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#f5f5f7] rounded-xl px-3 py-2.5 text-center">
              <p className="text-[#1d1d1f] font-bold text-lg">{fmtSubs(profile.subscriber_count)}</p>
              <p className="text-[9px] font-semibold text-[#aeaeb2] uppercase tracking-wider mt-0.5">Subscribers</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-xl px-3 py-2.5 text-center">
              <p className="text-green-600 font-bold text-lg">{profile.open_rate || '—'}</p>
              <p className="text-[9px] font-semibold text-[#aeaeb2] uppercase tracking-wider mt-0.5">Open rate</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-xl px-3 py-2.5 text-center">
              <p className="text-[#1d1d1f] font-bold text-sm leading-tight">{profile.audience_type || '—'}</p>
              <p className="text-[9px] font-semibold text-[#aeaeb2] uppercase tracking-wider mt-0.5">Audience type</p>
            </div>
          </div>

          {profile.audience_summary && (
            <div>
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5">Audience</p>
              <p className="text-[#6e6e73] text-sm leading-relaxed">{profile.audience_summary}</p>
            </div>
          )}

          {profile.ad_formats && profile.ad_formats.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-2">Available ad formats</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.ad_formats.map(f => (
                  <span key={f} className="flex items-center gap-1 text-[11px] text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.06] px-2.5 py-1 rounded-lg">
                    <Tag className="w-2.5 h-2.5" />{f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.past_advertisers && profile.past_advertisers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-2">Past advertisers</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.past_advertisers.map(a => (
                  <span key={a} className="text-sm text-[#1d1d1f] font-medium bg-[#f5f5f7] border border-black/[0.08] px-3 py-1 rounded-xl">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-black/[0.04]">
            {profile.website_url && (
              <ProfileLink href={profile.website_url} icon={<Globe className="w-3 h-3" />} label="Newsletter website" />
            )}
            {profile.media_kit_url && (
              <ProfileLink href={profile.media_kit_url} icon={<FileText className="w-3 h-3" />} label="Media kit" />
            )}
            {profile.sample_issue_url && (
              <ProfileLink href={profile.sample_issue_url} icon={<ExternalLink className="w-3 h-3" />} label="Sample issue" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.15] hover:bg-white px-3 py-1.5 rounded-xl transition-all"
    >
      {icon}
      {label}
      <ExternalLink className="w-2.5 h-2.5 text-[#aeaeb2]" />
    </a>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-black/[0.08] rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f5f5f7] transition-colors"
      >
        <span className="text-[#1d1d1f] text-sm font-medium pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#aeaeb2] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#aeaeb2] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-[#6e6e73] text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}
