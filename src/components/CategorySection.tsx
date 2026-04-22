import { ArrowRight, Clock, Star } from 'lucide-react';
import type { Listing } from '../types';
import OpportunityCard from './OpportunityCard';

interface CategorySectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  listings: Listing[];
  loading: boolean;
  onSecure: (l: Listing) => void;
  onDetails: (l: Listing) => void;
  onViewMediaProfile: (id: string) => void;
  onViewAll: () => void;
  totalCount: number;
  comingSoon?: boolean;
  comingSoonDesc?: string;
  accentColor?: string;
  maxCards?: number;
}

const PLACEHOLDER_OPPORTUNITIES = [
  {
    title: 'Founders Unfiltered',
    format: 'Mid-Roll · 85k downloads per episode',
    niche: 'Entrepreneurship',
    deadline: '6 days',
    price: '$2,200',
    gradient: 'from-orange-500 to-rose-500',
    initials: 'FU',
  },
  {
    title: 'The B2B Playbook',
    format: 'Pre-Roll · 42k downloads per episode',
    niche: 'B2B / Sales',
    deadline: '9 days',
    price: '$1,100',
    gradient: 'from-sky-500 to-blue-600',
    initials: 'BP',
  },
  {
    title: 'Climate Capital Pod',
    format: 'Host-Read · 28k downloads',
    niche: 'Climate / ESG',
    deadline: '12 days',
    price: '$890',
    gradient: 'from-emerald-500 to-teal-600',
    initials: 'CC',
  },
];

function ComingSoonPlaceholder({ desc, accentColor = '#1F7A63' }: { desc?: string; accentColor?: string }) {
  return (
    <div className="mt-6 space-y-3">
      {/* Coming soon cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLACEHOLDER_OPPORTUNITIES.map((p) => (
          <div key={p.title} className="relative bg-white border border-black/[0.06] rounded-3xl p-5 overflow-hidden select-none">
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 z-10 flex flex-col items-center justify-center gap-2">
              <span className="bg-[#1d1d1f] text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide">Coming Soon</span>
            </div>
            {/* Blurred card content */}
            <div className="opacity-30">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-[12px] font-bold">{p.initials}</span>
                </div>
                <div>
                  <p className="text-[#1d1d1f] font-semibold text-[14px]">{p.title}</p>
                  <p className="text-[#6e6e73] text-[12px] mt-0.5">{p.format}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#86868b] text-[11px]">{p.niche}</p>
                  <div className="flex items-center gap-1 text-orange-500 text-[11px] mt-0.5">
                    <Clock className="w-3 h-3" />{p.deadline} left
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#1d1d1f] font-bold text-[18px]">{p.price}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interest capture */}
      <div className="bg-white border border-black/[0.06] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div>
          <p className="text-[#1d1d1f] font-semibold text-[15px] mb-1">Be the first to know when this category launches</p>
          <p className="text-[#6e6e73] text-[13px]">{desc || 'We\'re onboarding creators in this category now.'}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <input
            type="email"
            placeholder="Your email"
            className="text-[13px] bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2 outline-none focus:border-black/20 w-44"
          />
          <button
            className="text-[13px] font-semibold text-white px-4 py-2 rounded-xl transition-all flex-shrink-0"
            style={{ background: accentColor }}
          >
            Notify me
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategorySection({
  title,
  subtitle,
  icon,
  listings,
  loading,
  onSecure,
  onDetails,
  onViewMediaProfile,
  onViewAll,
  totalCount,
  comingSoon = false,
  comingSoonDesc,
  accentColor = '#1F7A63',
  maxCards = 4,
}: CategorySectionProps) {
  const visibleListings = listings.slice(0, maxCards);

  return (
    <section className="py-16 border-t border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: accentColor }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-[-0.02em]">{title}</h2>
              <p className="text-[#6e6e73] text-[13px] mt-0.5">{subtitle}</p>
            </div>
          </div>
          {!comingSoon && totalCount > 0 && (
            <button
              onClick={onViewAll}
              className="flex-shrink-0 flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:opacity-80"
              style={{ color: accentColor }}
            >
              View all {totalCount}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        {comingSoon ? (
          <ComingSoonPlaceholder desc={comingSoonDesc} accentColor={accentColor} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white border border-black/[0.06] rounded-3xl h-48 animate-pulse" />
            ))}
          </div>
        ) : visibleListings.length === 0 ? (
          <div className="bg-white border border-black/[0.06] rounded-3xl p-10 text-center">
            <Star className="w-8 h-8 text-[#d2d2d7] mx-auto mb-3" />
            <p className="text-[#1d1d1f] font-semibold mb-1">New opportunities coming soon</p>
            <p className="text-[#6e6e73] text-[13px] mb-4">Check back — inventory refreshes weekly.</p>
            <button
              onClick={onViewAll}
              className="text-[13px] font-semibold text-white px-4 py-2 rounded-xl"
              style={{ background: accentColor }}
            >
              Browse all opportunities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleListings.map(listing => (
              <OpportunityCard
                key={listing.id}
                listing={listing}
                onSecure={onSecure}
                onDetails={onDetails}
                onViewMediaProfile={onViewMediaProfile}
              />
            ))}
          </div>
        )}

        {/* View all CTA if more exist */}
        {!comingSoon && visibleListings.length > 0 && totalCount > maxCards && (
          <div className="mt-6 text-center">
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-2 text-[14px] font-semibold border border-black/[0.08] hover:border-black/[0.15] px-6 py-2.5 rounded-2xl bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] transition-all"
            >
              See all {totalCount} {title.toLowerCase()} opportunities
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
