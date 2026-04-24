import { ArrowLeft, Search } from 'lucide-react';

interface NotFoundPageProps {
  onHome: () => void;
  onBrowse?: () => void;
}

export default function NotFoundPage({ onHome, onBrowse }: NotFoundPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-[#f5f5f7] rounded-3xl flex items-center justify-center">
            <span className="text-4xl font-bold text-[#d2d2d7] tracking-tight select-none">?</span>
          </div>
        </div>

        <p className="text-[#aeaeb2] font-semibold text-[13px] uppercase tracking-widest mb-3">404</p>
        <h1 className="text-[#1d1d1f] font-semibold text-3xl mb-3 tracking-[-0.02em]">Page not found</h1>
        <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-10">
          This slot has either expired, been secured, or never existed. Open slots close fast — check the live feed for what's still available.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 bg-white border border-black/[0.08] hover:border-black/[0.15] text-[#1d1d1f] font-semibold px-6 py-3 rounded-2xl text-[14px] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </button>
          {onBrowse && (
            <button
              onClick={onBrowse}
              className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-6 py-3 rounded-2xl text-[14px] transition-all"
            >
              <Search className="w-4 h-4" />
              Browse live slots
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
