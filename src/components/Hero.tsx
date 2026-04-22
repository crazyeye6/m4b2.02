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

  // Auto-cycle through slots
  useEffect(() => {
    if (bookingStep !== 'idle') return;
    const interval = setInterval(() => setActiveSlot(s => (s + 1) % DEMO_SLOTS.length), 3200);
    return () => clearInterval(interval);
  }, [bookingStep]);

  // Demo booking animation
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

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-12 xl:gap-16 items-start">

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

            {/* Trust signals */}
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

          {/* RIGHT — Before/After visual */}
          <div
            className="hidden lg:flex flex-col gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            {/* BEFORE — Cluttered inbox */}
            <div className="relative">
              <div className="absolute -top-2.5 left-4 z-10">
                <span className="bg-slate-700 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                  Before
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
                {/* Email client chrome */}
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium">Inbox — 47 unread</span>
                  </div>
                  <span className="text-[9px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded">Search mail…</span>
                </div>

                {/* Inbox rows — newsletter sales pitches */}
                <div className="divide-y divide-slate-100">
                  {[
                    {
                      from: 'Sarah @ TechBuzz Weekly',
                      avatar: 'TB',
                      avatarBg: 'bg-blue-500',
                      subject: 'Sponsorship opportunity — 85k subscribers',
                      preview: 'Hi, we have an opening for the 14th...',
                      time: '9:41 AM',
                      unread: true,
                      label: 'No price. No data.',
                    },
                    {
                      from: 'Partnerships · AI Daily',
                      avatar: 'AD',
                      avatarBg: 'bg-violet-500',
                      subject: 'RE: RE: RE: RE: Sponsorship rates',
                      preview: 'Updated our media kit — see attached PDF',
                      time: 'Mon',
                      unread: true,
                      label: '4th reply. Still no slot date.',
                    },
                    {
                      from: 'info@fintech-news.co',
                      avatar: 'FN',
                      avatarBg: 'bg-amber-500',
                      subject: 'Newsletter ad slot — limited availability!',
                      preview: 'Act fast! Only 2 slots remain for May…',
                      time: 'Mon',
                      unread: false,
                      label: 'Unverified numbers.',
                    },
                    {
                      from: 'hello@startupbrief.io',
                      avatar: 'SB',
                      avatarBg: 'bg-rose-500',
                      subject: 'Fwd: Media kit + rate card Q2 2025',
                      preview: 'Attached — updated deck + rate card inside...',
                      time: 'Sun',
                      unread: false,
                      label: 'PDF. No deadline.',
                    },
                    {
                      from: 'Growth Memo · Sponsorships',
                      avatar: 'GM',
                      avatarBg: 'bg-emerald-600',
                      subject: 'Following up on my last email about slots',
                      preview: 'Just checking in — did you get a chance to...',
                      time: 'Sat',
                      unread: false,
                      label: 'Third follow-up.',
                    },
                  ].map((row, i) => (
                    <div key={i} className={`px-4 py-2.5 flex items-center gap-3 ${row.unread ? 'bg-blue-50/40' : ''}`}>
                      <div className={`w-7 h-7 rounded-full ${row.avatarBg} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[8px] font-bold">{row.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {row.unread && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                          <p className={`text-[11px] truncate ${row.unread ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>{row.from}</p>
                          <span className="text-[9px] text-slate-400 ml-auto flex-shrink-0">{row.time}</span>
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${row.unread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>{row.subject}</p>
                        <p className="text-[9px] text-slate-400 truncate">{row.preview}</p>
                      </div>
                      <span className="flex-shrink-0 text-[8px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">{row.label}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 flex items-center justify-center gap-2 bg-slate-50">
                    <span className="text-[9px] text-slate-400">+ 42 more sponsorship emails…</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow / transition */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3 py-1.5">
                <ArrowRight className="w-3 h-3 text-teal-600" />
                <span className="text-[10px] font-semibold text-teal-700">endingthisweek.media</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* AFTER — Platform UI */}
            <div className="relative">
              <div className="absolute -top-2.5 left-4 z-10">
                <span className="bg-teal-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                  After
                </span>
              </div>

            {/* Selected slot detail panel */}
            <div className="bg-white rounded-2xl border border-teal-200 shadow-[0_4px_20px_rgba(20,184,166,0.08)] overflow-hidden">
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

              <div className="px-5 py-3">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Subscribers', value: slot.subscribers, icon: <Users className="w-3 h-3 text-slate-400" /> },
                    { label: 'Open rate', value: slot.openRate, icon: <Eye className="w-3 h-3 text-teal-500" />, accent: true },
                    { label: 'Send date', value: slot.sendDate, icon: <Clock className="w-3 h-3 text-slate-400" /> },
                    { label: 'Slots left', value: `${slot.slotsLeft} of 3`, icon: <BarChart3 className="w-3 h-3 text-orange-400" /> },
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <div className="flex justify-center mb-1">{stat.icon}</div>
                      <p className={`text-[12px] font-bold leading-tight ${stat.accent ? 'text-teal-600' : 'text-slate-800'}`}>{stat.value}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wide font-medium mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Sponsorship type + deadline */}
                <div className="flex items-center gap-2 mb-3">
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
                <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[22px] font-bold text-slate-900 tracking-tight leading-none">{slot.price}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp className="w-3 h-3 text-teal-600" />
                      <p className="text-[10px] text-teal-600 font-semibold">5% deposit to reserve</p>
                    </div>
                  </div>

                  <button
                    onClick={triggerBookingDemo}
                    className={`flex items-center gap-2 font-bold text-[13px] px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      bookingStep === 'done'
                        ? 'bg-emerald-500 text-white scale-95'
                        : bookingStep === 'locking'
                        ? 'bg-teal-700 text-white scale-95 opacity-80'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md hover:-translate-y-px'
                    }`}
                  >
                    {bookingStep === 'done' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Slot Reserved!
                      </>
                    ) : bookingStep === 'locking' ? (
                      <>
                        <Lock className="w-3.5 h-3.5 animate-pulse" />
                        Securing…
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Secure Slot
                        <Zap className="w-3.5 h-3.5 fill-white" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            </div>{/* end After wrapper */}

            {/* Social proof footer */}
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
                      <span className="text-white text-[7px] font-bold">{['M', 'J', 'K', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  <span className="text-slate-600 font-semibold">2,400+</span> sponsors have booked
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <MousePointerClick className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    Avg <span className="text-slate-600 font-semibold">4.8% CTR</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    <span className="text-emerald-600 font-semibold">340+</span> publishers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
