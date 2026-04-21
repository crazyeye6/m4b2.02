import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Zap, Clock, Users, TrendingDown, Shield, Sparkles } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
  liveCount?: number;
}

const FEATURED_SLOTS = [
  { name: 'AI Frontier', subs: '88k', niche: 'AI & ML', deadline: '12d', format: 'Sponsored post', price: '$4,200', tier: 'premium' as const },
  { name: 'SaaS Weekly', subs: '52k', niche: 'B2B SaaS', deadline: '8d', format: 'Sponsored post', price: '$2,400', tier: 'standard' as const },
  { name: 'Founder HQ', subs: '38k', niche: 'Startups', deadline: '10d', format: 'Dedicated send', price: '$3,800', tier: 'premium' as const },
  { name: 'Dev Current', subs: '44k', niche: 'Engineering', deadline: '8d', format: 'Sponsored post', price: '$2,100', tier: 'standard' as const },
];

const TRUST_LOGOS = [
  'SaaS Weekly', 'AI Frontier', 'Founder HQ', 'Marketing Brew', 'Dev Current', 'Fintech Forward',
];

export default function Hero({ onBrowse, onListSlot, liveCount = 0 }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveSlot(s => (s + 1) % FEATURED_SLOTS.length), 3200);
    return () => clearInterval(interval);
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

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[480px_1fr] gap-12 xl:gap-16 items-center">

          {/* LEFT — Copy */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-7 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              Newsletter sponsorship marketplace
            </div>

            <h1
              className="font-bold text-slate-900 tracking-[-0.045em] leading-[1.0] mb-5"
              style={{ fontSize: 'clamp(34px, 4.2vw, 56px)' }}
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

            <p className="text-[17px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[440px]">
              Browse verified sponsorship slots from top newsletter publishers. Pick your niche, audience, and budget — then reserve with a 5% deposit.
            </p>
            <p className="text-[14px] text-slate-400 font-medium mb-9 max-w-[400px]">
              The balance goes direct to the publisher. No middlemen, no markup.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={onBrowse}
                className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 shadow-[0_8px_28px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.24)] hover:-translate-y-px"
              >
                Browse {liveCount > 0 ? `${liveCount} Live Slots` : 'Opportunities'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
              <button
                onClick={onListSlot}
                className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-7 py-3.5 rounded-xl text-[15px] border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] hover:-translate-y-px"
              >
                <Mail className="w-4 h-4" />
                List a Slot Free
              </button>
            </div>

            {/* Trust row */}
            <div className="border-t border-slate-100 pt-7">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-4">
                Featured publishers
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_LOGOS.map(name => (
                  <span key={name} className="text-[13px] font-semibold text-slate-300 hover:text-slate-500 transition-colors duration-200 cursor-default">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Visual showcase */}
          <div
            className="hidden lg:block"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
              {/* Header bar */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-bold text-slate-700 tracking-widest uppercase">Live Sponsorship Slots</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {liveCount > 0 ? `${liveCount} live` : 'Live feed'}
                </span>
              </div>

              {/* Slot cards */}
              <div className="p-4 space-y-2.5">
                {FEATURED_SLOTS.map((slot, i) => (
                  <div
                    key={slot.name}
                    className={`rounded-xl border px-4 py-3.5 flex items-center gap-4 transition-all duration-500 ${
                      activeSlot === i
                        ? 'bg-teal-50/60 border-teal-200 shadow-[0_2px_12px_rgba(15,118,110,0.08)]'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                    style={{ animation: 'slotFade 0.5s ease both', animationDelay: `${350 + i * 100}ms` }}
                  >
                    {/* Avatar circle */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      slot.tier === 'premium'
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-500'
                        : 'bg-gradient-to-br from-slate-600 to-slate-800'
                    }`}>
                      <span className="text-white text-[13px] font-bold">{slot.name.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{slot.name}</p>
                        {slot.tier === 'premium' && (
                          <Sparkles className="w-3 h-3 text-teal-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Users className="w-2.5 h-2.5" />
                          {slot.subs}
                        </span>
                        <span className="text-[10px] text-slate-300">|</span>
                        <span className="text-[10px] text-slate-400 font-medium">{slot.format}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] font-bold text-slate-800">{slot.price}</p>
                      <div className="flex items-center gap-1 mt-0.5 justify-end text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        <p className="text-[10px] font-semibold">{slot.deadline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom stats strip */}
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />, val: 'Auto-discounting', sub: 'Prices drop near deadline' },
                    { icon: <Shield className="w-3.5 h-3.5 text-sky-500" />, val: '5% deposit only', sub: 'Balance direct to publisher' },
                    { icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />, val: 'Smart matching', sub: 'Find your niche fit' },
                  ].map(s => (
                    <div key={s.val} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-700 leading-tight">{s.val}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
              Verified publishers &middot; Real send dates &middot; Direct booking
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slotFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
