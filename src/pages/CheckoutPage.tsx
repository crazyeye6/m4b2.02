import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslations } from '../hooks/useTranslations';
import type { Listing } from '../types';
import SecureSlotFlow from '../components/SecureSlotFlow';
import Header from '../components/Header';

interface CheckoutPageProps {
  listingId: string;
  onBack: () => void;
  onHome: () => void;
  onListSlot: () => void;
  onAdmin: () => void;
  onDashboard: () => void;
  onSignIn: () => void;
  onSuccess: (listing: Listing) => void;
}

export default function CheckoutPage({
  listingId,
  onBack,
  onHome,
  onListSlot,
  onAdmin,
  onDashboard,
  onSignIn,
  onSuccess,
}: CheckoutPageProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tx = useTranslations();

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .maybeSingle();

      if (error || !data) {
        setError(tx.checkout.notFound);
      } else {
        setListing(data as Listing);
      }
      setLoading(false);
    }
    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <Header onHome={onHome} onListSlot={onListSlot} onAdmin={onAdmin} onDashboard={onDashboard} onSignIn={onSignIn} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#1d1d1f] animate-spin" />
            <p className="text-[#6e6e73] text-sm">{tx.checkout.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <Header onHome={onHome} onListSlot={onListSlot} onAdmin={onAdmin} onDashboard={onDashboard} onSignIn={onSignIn} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-orange-500" />
            </div>
            <h2 className="text-[#1d1d1f] font-semibold text-xl mb-2">{tx.checkout.notFound}</h2>
            <p className="text-[#6e6e73] text-sm mb-6">{error ?? tx.checkout.listingExpired}</p>
            <button
              onClick={onHome}
              className="bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] font-semibold px-5 py-2.5 rounded-2xl text-sm transition-all border border-black/[0.08] hover:border-black/[0.15]"
            >
              {tx.checkout.browseOpportunities}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header onHome={onHome} onListSlot={onListSlot} onAdmin={onAdmin} onDashboard={onDashboard} onSignIn={onSignIn} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          {tx.checkout.backToListing}
        </button>

        <div className="mb-6">
          <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest">{tx.checkout.secureSlot}</span>
          <h1 className="text-[#1d1d1f] font-bold text-2xl mt-1 leading-tight">{listing.property_name}</h1>
          <p className="text-[#6e6e73] text-sm mt-0.5">{listing.media_owner_name}</p>
        </div>

        <SecureSlotFlow
          listing={listing}
          onClose={onBack}
          onSuccess={onSuccess}
          inline
        />
      </div>
    </div>
  );
}
