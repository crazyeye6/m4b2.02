import { Search, CreditCard, FileText, SlidersHorizontal } from 'lucide-react';

const STEPS = [
  {
    icon: <Search className="w-4 h-4 text-sky-600" />,
    iconBg: 'bg-sky-50',
    number: '01',
    title: 'Browse live sponsorship slots',
    description: 'Filter by niche, audience size, geography, and budget. Each listing shows verified audience data, the send date, and a live countdown to the booking deadline.',
    note: null,
  },
  {
    icon: <SlidersHorizontal className="w-4 h-4 text-orange-500" />,
    iconBg: 'bg-orange-50',
    number: '02',
    title: 'Find the right match for your brand',
    description: 'Smart match scoring surfaces newsletters that fit your niche and audience. Some publishers also offer discounted rates as the send date approaches — entirely their choice.',
    note: null,
  },
  {
    icon: <CreditCard className="w-4 h-4 text-green-600" />,
    iconBg: 'bg-green-50',
    number: '03',
    title: 'Pay 5% to reserve',
    description: 'Pay a 5% deposit to lock in your sponsorship immediately. Your details and a booking reference are sent to the newsletter publisher straight away.',
    note: '95% paid direct to publisher',
  },
  {
    icon: <FileText className="w-4 h-4 text-rose-500" />,
    iconBg: 'bg-rose-50',
    number: '04',
    title: 'Send your ad copy',
    description: "The publisher's contact details are released after your deposit. You settle the balance directly and hand over your ad copy before the send date.",
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
            Find the right newsletter slot,<br />book it in minutes.
          </h2>
          <p className="text-[#6e6e73] text-[17px] leading-relaxed font-light">
            A curated marketplace of verified newsletter sponsorship slots. Filter, match, reserve — then settle directly with the publisher. Fast, flexible, and transparent.
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
                  <p className="mt-3 text-[11px] text-green-600 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Deposit only', value: '5%', sub: 'Charged by platform to reserve', color: 'text-green-600' },
            { label: 'Balance paid', value: 'Direct', sub: 'Publisher invoices you separately', color: 'text-sky-600' },
            { label: 'Publisher contact', value: 'Instant', sub: 'Released after deposit confirmed', color: 'text-orange-500' },
          ].map((item, i) => (
            <div key={i} className="bg-[#f5f5f7] rounded-3xl p-5 text-center">
              <p className={`font-bold text-[22px] tracking-[-0.02em] mb-0.5 ${item.color}`}>{item.value}</p>
              <p className="text-[#1d1d1f] text-[14px] font-semibold">{item.label}</p>
              <p className="text-[#6e6e73] text-[12px] mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#1d1d1f] rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-white font-semibold text-[17px] mb-1 tracking-[-0.01em]">Got sponsorship slots to fill across your newsletters?</h3>
            <p className="text-white/55 text-[14px]">Add your newsletters once, then create listings in seconds. Set a price and deadline, optionally enable automatic discounting, and let buyers come to you.</p>
          </div>
          <button onClick={onListSlot} className="flex-shrink-0 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] transition-all whitespace-nowrap shadow-lg shadow-green-500/25">
            List a Slot Free
          </button>
        </div>
      </div>
    </section>
  );
}
