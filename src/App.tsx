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
import AuthModal from './components/AuthModal';
import ListSlotPage from './pages/ListSlotPage';
import AdminPage from './pages/AdminPage';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { useListings } from './hooks/useListings';
import { useAuth } from './context/AuthContext';
import type { FilterState, Listing } from './types';

type Page = 'home' | 'list-slot' | 'admin' | 'terms' | 'privacy' | 'dashboard';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const opportunitiesRef = useRef<HTMLDivElement>(null);

  const { profile } = useAuth();
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

  const handleDashboard = () => {
    setPage('dashboard');
    window.scrollTo(0, 0);
  };

  const handleSecureFromDetail = () => {
    if (detailTarget) {
      setDetailTarget(null);
      setSecureTarget(detailTarget);
    }
  };

  const sharedHeaderProps = {
    onListSlot: handleListSlot,
    onAdmin: handleAdmin,
    onDashboard: handleDashboard,
    onSignIn: () => setShowAuthModal(true),
  };

  if (page === 'terms') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header {...sharedHeaderProps} onHome={() => setPage('home')} />
        <TermsPage onBack={() => setPage('home')} />
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header {...sharedHeaderProps} onHome={() => setPage('home')} />
        <PrivacyPage onBack={() => setPage('home')} onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }} />
      </div>
    );
  }

  if (page === 'list-slot') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header {...sharedHeaderProps} onHome={() => setPage('home')} />
        <ListSlotPage onBack={() => { setPage('home'); refetch(); }} />
      </div>
    );
  }

  if (page === 'admin') {
    return <AdminPage onBack={() => setPage('home')} />;
  }

  if (page === 'dashboard') {
    if (!profile) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
          <Header {...sharedHeaderProps} onHome={() => setPage('home')} />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-[#6e7681] text-sm mb-4">Please sign in to access your dashboard.</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                Sign in
              </button>
            </div>
          </div>
          {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </div>
      );
    }

    if (profile.role === 'seller') {
      return (
        <SellerDashboard
          onBack={() => { setPage('home'); window.scrollTo(0, 0); }}
          onListSlot={() => { setPage('list-slot'); window.scrollTo(0, 0); }}
        />
      );
    }

    return (
      <BuyerDashboard
        onBack={() => { setPage('home'); window.scrollTo(0, 0); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Header {...sharedHeaderProps} onHome={() => setPage('home')} />

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

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
