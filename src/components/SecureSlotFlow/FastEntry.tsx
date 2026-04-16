import { useState, useEffect } from 'react';
import { Mail, AlertTriangle, Building2, User, Globe, ChevronDown } from 'lucide-react';
import type { BuyerFormData, PurchaseType } from '../../types';
import { COUNTRIES, getCountryInfo } from '../../lib/vat';

interface FastEntryProps {
  form: BuyerFormData;
  onChange: (updates: Partial<BuyerFormData>) => void;
  onContinue: () => void;
}

export default function FastEntry({ form, onChange, onContinue }: FastEntryProps) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [form.buyer_email, form.purchase_type, form.buyer_country_code]);

  const handleContinue = () => {
    const email = form.buyer_email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (email.length > 254) {
      setError('Email address is too long');
      return;
    }
    setError('');
    onContinue();
  };

  const handleCountryChange = (code: string) => {
    const info = getCountryInfo(code);
    onChange({ buyer_country_code: code, buyer_country: info.name });
  };

  const countryInfo = getCountryInfo(form.buyer_country_code);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#1d1d1f] font-bold text-base mb-1">Reserve your slot</h3>
        <p className="text-[#6e6e73] text-sm">Takes under 60 seconds. No account required.</p>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
        <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold mb-3">Purchase type</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { type: 'business' as PurchaseType, icon: <Building2 className="w-4 h-4" />, label: 'Business', sub: 'Company / brand' },
            { type: 'individual' as PurchaseType, icon: <User className="w-4 h-4" />, label: 'Personal', sub: 'Individual buyer' },
          ]).map(({ type, icon, label, sub }) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ purchase_type: type })}
              className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl border text-left transition-all ${
                form.purchase_type === type
                  ? 'border-black/[0.2] bg-white shadow-sm'
                  : 'border-black/[0.06] bg-white hover:border-black/[0.12]'
              }`}
            >
              <div className={`flex items-center gap-2 font-semibold text-sm ${form.purchase_type === type ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                {icon}
                {label}
              </div>
              <p className="text-[#aeaeb2] text-xs">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
            <input
              type="email"
              value={form.buyer_email}
              onChange={e => onChange({ buyer_email: e.target.value })}
              placeholder="you@company.com"
              autoComplete="email"
              className={inputCls + ' pl-10'}
            />
          </div>
          <p className="text-[#aeaeb2] text-xs mt-1">Booking confirmation sent here</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
            <Globe className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-[#aeaeb2]" />
            Country <span className="text-red-500">*</span>
            {(countryInfo.isEU || countryInfo.isGBR) && (
              <span className="ml-2 text-[10px] text-[#6e6e73] font-normal normal-case">· VAT territory</span>
            )}
          </label>
          <div className="relative">
            <select
              value={form.buyer_country_code}
              onChange={e => handleCountryChange(e.target.value)}
              className={selectCls}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2] pointer-events-none" />
          </div>
          {countryInfo.currency !== 'USD' && (
            <p className="text-[#aeaeb2] text-xs mt-1">
              Local currency: {countryInfo.currencySymbol} {countryInfo.currency}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleContinue}
        className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
      >
        Continue
      </button>

      <p className="text-[#aeaeb2] text-xs text-center leading-relaxed">
        Your data is used only for booking purposes. We collect only what's necessary.
      </p>
    </div>
  );
}

const inputCls = 'w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all';
const selectCls = 'w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all appearance-none pr-10 [color-scheme:light]';
