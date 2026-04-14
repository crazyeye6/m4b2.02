import { ArrowRight, TrendingDown } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(31,111,235,0.07)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff] text-xs font-medium px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
            Live opportunities available now
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#e6edf3] leading-[1.1] tracking-tight mb-5">
            Find discounted media slots{' '}
            <span className="text-[#3fb950]">ending this week</span>
          </h1>

          <p className="text-lg text-[#8b949e] max-w-2xl mx-auto mb-9 leading-relaxed">
            Newsletters, podcasts, and influencer opportunities with real audience data and urgent availability.{' '}
            <span className="text-[#c9d1d9]">Last-minute media slots. Priced to move.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onBrowse}
              className="group flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium px-6 py-2.5 rounded-md text-sm border border-[#2ea043]/40 transition-all"
            >
              Browse Opportunities
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onListSlot}
              className="flex items-center gap-2 text-[#c9d1d9] font-medium px-6 py-2.5 rounded-md text-sm border border-[#30363d] hover:border-[#484f58] hover:bg-[#21262d] transition-all"
            >
              <TrendingDown className="w-3.5 h-3.5 text-[#3fb950]" />
              List a Slot
            </button>
          </div>

          <p className="text-[#484f58] text-xs mt-5">
            Secure expiring opportunities before they disappear.
          </p>
        </div>
      </div>
    </section>
  );
}
