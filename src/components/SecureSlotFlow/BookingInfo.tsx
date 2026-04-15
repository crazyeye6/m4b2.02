import { useState } from 'react';
import { Tag, CalendarDays, MessageSquare, AlertTriangle } from 'lucide-react';
import type { BuyerFormData, Listing } from '../../types';

interface BookingInfoProps {
  form: BuyerFormData;
  onChange: (updates: Partial<BuyerFormData>) => void;
  listing: Listing;
  onContinue: () => void;
  onBack: () => void;
}

export default function BookingInfo({ form, onChange, listing, onContinue, onBack }: BookingInfoProps) {
  const [error, setError] = useState('');

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleContinue = () => {
    if (!form.brand_name.trim()) { setError('Brand name is required'); return; }
    if (!form.campaign_start_date) { setError('Campaign start date is required'); return; }
    setError('');
    onContinue();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[#e6edf3] font-bold text-base mb-1">Campaign details</h3>
        <p className="text-[#8b949e] text-sm">Shared with the creator to brief your campaign.</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 flex items-start gap-3">
        <div className="w-8 h-8 bg-[#21262d] border border-[#30363d] rounded-lg flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-4 h-4 text-[#8b949e]" />
        </div>
        <div>
          <p className="text-[#e6edf3] text-xs font-semibold">{listing.property_name}</p>
          <p className="text-[#8b949e] text-xs">{listing.slot_type} · {listing.date_label}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
            <Tag className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
            Brand name <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            value={form.brand_name}
            onChange={e => onChange({ brand_name: e.target.value })}
            placeholder="e.g. Acme, MyBrand, ProductName"
            className={inputCls}
          />
          <p className="text-[#6e7681] text-xs mt-1">The brand being advertised in this slot</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
            <CalendarDays className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
            Campaign start date <span className="text-amber-500">*</span>
          </label>
          <input
            type="date"
            value={form.campaign_start_date}
            min={minDateStr}
            onChange={e => onChange({ campaign_start_date: e.target.value })}
            className={inputCls + ' [color-scheme:dark]'}
          />
          <p className="text-[#6e7681] text-xs mt-1">When you intend the campaign to go live</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
            <MessageSquare className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
            Campaign note <span className="text-[#6e7681] font-normal">(optional)</span>
          </label>
          <textarea
            value={form.campaign_note}
            onChange={e => onChange({ campaign_note: e.target.value })}
            placeholder="Brief description of your campaign, product, or any preferences for the creator..."
            rows={3}
            maxLength={500}
            className={inputCls + ' resize-none'}
          />
          <p className="text-[#6e7681] text-xs mt-1 text-right">{form.campaign_note.length}/500</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-xl border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-all"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm"
        >
          Review & Pay
        </button>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-[#161b22] border border-[#30363d] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-all';
