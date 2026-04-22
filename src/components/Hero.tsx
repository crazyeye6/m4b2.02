import { useEffect, useState } from 'react';
import {
  ArrowRight, Newspaper, Mic2, Users, Clock, Lock, Zap,
  CheckCircle, Star, Eye, BarChart3, TrendingUp,
} from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
  liveCount?: number;
}

const DEMO_OPPORTUNITIES = [
  {
    type: 'Newsletter',
    typeBadge: 'bg-blue-50 border-blue-200 text-blue-700',
    name: 'SaaS Founder Weekly',
    initials: 'SF',
    gradient: 'from-teal-500 to-emerald-500',
    niche: 'SaaS / B2B',
    meta: '62.4k subscribers · 47% open rate',
    slot: 'Dedicated Sponsor',
    deadline: '3 days',
    price: '$1,400',
    hot: true,
    icon: <Newspaper className="w-2.5 h-2.5" />,
  },
  {
    type: 'Podcast',
    typeBadge: 'bg-orange-50 border-orange-200 text-orange-700',
    name: 'Founders Unfiltered',
    initials: 'FU',
    gradient: 'from-orange-500 to-rose-500',
    niche: 'Entrepreneurship',
    meta: '85k downloads · Mid-roll slot',
    slot: 'Mid-Roll Sponsorship',
    deadline: '5 days',
    price: '$2,200',
    hot: true,
    icon: <Mic2 className="w-2.5 h-2.5" />,
  },
  {
    type: 'Influencer',
    typeBadge: 'bg-rose-50 border-rose-200 text-rose-700',
    name: 'Tech With Maya',
    initials: 'TM',
    gradient: 'from-sky-500 to-blue-600',
    niche: 'Tech / Consumer',
    meta: '340k followers · 4.2% engagement',
    slot: 'Instagram Reel',
    deadline: '7 days',
    price: '$3,800',
    hot: false,
    icon: <Users className="w-2.5 h-2.5" />,
  },
];

const TRUST_VALUE = [
  { label: 'Real creator inventory', dot: 'bg-emerald-400' },
  { label: 'Limited availability', dot: 'bg-orange-400' },
  { label: 'New opportunities every week', dot: 'bg-blue-400' },
  { label: 'Fast booking', dot: 'bg-teal-400' },
];

const CREATOR_NAMES = ['Newsletter Hub', 'Podcast Weekly', 'Founder Report', 'Tech Dispatch', 'Growth Daily', 'The Briefing'];

