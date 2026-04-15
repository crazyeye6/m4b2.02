import { Loader2, SearchX } from 'lucide-react';
import type { Listing } from '../types';
import OpportunityCard from './OpportunityCard';

export type GridColumns = 1 | 2 | 3;

interface ListingsGridProps {
  listings: Listing[];
  loading: boolean;
  onSecure: (listing: Listing) => void;
  onDetails: (listing: Listing) => void;
  columns?: GridColumns;
}

const GRID_CLASS: Record<GridColumns, string> = {
  1: 'grid-cols-1 max-w-2xl mx-auto',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
};

export default function ListingsGrid({ listings, loading, onSecure, onDetails, columns = 2 }: ListingsGridProps) {
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

  return (
    <div className={`grid ${GRID_CLASS[columns]} gap-4`}>
      {listings.map(listing => (
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
