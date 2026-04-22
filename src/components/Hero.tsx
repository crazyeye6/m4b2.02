import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Eye, MousePointerClick, TrendingUp, BarChart3, Users, Star, MapPin, Clock, CalendarDays, Zap, Lock, Globe, Tag, Shield, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
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

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-14 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-8 sm:gap-12 xl:gap-16 items-start">

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
            className="flex flex-col gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            {/* Section label */}
            <div className="text-center mb-1 lg:mb-2">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2">The smarter way to buy newsletter ads</p>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[40px] font-extrabold text-slate-900 leading-[1.08] tracking-[-0.03em] mb-2">
                Discovery: <span className="text-teal-600">Organized.</span>
              </h2>
              <p className="text-[14px] sm:text-[15px] text-slate-500 max-w-[420px] mx-auto leading-relaxed">
                Every open ad slot, every deadline, every price — in one place. No cold emails. No spreadsheets.
              </p>
            </div>

            {/* ── Demo listing card ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">

              {/* Header: urgency bar + media type */}
              <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold border border-green-200 bg-green-50 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Mail className="w-2.5 h-2.5" />Newsletter
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Clock className="w-2.5 h-2.5" />3 days left
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">2 of 3 slots remaining</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                </div>
              </div>

              {/* Publisher identity */}
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[12px] font-bold">SF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900 leading-tight">Sponsored slot in SaaS Founder Weekly</p>
                  <p className="text-[11px] text-teal-600 font-medium">SaaS Founder Media &middot; Weekly B2B SaaS digest</p>
                </div>
              </div>

              {/* Audience stats grid */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                {[
                  { icon: <Users className="w-3 h-3 text-slate-400" />, label: 'Subscribers', value: '62,400' },
                  { icon: <Eye className="w-3 h-3 text-teal-500" />, label: 'Open rate', value: '47.2%', accent: true },
                  { icon: <MousePointerClick className="w-3 h-3 text-slate-400" />, label: 'CTR', value: '4.8%' },
                ].map(s => (
                  <div key={s.label} className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">{s.icon}<span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</span></div>
                    <p className={`text-[15px] font-bold leading-none ${s.accent ? 'text-teal-600' : 'text-slate-800'}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Placement details row */}
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium">Ad date</span>
                  <span className="text-[11px] font-semibold text-slate-700 ml-auto">Tue 12 May 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium">Book by</span>
                  <span className="text-[11px] font-semibold text-slate-700 ml-auto">Sat 9 May</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium">Geography</span>
                  <span className="text-[11px] font-semibold text-slate-700 ml-auto">US / Global</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium">Slot type</span>
                  <span className="text-[11px] font-semibold text-slate-700 ml-auto">Dedicated</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Globe className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium">Audience</span>
                  <span className="text-[11px] font-semibold text-slate-700 ml-2 truncate">Founders, VCs, B2B SaaS operators</span>
                </div>
              </div>

              {/* Ad formats */}
              <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">Formats</span>
                {['Logo + copy', 'CTA link', 'Image optional'].map(f => (
                  <span key={f} className="text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>

              {/* Past advertisers */}
              <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">Used by</span>
                {['Notion', 'Linear', 'Loom', '+4 more'].map(b => (
                  <span key={b} className="text-[10px] font-semibold text-slate-500">{b}</span>
                ))}
              </div>

              {/* Pricing + discount */}
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">$1,800</span>
                      <span className="text-[13px] text-slate-400 line-through">$2,000</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        <TrendingUp className="w-2.5 h-2.5" />10% off
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Early bird discount &middot; increases as deadline nears</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[13px] font-bold text-emerald-600">$90 deposit</div>
                    <div className="text-[10px] text-slate-400">5% now &middot; balance direct</div>
                  </div>
                </div>
                {/* Discount tier ladder */}
                <div className="grid grid-cols-4 gap-1 mt-2.5">
                  {[
                    { label: '5+ days', price: '$2,000', active: false },
                    { label: '3–5 days', price: '−10%', active: true },
                    { label: '1–3 days', price: '−20%', active: false },
                    { label: '<24 hrs', price: '−30%', active: false },
                  ].map(t => (
                    <div key={t.label} className={`rounded-lg px-1.5 py-1.5 text-center border ${t.active ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                      <p className={`text-[8px] font-medium leading-none mb-0.5 ${t.active ? 'text-amber-600' : 'text-slate-400'}`}>{t.label}</p>
                      <p className={`text-[10px] font-bold leading-none ${t.active ? 'text-amber-700' : 'text-slate-500'}`}>{t.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 sm:px-5 py-3 flex items-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-[12px] transition-colors">
                  <Lock className="w-3 h-3" /><Zap className="w-3 h-3 text-amber-400" />Secure Slot — $90 deposit
                </button>
                <button className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-between px-1 flex-wrap gap-y-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {['bg-gradient-to-br from-teal-400 to-emerald-500','bg-gradient-to-br from-sky-400 to-blue-500','bg-gradient-to-br from-amber-400 to-orange-500','bg-gradient-to-br from-slate-500 to-slate-700'].map((bg, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${bg} border-2 border-white flex items-center justify-center`}>
                      <span className="text-white text-[7px] font-bold">{['M','J','K','S'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  <span className="text-slate-600 font-semibold">2,400+</span> sponsors booked
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] text-slate-400 font-medium">
                  <span className="text-emerald-600 font-semibold">{liveCount > 0 ? liveCount : '200+'}</span> slots live
                </span>
                <Users className="w-3 h-3 text-slate-300 ml-1.5" />
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
