import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import ListingsGrid from './components/ListingsGrid';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

const ListSlotPage = lazy(() => import('./pages/ListSlotPage'));
const ListingPage = lazy(() => import('./pages/ListingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
import { useListings } from './hooks/useListings';
import { useAuth } from './context/AuthContext';
import type { FilterState, Listing } from './types';
import type { GridColumns } from './components/ListingsGrid';

type Page = 'home' | 'list-slot' | 'admin' | 'terms' | 'privacy' | 'dashboard' | 'not-found' | 'listing' | 'checkout';

function getListingIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('listing');
}

function getCheckoutIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('checkout');
}

function setListingInUrl(id: string | null) {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set('listing', id);
  } else {
    url.searchParams.delete('listing');
  }
  url.searchParams.delete('checkout');
  window.history.pushState({}, '', url.toString());
}

function setCheckoutInUrl(listingId: string | null) {
  const url = new URL(window.location.href);
  if (listingId) {
    url.searchParams.set('checkout', listingId);
  } else {
    url.searchParams.delete('checkout');
  }
  url.searchParams.delete('listing');
  window.history.pushState({}, '', url.toString());
}

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  niche: '',
  geography: '',
  priceMin: 0,
  priceMax: 0,
  discountMin: 0,
  endingThisWeek: true,
  verified: false,
  searchQuery: '',
  selectedTags: [],
};

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    if (getCheckoutIdFromUrl()) return 'checkout';
    if (getListingIdFromUrl()) return 'listing';
    return 'home';
  });
  const [listingId, setListingId] = useState<string | null>(() => getListingIdFromUrl());
  const [checkoutListingId, setCheckoutListingId] = useState<string | null>(() => getCheckoutIdFromUrl());
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [columns, setColumns] = useState<GridColumns>(() => {
    const saved = localStorage.getItem('etw_grid_columns');
    return (saved === '1' || saved === '2' || saved === '3') ? (Number(saved) as GridColumns) : 2;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const opportunitiesRef = useRef<HTMLDivElement>(null);

  const { profile } = useAuth();
  const { listings, loading, stats, updateListingStatus, refetch } = useListings(filters);

  useEffect(() => {
    const handlePopState = () => {
      const checkoutId = getCheckoutIdFromUrl();
      const listId = getListingIdFromUrl();
      if (checkoutId) {
        setCheckoutListingId(checkoutId);
        setPage('checkout');
      } else if (listId) {
        setListingId(listId);
        setPage('listing');
      } else {
        setListingId(null);
        setCheckoutListingId(null);
        setPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  const handleColumnsChange = (c: GridColumns) => {
    setColumns(c);
    localStorage.setItem('etw_grid_columns', String(c));
  };

  const handleSecureSuccess = (listing: Listing) => {
    updateListingStatus(listing.id, 'secured');
  };

  const handleSecure = (listing: Listing) => {
    setCheckoutListingId(listing.id);
    setCheckoutInUrl(listing.id);
    setPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleBrowse = () => {
    opportunitiesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpportunities = () => {
    if (page !== 'home') {
      setListingInUrl(null);
      setListingId(null);
      setCheckoutListingId(null);
      setPage('home');
      setTimeout(() => {
        document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      opportunitiesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHowItWorks = () => {
    if (page !== 'home') {
      setListingInUrl(null);
      setListingId(null);
      setCheckoutListingId(null);
      setPage('home');
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleListSlot = () => {
    if (!profile) {
      setShowAuthModal(true);
      return;
    }
    setListingInUrl(null);
    setPage('list-slot');
    window.scrollTo(0, 0);
  };

  const handleAdmin = () => {
    setListingInUrl(null);
    setPage('admin');
    window.scrollTo(0, 0);
  };

  const handleDashboard = () => {
    if (!profile) {
      setShowAuthModal(true);
      return;
    }
    setListingInUrl(null);
    setPage('dashboard');
    window.scrollTo(0, 0);
  };

  const handleViewListing = (listing: Listing) => {
    setListingId(listing.id);
    setListingInUrl(listing.id);
    setPage('listing');
    window.scrollTo(0, 0);
  };

  const handleBackFromListing = () => {
    setListingId(null);
    setListingInUrl(null);
    setPage('home');
    window.scrollTo(0, 0);
  };

  const sharedHeaderProps = {
    onListSlot: handleListSlot,
    onAdmin: handleAdmin,
    onDashboard: handleDashboard,
    onSignIn: () => setShowAuthModal(true),
    onOpportunities: handleOpportunities,
    onHowItWorks: handleHowItWorks,
  };

  const goHome = () => { setListingInUrl(null); setListingId(null); setCheckoutListingId(null); setPage('home'); };

  if (page === 'terms') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={goHome} />
        <Suspense fallback={<PageFallback />}>
          <TermsPage onBack={goHome} />
        </Suspense>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={goHome} />
        <Suspense fallback={<PageFallback />}>
          <PrivacyPage onBack={goHome} onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }} />
        </Suspense>
      </div>
    );
  }

  if (page === 'list-slot') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={goHome} />
        <Suspense fallback={<PageFallback />}>
          <ListSlotPage
            onBack={() => { goHome(); refetch(); }}
            onEditProfile={() => { setPage('dashboard'); window.scrollTo(0, 0); }}
          />
        </Suspense>
      </div>
    );
  }

  if (page === 'admin') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminPage onBack={goHome} />
      </Suspense>
    );
  }

  if (page === 'dashboard') {
    if (profile?.role === 'seller') {
      return (
        <Suspense fallback={<PageFallback />}>
          <SellerDashboard
            onBack={() => { goHome(); window.scrollTo(0, 0); }}
            onListSlot={() => { setPage('list-slot'); window.scrollTo(0, 0); }}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<PageFallback />}>
        <BuyerDashboard
          onBack={() => { goHome(); window.scrollTo(0, 0); }}
        />
      </Suspense>
    );
  }

  if (page === 'not-found') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={() => { setListingInUrl(null); setPage('home'); }} />
        <Suspense fallback={<PageFallback />}>
          <NotFoundPage onHome={() => { setListingInUrl(null); setPage('home'); }} onBrowse={() => { setListingInUrl(null); setPage('home'); }} />
        </Suspense>
      </div>
    );
  }

  if (page === 'checkout' && checkoutListingId) {
    const fromListingId = listingId;
    return (
      <Suspense fallback={<PageFallback />}>
        <CheckoutPage
          listingId={checkoutListingId}
          onBack={() => {
            if (fromListingId) {
              setCheckoutListingId(null);
              setListingInUrl(fromListingId);
              setPage('listing');
            } else {
              setCheckoutListingId(null);
              setListingInUrl(null);
              setPage('home');
            }
            window.scrollTo(0, 0);
          }}
          onHome={goHome}
          onListSlot={handleListSlot}
          onAdmin={handleAdmin}
          onDashboard={handleDashboard}
          onSignIn={() => setShowAuthModal(true)}
          onSuccess={(listing) => {
            handleSecureSuccess(listing);
            refetch();
          }}
        />
      </Suspense>
    );
  }

  if (page === 'listing' && listingId) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={() => { setListingInUrl(null); setPage('home'); }} />
        <Suspense fallback={<PageFallback />}>
          <ListingPage
            listingId={listingId}
            onBack={handleBackFromListing}
            onSecure={handleSecure}
          />
        </Suspense>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Header {...sharedHeaderProps} onHome={() => setPage('home')} />

      <main>
        <Hero onBrowse={handleBrowse} onListSlot={handleListSlot} />
        <StatsBar
          liveCount={stats.liveCount}
          avgDiscount={stats.avgDiscount}
          totalSavings={stats.totalSavings}
        />

        <div ref={opportunitiesRef} id="opportunities">
          <div className="bg-white border-b border-black/[0.06] sticky top-[52px] z-50 shadow-sm shadow-black/[0.04]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <SearchBar
                searchQuery={filters.searchQuery}
                selectedTags={filters.selectedTags}
                onSearchChange={(q) => updateFilters({ searchQuery: q })}
                onTagsChange={(tags) => updateFilters({ selectedTags: tags })}
              />
            </div>
          </div>
          <FilterBar filters={filters} onChange={updateFilters} total={listings.length} columns={columns} onColumnsChange={handleColumnsChange} />

          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-[-0.01em]">Live Opportunities</h2>
                <p className="text-[#6e6e73] text-[13px] mt-0.5">Secure expiring opportunities before they disappear.</p>
              </div>
            </div>
            <ListingsGrid
              listings={listings}
              loading={loading}
              onSecure={handleSecure}
              onDetails={handleViewListing}
              columns={columns}
            />
          </section>
        </div>

        <HowItWorks onListSlot={handleListSlot} />
      </main>

      <Footer
        onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }}
        onPrivacy={() => { setPage('privacy'); window.scrollTo(0, 0); }}
      />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}
