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
    if (!form.buyer_email.trim() || !form.buyer_email.includes('@')) {
      setError('Please enter a valid email address');
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
        <h3 className="text-[#e6edf3] font-bold text-base mb-1">Reserve your slot</h3>
        <p className="text-[#8b949e] text-sm">Takes under 60 seconds. No account required.</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <p className="text-[#8b949e] text-xs uppercase tracking-wide font-semibold mb-3">Purchase type</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { type: 'business' as PurchaseType, icon: <Building2 className="w-4 h-4" />, label: 'Business', sub: 'Company / brand' },
            { type: 'individual' as PurchaseType, icon: <User className="w-4 h-4" />, label: 'Personal', sub: 'Individual buyer' },
          ]).map(({ type, icon, label, sub }) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ purchase_type: type })}
              className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all ${
                form.purchase_type === type
                  ? 'border-emerald-500/50 bg-emerald-500/[0.06] ring-1 ring-emerald-500/20'
                  : 'border-[#30363d] bg-[#0d1117] hover:border-[#484f58]'
              }`}
            >
              <div className={`flex items-center gap-2 font-semibold text-sm ${form.purchase_type === type ? 'text-emerald-400' : 'text-[#e6edf3]'}`}>
                {icon}
                {label}
              </div>
              <p className="text-[#6e7681] text-xs">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
            Email address <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
            <input
              type="email"
              value={form.buyer_email}
              onChange={e => onChange({ buyer_email: e.target.value })}
              placeholder="you@company.com"
              autoComplete="email"
              className={inputCls + ' pl-10'}
            />
          </div>
          <p className="text-[#6e7681] text-xs mt-1">Booking confirmation sent here</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
            <Globe className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-[#6e7681]" />
            Country <span className="text-amber-500">*</span>
            {(countryInfo.isEU || countryInfo.isGBR) && (
              <span className="ml-2 text-[10px] text-blue-400 font-normal">· VAT territory</span>
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681] pointer-events-none" />
          </div>
          {countryInfo.currency !== 'USD' && (
            <p className="text-[#6e7681] text-xs mt-1">
              Local currency: {countryInfo.currencySymbol} {countryInfo.currency}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleContinue}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/20"
      >
        Continue
      </button>

      <p className="text-[#6e7681] text-xs text-center leading-relaxed">
        Your data is used only for booking purposes. We collect only what's necessary.
      </p>
    </div>
  );
}

const inputCls = 'w-full bg-[#161b22] border border-[#30363d] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-all';
const selectCls = 'w-full bg-[#161b22] border border-[#30363d] focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm outline-none transition-all appearance-none pr-10';
