import { ArrowRight, Mail } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-[#1d1d1f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(34,197,94,0.08)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(20,184,166,0.06)_0%,_transparent_50%)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] text-white/70 text-[12px] font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Newsletter sponsorship slots available now
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-[-0.03em] mb-6">
            Newsletter ad slots ending this week
            <br />
            <span className="italic text-white/60">— before they're gone</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/55 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Last-minute sponsorship opportunities in curated newsletters — limited availability, ready to book.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onBrowse}
              className="group inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-full text-[15px] transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              Browse Newsletter Slots
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onListSlot}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-8 py-3.5 rounded-full text-[15px] border border-white/[0.15] hover:border-white/[0.30] bg-white/[0.05] hover:bg-white/[0.10] transition-all duration-200"
            >
              <Mail className="w-4 h-4" />
              List Your Newsletter Slot
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
