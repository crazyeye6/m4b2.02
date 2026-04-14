import { ArrowRight, TrendingDown } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  return (
    <section className="relative pt-28 pb-14 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05)_0%,_transparent_65%)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live opportunities available now
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-[#e6edf3] leading-[1.1] tracking-tight mb-4">
            Discounted media slots{' '}
            <span className="text-emerald-400">ending this week</span>
          </h1>

          <p className="text-base text-[#8b949e] max-w-xl mx-auto mb-8 leading-relaxed">
            Last-minute newsletter, podcast, and influencer slots — priced to move, secured in 10 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onBrowse}
              className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3 rounded-lg text-sm border border-emerald-500/30 transition-all shadow-md shadow-emerald-900/20"
            >
              Browse Opportunities
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onListSlot}
              className="flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] font-medium px-6 py-3 rounded-lg text-sm border border-[#30363d] hover:border-[#484f58] hover:bg-[#21262d] transition-all"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              List a Slot
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
