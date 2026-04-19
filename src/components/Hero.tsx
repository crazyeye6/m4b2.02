import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Mail, Inbox, TrendingDown, Clock, Zap, ArrowRight as ArrowRightIcon } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

const MESSY_EMAILS = [
  { from: 'Sarah @ TechBrief', subject: 'Re: ad slot availability?', time: '2d ago', read: false },
  { from: 'newsletter@dailyfinance.co', subject: 'FWD: Sponsorship rates Q2', time: '3d ago', read: true },
  { from: 'partnerships@devweekly.io', subject: 'Quick question about your...', time: '5d ago', read: false },
  { from: 'Mike Patel', subject: 'RE: RE: RE: ad copy deadline', time: '1w ago', read: true },
  { from: 'noreply@mailchimp.com', subject: 'Your campaign stats for Apr...', time: '1w ago', read: true },
  { from: 'alex@growthletters.com', subject: 'Slot still available? Price?', time: '2w ago', read: false },
];

const STRUCTURED_CARDS = [
  {
    id: 1,
    name: 'FinanceWeekly',
    niche: 'Personal Finance',
    subs: '84K',
    price: 890,
    original: 1800,
    discount: 51,
    hours: 5,
    mins: 18,
    urgent: true,
  },
  {
    id: 2,
    name: 'SaaS Insider',
    niche: 'B2B / SaaS',
    subs: '62K',
    price: 1100,
    original: 2200,
    discount: 50,
    hours: 11,
    mins: 47,
    urgent: false,
  },
  {
    id: 3,
    name: 'Dev Digest',
    niche: 'Software Dev',
    subs: '120K',
    price: 1350,
    original: 3000,
    discount: 55,
    hours: 0,
    mins: 43,
    urgent: true,
  },
];

function useLiveCountdown(hours: number, mins: number) {
  const totalMs = useRef((hours * 3600 + mins * 60) * 1000);
  const [ms, setMs] = useState(totalMs.current);
  useEffect(() => {
    const id = setInterval(() => setMs((p) => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function OpportunityCard({ card, index }: { card: typeof STRUCTURED_CARDS[0]; index: number }) {
  const countdown = useLiveCountdown(card.hours, card.mins);
  return (
    <div
      className="structured-card bg-white rounded-xl border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-3.5 cursor-default"
      style={{ animationDelay: `${600 + index * 120}ms` }}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[12px] font-bold text-slate-600 flex-shrink-0">
            {card.name[0]}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-900 leading-tight">{card.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{card.niche} · {card.subs} subs</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">
          <TrendingDown className="w-2 h-2" />-{card.discount}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-slate-400 line-through">${card.original.toLocaleString()}</p>
          <p className="text-[15px] font-bold text-slate-900 leading-none">${card.price.toLocaleString()}</p>
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-full border ${card.urgent ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
          <Clock className="w-2.5 h-2.5" />
          {countdown}
        </div>
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[9px] text-emerald-600 font-semibold">View Deal</span>
        <ArrowRightIcon className="w-3 h-3 text-emerald-500" />
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
      {/* Subtle grid — financial terminal feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15,23,42,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.032) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 130% 110% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 130% 110% at 50% 0%, black 20%, transparent 100%)',
        }}
      />

      {/* Soft ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(150deg, rgba(236,253,245,0.55) 0%, rgba(255,255,255,0) 45%, rgba(240,249,255,0.25) 100%)',
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-[1fr_580px] gap-16 lg:gap-12 items-center">

          {/* LEFT — Copy + CTAs */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(22px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              Industry inbox + matching engine
            </div>

            {/* Headline */}
            <h1
              className="font-bold text-slate-900 tracking-[-0.045em] leading-[1.0] mb-5"
              style={{ fontSize: 'clamp(40px, 5.5vw, 70px)' }}
            >
              The inbox for{' '}
              <br className="hidden sm:block" />
              newsletter{' '}
              <span className="relative inline-block" style={{ color: '#0f766e' }}>
                advertising.
                <span
                  className="absolute left-0 right-0 h-[3px] rounded-full"
                  style={{ bottom: '-3px', background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
                />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-[18px] sm:text-[20px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[490px]">
              We organize, surface, and match the best promo opportunities — all in one place.
            </p>

            {/* Support line */}
            <p className="text-[14px] text-slate-400 font-medium mb-10 max-w-[420px]">
              Stop digging through emails. See the right deals instantly.
            </p>

            {/* CTAs */}
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

            {/* Trust line */}
            <p className="mt-7 text-[12px] text-slate-400 font-medium tracking-wide">
              Curated from real publisher inventory. No spam. No noise.
            </p>
          </div>

          {/* RIGHT — Transformation visual */}
          <div
            className="hidden lg:block"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            <div className="flex items-stretch gap-3">

              {/* INBOX — Messy */}
              <div
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
                style={{ minWidth: 0 }}
              >
                <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white flex items-center gap-2">
                  <Inbox className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">Your Inbox</span>
                  <span className="ml-auto text-[10px] bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">47 unread</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {MESSY_EMAILS.map((email, i) => (
                    <div
                      key={i}
                      className={`px-3.5 py-2.5 ${email.read ? 'opacity-55' : ''}`}
                      style={{ animation: 'emailSlide 0.4s ease both', animationDelay: `${300 + i * 60}ms` }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {!email.read
                          ? <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                          : <span className="w-1.5 h-1.5 flex-shrink-0" />}
                        <p className="text-[10px] font-semibold text-slate-700 truncate">{email.from}</p>
                        <span className="ml-auto text-[9px] text-slate-400 flex-shrink-0">{email.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate pl-3">{email.subject}</p>
                    </div>
                  ))}
                </div>
                <div className="h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, rgba(248,250,252,0.96))' }} />
                <div className="px-3.5 pb-3 text-center">
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Messy. Manual. Slow.</span>
                </div>
              </div>

              {/* Connector */}
              <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-[0_4px_16px_rgba(15,23,42,0.22)]"
                  style={{ animation: 'connectorPulse 2.2s ease-in-out infinite' }}
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest text-center leading-tight">
                  Structured<br />by us
                </span>
              </div>

              {/* OPPORTUNITIES — Clean */}
              <div
                className="flex-1 rounded-2xl border border-emerald-100 bg-white overflow-hidden shadow-[0_4px_28px_rgba(0,0,0,0.08)]"
                style={{ minWidth: 0 }}
              >
                <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-100 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-slate-700 tracking-wide uppercase">Live Deals</span>
                  <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                    {STRUCTURED_CARDS.length} matched
                  </span>
                </div>
                <div className="p-2.5 flex flex-col gap-2">
                  {STRUCTURED_CARDS.map((card, i) => (
                    <OpportunityCard key={card.id} card={card} index={i} />
                  ))}
                </div>
                <div className="px-3.5 pb-3 text-center">
                  <span className="text-[9px] text-emerald-600 font-semibold uppercase tracking-widest">Organized. Matched. Ready.</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
              We turn inbox chaos into structured advertising opportunities
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
          50% { transform: scale(1.09); box-shadow: 0 6px 24px rgba(15,23,42,0.3); }
        }
      `}</style>
    </section>
  );
}
