import { useEffect, useState } from 'react';
import { ArrowRight, Mail, MousePointerClick, BarChart3 } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
  liveCount?: number;
}

const TRUST_LOGOS = [
  'SaaS Weekly', 'AI Frontier', 'Founder HQ', 'Marketing Brew', 'Dev Current', 'Fintech Forward',
];

const PROOF_AVATARS = [
  'bg-gradient-to-br from-teal-400 to-emerald-500',
  'bg-gradient-to-br from-sky-400 to-blue-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-slate-500 to-slate-700',
];

export default function Hero({ onBrowse, onListSlot, liveCount = 0 }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15,23,42,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.028) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 140% 120% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 140% 120% at 50% 0%, black 20%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, rgba(236,253,245,0.35) 0%, rgba(255,255,255,0) 40%, rgba(240,249,255,0.12) 100%)',
        }}
      />

      <div className="relative max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-20 text-center">
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
            Newsletter sponsorship marketplace
            {liveCount > 0 && (
              <>
                <span className="w-px h-3 bg-slate-300" />
                <span className="text-emerald-600">{liveCount} live</span>
              </>
            )}
          </div>

          {/* Headline */}
          <h1
            className="font-bold text-slate-900 tracking-[-0.045em] leading-[1.0] mb-6"
            style={{ fontSize: 'clamp(38px, 5.5vw, 68px)' }}
          >
            Book newsletter{' '}
            <br className="hidden sm:block" />
            ad slots{' '}
            <span className="relative inline-block" style={{ color: '#0f766e' }}>
              directly.
              <span
                className="absolute left-0 right-0 h-[3px] rounded-full"
                style={{ bottom: '-2px', background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
              />
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="text-[18px] sm:text-[20px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[620px] mx-auto">
            Browse verified sponsorship slots from top newsletter publishers. Pick your niche, audience, and budget — then reserve with a 5% deposit.
          </p>
          <p className="text-[14px] text-slate-400 font-medium mb-10 max-w-[480px] mx-auto">
            The balance goes direct to the publisher. No middlemen, no markup.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button
              onClick={onBrowse}
              className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl text-[16px] transition-all duration-200 shadow-[0_8px_28px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.24)] hover:-translate-y-px"
            >
              Browse {liveCount > 0 ? `${liveCount} Live Slots` : 'Opportunities'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
            <button
              onClick={onListSlot}
              className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-8 py-4 rounded-xl text-[16px] border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] hover:-translate-y-px"
            >
              <Mail className="w-4 h-4" />
              List a Slot Free
            </button>
          </div>

          {/* Social proof + trust */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-slate-100">
            {/* Avatars + count */}
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1.5">
                {PROOF_AVATARS.map((bg, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
                    <span className="text-white text-[8px] font-bold">{['M', 'J', 'K', 'S'][i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-slate-400 font-medium">
                <span className="text-slate-600 font-semibold">2,400+</span> sponsors have booked
              </p>
            </div>

            <span className="hidden sm:block w-px h-4 bg-slate-200" />

            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[12px] text-slate-400 font-medium">
                Avg <span className="text-slate-600 font-semibold">4.8% CTR</span>
              </span>
            </div>

            <span className="hidden sm:block w-px h-4 bg-slate-200" />

            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[12px] text-slate-400 font-medium">
                <span className="text-emerald-600 font-semibold">340+</span> publishers
              </span>
            </div>
          </div>

          {/* Publisher logos */}
          <div className="mt-8">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-4">
              Featured publishers
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
              {TRUST_LOGOS.map(name => (
                <span key={name} className="text-[13px] font-semibold text-slate-300 hover:text-slate-500 transition-colors duration-200 cursor-default">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