export default function Hero({ onBrowse, onListSlot, liveCount = 0 }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [bookingStep, setBookingStep] = useState<'idle' | 'locking' | 'done'>('idle');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (bookingStep !== 'idle') return;
    const interval = setInterval(() => setActiveSlot(s => (s + 1) % DEMO_OPPORTUNITIES.length), 3400);
    return () => clearInterval(interval);
  }, [bookingStep]);

  const triggerBookingDemo = () => {
    if (bookingStep !== 'idle') return;
    setBookingStep('locking');
    setTimeout(() => setBookingStep('done'), 1200);
    setTimeout(() => setBookingStep('idle'), 3000);
  };

  const opp = DEMO_OPPORTUNITIES[activeSlot];

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
          background: 'linear-gradient(160deg, rgba(236,253,245,0.35) 0%, rgba(255,255,255,0) 40%, rgba(255,247,237,0.12) 100%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-[440px_1fr] xl:grid-cols-[480px_1fr] gap-12 xl:gap-16 items-start">

          {/* LEFT — Copy */}
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
              Creator media marketplace
            </div>

            <h1
              className="font-bold text-slate-900 tracking-[-0.045em] leading-[1.0] mb-5"
              style={{ fontSize: 'clamp(30px, 3.8vw, 52px)' }}
            >
              Find and book{' '}
              <span className="relative inline-block" style={{ color: '#1F7A63' }}>
                last-minute
                <span
                  className="absolute left-0 right-0 h-[3px] rounded-full"
                  style={{ bottom: '-2px', background: 'linear-gradient(90deg, #1F7A63, #2daa8a)' }}
                />
              </span>
              {' '}media opportunities
              <br className="hidden sm:block" />
              across creators.
            </h1>

            <p className="text-[17px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[460px]">
              Browse time-sensitive opportunities from newsletters, podcasts, influencers, sponsorships, and more — all in one place.
            </p>
            <p className="text-[14px] text-slate-400 font-medium mb-9 max-w-[420px]">
              Secure creator inventory fast. Limited slots. New opportunities every week.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={onBrowse}
                className="group inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 shadow-[0_8px_28px_rgba(31,122,99,0.22)] hover:shadow-[0_12px_36px_rgba(31,122,99,0.32)] hover:-translate-y-px text-white"
                style={{ background: '#1F7A63' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#186453')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1F7A63')}
              >
                Browse Opportunities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
              <button
                onClick={onListSlot}
                className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-7 py-3.5 rounded-xl text-[15px] border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] hover:-translate-y-px"
              >
                List Your Opportunity
              </button>
            </div>

            {/* Trust / value bar */}
            <div className="border-t border-slate-100 pt-6 mb-7">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_VALUE.map(({ label, dot }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="text-[12px] text-slate-500 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator names */}
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-3">
                Featured creators
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {CREATOR_NAMES.map(name => (
                  <span key={name} className="text-[13px] font-semibold text-slate-300 hover:text-slate-500 transition-colors duration-200 cursor-default">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Platform UI preview */}
          <div
            className="hidden lg:flex flex-col gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            {/* Browser chrome */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-medium bg-white border border-slate-200 rounded-md px-3 py-0.5">
                    endingthisweek.media / opportunities
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#1F7A63' }} />
                  <span className="text-[10px] font-semibold" style={{ color: '#1F7A63' }}>{liveCount > 0 ? liveCount : '200+'} live</span>
                </div>
              </div>

              {/* Category filter tabs */}
              <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] text-white font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: '#1F7A63' }}>All</span>
                <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 font-medium px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
                  <Newspaper className="w-2.5 h-2.5" /> Newsletters
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 font-medium px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
                  <Mic2 className="w-2.5 h-2.5" /> Podcasts
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 font-medium px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" /> Influencers
                </span>
              </div>

              {/* Opportunity list */}
              <div className="divide-y divide-slate-100">
                {DEMO_OPPORTUNITIES.map((o, i) => (
                  <div
                    key={o.name}
                    onClick={() => { setActiveSlot(i); setBookingStep('idle'); }}
                    className={`px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                      activeSlot === i ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${o.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-[11px] font-bold">{o.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{o.name}</p>
                        {o.hot && <span className="text-[8px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">Hot</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-semibold border px-1.5 py-0.5 rounded-full ${o.typeBadge}`}>
                          {o.icon}{o.type}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">{o.niche}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] font-bold text-slate-900">{o.price}</p>
                      <div className={`flex items-center gap-1 justify-end text-[9px] font-semibold ${o.hot ? 'text-orange-500' : 'text-slate-400'}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {o.deadline} left
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail panel */}
            <div className="bg-white rounded-2xl border border-teal-200 shadow-[0_4px_20px_rgba(31,122,99,0.08)] overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opp.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-[12px] font-bold">{opp.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-800 truncate">{opp.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold border px-1.5 py-0.5 rounded-full uppercase tracking-wide ${opp.typeBadge}`}>
                      {opp.icon}{opp.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{opp.niche}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="px-5 py-3">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Format', value: opp.slot, icon: <Eye className="w-3 h-3 text-slate-400" /> },
                    { label: 'Audience', value: opp.meta.split(' · ')[0], icon: <Users className="w-3 h-3 text-slate-400" /> },
                    { label: 'Deadline', value: opp.deadline, icon: <Clock className="w-3 h-3 text-orange-400" /> },
                    { label: 'Inventory', value: '2 of 3', icon: <BarChart3 className="w-3 h-3 text-orange-400" /> },
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <div className="flex justify-center mb-1">{stat.icon}</div>
                      <p className="text-[11px] font-bold leading-tight text-slate-800 truncate">{stat.value}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wide font-medium mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[22px] font-bold text-slate-900 tracking-tight leading-none">{opp.price}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp className="w-3 h-3 text-teal-600" />
                      <p className="text-[10px] font-semibold" style={{ color: '#1F7A63' }}>5% deposit to reserve</p>
                    </div>
                  </div>

                  <button
                    onClick={triggerBookingDemo}
                    className={`flex items-center gap-2 font-bold text-[13px] px-4 py-2.5 rounded-xl transition-all duration-300 text-white ${
                      bookingStep === 'done'
                        ? 'bg-emerald-500 scale-95'
                        : bookingStep === 'locking'
                        ? 'scale-95 opacity-80'
                        : 'shadow-sm hover:shadow-md hover:-translate-y-px'
                    }`}
                    style={{
                      backgroundColor: bookingStep === 'done' ? undefined : bookingStep === 'locking' ? '#145247' : '#1F7A63',
                    }}
                  >
                    {bookingStep === 'done' ? (
                      <><CheckCircle className="w-3.5 h-3.5" />Reserved!</>
                    ) : bookingStep === 'locking' ? (
                      <><Lock className="w-3.5 h-3.5 animate-pulse" />Securing…</>
                    ) : (
                      <><Lock className="w-3.5 h-3.5" />Secure Slot<Zap className="w-3.5 h-3.5 fill-white" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
