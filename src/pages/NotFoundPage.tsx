import { ArrowLeft, Search, Zap } from 'lucide-react';

interface NotFoundPageProps {
  onHome: () => void;
  onBrowse?: () => void;
}

export default function NotFoundPage({ onHome, onBrowse }: NotFoundPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-[#161b22] border border-[#30363d] rounded-2xl flex items-center justify-center">
              <Zap className="w-9 h-9 text-[#30363d]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#0d1117] border border-[#30363d] rounded-full flex items-center justify-center">
              <span className="text-[#6e7681] text-xs font-bold">?</span>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <span className="text-[#30363d] font-mono text-6xl font-black tracking-tight">404</span>
        </div>

        <h1 className="text-[#e6edf3] font-bold text-2xl mb-3">Page not found</h1>
        <p className="text-[#8b949e] text-sm leading-relaxed mb-8">
          This slot has either expired, been secured, or never existed. The opportunity you're looking for is no longer available.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </button>
          {onBrowse && (
            <button
              onClick={onBrowse}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
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
