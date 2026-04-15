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
        <h3 className="text-[#e6edf3] font-bold text-base mb-1">Review your booking</h3>
        <p className="text-[#8b949e] text-sm">Confirm everything looks right before paying.</p>
      </div>

      <div className="bg-amber-500/[0.06] border border-amber-500/25 rounded-xl p-3 flex items-center gap-2.5">
        <Zap className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
        <p className="text-amber-300 text-xs font-semibold">Slot only secured once deposit is paid</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
          <p className="text-[#8b949e] text-xs font-semibold uppercase tracking-wide">Opportunity</p>
          <CountdownTimer deadline={listing.deadline_at} compact />
        </div>
        <div className="p-4 space-y-2">
          <Row label="Media owner" value={listing.media_owner_name} />
          <Row label="Slot" value={listing.property_name} />
          <Row label="Type" value={listing.slot_type} />
          <Row label="Ad slot date" value={listing.date_label} />
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d]">
          <p className="text-[#8b949e] text-xs font-semibold uppercase tracking-wide">Buyer</p>
        </div>
        <div className="p-4 space-y-2">
          <Row label={form.purchase_type === 'business' ? 'Company' : 'Name'} value={displayName} />
          <Row label="Email" value={form.buyer_email} />
          <Row label="Country" value={form.buyer_country} />
          {form.purchase_type === 'business' && form.buyer_vat_number && (
            <Row label="VAT number" value={form.buyer_vat_number} />
          )}
          <Row label="Brand" value={form.brand_name} />
          <Row label="Campaign start" value={form.campaign_start_date} />
        </div>
      </div>

      <div className="bg-[#161b22] border border-emerald-500/20 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d]">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Pricing breakdown</p>
        </div>
        <div className="p-4 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#8b949e]">Full campaign price</span>
            <span className="text-[#e6edf3] font-semibold">${totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-[#30363d] pt-2">
            <span className="text-[#8b949e]">Deposit (10% of full price)</span>
            <span className="text-[#e6edf3]">${depositSubtotal.toLocaleString()}</span>
          </div>
          {vat.vatApplies && (
            <div className="flex justify-between text-xs">
              <span className="text-[#8b949e]">{vat.vatLabel}</span>
              <span className="text-[#e6edf3]">${vat.vatAmount.toFixed(2)}</span>
            </div>
          )}
          {vat.reverseCharge && (
            <div className="flex justify-between text-xs">
              <span className="text-blue-400">Reverse charge (0% VAT)</span>
              <span className="text-blue-400">$0.00</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[#30363d] pt-2.5">
            <div>
              <span className="text-emerald-400 font-bold text-sm">Total due today</span>
              <p className="text-[#6e7681] text-[10px]">Charged by EndingThisWeek.media</p>
            </div>
            <span className="text-emerald-400 font-black text-xl">${depositTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-[#30363d] pt-2">
            <span className="text-[#8b949e]">Balance to creator (90%) — paid directly</span>
            <span className="text-[#e6edf3]">${balanceAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {listing.slots_remaining <= 2 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400 text-xs font-medium">
            Only {listing.slots_remaining} slot{listing.slots_remaining !== 1 ? 's' : ''} left — secure now
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-xl border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-all"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          <Lock className="w-4 h-4" />
          Proceed to Payment
        </button>
      </div>

      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-[#6e7681] flex-shrink-0 mt-0.5" />
          <p className="text-[#6e7681] text-xs leading-relaxed">
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
      <span className="text-[#6e7681] text-xs flex-shrink-0">{label}</span>
      <span className="text-[#e6edf3] text-xs font-medium text-right">{value || '—'}</span>
    </div>
  );
}
