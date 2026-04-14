import { useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import ListingsGrid from './components/ListingsGrid';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import SecureSlotFlow from './components/SecureSlotFlow';
import DetailModal from './components/DetailModal';
import ListSlotPage from './pages/ListSlotPage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { useListings } from './hooks/useListings';
import type { FilterState, Listing } from './types';

type Page = 'home' | 'list-slot' | 'admin' | 'terms' | 'privacy';

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  niche: '',
  geography: '',
  priceMin: 0,
  priceMax: 0,
  discountMin: 0,
  dateRange: '',
  verified: false,
  sortBy: 'ending_soon',
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [secureTarget, setSecureTarget] = useState<Listing | null>(null);
  const [detailTarget, setDetailTarget] = useState<Listing | null>(null);
  const opportunitiesRef = useRef<HTMLDivElement>(null);

  const { listings, loading, stats, updateListingStatus, refetch } = useListings(filters);

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  const handleSecureSuccess = (listing: Listing) => {
    updateListingStatus(listing.id, 'secured');
  };

  const handleBrowse = () => {
    opportunitiesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleListSlot = () => {
    setPage('list-slot');
    window.scrollTo(0, 0);
  };

  const handleAdmin = () => {
    setPage('admin');
    window.scrollTo(0, 0);
  };

  const handleSecureFromDetail = () => {
    if (detailTarget) {
      setDetailTarget(null);
      setSecureTarget(detailTarget);
    }
  };

  if (page === 'terms') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header onListSlot={handleListSlot} onHome={() => setPage('home')} onAdmin={handleAdmin} />
        <TermsPage onBack={() => setPage('home')} />
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header onListSlot={handleListSlot} onHome={() => setPage('home')} onAdmin={handleAdmin} />
        <PrivacyPage onBack={() => setPage('home')} onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }} />
      </div>
    );
  }

  if (page === 'list-slot') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header onListSlot={handleListSlot} onHome={() => setPage('home')} onAdmin={handleAdmin} />
        <ListSlotPage onBack={() => { setPage('home'); refetch(); }} />
      </div>
    );
  }

  if (page === 'admin') {
    return <AdminPage onBack={() => setPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Header onListSlot={handleListSlot} onHome={() => setPage('home')} onAdmin={handleAdmin} />

      <main>
        <Hero onBrowse={handleBrowse} onListSlot={handleListSlot} />
        <StatsBar
          liveCount={stats.liveCount}
          avgDiscount={stats.avgDiscount}
          totalSavings={stats.totalSavings}
        />

        <div ref={opportunitiesRef} id="opportunities">
          <FilterBar filters={filters} onChange={updateFilters} total={listings.length} />

          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#e6edf3]">Live Opportunities</h2>
                <p className="text-[#8b949e] text-sm mt-0.5">Secure expiring opportunities before they disappear.</p>
              </div>
            </div>
            <ListingsGrid
              listings={listings}
              loading={loading}
              onSecure={setSecureTarget}
              onDetails={setDetailTarget}
            />
          </section>
        </div>

        <HowItWorks />
      </main>

      <Footer
        onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }}
        onPrivacy={() => { setPage('privacy'); window.scrollTo(0, 0); }}
      />

      {secureTarget && (
        <SecureSlotFlow
          listing={secureTarget}
          onClose={() => { setSecureTarget(null); refetch(); }}
          onSuccess={handleSecureSuccess}
        />
      )}

      {detailTarget && (
        <DetailModal
          listing={detailTarget}
          onClose={() => setDetailTarget(null)}
          onSecure={handleSecureFromDetail}
        />
      )}
    </div>
  );
}
