import { Shield, Clock, AlertTriangle, Info } from 'lucide-react';
import type { Listing } from '../../types';
import CountdownTimer from '../CountdownTimer';

interface BookingSummaryProps {
  listing: Listing;
  slotsCount: number;
  onContinue: () => void;
}

export default function BookingSummary({ listing, slotsCount, onContinue }: BookingSummaryProps) {
  const totalPrice = listing.discounted_price * slotsCount;
  const depositAmount = Math.round(totalPrice * 0.1);
  const balanceAmount = totalPrice - depositAmount;
  const isScarce = listing.slots_remaining <= 2;

  return (
    <div className="space-y-5">
      <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Booking summary</p>
          <CountdownTimer deadline={listing.deadline_at} compact />
        </div>
        <div className="p-4 space-y-2.5">
          <Row label="Creator / Seller" value={listing.media_owner_name} />
          <Row label="Platform" value={listing.media_company_name} />
          <Row label="Opportunity" value={listing.property_name} />
          <Row label="Content type" value={listing.slot_type} />
          <Row label="Posting date" value={listing.date_label} />
          {listing.deliverables_detail && (
            <Row label="Deliverables" value={listing.deliverables_detail} wrap />
          )}
          <div className="border-t border-white/5 pt-2.5">
            <Row label="Slots being secured" value={`${slotsCount} of ${listing.slots_remaining} available`} />
            <Row label="Price per slot" value={`$${listing.discounted_price.toLocaleString()}`} />
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-amber-500/20 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-amber-400 text-xs uppercase tracking-wide font-semibold">Pricing breakdown</p>
        </div>
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total campaign price</span>
            <span className="text-white font-bold text-sm">${totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-y border-white/5">
            <div>
              <span className="text-emerald-400 font-bold text-sm">Deposit due now (10%)</span>
              <p className="text-gray-600 text-xs mt-0.5">Charged by EndingThisWeek.media</p>
            </div>
            <span className="text-emerald-400 font-black text-lg">${depositAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-sm">Balance due direct to creator (90%)</span>
              <p className="text-gray-600 text-xs mt-0.5">Invoiced directly by seller</p>
            </div>
            <span className="text-white font-bold text-sm">${balanceAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-950/30 border border-blue-500/15 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">How booking works</p>
        </div>
        <ul className="space-y-2">
          {[
            'Pay 10% now to reserve the slot',
            'Your deposit is collected by EndingThisWeek.media',
            'The creator handles the remaining balance directly',
            'The seller will invoice you after confirmation',
            'Your slot is held pending seller-side confirmation',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="w-4 h-4 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-gray-500" />
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Refund policy</p>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">
          Deposit refunds are assessed case by case based on listing terms, seller obligations, and buyer actions. Seller contact details are released after payment.
        </p>
      </div>

      {isScarce && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400 text-xs font-medium">
            Only {listing.slots_remaining} slot{listing.slots_remaining !== 1 ? 's' : ''} remaining — reserve now before it closes
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Clock className="w-3.5 h-3.5" />
        <span>Slot hold period after payment: 48 hours pending seller confirmation</span>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] text-sm"
      >
        Continue to Your Details
      </button>
    </div>
  );
}

function Row({ label, value, wrap }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div className={`flex ${wrap ? 'flex-col gap-0.5' : 'items-start justify-between gap-4'}`}>
      <span className="text-gray-500 text-xs flex-shrink-0">{label}</span>
      <span className={`text-white text-xs font-medium ${wrap ? '' : 'text-right'}`}>{value}</span>
    </div>
  );
}
