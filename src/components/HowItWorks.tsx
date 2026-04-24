import { Search, CreditCard, FileText, SlidersHorizontal } from 'lucide-react';

const BUYER_STEPS = [
  {
    icon: <Search className="w-4 h-4 text-sky-600" />,
    iconBg: 'bg-sky-50',
    number: '01',
    title: 'Browse open slots across podcasts and media',
    description: 'Filter by niche, audience size, geography, and budget. Each open slot shows verified download data, the episode date, and a live countdown before it closes.',
    note: null,
  },
  {
    icon: <SlidersHorizontal className="w-4 h-4 text-orange-500" />,
    iconBg: 'bg-orange-50',
    number: '02',
    title: 'Request to secure before deadline',
    description: 'Pay a 5% deposit to lock in the slot immediately. Your booking reference and the host\'s contact details are released straight away.',
    note: '95% paid direct to host',
  },
  {
    icon: <FileText className="w-4 h-4 text-green-600" />,
    iconBg: 'bg-green-50',
    number: '03',
    title: 'Confirm and run your campaign directly with the creator',
    description: 'Settle the balance and submit your ad copy or brief directly to the host before the episode records. No agency. No markup.',
    note: null,
  },
];

const SELLER_STEPS = [
  {
    icon: <FileText className="w-4 h-4 text-sky-600" />,
    iconBg: 'bg-sky-50',
    number: '01',
    title: 'Email your open ad slots',
    description: 'Send your unsold inventory to slots@endingthisweek.media. We parse each slot automatically — podcast name, format, audience, price, and episode date.',
    note: null,
  },
  {
    icon: <Search className="w-4 h-4 text-orange-500" />,
    iconBg: 'bg-orange-50',
    number: '02',
    title: 'We list and promote them instantly',
    description: 'Approved slots go live in the open slot feed immediately — visible to active buyers who are looking for exactly this inventory this week.',
    note: null,
  },
  {
    icon: <CreditCard className="w-4 h-4 text-green-600" />,
    iconBg: 'bg-green-50',
    number: '03',
    title: 'Fill inventory before it falls back to programmatic',
    description: "A buyer pays 5% to secure, you get notified instantly. Settle the remaining 95% directly — no commission, no middlemen, and your slot fills instead of defaulting.",
    note: 'No commission taken',
  },
];

interface HowItWorksProps {
  onListSlot?: () => void;
}

function StepGrid({ steps }: { steps: typeof BUYER_STEPS }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {steps.map((step, i) => (
        <div key={i} className="relative">
          {i < steps.length - 1 && (
            <div className="hidden sm:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-black/[0.08] to-transparent z-0" />
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
  );
}

export default function HowItWorks({ onListSlot }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="pt-24 pb-24 border-t border-black/[0.06] bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Buyers */}
        <div>
          <div className="max-w-2xl mb-10">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#86868b] mb-4">For buyers</p>
            <h2 className="text-4xl font-semibold text-[#1d1d1f] mb-4 leading-tight tracking-[-0.02em]">
              Access premium ad slots<br />before they drop to programmatic.
            </h2>
            <p className="text-[#6e6e73] text-[17px] leading-relaxed font-light">
              A live feed of unsold host-read inventory. Filter, reserve, and run your campaign directly with the creator — before the deadline closes.
            </p>
          </div>
          <StepGrid steps={BUYER_STEPS} />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Deposit only', value: '5%', sub: 'Charged by platform to reserve', color: 'text-green-600' },
              { label: 'Balance paid', value: 'Direct', sub: 'Host invoices you separately', color: 'text-sky-600' },
              { label: 'Host contact', value: 'Instant', sub: 'Released after deposit confirmed', color: 'text-orange-500' },
            ].map((item, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-3xl p-5 text-center">
                <p className={`font-bold text-[22px] tracking-[-0.02em] mb-0.5 ${item.color}`}>{item.value}</p>
                <p className="text-[#1d1d1f] text-[14px] font-semibold">{item.label}</p>
                <p className="text-[#6e6e73] text-[12px] mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sellers */}
        <div>
          <div className="max-w-2xl mb-10">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#86868b] mb-4">For sellers</p>
            <h2 className="text-4xl font-semibold text-[#1d1d1f] mb-4 leading-tight tracking-[-0.02em]">
              Fill open ad slots<br />before they default to programmatic.
            </h2>
            <p className="text-[#6e6e73] text-[17px] leading-relaxed font-light">
              If you have unsold host-read inventory, simply email it to us. We'll match it with active buyers this week — at full price, directly to you.
            </p>
          </div>
          <StepGrid steps={SELLER_STEPS} />
        </div>

        <div className="bg-[#1d1d1f] rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-white font-semibold text-[17px] mb-1 tracking-[-0.01em]">Got unsold inventory this week?</h3>
            <p className="text-white/55 text-[14px]">Email your open slots to slots@endingthisweek.media. We'll list and promote them to active buyers before they default to programmatic.</p>
          </div>
          <button onClick={onListSlot} className="flex-shrink-0 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] transition-all whitespace-nowrap shadow-lg shadow-sky-500/25">
            Submit via Email
          </button>
        </div>
      </div>
    </section>
  );
}
