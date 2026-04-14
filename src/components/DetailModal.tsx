import { X, MapPin, Users, BarChart2, Shield, Mail, Mic, Instagram, ExternalLink, Clock, Lock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Listing } from '../types';
import CountdownTimer from './CountdownTimer';

interface DetailModalProps {
  listing: Listing;
  onClose: () => void;
  onSecure: () => void;
}

const MEDIA_CONFIG = {
  newsletter: { icon: <Mail className="w-4 h-4" />, label: 'Newsletter', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  podcast: { icon: <Mic className="w-4 h-4" />, label: 'Podcast', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  influencer: { icon: <Instagram className="w-4 h-4" />, label: 'Influencer', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export default function DetailModal({ listing, onClose, onSecure }: DetailModalProps) {
  const mc = MEDIA_CONFIG[listing.media_type];
  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);
  const savings = listing.original_price - listing.discounted_price;
  const depositAmount = Math.round(listing.discounted_price * 0.1);
  const balanceAmount = listing.discounted_price - depositAmount;
  const isSecured = listing.status === 'secured' || listing.status === 'expired' || listing.status === 'cancelled';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111118] border-b border-white/8 px-6 py-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-lg ${mc.bg} ${mc.color} text-xs font-semibold`}>
              {mc.icon}
              {mc.label}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{listing.property_name}</h2>
              <p className="text-gray-500 text-sm">{listing.media_company_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-2">Price per slot</p>
              <p className="text-white text-4xl font-black mb-1">${listing.discounted_price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500 text-sm line-through">${listing.original_price.toLocaleString()}</span>
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">-{discount}%</span>
                <span className="text-emerald-400 text-xs font-semibold">Save ${savings.toLocaleString()}</span>
              </div>
              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 text-xs font-semibold">Deposit due now (10%)</span>
                  <span className="text-emerald-400 font-bold text-sm">${depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">Balance direct to creator (90%)</span>
                  <span className="text-white text-xs font-medium">${balanceAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-2">Time remaining</p>
              <div className="mb-2">
                <CountdownTimer deadline={listing.deadline_at} />
              </div>
              <p className="text-gray-600 text-xs">Slot date: <span className="text-gray-400">{listing.date_label}</span></p>
              <p className="text-gray-600 text-xs mt-1">Slots left: <span className={`font-semibold ${listing.slots_remaining === 1 ? 'text-red-400' : 'text-orange-400'}`}>{listing.slots_remaining}</span></p>
            </div>
          </div>

          <Section title="Audience breakdown" icon={<Users className="w-4 h-4 text-amber-400" />}>
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
            <div className="flex items-start gap-3 mt-3 pt-3 border-t border-white/5">
              <MapPin className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Geography</p>
                <p className="text-white text-sm">{listing.location}</p>
              </div>
              <div className="ml-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-0.5">Audience</p>
                <p className="text-white text-sm">{listing.audience}</p>
              </div>
            </div>
          </Section>

          <Section title="Placement details" icon={<BarChart2 className="w-4 h-4 text-amber-400" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Slot type</p>
                <p className="text-white text-sm font-semibold">{listing.slot_type}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Scheduled date</p>
                <p className="text-white text-sm font-semibold">{listing.date_label}</p>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 mt-3">
              <p className="text-xs text-gray-600 mb-1">Booking terms</p>
              <p className="text-gray-400 text-sm">Creative must be submitted within 24 hours of booking. Full payment required on confirmation. Hold period: {listing.status === 'securing' ? '6h' : '24h'}.</p>
            </div>
          </Section>

          <Section title="Seller" icon={<Shield className="w-4 h-4 text-amber-400" />}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {listing.media_owner_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{listing.media_owner_name}</p>
                <p className="text-gray-500 text-sm">{listing.media_company_name}</p>
                <p className="text-gray-600 text-xs mt-1">{listing.location}</p>
              </div>
              <button className="flex items-center gap-1 text-amber-500 text-xs font-medium hover:text-amber-400 transition-colors">
                View profile <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </Section>

          {listing.past_advertisers.length > 0 && (
            <Section title="Past advertisers" icon={<Shield className="w-4 h-4 text-amber-400" />}>
              <div className="flex flex-wrap gap-2">
                {listing.past_advertisers.map(a => (
                  <span key={a} className="text-sm text-gray-300 font-medium bg-white/5 border border-white/8 px-3 py-1.5 rounded-lg">
                    {a}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="How booking works" icon={<Info className="w-4 h-4 text-blue-400" />}>
            <div className="bg-blue-950/30 border border-blue-500/15 rounded-xl p-4 space-y-4">
              <div>
                <p className="text-blue-300 text-xs font-semibold mb-2">Pay 10% deposit today</p>
                <ul className="space-y-1.5">
                  {[
                    'Your deposit is collected by EndingThisWeek.media',
                    'The creator handles the remaining 90% directly',
                    'The seller will invoice you after confirmation',
                    'Seller contact details released after deposit',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-blue-500/10 pt-3">
                <p className="text-blue-300 text-xs font-semibold mb-2">Why this works</p>
                <ul className="space-y-1.5">
                  {[
                    'Fast way to reserve time-sensitive opportunities',
                    'Prevents losing the slot while details are finalized',
                    'Keeps final campaign handling direct and flexible',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="FAQ" icon={<Shield className="w-4 h-4 text-amber-400" />}>
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

        <div className="sticky bottom-0 bg-[#111118] border-t border-white/8 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={!isSecured ? onSecure : undefined}
              disabled={isSecured}
              className={`flex-1 font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2
                ${isSecured
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                }`}
            >
              {!isSecured && <Lock className="w-4 h-4" />}
              {isSecured ? 'Not available' : 'Secure Slot'}
            </button>
            <button onClick={onClose} className="px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm font-medium transition-all">
              Close
            </button>
          </div>
          {!isSecured && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Clock className="w-3 h-3 text-gray-600" />
              <p className="text-gray-600 text-xs text-center">Reserve with 10% deposit · Balance paid direct to creator</p>
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
        <h3 className="text-white text-sm font-semibold uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
      <p className={`font-bold text-lg ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      <p className="text-gray-600 text-xs mt-0.5 uppercase tracking-wide">{label}</p>
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

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white text-sm font-medium pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}
