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
import NotFoundPage from './pages/NotFoundPage';
import { useListings } from './hooks/useListings';
import { useAuth } from './context/AuthContext';
import type { FilterState, Listing } from './types';

type Page = 'home' | 'list-slot' | 'admin' | 'terms' | 'privacy' | 'dashboard' | 'not-found';

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
        <ListSlotPage
          onBack={() => { setPage('home'); refetch(); }}
          onEditProfile={() => { setPage('dashboard'); window.scrollTo(0, 0); }}
        />
      </div>
    );
  }

  if (page === 'admin') {
    if (profile?.role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
          <Header {...sharedHeaderProps} onHome={() => setPage('home')} />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7m0 0a4 4 0 10-8 0 4 4 0 008 0z" /></svg>
              </div>
              <h2 className="text-[#e6edf3] font-bold text-xl mb-2">Access Denied</h2>
              <p className="text-[#8b949e] text-sm mb-6">You don't have permission to access the admin panel.</p>
              <button onClick={() => setPage('home')} className="bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-semibold px-5 py-2.5 rounded-lg text-sm transition-all border border-[#30363d]">
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
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

  if (page === 'not-found') {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header {...sharedHeaderProps} onHome={() => setPage('home')} />
        <NotFoundPage onHome={() => setPage('home')} onBrowse={() => setPage('home')} />
      </div>
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
