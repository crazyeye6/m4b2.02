import { useEffect, useState } from 'react';
import {
  ArrowRight, Mail, Users, Clock, Lock, Zap,
  TrendingUp, BarChart3, MapPin, CheckCircle, Star,
  MousePointerClick, Eye,
} from 'lucide-react';

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

const DEMO_SLOTS = [
  {
    newsletter: 'SaaS Founder Weekly',
    initials: 'SF',
    gradient: 'from-teal-500 to-emerald-500',
    niche: 'SaaS / B2B',
    subscribers: '62.4k',
    openRate: '47%',
    sponsorType: 'Dedicated Sponsor',
    sendDate: 'Tue 12 May',
    deadline: '3 days',
    price: '$1,400',
    slotsLeft: 2,
    hot: true,
  },
  {
    newsletter: 'AI Frontier Daily',
    initials: 'AI',
    gradient: 'from-sky-500 to-blue-600',
    niche: 'Artificial Intelligence',
    subscribers: '118k',
    openRate: '52%',
    sponsorType: 'Primary Placement',
    sendDate: 'Mon 19 May',
    deadline: '9 days',
    price: '$2,800',
    slotsLeft: 1,
    hot: true,
  },
  {
    newsletter: 'Fintech Forward',
    initials: 'FF',
    gradient: 'from-amber-500 to-orange-500',
    niche: 'Fintech / Finance',
    subscribers: '34.1k',
    openRate: '41%',
    sponsorType: 'Classified Ad',
    sendDate: 'Thu 22 May',
    deadline: '12 days',
    price: '$590',
    slotsLeft: 3,
    hot: false,
  },
];

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
    const interval = setInterval(() => setActiveSlot(s => (s + 1) % DEMO_SLOTS.length), 3200);
    return () => clearInterval(interval);
  }, [bookingStep]);

  const triggerBookingDemo = () => {
    if (bookingStep !== 'idle') return;
    setBookingStep('locking');
    setTimeout(() => setBookingStep('done'), 1200);
    setTimeout(() => setBookingStep('idle'), 3000);
  };

  const slot = DEMO_SLOTS[activeSlot];

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

      <div className="relative max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-20">
        {/* Centered copy block */}
        <div
          className="text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
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

          <p className="text-[18px] sm:text-[20px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[620px] mx-auto">
            Browse verified sponsorship slots from top newsletter publishers. Pick your niche, audience, and budget — then reserve with a 5% deposit.
          </p>
          <p className="text-[14px] text-slate-400 font-medium mb-10 max-w-[480px] mx-auto">
            The balance goes direct to the publisher. No middlemen, no markup.
          </p>

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

          {/* Social proof row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pb-10 border-b border-slate-100">
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
          <div className="pt-7 mb-14">
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

        {/* Slot detail card — animated, full-width below copy */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s',
          }}
        >
          <div className="bg-white rounded-2xl border border-teal-200 shadow-[0_8px_40px_rgba(20,184,166,0.10)] overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${slot.gradient} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-[12px] font-bold">{slot.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-800 truncate">{slot.newsletter}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold border border-green-100 bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    <Mail className="w-2.5 h-2.5" />Newsletter
                  </span>
                  <span className="text-[10px] text-slate-400">{slot.niche}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>

            <div className="px-5 py-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Subscribers', value: slot.subscribers, icon: <Users className="w-3 h-3 text-slate-400" /> },
                  { label: 'Open rate', value: slot.openRate, icon: <Eye className="w-3 h-3 text-teal-500" />, accent: true },
                  { label: 'Send date', value: slot.sendDate, icon: <Clock className="w-3 h-3 text-slate-400" /> },
                  { label: 'Slots left', value: `${slot.slotsLeft} of 3`, icon: <BarChart3 className="w-3 h-3 text-orange-400" /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <p className={`text-[13px] font-bold leading-tight ${stat.accent ? 'text-teal-600' : 'text-slate-800'}`}>{stat.value}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Type + deadline */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-600">{slot.sponsorType}</span>
                </div>
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${slot.hot ? 'bg-red-50' : 'bg-orange-50'}`}>
                  <Clock className={`w-3 h-3 flex-shrink-0 ${slot.hot ? 'text-red-500' : 'text-orange-500'}`} />
                  <span className={`text-[11px] font-semibold ${slot.hot ? 'text-red-600' : 'text-orange-600'}`}>Book by {slot.deadline}</span>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-5 py-3.5">
                <div>
                  <p className="text-[24px] font-bold text-slate-900 tracking-tight leading-none">{slot.price}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp className="w-3 h-3 text-teal-600" />
                    <p className="text-[10px] text-teal-600 font-semibold">5% deposit to reserve</p>
                  </div>
                </div>
                <button
                  onClick={triggerBookingDemo}
                  className={`flex items-center gap-2 font-bold text-[14px] px-5 py-3 rounded-xl transition-all duration-300 ${
                    bookingStep === 'done'
                      ? 'bg-emerald-500 text-white scale-95'
                      : bookingStep === 'locking'
                      ? 'bg-teal-700 text-white scale-95 opacity-80'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md hover:-translate-y-px'
                  }`}
                >
                  {bookingStep === 'done' ? (
                    <><CheckCircle className="w-4 h-4" />Slot Reserved!</>
                  ) : bookingStep === 'locking' ? (
                    <><Lock className="w-4 h-4 animate-pulse" />Securing…</>
                  ) : (
                    <><Lock className="w-4 h-4" />Secure Slot<Zap className="w-4 h-4 fill-white" /></>
                  )}
                </button>
              </div>

              {/* Slot selector dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {DEMO_SLOTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveSlot(i); setBookingStep('idle'); }}
                    className={`rounded-full transition-all duration-200 ${
                      activeSlot === i ? 'w-5 h-2 bg-teal-500' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
