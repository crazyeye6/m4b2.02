import { useState, useCallback } from 'react';
import { Mic2, Plus } from 'lucide-react';
import SmartFilterBar from '../components/SmartFilterBar';
import ListingsGrid from '../components/ListingsGrid';
import SmartMatchCallout from '../components/SmartMatchCallout';
import Footer from '../components/Footer';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import type { FilterState, Listing, ViewMode } from '../types';
import type { GridColumns } from '../components/ListingsGrid';
import { DEFAULT_FILTERS } from '../lib/urlState';

const PODCAST_DEFAULT_FILTERS: FilterState = { ...DEFAULT_FILTERS, category: 'podcast' };

interface PodcastsPageProps {
  onBack: () => void;
  onSecure: (listing: Listing) => void;
  onViewListing: (listing: Listing) => void;
  onViewMediaProfile: (profileId: string) => void;
  onSignIn: () => void;
  onDashboard: () => void;
  onListSlot: (newsletterId?: string) => void;
}

export default function PodcastsPage({
  onBack,
  onSecure,
  onViewListing,
  onViewMediaProfile,
  onSignIn,
  onDashboard,
  onListSlot,
}: PodcastsPageProps) {
  const { profile } = useAuth();

  const [filters, setFilters] = useState<FilterState>(PODCAST_DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [columns, setColumns] = useState<GridColumns>(2);

  const updateFilters = useCallback((partial: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...partial, category: 'podcast' }));
  }, []);

  const handleReset = () => setFilters(PODCAST_DEFAULT_FILTERS);

  const handleColumnsChange = (c: GridColumns) => {
    setColumns(c);
    localStorage.setItem('etw_grid_columns', String(c));
  };

  const { listings, loading } = useListings(filters);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <main className="pt-[52px]">
        {/* Page header */}
        <div className="bg-white border-b border-[#e8e8ed]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                    <Mic2 className="w-4.5 h-4.5 text-sky-500" />
                  </div>
                  <span className="text-xs font-semibold text-sky-500 uppercase tracking-wide">Podcast Ad Slots</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight">
                  Podcast Sponsorships
                </h1>
                <p className="text-sm text-[#6e6e73] mt-2 max-w-lg">
                  Pre-roll, mid-roll, and post-roll ad slots from independent podcast hosts. Find your next engaged audio audience.
                </p>
              </div>
              <button
                onClick={() => onListSlot()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors self-start sm:self-auto whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                List a podcast slot
              </button>
            </div>
          </div>
        </div>

        <SmartFilterBar
          filters={filters}
          onChange={updateFilters}
          total={listings.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          onReset={handleReset}
        />

        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {!loading && listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center">
                <Mic2 className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">No podcast slots yet</h3>
                <p className="text-sm text-[#6e6e73] max-w-sm">
                  Be the first to list a podcast ad slot and reach an engaged audio audience.
                </p>
              </div>
              <button
                onClick={() => onListSlot()}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
              >
                List a podcast slot
              </button>
            </div>
          ) : (
            <ListingsGrid
              listings={listings}
              loading={loading}
              onSecure={onSecure}
              onDetails={onViewListing}
              onViewMediaProfile={onViewMediaProfile}
              columns={columns}
              viewMode={viewMode}
              sort={filters.sort}
            />
          )}
        </section>

        <SmartMatchCallout
          isLoggedIn={!!profile}
          onSignIn={onSignIn}
          onDashboard={onDashboard}
        />
      </main>

      <Footer
        onTerms={() => {}}
        onPrivacy={() => {}}
        onContact={() => {}}
      />
    </div>
  );
}
