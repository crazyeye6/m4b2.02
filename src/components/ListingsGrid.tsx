import { Loader2, SearchX } from 'lucide-react';
import type { Listing, SortOption, ViewMode } from '../types';
import OpportunityCard from './OpportunityCard';
import ListingRow from './ListingRow';

export type GridColumns = 1 | 2 | 3;

interface ListingsGridProps {
  listings: Listing[];
  loading: boolean;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
  columns?: GridColumns;
  viewMode?: ViewMode;
  sort?: SortOption;
}

const GRID_CLASS: Record<GridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

function sortListings(listings: Listing[], sort: SortOption): Listing[] {
  const arr = [...listings];
  switch (sort) {
    case 'deadline_asc':
      return arr.sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime());
    case 'price_asc':
      return arr.sort((a, b) => a.discounted_price - b.discounted_price);
    case 'price_desc':
      return arr.sort((a, b) => b.discounted_price - a.discounted_price);
    case 'discount_desc':
      return arr.sort((a, b) => {
        const da = ((a.original_price - a.discounted_price) / a.original_price);
        const db = ((b.original_price - b.discounted_price) / b.original_price);
        return db - da;
      });
    case 'audience_desc':
      return arr.sort((a, b) => {
        const va = a.subscribers ?? a.downloads ?? a.followers ?? 0;
        const vb = b.subscribers ?? b.downloads ?? b.followers ?? 0;
        return vb - va;
      });
    case 'newest':
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    default:
      return arr;
  }
}

export default function ListingsGrid({
  listings,
  loading,
  onSecure,
  onDetails,
  columns = 2,
  viewMode = 'grid',
  sort = 'deadline_asc',
}: ListingsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
          <p className="text-[#6e6e73] text-[13px]">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 bg-[#f5f5f7] rounded-3xl flex items-center justify-center">
          <SearchX className="w-6 h-6 text-[#aeaeb2]" />
        </div>
        <div className="text-center">
          <p className="text-[#1d1d1f] font-semibold text-[14px] mb-1">No opportunities found</p>
          <p className="text-[#6e6e73] text-[13px]">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  const sorted = sortListings(listings, sort);

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {sorted.map(listing => (
          <ListingRow
            key={listing.id}
            listing={listing}
            onSecure={onSecure}
            onDetails={onDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${GRID_CLASS[columns]} gap-4`}>
      {sorted.map(listing => (
        <OpportunityCard
          key={listing.id}
          listing={listing}
          onSecure={onSecure}
          onDetails={onDetails}
        />
      ))}
    </div>
  );
}
