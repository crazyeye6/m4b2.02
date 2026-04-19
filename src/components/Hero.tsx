import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Mail, Inbox, Clock, Zap, Users, MapPin, CheckCircle, Lock, Eye, CalendarClock, Shield } from 'lucide-react';

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

const DEMO_CARD = {
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
  publishDay: 'Tuesday',
  publishDate: '10 Jun 2025',
  slots: 3,
  slotsTotal: 5,
  pastAdvertisers: ['HubSpot', 'Revolut'],
};

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

function DemoCard() {
  const c = DEMO_CARD;
  const countdown = useLiveCountdown(c.hours, c.mins);
  const savings = c.original - c.price;
  const deposit = Math.round(c.price * 0.1);

  return (
    <div className="structured-card bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_32px_rgba(0,0,0,0.09)] overflow-hidden flex flex-col w-full max-w-[320px]" style={{ animationDelay: '550ms' }}>
      <div className="p-5 flex flex-col h-full">

        <div className="flex items-center justify-between mb-3 gap-3">
          <span className="inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide bg-green-50 text-green-600 border-green-100">
            <Mail className="w-3.5 h-3.5" />
            Newsletter
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-semibold text-[#6e6e73]">{c.slots} slots</span>
            <div className="flex gap-0.5">
              {Array.from({ length: c.slotsTotal }).map((_, i) => (
                <span key={i} className={`block w-2 h-2 rounded-full ${i < c.slots ? 'bg-green-500' : 'bg-[#e5e5ea]'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded-2xl p-3.5 relative overflow-hidden border border-black/[0.05]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-black/10" />
            <p className="text-[#86868b] text-[8px] font-bold uppercase tracking-widest leading-none mb-2">Publisher</p>
            <p className="text-[#1d1d1f] text-[13px] font-bold leading-tight truncate mb-0.5">{c.name}</p>
            <p className="text-[#6e6e73] text-[10px] font-medium leading-none truncate">{c.publisher}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3.5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-green-400 to-teal-400" />
            <p className="text-green-700/60 text-[8px] font-bold uppercase tracking-widest leading-none mb-2">Publish Date</p>
            <p className="text-green-800 text-[13px] font-bold leading-tight truncate mb-0.5">{c.publishDay}</p>
            <p className="text-green-700/60 text-[10px] font-medium leading-none truncate">{c.publishDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 rounded-xl px-3 py-2 bg-orange-50">
          <CalendarClock className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#86868b] flex-shrink-0">Book by</p>
          <p className="text-[12px] font-bold ml-auto text-orange-600">2 Jun 2025</p>
        </div>

        <div className="flex items-center justify-between mb-3 bg-[#f5f5f7] rounded-2xl p-3.5">
          <div>
            <p className="text-[#86868b] text-[10px] font-medium uppercase tracking-wide mb-1">Price per slot</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[#1d1d1f] text-2xl font-semibold tracking-[-0.02em]">${c.price.toLocaleString()}</span>
              <span className="text-[#aeaeb2] text-sm line-through">${c.original.toLocaleString()}</span>
            </div>
            <p className="text-green-600 text-[11px] font-semibold mt-0.5">Save ${savings.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[15px] font-bold px-3 py-1.5 rounded-2xl tabular-nums shadow-sm shadow-orange-500/25">
            -{c.discount}%
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 bg-green-50 rounded-2xl px-3.5 py-3">
          <div>
            <p className="text-green-700 text-[12px] font-semibold">Reserve with deposit</p>
            <p className="text-green-600/70 text-[10px] mt-0.5">Balance paid direct to creator</p>
          </div>
          <div className="text-right">
            <p className="text-green-700 text-[18px] font-bold tracking-[-0.02em]">${deposit}</p>
            <p className="text-green-600/70 text-[10px]">now</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#f5f5f7] rounded-2xl p-2.5 text-center">
            <p className="text-[12px] font-semibold text-[#1d1d1f]">84K</p>
            <p className="text-[#aeaeb2] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">Subscribers</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-2.5 text-center">
            <p className="text-[12px] font-semibold text-teal-600">{c.openRate}</p>
            <p className="text-[#aeaeb2] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">Open rate</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-2.5 text-center">
            <p className="text-[12px] font-semibold text-[#1d1d1f]">{c.ctr}</p>
            <p className="text-[#aeaeb2] text-[9px] mt-0.5 uppercase tracking-wide font-medium leading-tight">CTR</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] text-[#6e6e73]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#aeaeb2]" />
            {c.geo}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-[#aeaeb2]" />
            Personal Finance enthusiasts
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <Shield className="w-3 h-3 text-[#aeaeb2] flex-shrink-0" />
          <p className="text-[#86868b] text-[11px]">Used by</p>
          <div className="flex items-center gap-1">
            {c.pastAdvertisers.map(a => (
              <span key={a} className="text-[11px] text-[#6e6e73] font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between bg-orange-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-600">
              <Clock className="w-3.5 h-3.5" />
              Ends in
            </div>
            <span className="text-[13px] font-bold text-orange-600 tabular-nums">{countdown}</span>
          </div>
          <button className="w-full font-semibold text-[14px] py-3 rounded-2xl bg-green-600 text-white flex items-center justify-center gap-2 pointer-events-none">
            <Lock className="w-3.5 h-3.5" />
            Secure Slot
            <Zap className="w-3.5 h-3.5 fill-white" />
          </button>
          <div className="flex items-center justify-between">
            <p className="text-[#aeaeb2] text-[10px]">Takes less than 10 seconds</p>
            <button className="flex items-center gap-1.5 text-[#6e6e73] text-[12px] font-medium pointer-events-none">
              <Eye className="w-3.5 h-3.5" />
              View details
            </button>
          </div>
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

              {/* OPPORTUNITY — Live deal card */}
              <div className="flex-1 min-w-0 rounded-2xl border border-emerald-100 bg-white overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.08)] flex flex-col">
                <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">Live Deal</span>
                  <span className="ml-auto text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                    1 active
                  </span>
                </div>
                <div className="p-3 flex justify-center">
                  <DemoCard />
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
