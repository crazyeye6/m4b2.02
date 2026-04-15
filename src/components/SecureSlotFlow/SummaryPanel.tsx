import { Zap, Shield, AlertTriangle, Lock } from 'lucide-react';
import type { BuyerFormData, Listing } from '../../types';
import type { VatCalculation } from '../../lib/vat';
import CountdownTimer from '../CountdownTimer';

interface SummaryPanelProps {
  listing: Listing;
  form: BuyerFormData;
  vat: VatCalculation;
  depositSubtotal: number;
  depositTotal: number;
  balanceAmount: number;
  totalPrice: number;
  onContinue: () => void;
  onBack: () => void;
}

export default function SummaryPanel({
  listing, form, vat, depositSubtotal, depositTotal, balanceAmount, totalPrice, onContinue, onBack,
}: SummaryPanelProps) {
  const displayName = form.purchase_type === 'business'
    ? (form.buyer_company || form.buyer_name || form.buyer_email)
    : (form.buyer_name || form.buyer_email);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[#1d1d1f] font-bold text-base mb-1">Review your booking</h3>
        <p className="text-[#6e6e73] text-sm">Confirm everything looks right before paying.</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center gap-2.5">
        <Zap className="w-4 h-4 text-orange-500 fill-orange-500 flex-shrink-0" />
        <p className="text-orange-700 text-xs font-semibold">Slot only secured once deposit is paid</p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between">
          <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wide">Opportunity</p>
          <CountdownTimer deadline={listing.deadline_at} compact />
        </div>
        <div className="p-4 space-y-2">
          <Row label="Media owner" value={listing.media_owner_name} />
          <Row label="Slot" value={listing.property_name} />
          <Row label="Type" value={listing.slot_type} />
          <Row label="Ad slot date" value={listing.date_label} />
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wide">Buyer</p>
        </div>
        <div className="p-4 space-y-2">
          <Row label={form.purchase_type === 'business' ? 'Company' : 'Name'} value={displayName} />
          <Row label="Email" value={form.buyer_email} />
          <Row label="Country" value={form.buyer_country} />
          {form.purchase_type === 'business' && form.buyer_vat_number && (
            <Row label="VAT number" value={form.buyer_vat_number} />
          )}
          <Row label="Brand" value={form.brand_name} />
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-green-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-green-700 text-xs font-semibold uppercase tracking-wide">Pricing breakdown</p>
        </div>
        <div className="p-4 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#86868b]">Full campaign price</span>
            <span className="text-[#1d1d1f] font-semibold">${totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-black/[0.06] pt-2">
            <span className="text-[#86868b]">Deposit (10% of full price)</span>
            <span className="text-[#1d1d1f]">${depositSubtotal.toLocaleString()}</span>
          </div>
          {vat.vatApplies && (
            <div className="flex justify-between text-xs">
              <span className="text-[#86868b]">{vat.vatLabel}</span>
              <span className="text-[#1d1d1f]">${vat.vatAmount.toFixed(2)}</span>
            </div>
          )}
          {vat.reverseCharge && (
            <div className="flex justify-between text-xs">
              <span className="text-[#6e6e73]">Reverse charge (0% VAT)</span>
              <span className="text-[#6e6e73]">$0.00</span>
            </div>
          )}
          <div className="flex justify-between border-t border-black/[0.06] pt-2.5">
            <div>
              <span className="text-green-700 font-bold text-sm">Total due today</span>
              <p className="text-[#aeaeb2] text-[10px]">Charged by EndingThisWeek.media</p>
            </div>
            <span className="text-green-700 font-black text-xl">${depositTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-black/[0.06] pt-2">
            <span className="text-[#86868b]">Balance to creator (90%) — paid directly</span>
            <span className="text-[#1d1d1f]">${balanceAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {listing.slots_remaining <= 2 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-orange-700 text-xs font-medium">
            Only {listing.slots_remaining} slot{listing.slots_remaining !== 1 ? 's' : ''} left — secure now
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Proceed to Payment
        </button>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-[#aeaeb2] flex-shrink-0 mt-0.5" />
          <p className="text-[#6e6e73] text-xs leading-relaxed">
            You are paying a 10% booking deposit to reserve this media placement. The remaining 90% is paid directly to the media owner. Deposits may be refunded if the seller cannot fulfil the placement.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#aeaeb2] text-xs flex-shrink-0">{label}</span>
      <span className="text-[#1d1d1f] text-xs font-medium text-right">{value || '—'}</span>
    </div>
  );
}
