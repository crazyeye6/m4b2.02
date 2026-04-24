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
import WhyNewsletterAds from './components/WhyNewsletterAds';
import PodcastsSection from './components/PodcastsSection';
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
const ClaimAccountPage = lazy(() => import('./pages/ClaimAccountPage'));
const PodcastsPage = lazy(() => import('./pages/PodcastsPage'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RedirectToAuth({ onRedirect }: { onRedirect: () => void }) {
  useEffect(() => { onRedirect(); }, []);
  return <PageFallback />;
}

import { useListings } from './hooks/useListings';
import { useAuth } from './context/AuthContext';
import type { FilterState, Listing, ViewMode } from './types';
import type { GridColumns } from './components/ListingsGrid';
import { encodeFiltersToUrl, decodeFiltersFromUrl, DEFAULT_FILTERS } from './lib/urlState';

type Page = 'home' | 'opportunities' | 'podcasts' | 'list-slot' | 'admin' | 'terms' | 'privacy' | 'dashboard' | 'not-found' | 'listing' | 'checkout' | 'media-profile' | 'claim-account';

function getParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

function getListingIdFromUrl(): string | null { return getParam('listing'); }
function getCheckoutIdFromUrl(): string | null { return getParam('checkout'); }
function getMediaProfileIdFromUrl(): string | null { return getParam('media-profile'); }

// Single URL navigation function — clears all deep-link params then sets the relevant one
function navigateUrl(key: 'listing' | 'checkout' | 'media-profile' | null, id?: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete('listing');
  url.searchParams.delete('checkout');
  url.searchParams.delete('media-profile');
  if (key && id) url.searchParams.set(key, id);
  window.history.pushState({}, '', url.toString());
}

export default function App() {
  const [claimToken, setClaimToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('claim');
  });

  const [page, setPage] = useState<Page>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('claim')) return 'claim-account';
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

  const { profile, loading: authLoading } = useAuth();
  const { listings, loading, stats, updateListingStatus, refetch } = useListings(filters);

  const now = Date.now();
  const in48h = now + 48 * 60 * 60 * 1000;
  const closingSoon = listings.filter(l => l.status === 'live' && new Date(l.deadline_at).getTime() < in48h && new Date(l.deadline_at).getTime() > now).length;
  const totalReach = listings.filter(l => l.status === 'live').reduce((sum, l) => sum + (l.downloads ?? l.subscribers ?? 0), 0);

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
    navigateUrl('checkout', listing.id);
    setPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleBrowse = () => {
    navigateUrl(null);
    setListingId(null);
    setCheckoutListingId(null);
    setPage('opportunities');
    window.scrollTo(0, 0);
  };

  const handleOpportunities = () => {
    navigateUrl(null);
    setListingId(null);
    setCheckoutListingId(null);
    setPage('opportunities');
    window.scrollTo(0, 0);
  };

  const handlePodcasts = () => {
    navigateUrl(null);
    setListingId(null);
    setCheckoutListingId(null);
    setPage('podcasts');
    window.scrollTo(0, 0);
  };

  const handleHowItWorks = () => {
    if (page !== 'home') {
      navigateUrl(null);
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

  const [preselectedMediaId, setPreselectedMediaId] = useState<string | null>(null);

  const handleListSlot = (mediaId?: string) => {
    if (!profile && !authLoading) {
      setShowAuthModal(true);
      return;
    }
    setPreselectedMediaId(mediaId ?? null);
    navigateUrl(null);
    setPage('list-slot');
    window.scrollTo(0, 0);
  };

  const handleAdmin = () => {
    navigateUrl(null);
    setPage('admin');
    window.scrollTo(0, 0);
  };

  const handleDashboard = () => {
    if (!profile && !authLoading) {
      setShowAuthModal(true);
      return;
    }
    navigateUrl(null);
    setPage('dashboard');
    window.scrollTo(0, 0);
  };

  const handleViewListing = (listing: Listing) => {
    setListingId(listing.id);
    navigateUrl('listing', listing.id);
    setPage('listing');
    window.scrollTo(0, 0);
  };

  const handleViewMediaProfile = (profileId: string) => {
    setMediaProfileId(profileId);
    navigateUrl('media-profile', profileId);
    setPage('media-profile');
    window.scrollTo(0, 0);
  };

  const handleBackFromListing = () => {
    setListingId(null);
    navigateUrl(null);
    setPage('opportunities');
    window.scrollTo(0, 0);
  };

  const sharedHeaderProps = {
    onListSlot: handleListSlot,
    onAdmin: handleAdmin,
    onDashboard: handleDashboard,
    onSignIn: () => setShowAuthModal(true),
    onOpportunities: handleOpportunities,
    onPodcasts: handlePodcasts,
    onHowItWorks: handleHowItWorks,
  };

  const goHome = () => { navigateUrl(null); setListingId(null); setCheckoutListingId(null); setPage('home'); };

  if (page === 'claim-account' && claimToken) {
    return (
      <Suspense fallback={<PageFallback />}>
        <ClaimAccountPage
          token={claimToken}
          onClaimed={() => {
            setClaimToken(null);
            const url = new URL(window.location.href);
            url.searchParams.delete('claim');
            window.history.replaceState({}, '', url.toString());
            setPage('dashboard');
            window.scrollTo(0, 0);
          }}
        />
      </Suspense>
    );
  }

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
            preselectedNewsletterId={preselectedMediaId}
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
    if (authLoading) {
      return <PageFallback />;
    }

    if (!profile) {
      // Use effect to avoid setState during render
      return <RedirectToAuth onRedirect={() => { setShowAuthModal(true); setPage('home'); }} />;
    }

    if (profile.role === 'seller' || profile.role === 'admin') {
      return (
        <Suspense fallback={<PageFallback />}>
          <SellerDashboard
            onBack={() => { goHome(); window.scrollTo(0, 0); }}
            onListSlot={(mediaId) => { handleListSlot(mediaId); }}
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
            navigateUrl('listing', listing.id);
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
        <Header {...sharedHeaderProps} onHome={() => { navigateUrl(null); setPage('home'); }} />
        <Suspense fallback={<PageFallback />}>
          <NotFoundPage onHome={() => { navigateUrl(null); setPage('home'); }} onBrowse={() => { navigateUrl(null); setPage('home'); }} />
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
              navigateUrl('listing', fromListingId);
              setPage('listing');
            } else {
              setCheckoutListingId(null);
              navigateUrl(null);
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
              navigateUrl(null);
              setMediaProfileId(null);
              setPage('opportunities');
              window.scrollTo(0, 0);
            }}
            onViewListing={(listing) => {
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
        <Header {...sharedHeaderProps} onHome={() => { navigateUrl(null); setPage('home'); }} />
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

  if (page === 'podcasts') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Header {...sharedHeaderProps} onHome={goHome} />
        <Suspense fallback={<PageFallback />}>
          <PodcastsPage
            onBack={goHome}
            onSecure={handleSecure}
            onViewListing={handleViewListing}
            onViewMediaProfile={handleViewMediaProfile}
            onSignIn={() => setShowAuthModal(true)}
            onDashboard={handleDashboard}
            onListSlot={handleListSlot}
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
        <Hero onBrowse={handlePodcasts} onListSlot={handleListSlot} liveCount={stats.liveCount} />
        <StatsBar liveCount={stats.liveCount} avgDiscount={stats.avgDiscount} totalSavings={stats.totalSavings} closingSoon={closingSoon} totalReach={totalReach} />
        <PodcastsSection onBrowsePodcasts={handlePodcasts} onSecure={handleSecure} onDetails={handleViewListing} />
        <WhyNewsletterAds onBrowse={handlePodcasts} />
        <SmartMatchCallout isLoggedIn={!!profile} onSignIn={() => setShowAuthModal(true)} onDashboard={handleDashboard} />
        <HowItWorks onListSlot={handleListSlot} />
      </main>

      <Footer
        onTerms={() => { setPage('terms'); window.scrollTo(0, 0); }}
        onPrivacy={() => { setPage('privacy'); window.scrollTo(0, 0); }}
        onContact={() => setShowContactModal(true)}
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
