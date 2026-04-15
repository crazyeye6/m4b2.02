import { useState, useEffect } from 'react';
import { User, Building2, AlertTriangle, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import type { BuyerFormData } from '../../types';
import { getCountryInfo, formatVatHint, validateVatFormat } from '../../lib/vat';

interface BuyerDetailsProps {
  form: BuyerFormData;
  onChange: (updates: Partial<BuyerFormData>) => void;
  vatNumberValid: boolean | null;
  onVatValidation: (valid: boolean | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function BuyerDetails({
  form, onChange, vatNumberValid, onVatValidation, onContinue, onBack,
}: BuyerDetailsProps) {
  const [error, setError] = useState('');
  const [vatChecking, setVatChecking] = useState(false);
  const countryInfo = getCountryInfo(form.buyer_country_code);
  const isVATTerritory = countryInfo.isEU || countryInfo.isGBR;
  const isBusiness = form.purchase_type === 'business';

  useEffect(() => {
    if (error) setError('');
  }, [form.buyer_name, form.buyer_company, form.buyer_vat_number]);

  useEffect(() => {
    onVatValidation(null);
  }, [form.buyer_vat_number, form.buyer_country_code]);

  const handleVatCheck = async () => {
    if (!form.buyer_vat_number.trim()) return;
    const isFormatValid = validateVatFormat(form.buyer_vat_number, form.buyer_country_code);
    if (!isFormatValid) {
      onVatValidation(false);
      return;
    }
    setVatChecking(true);
    await new Promise(r => setTimeout(r, 800));
    const cleaned = form.buyer_vat_number.replace(/[\s\-\.]/g, '').toUpperCase();
    const hasPrefix = cleaned.length >= 10 && /^[A-Z]{2}/.test(cleaned);
    onVatValidation(hasPrefix);
    setVatChecking(false);
  };

  const handleContinue = () => {
    if (isBusiness) {
      if (!form.buyer_company.trim()) { setError('Company name is required'); return; }
    } else {
      if (!form.buyer_name.trim()) { setError('Full name is required'); return; }
    }
    setError('');
    onContinue();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[#e6edf3] font-bold text-base mb-1">
          {isBusiness ? 'Business details' : 'Your details'}
        </h3>
        <p className="text-[#8b949e] text-sm">
          {isBusiness ? 'Used for VAT compliance and creator contact.' : 'Shared with the creator after deposit.'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {isBusiness ? (
          <>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                Company name <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
                <input
                  type="text"
                  value={form.buyer_company}
                  onChange={e => onChange({ buyer_company: e.target.value })}
                  placeholder="Acme Inc."
                  autoComplete="organization"
                  className={inputCls + ' pl-10'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                Your name <span className="text-[#6e7681] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
                <input
                  type="text"
                  value={form.buyer_name}
                  onChange={e => onChange({ buyer_name: e.target.value })}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  className={inputCls + ' pl-10'}
                />
              </div>
            </div>

            {isVATTerritory && (
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                  VAT number <span className="text-[#6e7681] font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={form.buyer_vat_number}
                      onChange={e => onChange({ buyer_vat_number: e.target.value.toUpperCase() })}
                      placeholder={formatVatHint(form.buyer_country_code)}
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVatCheck}
                    disabled={!form.buyer_vat_number.trim() || vatChecking}
                    className="flex-shrink-0 px-3 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] text-xs font-medium rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {vatChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                  </button>
                </div>

                {vatNumberValid === true && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    VAT valid — reverse charge applied (0% VAT)
                  </div>
                )}
                {vatNumberValid === false && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-yellow-400">
                    <XCircle className="w-3.5 h-3.5" />
                    Could not validate — {countryInfo.vatRate}% VAT will apply
                  </div>
                )}

                <div className="bg-blue-500/[0.06] border border-blue-500/15 rounded-lg p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[#8b949e] leading-relaxed">
                      <span className="text-blue-400 font-medium">VAT reverse charge: </span>
                      If you have a valid {countryInfo.isGBR ? 'UK' : 'EU'} VAT number and are buying as a business, reverse charge applies — you account for VAT yourself and we charge 0%.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
              Full name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
              <input
                type="text"
                value={form.buyer_name}
                onChange={e => onChange({ buyer_name: e.target.value })}
                placeholder="Jane Smith"
                autoComplete="name"
                className={inputCls + ' pl-10'}
              />
            </div>

            {isVATTerritory && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 mt-3">
                <p className="text-[#8b949e] text-xs">
                  As an individual in a VAT territory, {countryInfo.vatRate}% VAT will be applied to your deposit. To avoid this, switch to a business purchase and enter your VAT number.
                </p>
              </div>
            )}
          </div>
        )}
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
          Continue
        </button>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-[#161b22] border border-[#30363d] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg px-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-all';
