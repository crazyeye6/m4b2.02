import { Search, CreditCard, MessageSquare, TrendingDown } from 'lucide-react';

const STEPS = [
  {
    icon: <Search className="w-4 h-4 text-[#58a6ff]" />,
    number: '01',
    title: 'Browse expiring slots',
    description: 'Filter by channel, niche, geography, and budget. Every listing shows real audience data and live countdown timers.',
    note: null,
  },
  {
    icon: <TrendingDown className="w-4 h-4 text-[#e3b341]" />,
    number: '02',
    title: 'Find a deal worth taking',
    description: 'Sellers discount unsold inventory to fill it fast. You get access to premium placements at 20–50% below standard rate.',
    note: null,
  },
  {
    icon: <CreditCard className="w-4 h-4 text-[#3fb950]" />,
    number: '03',
    title: 'Pay 10% to reserve',
    description: 'Pay a 10% deposit to lock in your slot immediately. Your details and a booking reference are sent to the creator straight away.',
    note: '90% paid direct to creator',
  },
  {
    icon: <MessageSquare className="w-4 h-4 text-[#f78166]" />,
    number: '04',
    title: 'Finalise with the creator',
    description: "The creator's contact details are released after deposit. You settle the balance directly and finalise your campaign brief together.",
    note: null,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-t border-[#30363d]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-[#3fb950] text-[10px] font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-[#e6edf3] mb-3 leading-tight">
            Reserve a slot in minutes,<br />pay the creator directly.
          </h2>
          <p className="text-[#8b949e] text-base leading-relaxed">
            A 10% deposit locks in your listing. The remaining 90% is settled directly between you and the creator — fast, flexible, and commercial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-[#30363d] to-transparent z-0" />
              )}
              <div className="relative bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#484f58] transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-[#21262d] border border-[#30363d] rounded-md flex items-center justify-center group-hover:border-[#484f58] transition-all">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-bold text-[#21262d] group-hover:text-[#30363d] transition-all tabular-nums select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-[#e6edf3] font-semibold text-sm mb-1.5">{step.title}</h3>
                <p className="text-[#8b949e] text-xs leading-relaxed">{step.description}</p>
                {step.note && (
                  <p className="mt-3 text-[10px] text-[#3fb950] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] flex-shrink-0" />
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Deposit only', value: '10%', sub: 'Charged by platform to reserve' },
            { label: 'Balance paid', value: 'Direct', sub: 'Creator invoices you separately' },
            { label: 'Seller contact', value: 'Instant', sub: 'Released after deposit confirmed' },
          ].map((item, i) => (
            <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
              <p className="text-[#e3b341] font-bold text-xl mb-0.5">{item.value}</p>
              <p className="text-[#e6edf3] text-sm font-medium">{item.label}</p>
              <p className="text-[#6e7681] text-xs mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-[#e6edf3] font-semibold text-base mb-1">Are you a publisher or creator?</h3>
            <p className="text-[#8b949e] text-sm">List your unsold slots and fill your inventory before the deadline.</p>
          </div>
          <button className="flex-shrink-0 bg-[#238636] hover:bg-[#2ea043] text-white font-medium px-5 py-2 rounded-md text-sm border border-[#2ea043]/40 transition-all whitespace-nowrap">
            List a Slot Free
          </button>
        </div>
      </div>
    </section>
  );
}
