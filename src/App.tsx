import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import SearchBar from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
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
import type { FilterState, Listing, ViewMode } from './types';
import type { GridColumns } from './components/ListingsGrid';
import { encodeFiltersToUrl, decodeFiltersFromUrl, DEFAULT_FILTERS } from './lib/urlState';

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

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    if (getCheckoutIdFromUrl()) return 'checkout';
    if (getListingIdFromUrl()) return 'listing';
    return 'home';
  });
  const [listingId, setListingId] = useState<string | null>(() => getListingIdFromUrl());
  const [checkoutListingId, setCheckoutListingId] = useState<string | null>(() => getCheckoutIdFromUrl());

  const [{ filters, viewMode, columns }, setUiState] = useState<{
    filters: FilterState;
    viewMode: ViewMode;
    columns: GridColumns;
  }>(() => {
    const decoded = decodeFiltersFromUrl();
    const savedCols = localStorage.getItem('etw_grid_columns');
    const colsFromStorage = (savedCols === '1' || savedCols === '2' || savedCols === '3')
      ? (Number(savedCols) as GridColumns)
      : decoded.columns;
    return {
      filters: decoded.filters,
      viewMode: decoded.viewMode,
      columns: colsFromStorage,
    };
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const opportunitiesRef = useRef<HTMLDivElement>(null);

  const { profile } = useAuth();
  const { listings, loading, stats, updateListingStatus, refetch } = useListings(filters);

  const syncUrl = useCallback((f: FilterState, v: ViewMode, c: GridColumns) => {
    encodeFiltersToUrl(f, v, c);
  }, []);

  useEffect(() => {
    syncUrl(filters, viewMode, columns);
  }, [filters, viewMode, columns, syncUrl]);

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
    setUiState(prev => ({ ...prev, filters: { ...prev.filters, ...partial } }));
  };

  const handleViewModeChange = (v: ViewMode) => {
    setUiState(prev => ({ ...prev, viewMode: v }));
  };

  const handleColumnsChange = (c: GridColumns) => {
    setUiState(prev => ({ ...prev, columns: c }));
    localStorage.setItem('etw_grid_columns', String(c));
  };

  const handleReset = () => {
    setUiState(prev => ({ ...prev, filters: DEFAULT_FILTERS }));
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

          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start gap-7">

              {/* Sidebar */}
              <div className="hidden lg:block">
                <FilterSidebar
                  filters={filters}
                  onChange={updateFilters}
                  total={listings.length}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  columns={columns}
                  onColumnsChange={handleColumnsChange}
                  onReset={handleReset}
                />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-[-0.01em]">Live Opportunities</h2>
                    <p className="text-[#6e6e73] text-[13px] mt-0.5">
                      {listings.length} result{listings.length !== 1 ? 's' : ''} &mdash; Secure expiring opportunities before they disappear.
                    </p>
                  </div>

                  {/* Mobile view/sort controls */}
                  <div className="flex items-center gap-2 lg:hidden">
                    <button
                      onClick={() => handleViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
                      className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                    >
                      {viewMode === 'grid'
                        ? (
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="2" y1="4" x2="14" y2="4" />
                            <line x1="2" y1="8" x2="14" y2="8" />
                            <line x1="2" y1="12" x2="14" y2="12" />
                          </svg>
                        )
                        : (
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <rect x="2" y="2" width="5" height="5" rx="1" />
                            <rect x="9" y="2" width="5" height="5" rx="1" />
                            <rect x="2" y="9" width="5" height="5" rx="1" />
                            <rect x="9" y="9" width="5" height="5" rx="1" />
                          </svg>
                        )
                      }
                    </button>
                  </div>
                </div>

                <ListingsGrid
                  listings={listings}
                  loading={loading}
                  onSecure={handleSecure}
                  onDetails={handleViewListing}
                  columns={columns}
                  viewMode={viewMode}
                  sort={filters.sort}
                />
              </div>

            </div>
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
