import { useState } from 'react';
import { Tag, CalendarDays, MessageSquare, AlertTriangle } from 'lucide-react';
import type { BuyerFormData, Listing } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';

interface BookingInfoProps {
  form: BuyerFormData;
  onChange: (updates: Partial<BuyerFormData>) => void;
  listing: Listing;
  onContinue: () => void;
  onBack: () => void;
}

export default function BookingInfo({ form, onChange, listing, onContinue, onBack }: BookingInfoProps) {
  const [error, setError] = useState('');
  const tx = useTranslations();

  const handleContinue = () => {
    if (!form.brand_name.trim()) { setError(tx.booking.brandRequired); return; }
    if (form.brand_name.trim().length > 200) { setError(tx.booking.brandTooLong); return; }
    setError('');
    onContinue();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[#1d1d1f] font-bold text-base mb-1">{tx.booking.title}</h3>
        <p className="text-[#6e6e73] text-sm">{tx.booking.subtitle}</p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3 flex items-start gap-3">
        <div className="w-8 h-8 bg-white border border-black/[0.08] rounded-xl flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-4 h-4 text-[#6e6e73]" />
        </div>
        <div>
          <p className="text-[#1d1d1f] text-xs font-semibold">{listing.property_name}</p>
          <p className="text-[#6e6e73] text-xs">{listing.slot_type} · {listing.date_label}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
            <Tag className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
            {tx.booking.brandName} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.brand_name}
            onChange={e => onChange({ brand_name: e.target.value })}
            placeholder={tx.booking.brandPlaceholder}
            maxLength={200}
            className={inputCls}
          />
          <p className="text-[#aeaeb2] text-xs mt-1">{tx.booking.brandHint}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
            <MessageSquare className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
            {tx.booking.campaignNote} <span className="text-[#aeaeb2] font-normal normal-case">({tx.details.optional})</span>
          </label>
          <textarea
            value={form.campaign_note}
            onChange={e => onChange({ campaign_note: e.target.value })}
            placeholder={tx.booking.campaignPlaceholder}
            rows={3}
            maxLength={500}
            className={inputCls + ' resize-none'}
          />
          <p className="text-[#aeaeb2] text-xs mt-1 text-right">{form.campaign_note.length}/500</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all"
        >
          {tx.booking.back}
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
        >
          {tx.booking.reviewAndPay}
        </button>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all';
