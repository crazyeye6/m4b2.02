import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Mic2, Shield, Crosshair, TrendingUp, X, Search, Clock, CheckCircle, AlertTriangle, Headphones } from 'lucide-react';

interface WhyNewsletterAdsProps {
  onBrowse: () => void;
}

const VALUE_CARDS = [
  {
    icon: <Headphones className="w-5 h-5" />,
    accent: 'from-sky-500 to-blue-500',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-600',
    title: 'Captive attention',
    body: 'Listeners are in the middle of an episode — fully engaged, headphones on, screen away.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    accent: 'from-teal-500 to-emerald-500',
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-600',
    title: 'Host-read trust',
    body: 'Hosts endorse your brand in their own voice. Listeners trust them — and that trust transfers.',
  },
  {
    icon: <Crosshair className="w-5 h-5" />,
    accent: 'from-amber-500 to-orange-500',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-600',
    title: 'Niche audiences',
    body: 'Reach founders, developers, investors, and professionals in tightly defined niches.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    accent: 'from-emerald-500 to-green-500',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    title: 'Strong ROI',
    body: 'Lower CPMs than display ads, better recall than banners, and measurable conversion uplift.',
  },
];

const PROBLEMS = [
  { icon: <Search className="w-3.5 h-3.5" />, text: 'Hard to find podcast opportunities' },
  { icon: <X className="w-3.5 h-3.5" />, text: 'Scattered across DMs and emails' },
  { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'Slots gone before you see them' },
];

const SOLUTIONS = [
  { icon: <CheckCircle className="w-3.5 h-3.5" />, text: 'Curated podcast opportunities' },
  { icon: <Clock className="w-3.5 h-3.5" />, text: 'Ending this week' },
  { icon: <ArrowRight className="w-3.5 h-3.5" />, text: 'Ready to book now' },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function WhyNewsletterAds({ onBrowse }: WhyNewsletterAdsProps) {
  const hero = useInView(0.1);
  const cards = useInView(0.08);
  const compare = useInView(0.12);
  const urgency = useInView(0.15);

  return (
    <section className="py-24 bg-white border-t border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADLINE + VALUE CARDS */}
        <div
          ref={hero.ref}
          className="grid lg:grid-cols-[1fr_1fr] gap-14 lg:gap-20 items-start"
        >
          {/* Left — copy */}
          <div
            className="max-w-[520px]"
            style={{
              opacity: hero.visible ? 1 : 0,
              transform: hero.visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.55s ease, transform 0.55s ease',
            }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#86868b] mb-4">
              Why podcast ads
            </p>
            <h2 className="text-[36px] sm:text-[42px] font-semibold text-[#1d1d1f] leading-[1.1] tracking-[-0.03em] mb-5">
              Reach the right audience
              <span className="block text-sky-600">
                — while they're listening.
              </span>
            </h2>
            <p className="text-[17px] text-[#6e6e73] leading-relaxed font-light max-w-[460px]">
              Podcast sponsorships put your brand inside an episode your audience chose to play. No scrolling past, no banner blindness — just your message, delivered by a trusted voice.
            </p>

            {/* Stats ribbon */}
            <div className="mt-10 flex gap-8">
              {[
                { val: '65%', label: 'Ad recall rate' },
                { val: '3–8x', label: 'ROI vs display' },
                { val: '80%', label: 'Listen to end' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.03em] leading-none">{s.val}</p>
                  <p className="text-[11px] text-[#86868b] font-medium uppercase tracking-wide mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — value cards */}
          <div
            ref={cards.ref}
            className="grid grid-cols-2 gap-3"
          >
            {VALUE_CARDS.map((card, i) => (
              <div
                key={card.title}
                className="group relative bg-[#f5f5f7] rounded-2xl p-5 hover:bg-white hover:shadow-lg hover:shadow-black/[0.05] transition-all duration-300 border border-transparent hover:border-black/[0.06] cursor-default"
                style={{
                  opacity: cards.visible ? 1 : 0,
                  transform: cards.visible ? 'translateY(0)' : 'translateY(18px)',
                  transition: `opacity 0.45s ease ${i * 0.08}s, transform 0.45s ease ${i * 0.08}s, background-color 0.3s, box-shadow 0.3s, border-color 0.3s`,
                }}
              >
                <div className={`w-10 h-10 ${card.accentBg} rounded-xl flex items-center justify-center mb-4 ${card.accentText} group-hover:scale-105 transition-transform duration-200`}>
                  {card.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-1.5">{card.title}</h3>
                <p className="text-[13px] text-[#6e6e73] leading-relaxed">{card.body}</p>
                <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${card.accent}`} />
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEM vs SOLUTION */}
        <div
          ref={compare.ref}
          className="mt-20 grid sm:grid-cols-2 gap-4"
          style={{
            opacity: compare.visible ? 1 : 0,
            transform: compare.visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* Problem */}
          <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-[13px] font-semibold text-red-400 uppercase tracking-widest">The problem</p>
            </div>
            <div className="space-y-3">
              {PROBLEMS.map(p => (
                <div key={p.text} className="flex items-center gap-3 text-[14px] text-[#6e6e73]">
                  <span className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-300 flex-shrink-0">{p.icon}</span>
                  {p.text}
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-[13px] font-semibold text-sky-600 uppercase tracking-widest">The solution</p>
            </div>
            <div className="space-y-3">
              {SOLUTIONS.map(s => (
                <div key={s.text} className="flex items-center gap-3 text-[14px] text-[#1d1d1f] font-medium">
                  <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">{s.icon}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* URGENCY + CTA */}
        <div
          ref={urgency.ref}
          className="mt-10"
          style={{
            opacity: urgency.visible ? 1 : 0,
            transform: urgency.visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s',
          }}
        >
          <div className="rounded-2xl bg-slate-900 p-7 sm:p-9 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Time-sensitive</p>
              </div>
              <p className="text-white text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] leading-snug mb-2">
                Once an episode drops, that ad slot is gone.
              </p>
              <p className="text-white/50 text-[14px] leading-relaxed">
                The best opportunities are last-minute. Slots with approaching deadlines often come with better pricing — but they won't wait.
              </p>
            </div>
            <button
              onClick={onBrowse}
              className="group flex-shrink-0 inline-flex items-center gap-2 bg-white hover:bg-sky-50 text-slate-900 font-semibold px-7 py-3.5 rounded-xl text-[15px] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:-translate-y-px whitespace-nowrap"
            >
              Browse Slots Ending This Week
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
