import { useState, useEffect } from 'react';
import { Mic2, ArrowRight, Clock, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calcDynamicPrice } from '../lib/dynamicPricing';
import { formatDeadlineDate } from '../lib/dateUtils';
import { useLocale } from '../context/LocaleContext';
import type { Listing } from '../types';

interface PodcastsSectionProps {
  onBrowsePodcasts: () => void;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
}

const SLOT_COLORS: Record<string, string> = {
  'Pre-roll': 'bg-amber-50 text-amber-700 border border-amber-100',
  'Mid-roll': 'bg-sky-50 text-sky-700 border border-sky-100',
  'Post-roll': 'bg-slate-100 text-slate-600 border border-slate-200',
};

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export default function PodcastsSection({ onBrowsePodcasts, onSecure, onDetails }: PodcastsSectionProps) {
  const { formatPrice, browserLocale } = useLocale();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('listings')
        .select('*, newsletter:newsletters(*), media_profile:media_profiles(*)')
        .eq('media_type', 'podcast')
        .eq('status', 'live')
        .order('deadline_at', { ascending: true })
        .limit(4);

      if (data) {
        const priced = (data as Listing[]).map(l => {
          const pricing = calcDynamicPrice(l.original_price, l.deadline_at, l.auto_discount_enabled !== false);
          return { ...l, discounted_price: pricing.currentPrice };
        });
        setListings(priced);
      }
      setLoading(false);
    })();
  }, []);

  if (!loading && listings.length === 0) return null;

  return (
    <section className="py-16 bg-white border-t border-[#e8e8ed]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
                <Mic2 className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-xs font-semibold text-sky-500 uppercase tracking-wide">Podcast Ad Slots</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              Reach listeners, not just readers
            </h2>
            <p className="text-sm text-[#6e6e73] mt-1 max-w-xl">
              Pre-roll, mid-roll and post-roll slots from independent podcast creators — booked in minutes.
            </p>
          </div>
          <button
            onClick={onBrowsePodcasts}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors whitespace-nowrap"
          >
            Browse all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl border border-[#e8e8ed] bg-[#f5f5f7] animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map(listing => {
              const pricing = calcDynamicPrice(listing.original_price, listing.deadline_at, listing.auto_discount_enabled !== false);
              const hasDiscount = pricing.discountPct > 0;
              const slotPos = listing.ad_slot_position || listing.slot_type || 'Mid-roll';
              const slotColorClass = SLOT_COLORS[slotPos] || 'bg-slate-100 text-slate-600 border border-slate-200';
              const deadlineFormatted = formatDeadlineDate(listing.deadline_at, browserLocale);
              const downloads = listing.downloads ?? listing.subscribers ?? null;

              return (
                <div
                  key={listing.id}
                  className="group bg-white rounded-xl border border-[#e8e8ed] hover:border-sky-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
                  onClick={() => onDetails(listing)}
                >
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-[#8e8e93] font-medium truncate">
                          {listing.host_name || listing.media_owner_name}
                        </p>
                        <h3 className="text-sm font-semibold text-[#1d1d1f] leading-tight mt-0.5 truncate">
                          {listing.property_name}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${slotColorClass}`}>
                        {slotPos}
                      </span>
                    </div>

                    {downloads !== null && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6e6e73]">
                        <Download className="w-3 h-3 flex-shrink-0" />
                        <span>{fmtCompact(downloads)} downloads/ep</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-[#8e8e93]">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>Deadline {deadlineFormatted}</span>
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex items-center justify-between gap-2 border-t border-[#f5f5f7] pt-3">
                    <div>
                      {hasDiscount && (
                        <span className="text-[10px] text-[#8e8e93] line-through block">
                          {formatPrice(listing.original_price)}
                        </span>
                      )}
                      <span className="text-base font-bold text-[#1d1d1f]">
                        {formatPrice(pricing.currentPrice)}
                      </span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onSecure(listing); }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors whitespace-nowrap"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 sm:hidden flex justify-center">
          <button
            onClick={onBrowsePodcasts}
            className="flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Browse all podcast slots
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
