import { ArrowRight, TrendingDown } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-[#f5f5f7]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(0,0,0,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-black/[0.08] text-[#6e6e73] text-[12px] font-medium px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live opportunities available now
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-[#1d1d1f] leading-[1.05] tracking-[-0.03em] mb-6">
            Discounted media slots{' '}
            <span className="text-[#6e6e73]">ending this week</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#6e6e73] max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Last-minute newsletter, podcast, and influencer slots — priced to move, secured in 10 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onBrowse}
              className="group inline-flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-8 py-3.5 rounded-full text-[15px] transition-all duration-200 shadow-sm"
            >
              Browse Opportunities
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onListSlot}
              className="inline-flex items-center gap-2 text-[#1d1d1f] hover:text-[#6e6e73] font-medium px-8 py-3.5 rounded-full text-[15px] border border-[#d2d2d7] hover:border-[#86868b] bg-white hover:bg-[#f5f5f7] transition-all duration-200"
            >
              <TrendingDown className="w-4 h-4" />
              List a Slot
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
