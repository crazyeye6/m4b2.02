import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Inbox, Zap, CheckCircle, Target, Clock, Users } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onListSlot: () => void;
}

const MESSY_EMAILS = [
  { from: 'Sarah @ TechBrief', subject: 'Re: ad slot still available?', time: '2d', read: false },
  { from: 'newsletter@dailyfinance.co', subject: 'FWD: Sponsorship rates — Q2', time: '3d', read: true },
  { from: 'partnerships@devweekly.io', subject: 'Quick question about your rates…', time: '5d', read: false },
  { from: 'Mike Patel', subject: 'RE: RE: RE: ad copy deadline', time: '1w', read: true },
  { from: 'noreply@mailchimp.com', subject: 'Your campaign stats for April…', time: '1w', read: true },
  { from: 'alex@growthletters.com', subject: 'Is the March slot still open??', time: '2w', read: false },
  { from: 'hello@founderweekly.com', subject: 'Newsletter sponsorship — rates?', time: '2w', read: false },
];

const LIVE_SLOTS = [
  { name: 'SaaS Insider', subs: '62k', tag: 'B2B SaaS', deadline: '18h', tier: 'urgent' },
  { name: 'FinanceFeed Weekly', subs: '84k', tag: 'Personal Finance', deadline: '3d', tier: 'open' },
  { name: 'Founder Weekly', subs: '31k', tag: 'Startups', deadline: '6h', tier: 'urgent' },
];

export default function Hero({ onBrowse, onListSlot }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);
  void tick;

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
              Media sponsorship marketplace
            </div>

            <h1
              className="font-bold text-slate-900 tracking-[-0.045em] leading-[1.0] mb-5"
              style={{ fontSize: 'clamp(34px, 4.2vw, 58px)' }}
            >
              Discover newsletter{' '}
              <br className="hidden sm:block" />
              sponsorship{' '}
              <span className="relative inline-block" style={{ color: '#0f766e' }}>
                opportunities.
                <span
                  className="absolute left-0 right-0 h-[3px] rounded-full"
                  style={{ bottom: '-2px', background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }}
                />
              </span>
            </h1>

            <p className="text-[17px] text-slate-500 leading-relaxed tracking-[-0.01em] mb-2 max-w-[420px]">
              Browse verified sponsorship slots from newsletter publishers. Filter by niche, audience, and budget — then book directly in minutes.
            </p>
            <p className="text-[14px] text-slate-400 font-medium mb-10 max-w-[380px]">
              Pay a 5% deposit to reserve your slot. The balance goes direct to the publisher.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={onBrowse}
                className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 shadow-[0_8px_28px_rgba(15,23,42,0.18)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.24)] hover:-translate-y-px"
              >
                Browse Opportunities
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

            <div className="space-y-2.5">
              {[
                { icon: <Target className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />, text: 'Filter by niche, audience size, geography, and budget' },
                { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />, text: 'Verified publisher inventory with real audience data' },
                { icon: <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />, text: 'Live booking deadlines — slots fill up fast' },
              ].map(b => (
                <span key={b.text} className="flex items-start gap-2.5 text-[13px] text-slate-500 font-medium leading-snug">
                  {b.icon}{b.text}
                </span>
              ))}
            </div>

            <p className="mt-7 text-[11px] text-slate-400 font-medium tracking-wide uppercase">
              Verified publisher inventory &middot; Real send dates &middot; Direct booking
            </p>
          </div>

          <div
            className="hidden lg:flex flex-col gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.65s ease 0.14s, transform 0.65s ease 0.14s',
            }}
          >
            <div className="flex items-stretch gap-4">

              <div className="w-[196px] flex-shrink-0 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col">
                <div className="px-3.5 pt-3 pb-2 border-b border-slate-200 bg-white flex items-center gap-1.5 flex-shrink-0">
                  <Inbox className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Your Inbox</span>
                  <span className="ml-auto text-[9px] bg-red-100 text-red-500 font-bold px-1.5 py-0.5 rounded-full">47 new</span>
                </div>
                <div className="flex-1 divide-y divide-slate-100 overflow-hidden">
                  {MESSY_EMAILS.map((email, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2 ${email.read ? 'opacity-40' : ''}`}
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

              <div className="flex flex-col items-center justify-center gap-2 w-10 flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center shadow-[0_4px_16px_rgba(15,23,42,0.25)]"
                  style={{ animation: 'connectorPulse 2.2s ease-in-out infinite' }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>

              <div className="flex-1 min-w-0 rounded-2xl border border-emerald-100 bg-white overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.07)] flex flex-col">
                <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase">EndingThisWeek.media</span>
                  <span className="ml-auto flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                    Live feed
                  </span>
                </div>

                <div className="flex-1 p-3.5 flex flex-col gap-2.5">
                  {LIVE_SLOTS.map((slot, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border px-3 py-2.5 flex items-center gap-3
                        ${slot.tier === 'urgent' ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}
                      style={{ animation: 'slotFade 0.5s ease both', animationDelay: `${400 + i * 120}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{slot.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Users className="w-2.5 h-2.5 text-slate-400" />
                          <p className="text-[10px] text-slate-400 font-medium">{slot.subs} subscribers</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                          {slot.tag}
                        </span>
                        <div className={`flex items-center gap-1 mt-1 justify-end ${slot.tier === 'urgent' ? 'text-amber-600' : 'text-slate-400'}`}>
                          <Clock className="w-2.5 h-2.5" />
                          <p className="text-[9px] font-semibold">{slot.deadline}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-1 grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100">
                    {[
                      { val: '200+', label: 'live slots', color: 'text-teal-600' },
                      { val: '5%', label: 'deposit to reserve', color: 'text-slate-700' },
                      { val: '95%', label: 'direct to publisher', color: 'text-slate-800' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className={`text-[17px] font-bold tracking-tight ${s.color}`}>{s.val}</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide mt-0.5 leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Curated. Matched. Ready to book.</span>
                  <span className="text-[9px] text-slate-400">Slots update live</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium">
              Publisher-verified inventory · Smart audience matching · Direct booking
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes emailSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slotFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes connectorPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(15,23,42,0.22); }
          50% { transform: scale(1.1); box-shadow: 0 6px 24px rgba(15,23,42,0.32); }
        }
      `}</style>
    </section>
  );
}
