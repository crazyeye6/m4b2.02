import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Clock, TrendingDown, Zap, Mail } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

interface MockListing {
  id: number;
  name: string;
  niche: string;
  subscribers: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  hoursLeft: number;
  minutesLeft: number;
  hot: boolean;
}

const MOCK_LISTINGS: MockListing[] = [
  {
    id: 1,
    name: 'FinanceWeekly',
    niche: 'Personal Finance',
    subscribers: '84K',
    originalPrice: 1800,
    discountedPrice: 890,
    discount: 51,
    hoursLeft: 5,
    minutesLeft: 22,
    hot: true,
  },
  {
    id: 2,
    name: 'SaaS Insider',
    niche: 'B2B / SaaS',
    subscribers: '62K',
    originalPrice: 2200,
    discountedPrice: 1100,
    discount: 50,
    hoursLeft: 11,
    minutesLeft: 47,
    hot: false,
  },
  {
    id: 3,
    name: 'Dev Digest',
    niche: 'Software Dev',
    subscribers: '120K',
    originalPrice: 3000,
    discountedPrice: 1350,
    discount: 55,
    hoursLeft: 0,
    minutesLeft: 43,
    hot: true,
  },
];

function useCountdown(hoursLeft: number, minutesLeft: number) {
  const totalMs = useRef((hoursLeft * 3600 + minutesLeft * 60) * 1000);
  const [ms, setMs] = useState(totalMs.current);

  useEffect(() => {
    const id = setInterval(() => {
      setMs((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function MockCard({ listing, delay }: { listing: MockListing; delay: number }) {
  const countdown = useCountdown(listing.hoursLeft, listing.minutesLeft);
  const isUrgent = listing.hoursLeft === 0;

  return (
    <div
      className="hero-card bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-4 w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-600 flex-shrink-0">
            {listing.name[0]}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900 leading-tight">{listing.name}</p>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{listing.niche} · {listing.subscribers} subs</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {listing.hot && (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5" /> HOT
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <TrendingDown className="w-2.5 h-2.5" /> -{listing.discount}%
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-slate-400 line-through">${listing.originalPrice.toLocaleString()}</p>
          <p className="text-[18px] font-bold text-slate-900 leading-none">${listing.discountedPrice.toLocaleString()}</p>
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full border ${isUrgent ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
          <Clock className="w-3 h-3" />
          {countdown}
        </div>
      </div>
    </div>
  );
}

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white" style={{ minHeight: '100vh' }}>
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, rgba(248,250,252,0.9) 0%, rgba(255,255,255,1) 60%),
            linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      {/* Gradient blob top-left */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      {/* Gradient blob top-right */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-36 lg:pb-24">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

          {/* LEFT: Text + CTAs */}
          <div
            className="text-left max-w-[620px]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.55s ease, transform 0.55s ease',
            }}
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-[12px] font-medium px-4 py-1.5 rounded-full mb-7">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              Live deals — updated weekly
            </div>

            {/* Headline */}
            <h1 className="text-[52px] sm:text-[64px] lg:text-[72px] font-bold text-slate-900 leading-[1.0] tracking-[-0.04em] mb-5">
              Newsletter ad slots.{' '}
              <span className="text-slate-400 font-semibold italic">Ending This Week.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-[18px] sm:text-[20px] text-slate-500 font-normal leading-relaxed mb-2 tracking-[-0.01em]">
              Last-minute ad opportunities — curated and ready to go.
            </p>

            {/* Support line */}
            <p className="text-[14px] text-slate-400 font-medium mb-10 tracking-wide uppercase">
              Book before they&apos;re gone.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBrowse}
                className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold px-8 py-4 rounded-xl text-[15px] transition-all duration-200 shadow-[0_8px_24px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.24)] hover:-translate-y-px"
              >
                View Deals
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
              <button
                onClick={onListSlot}
                className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-8 py-4 rounded-xl text-[15px] border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.10)] hover:-translate-y-px"
              >
                <Mail className="w-4 h-4" />
                List Your Slot
              </button>
            </div>

            {/* Trust line */}
            <p className="mt-7 text-[12px] text-slate-400 font-medium">
              No subscription required · Pay per slot · Instant confirmation
            </p>
          </div>

          {/* RIGHT: Mock listing cards */}
          <div
            className="hidden lg:flex flex-col gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s',
            }}
          >
            {MOCK_LISTINGS.map((listing, i) => (
              <MockCard key={listing.id} listing={listing} delay={i * 80} />
            ))}

            {/* Bottom label */}
            <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
              Sample listings — real deals updated weekly
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .hero-card {
          animation: cardSlideIn 0.5s ease both;
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
