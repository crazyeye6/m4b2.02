import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Eye, MousePointerClick, TrendingUp, BarChart3, Users, Star } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
  liveCount?: number;
}

const TRUST_LOGOS = [
  'SaaS Weekly', 'AI Frontier', 'Founder HQ', 'Marketing Brew', 'Dev Current', 'Fintech Forward',
];

export default function Hero({ onBrowse, onListSlot, liveCount = 0 }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const [statStep, setStatStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setStatStep(s => (s + 1) % 3), 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white">
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
        <div className="grid lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-12 xl:gap-16 items-start">

          {/* LEFT -- Copy */}
          <div
            className="lg:sticky lg:top-28"
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

          {/* RIGHT -- Newsletter preview with sponsored ad */}
          <div
            className="hidden lg:flex flex-col gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            {/* Simulated newsletter email */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
              {/* Email chrome bar */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-medium bg-white border border-slate-200 rounded-md px-3 py-0.5">
                    mail.google.com/inbox
                  </span>
                </div>
              </div>

              {/* Email header */}
              <div className="px-5 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[11px] font-bold">SF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-slate-800">SaaS Founder Weekly</p>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">62,400 subscribers</span>
                    </div>
                    <p className="text-[10px] text-slate-400">to me &middot; Tuesday 9:04 AM</p>
                  </div>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                </div>
                <p className="text-[13px] font-semibold text-slate-700">#247 &mdash; How to scale your GTM motion in 2026</p>
              </div>

              {/* Newsletter body content */}
              <div className="px-5 py-4 space-y-3">
                {/* Fake text lines */}
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-slate-100 rounded-full w-full" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-[92%]" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-[78%]" />
                </div>

                {/* Sponsored ad placement -- the hero moment */}
                <div
                  className="relative rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 p-4 my-2"
                  style={{ animation: 'adGlow 3s ease-in-out infinite' }}
                >
                  <div className="absolute -top-2.5 left-4">
                    <span className="text-[9px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full uppercase tracking-widest border border-teal-200">
                      Your Ad Here
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[18px] font-bold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-800 mb-0.5">Acme Analytics — Know your customers better</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Join 4,000+ SaaS teams using Acme to understand user behavior and reduce churn by 35%. Start free today.</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-slate-800 text-white text-[9px] font-bold px-2.5 py-1 rounded-md">
                        Try Acme Free <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* More fake text */}
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-slate-100 rounded-full w-[88%]" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-full" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            {/* Performance metrics strip */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: <Eye className="w-3.5 h-3.5 text-teal-600" />, label: 'Open rate', value: '47.2%', bg: 'bg-teal-50', border: 'border-teal-100' },
                { icon: <MousePointerClick className="w-3.5 h-3.5 text-sky-600" />, label: 'Click rate', value: '4.8%', bg: 'bg-sky-50', border: 'border-sky-100' },
                { icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />, label: 'Est. ROI', value: '6.2x', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              ].map((m, i) => (
                <div
                  key={m.label}
                  className={`rounded-xl border ${m.border} ${m.bg} p-3 transition-all duration-500 ${
                    statStep === i ? 'scale-[1.03] shadow-md' : 'shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {m.icon}
                    <span className="text-[10px] text-slate-500 font-medium">{m.label}</span>
                  </div>
                  <p className="text-[20px] font-bold text-slate-800 tracking-tight leading-none">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Social proof bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[
                    'bg-gradient-to-br from-teal-400 to-emerald-500',
                    'bg-gradient-to-br from-sky-400 to-blue-500',
                    'bg-gradient-to-br from-amber-400 to-orange-500',
                    'bg-gradient-to-br from-slate-500 to-slate-700',
                  ].map((bg, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
                      <span className="text-white text-[7px] font-bold">{['M','J','K','S'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  <span className="text-slate-600 font-semibold">2,400+</span> sponsors have booked slots
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] text-slate-400 font-medium">
                  <span className="text-emerald-600 font-semibold">{liveCount > 0 ? liveCount : '200+'}</span> slots live now
                </span>
                <Users className="w-3 h-3 text-slate-300 ml-2" />
                <span className="text-[10px] text-slate-400 font-medium">
                  <span className="text-slate-600 font-semibold">340+</span> publishers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes adGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(20,184,166,0); }
          50% { box-shadow: 0 0 20px 4px rgba(20,184,166,0.1); }
        }
      `}</style>
    </section>
  );
}
