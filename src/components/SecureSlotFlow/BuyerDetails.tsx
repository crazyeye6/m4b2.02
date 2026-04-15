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
        <h3 className="text-[#1d1d1f] font-bold text-base mb-1">
          {isBusiness ? 'Business details' : 'Your details'}
        </h3>
        <p className="text-[#6e6e73] text-sm">
          {isBusiness ? 'Used for VAT compliance and creator contact.' : 'Shared with the creator after deposit.'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {isBusiness ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                Company name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
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
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                Your name <span className="text-[#aeaeb2] font-normal normal-case">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
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
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  VAT number <span className="text-[#aeaeb2] font-normal normal-case">(optional)</span>
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
                    className="flex-shrink-0 px-3 py-2.5 bg-[#f5f5f7] hover:bg-white border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-xs font-semibold rounded-2xl transition-all disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {vatChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                  </button>
                </div>

                {vatNumberValid === true && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    VAT valid — reverse charge applied (0% VAT)
                  </div>
                )}
                {vatNumberValid === false && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-orange-600">
                    <XCircle className="w-3.5 h-3.5" />
                    Could not validate — {countryInfo.vatRate}% VAT will apply
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[#6e6e73] leading-relaxed">
                      <span className="text-blue-600 font-medium">VAT reverse charge: </span>
                      If you have a valid {countryInfo.isGBR ? 'UK' : 'EU'} VAT number and are buying as a business, reverse charge applies — you account for VAT yourself and we charge 0%.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Full name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
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
              <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3 mt-3">
                <p className="text-[#6e6e73] text-xs">
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
          className="px-5 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all';
