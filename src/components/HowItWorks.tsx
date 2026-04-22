import { Layers, Search, CreditCard, MessageSquare } from 'lucide-react';

const STEPS = [
  {
    icon: <Layers className="w-4 h-4 text-[#1F7A63]" />,
    iconBg: 'bg-emerald-50',
    number: '01',
    title: 'Creators list available opportunities',
    description: 'Newsletter publishers, podcasters, influencers, and media owners list their time-sensitive inventory — with full audience data, pricing, and a deadline.',
    note: null,
  },
  {
    icon: <Search className="w-4 h-4 text-sky-600" />,
    iconBg: 'bg-sky-50',
    number: '02',
    title: 'Buyers explore by category',
    description: 'Browse the formats that fit your campaign — from newsletter sponsorships to podcast placements. Filter by niche, audience size, location, and budget.',
    note: null,
  },
  {
    icon: <CreditCard className="w-4 h-4 text-orange-500" />,
    iconBg: 'bg-orange-50',
    number: '03',
    title: 'Book before they\'re gone',
    description: 'Pay a small deposit to secure the opportunity while availability lasts. Creator contact details are released immediately so you can move fast.',
    note: '5% deposit · 95% direct to creator',
  },
  {
    icon: <MessageSquare className="w-4 h-4 text-rose-500" />,
    iconBg: 'bg-rose-50',
    number: '04',
    title: 'Run your campaign',
    description: 'Contact the creator directly, deliver your brief, and settle the balance. No agency fees, no platform markup — a transparent, creator-first process.',
    note: null,
  },
];

interface HowItWorksProps {
  onListSlot?: () => void;
}

export default function HowItWorks({ onListSlot }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="pt-24 pb-24 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#86868b] mb-4">How it works</p>
          <h2 className="text-4xl font-semibold text-[#1d1d1f] mb-4 leading-tight tracking-[-0.02em]">
            Find and book creator media<br />opportunities in minutes.
          </h2>
          <p className="text-[#6e6e73] text-[17px] leading-relaxed font-light">
            A curated marketplace of time-sensitive creator media opportunities. Browse by category, match to your campaign, and book before inventory runs out.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-black/[0.08] to-transparent z-0" />
              )}
              <div className="relative bg-[#f5f5f7] rounded-3xl p-6 hover:bg-white hover:shadow-md hover:shadow-black/[0.06] transition-all duration-200 border border-transparent hover:border-black/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-9 h-9 ${step.iconBg} rounded-2xl flex items-center justify-center shadow-sm shadow-black/[0.04]`}>
                    {step.icon}
                  </div>
                  <span className="text-3xl font-bold text-black/10 tabular-nums select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-[#1d1d1f] font-semibold text-[14px] mb-2 tracking-[-0.01em]">{step.title}</h3>
                <p className="text-[#6e6e73] text-[13px] leading-relaxed">{step.description}</p>
                {step.note && (
                  <p className="mt-3 text-[11px] font-semibold flex items-center gap-1.5" style={{ color: '#1F7A63' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1F7A63' }} />
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Deposit only', value: '5%', sub: 'Charged by platform to reserve', cls: '' },
            { label: 'Balance paid', value: 'Direct', sub: 'Creator invoices you separately', cls: 'text-sky-600' },
            { label: 'Creator contact', value: 'Instant', sub: 'Released after deposit confirmed', cls: 'text-orange-500' },
          ].map((item, i) => (
            <div key={i} className="bg-[#f5f5f7] rounded-3xl p-5 text-center">
              <p
                className={`font-bold text-[22px] tracking-[-0.02em] mb-0.5 ${item.cls}`}
                style={i === 0 ? { color: '#1F7A63' } : undefined}
              >
                {item.value}
              </p>
              <p className="text-[#1d1d1f] text-[14px] font-semibold">{item.label}</p>
              <p className="text-[#6e6e73] text-[12px] mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#1d1d1f] rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-white font-semibold text-[17px] mb-1 tracking-[-0.01em]">Got media opportunities to list across your creator channels?</h3>
            <p className="text-white/55 text-[14px]">Whether you publish a newsletter, run a podcast, or manage an audience — list your available slots in minutes. Set a price, add a deadline, and let buyers come to you.</p>
          </div>
          <button
            onClick={onListSlot}
            className="flex-shrink-0 font-semibold px-6 py-2.5 rounded-full text-[14px] transition-all whitespace-nowrap shadow-lg text-white"
            style={{ background: '#1F7A63', boxShadow: '0 8px 24px rgba(31,122,99,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#186453')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1F7A63')}
          >
            List Your Opportunity Free
          </button>
        </div>
      </div>
    </section>
  );
}
