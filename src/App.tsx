import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import SmartFilterBar from './components/SmartFilterBar';
import ListingsGrid from './components/ListingsGrid';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import AuthModal from './components/AuthModal';
import PreferencesOnboarding from './components/PreferencesOnboarding';
import PreferencesModal from './components/PreferencesModal';
import SmartMatchCallout from './components/SmartMatchCallout';
import { useBuyerPreferences } from './hooks/useBuyerPreferences';

const ListSlotPage = lazy(() => import('./pages/ListSlotPage'));
const ListingPage = lazy(() => import('./pages/ListingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MediaProfilePage = lazy(() => import('./pages/MediaProfilePage'));

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

type Page = 'home' | 'opportunities' | 'list-slot' | 'admin' | 'terms' | 'privacy' | 'dashboard' | 'not-found' | 'listing' | 'checkout' | 'media-profile';

function getListingIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('listing');
}

function getCheckoutIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('checkout');
}

function getMediaProfileIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('media-profile');
}

function setMediaProfileInUrl(id: string | null) {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set('media-profile', id);
    url.searchParams.delete('listing');
    url.searchParams.delete('checkout');
  } else {
    url.searchParams.delete('media-profile');
  }
  window.history.pushState({}, '', url.toString());
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
    if (getMediaProfileIdFromUrl()) return 'media-profile';
    return 'home';
  });
  const [listingId, setListingId] = useState<string | null>(() => getListingIdFromUrl());
  const [checkoutListingId, setCheckoutListingId] = useState<string | null>(() => getCheckoutIdFromUrl());
  const [mediaProfileId, setMediaProfileId] = useState<string | null>(() => getMediaProfileIdFromUrl());

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
    const hasExplicitView = new URLSearchParams(window.location.search).has('view');
    const isDesktop = window.innerWidth >= 768;
    const defaultViewMode: ViewMode = hasExplicitView ? decoded.viewMode : (isDesktop ? 'list' : 'grid');
    return {
      filters: decoded.filters,
      viewMode: defaultViewMode,
      columns: colsFromStorage,
    };
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPrefsModal, setShowPrefsModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const { prefs, setPrefs } = useBuyerPreferences();

  const { profile, user, loading: authLoading } = useAuth();
  const { listings, loading, stats, updateListingStatus, refetch } = useListings(filters);

  // Onboarding popup disabled for now

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
      const profileId = getMediaProfileIdFromUrl();
      if (checkoutId) {
        setCheckoutListingId(checkoutId);
        setPage('checkout');
      } else if (listId) {
        setListingId(listId);
        setPage('listing');
      } else if (profileId) {
        setMediaProfileId(profileId);
        setPage('media-profile');
      } else {
        setListingId(null);
        setCheckoutListingId(null);
        setMediaProfileId(null);
        const p = new URLSearchParams(window.location.search);
        if (p.get('page') === 'opportunities') {
          setPage('opportunities');
        } else {
          setPage('home');
        }
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
    setListingInUrl(null);
    setListingId(null);
    setCheckoutListingId(null);
    setPage('opportunities');
    window.scrollTo(0, 0);
  };

  const handleOpportunities = () => {
    setListingInUrl(null);
    setListingId(null);
    setCheckoutListingId(null);
    setPage('opportunities');
    window.scrollTo(0, 0);
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
    if (!authLoading && !user) {
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
    if (!authLoading && !user) {
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

  const handleViewMediaProfile = (profileId: string) => {
    setMediaProfileId(profileId);
    setMediaProfileInUrl(profileId);
    setPage('media-profile');
    window.scrollTo(0, 0);
  };

  const handleBackFromListing = () => {
    setListingId(null);
    setListingInUrl(null);
    setPage('opportunities');
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
          onViewListing={(listing) => {
            setListingId(listing.id);
            setListingInUrl(listing.id);
            setPage('listing');
            window.scrollTo(0, 0);
          }}
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

  if (page === 'media-profile' && mediaProfileId) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={goHome} />
        <Suspense fallback={<PageFallback />}>
          <MediaProfilePage
            profileId={mediaProfileId}
            onBack={() => {
              setMediaProfileInUrl(null);
              setMediaProfileId(null);
              setPage('opportunities');
              window.scrollTo(0, 0);
            }}
            onViewListing={(listing) => {
              setMediaProfileInUrl(null);
              setMediaProfileId(null);
              handleViewListing(listing);
            }}
          />
        </Suspense>
      </div>
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
            onViewMediaProfile={handleViewMediaProfile}
          />
        </Suspense>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  if (page === 'opportunities') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={goHome} />

        <main className="pt-[52px]">
          <SmartFilterBar
            filters={filters}
            onChange={updateFilters}
            total={listings.length}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            columns={columns}
            onColumnsChange={handleColumnsChange}
            onReset={handleReset}
            onEditPrefs={() => setShowPrefsModal(true)}
          />

          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <ListingsGrid
              listings={listings}
              loading={loading}
              onSecure={handleSecure}
              onDetails={handleViewListing}
              onViewMediaProfile={handleViewMediaProfile}
              columns={columns}
              viewMode={viewMode}
              sort={filters.sort}
            />
          </section>

          <SmartMatchCallout
            isLoggedIn={!!profile}
            onSignIn={() => setShowAuthModal(true)}
            onDashboard={handleDashboard}
          />
        </main>

        <Footer
          onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }}
          onPrivacy={() => { setPage('privacy'); window.scrollTo(0, 0); }}
          onContact={() => setShowContactModal(true)}
        />

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}

        {showPrefsModal && (
          <PreferencesModal
            prefs={prefs}
            onSave={(partial) => setPrefs(partial)}
            onClose={() => setShowPrefsModal(false)}
          />
        )}

        {showContactModal && (
          <ContactModal onClose={() => setShowContactModal(false)} />
        )}
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

        <SmartMatchCallout
          isLoggedIn={!!profile}
          onSignIn={() => setShowAuthModal(true)}
          onDashboard={handleDashboard}
        />

        <HowItWorks onListSlot={handleListSlot} />
      </main>

      <Footer
        onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }}
        onPrivacy={() => { setPage('privacy'); window.scrollTo(0, 0); }}
      />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showOnboarding && (
        <PreferencesOnboarding
          onSave={(partial) => { setPrefs(partial); setShowOnboarding(false); }}
          onSkip={() => { setPrefs({ hasCompletedOnboarding: true }); setShowOnboarding(false); }}
        />
      )}

      {showPrefsModal && (
        <PreferencesModal
          prefs={prefs}
          onSave={(partial) => setPrefs(partial)}
          onClose={() => setShowPrefsModal(false)}
        />
      )}

      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
}
