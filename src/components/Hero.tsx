import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Mail, Inbox, TrendingDown, Clock, Zap, Users, MapPin, Star, CheckCircle } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

const MESSY_EMAILS = [
  { from: 'Sarah @ TechBrief', subject: 'Re: ad slot availability next Q?', time: '2d', read: false },
  { from: 'newsletter@dailyfinance.co', subject: 'FWD: Sponsorship rates — Q2', time: '3d', read: true },
  { from: 'partnerships@devweekly.io', subject: 'Quick question about your rates…', time: '5d', read: false },
  { from: 'Mike Patel', subject: 'RE: RE: RE: ad copy deadline', time: '1w', read: true },
  { from: 'noreply@mailchimp.com', subject: 'Your campaign stats for April…', time: '1w', read: true },
  { from: 'alex@growthletters.com', subject: 'Is the slot still available??', time: '2w', read: false },
  { from: 'hello@founderweekly.com', subject: 'Newsletter ad — pricing info?', time: '2w', read: false },
];

const STRUCTURED_CARDS = [
  {
    id: 1,
    name: 'FinanceWeekly',
    publisher: 'Capital Media',
    niche: 'Personal Finance',
    geo: 'UK / IE',
    subs: 84_000,
    openRate: '42%',
    ctr: '3.1%',
    price: 890,
    original: 1800,
    discount: 51,
    hours: 5,
    mins: 18,
    urgent: true,
    matchScore: 94,
    reasons: ['UK SaaS audience fit', 'Within your budget'],
  },
  {
    id: 2,
    name: 'SaaS Insider',
    publisher: 'B2B Growth Co.',
    niche: 'B2B / SaaS',
    geo: 'US / Global',
    subs: 62_000,
    openRate: '38%',
    ctr: '2.7%',
    price: 1100,
    original: 2200,
    discount: 50,
    hours: 11,
    mins: 47,
    urgent: false,
    matchScore: 87,
    reasons: ['Top SaaS newsletter', 'Strong engagement'],
  },
  {
    id: 3,
    name: 'Dev Digest',
    publisher: 'Developer Weekly',
    niche: 'Software / Dev',
    geo: 'US / Europe',
    subs: 120_000,
    openRate: '35%',
    ctr: '2.3%',
    price: 1350,
    original: 3000,
    discount: 55,
    hours: 0,
    mins: 43,
    urgent: true,
    matchScore: 81,
    reasons: ['High reach', 'Closing in 43 min'],
  },
];

function compactNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function useLiveCountdown(hours: number, mins: number) {
  const totalMs = useRef((hours * 3600 + mins * 60) * 1000);
  const [ms, setMs] = useState(totalMs.current);
  useEffect(() => {
    const id = setInterval(() => setMs(p => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r={r} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
      <circle
        cx="12" cy="12" r={r} fill="none"
        stroke={color} strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LiveCard({ card, index }: { card: typeof STRUCTURED_CARDS[0]; index: number }) {
  const countdown = useLiveCountdown(card.hours, card.mins);
  const savings = card.original - card.price;
  const scoreColor = card.matchScore >= 90 ? '#10b981' : '#14b8a6';
  const scoreBg = card.matchScore >= 90
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-teal-50 border-teal-200 text-teal-700';

  return (
    <div
      className="structured-card bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
      style={{ animationDelay: `${550 + index * 130}ms` }}
    >
      {card.urgent && <div className="h-0.5 bg-gradient-to-r from-red-400 to-orange-400" />}

      <div className="p-3.5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[12px] font-bold text-slate-600 flex-shrink-0">
              {card.name[0]}
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-900 leading-tight">{card.name}</p>
              <p className="text-[9px] text-slate-400 leading-tight truncate">{card.publisher}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 rounded-full border ${scoreBg}`}>
            <ScoreRing score={card.matchScore} color={scoreColor} />
            <span>{card.matchScore}</span>
          </div>
        </div>

        {/* Category + geo tags */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          <span className="text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full">{card.niche}</span>
          <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
            <MapPin className="w-2 h-2" />{card.geo}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-0 mb-2.5 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
          <div className="p-2 text-center">
            <p className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight mb-0.5">Subs</p>
            <div className="flex items-center justify-center gap-0.5">
              <Users className="w-2 h-2 text-slate-500" />
              <p className="text-[11px] font-bold text-slate-800">{compactNum(card.subs)}</p>
            </div>
          </div>
          <div className="p-2 text-center border-x border-slate-100">
            <p className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight mb-0.5">Open</p>
            <p className="text-[11px] font-bold text-slate-800">{card.openRate}</p>
          </div>
          <div className="p-2 text-center">
            <p className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight mb-0.5">CTR</p>
            <p className="text-[11px] font-bold text-slate-800">{card.ctr}</p>
          </div>
        </div>

        {/* Price block */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[9px] text-slate-400 line-through">${card.original.toLocaleString()}</p>
            <p className="text-[18px] font-bold text-slate-900 leading-none">${card.price.toLocaleString()}</p>
            <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">Save ${savings.toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              <TrendingDown className="w-2 h-2" />-{card.discount}%
            </span>
            <div className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-full border ${card.urgent ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
              <Clock className="w-2 h-2" />
              {countdown}
            </div>
          </div>
        </div>

        {/* Match reason pill */}
        <div className="px-2 py-1 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-center gap-1 mb-2.5">
          <Star className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
          <p className="text-[9px] text-emerald-700 font-medium truncate">{card.reasons[0]}</p>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1.5 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-1 bg-slate-900 text-white text-[10px] font-bold py-2 rounded-xl">
            View Deal <ArrowRight className="w-2.5 h-2.5" />
          </button>
          <button className="text-[9px] text-slate-400 font-medium px-2 py-2 rounded-xl border border-slate-100 whitespace-nowrap">
            Why?
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 130% 110% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 130% 110% at 50% 0%, black 20%, transparent 100%)',
        }}
      />
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(150deg, rgba(236,253,245,0.5) 0%, rgba(255,255,255,0) 45%, rgba(240,249,255,0.2) 100%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 lg:pt-32 lg:pb-16">
        <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-12 xl:gap-14 items-start">

          {/* LEFT — Copy */}
          <div
            className="lg:sticky lg:top-28"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              Industry inbox + matching engine
            </div>

            <h1
              className="font-bold text-slate-900 tracking-[-0.045em] leading-[1.0] mb-5"
              style={{ fontSize: 'clamp(36px, 4.5vw, 62px)' }}
            >
              The inbox for{' '}
              <br />
              newsletter{' '}
              <span className="relative inline-block" style={{ color: '#0f766e' }}>
                advertising.
                <span
                  className="absolute left-0 right-0 h-[3px] rounded-full"
                  style={{ bottom: '-2px', background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
                />
              </span>
            </h1>

            <p className="text-[17px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[400px]">
              We organize, surface, and match the best promo opportunities — all in one place.
            </p>
            <p className="text-[14px] text-slate-400 font-medium mb-10 max-w-[360px]">
              Stop digging through emails. See the right deals instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBrowse}
                className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 shadow-[0_8px_28px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.24)] hover:-translate-y-px"
              >
                View Opportunities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
              <button
                onClick={onListSlot}
                className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-7 py-3.5 rounded-xl text-[15px] border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.10)] hover:-translate-y-px"
              >
                <Mail className="w-4 h-4" />
                Submit a Slot
              </button>
            </div>

            <p className="mt-7 text-[12px] text-slate-400 font-medium tracking-wide">
              Curated from real publisher inventory. No spam. No noise.
            </p>

            <div className="mt-5 flex flex-col gap-1.5">
              {[
                { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />, text: 'Live pricing with real discounts' },
                { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />, text: 'Intelligent match scoring per buyer' },
                { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />, text: 'Countdown timers on every slot' },
              ].map(b => (
                <span key={b.text} className="inline-flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                  {b.icon}{b.text}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Transformation visual */}
          <div
            className="hidden lg:flex flex-col gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            <div className="flex items-stretch gap-4">

              {/* INBOX — Messy */}
              <div className="w-[200px] flex-shrink-0 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col">
                <div className="px-3.5 pt-3 pb-2 border-b border-slate-200 bg-white flex items-center gap-1.5 flex-shrink-0">
                  <Inbox className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Your Inbox</span>
                  <span className="ml-auto text-[9px] bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">47 new</span>
                </div>
                <div className="flex-1 divide-y divide-slate-100 overflow-hidden">
                  {MESSY_EMAILS.map((email, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 ${email.read ? 'opacity-45' : ''}`}
                      style={{ animation: 'emailSlide 0.4s ease both', animationDelay: `${280 + i * 55}ms` }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {!email.read
                          ? <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                          : <span className="w-1.5 h-1.5 flex-shrink-0" />}
                        <p className="text-[9px] font-semibold text-slate-700 truncate">{email.from}</p>
                        <span className="ml-auto text-[8px] text-slate-400 flex-shrink-0">{email.time}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate pl-3">{email.subject}</p>
                    </div>
                  ))}
                </div>
                <div className="relative h-10 flex-shrink-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(248,250,252,0.98))' }}>
                  <div className="absolute bottom-2 inset-x-0 text-center">
                    <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest">Slow. Noisy. Chaotic.</span>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex flex-col items-center justify-center gap-2 w-10 flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-[0_4px_16px_rgba(15,23,42,0.25)]"
                  style={{ animation: 'connectorPulse 2.2s ease-in-out infinite' }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest text-center leading-tight">
                  Structured<br />& matched
                </span>
              </div>

              {/* OPPORTUNITIES — Live deals 3-column */}
              <div className="flex-1 min-w-0 rounded-2xl border border-emerald-100 bg-white overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)] flex flex-col">
                <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">Live Deals — Matched for You</span>
                  <span className="ml-auto text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                    {STRUCTURED_CARDS.length} active
                  </span>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2.5">
                  {STRUCTURED_CARDS.map((card, i) => (
                    <LiveCard key={card.id} card={card} index={i} />
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                  <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">Organized. Matched. Ready.</span>
                  <span className="text-[8px] text-slate-400">Countdowns are live</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium">
              EndingThisWeek turns inbox chaos into an intelligent, structured deal engine
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes emailSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .structured-card {
          animation: cardSlide 0.45s ease both;
        }
        @keyframes cardSlide {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes connectorPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(15,23,42,0.22); }
          50% { transform: scale(1.1); box-shadow: 0 6px 24px rgba(15,23,42,0.32); }
        }
      `}</style>
    </section>
  );
}
