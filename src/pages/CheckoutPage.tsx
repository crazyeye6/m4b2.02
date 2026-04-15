import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
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

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .maybeSingle();

      if (error || !data) {
        setError('This opportunity could not be found.');
      } else {
        setListing(data as Listing);
      }
      setLoading(false);
    }
    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header onHome={onHome} onListSlot={onListSlot} onAdmin={onAdmin} onDashboard={onDashboard} onSignIn={onSignIn} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <p className="text-[#8b949e] text-sm">Loading opportunity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header onHome={onHome} onListSlot={onListSlot} onAdmin={onAdmin} onDashboard={onDashboard} onSignIn={onSignIn} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-[#e6edf3] font-bold text-xl mb-2">Opportunity not found</h2>
            <p className="text-[#8b949e] text-sm mb-6">{error ?? 'This listing may have expired or been removed.'}</p>
            <button
              onClick={onHome}
              className="bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-semibold px-5 py-2.5 rounded-lg text-sm transition-all border border-[#30363d]"
            >
              Browse opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Header onHome={onHome} onListSlot={onListSlot} onAdmin={onAdmin} onDashboard={onDashboard} onSignIn={onSignIn} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] text-sm mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to listing
        </button>

        <div className="mb-6">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Secure Slot</span>
          <h1 className="text-[#e6edf3] font-bold text-2xl mt-1 leading-tight">{listing.property_name}</h1>
          <p className="text-[#8b949e] text-sm mt-0.5">{listing.media_owner_name}</p>
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
