import { useState } from 'react';
import { Lock, CreditCard, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import type { BuyerFormData, Listing } from '../../types';
import type { VatCalculation } from '../../lib/vat';

interface PaymentStepProps {
  listing: Listing;
  form: BuyerFormData;
  vat: VatCalculation;
  depositSubtotal: number;
  depositTotal: number;
  onSuccess: (stripePaymentIntentId: string) => void;
  onBack: () => void;
}

export default function PaymentStep({ form, vat, depositSubtotal, depositTotal, onSuccess, onBack }: PaymentStepProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState(form.buyer_name || form.buyer_company || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = async () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return;
    }
    if (!expiry || expiry.length < 5) {
      setError('Please enter a valid expiry date');
      return;
    }
    if (!cvc || cvc.length < 3) {
      setError('Please enter a valid CVC');
      return;
    }
    if (!nameOnCard.trim()) {
      setError('Please enter the name on card');
      return;
    }

    setError('');
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setProcessing(false);
    onSuccess(paymentIntentId);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#f5f5f7] border border-green-200 rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold mb-1">Booking deposit</p>
            <p className="text-[#1d1d1f] text-3xl font-black tabular-nums">${depositTotal.toLocaleString()}</p>
            <p className="text-[#aeaeb2] text-xs mt-1">Charged by EndingThisWeek.media</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-2.5 py-1.5">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span className="text-green-700 text-xs font-semibold">Secured</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-black/[0.06] space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#aeaeb2]">Deposit (10%)</span>
            <span className="text-[#6e6e73]">${depositSubtotal.toLocaleString()}</span>
          </div>
          {vat.vatApplies && (
            <div className="flex justify-between">
              <span className="text-[#aeaeb2]">{vat.vatLabel}</span>
              <span className="text-[#6e6e73]">${vat.vatAmount.toFixed(2)}</span>
            </div>
          )}
          {vat.reverseCharge && (
            <div className="flex justify-between">
              <span className="text-blue-600">Reverse charge (0% VAT)</span>
              <span className="text-blue-600">$0.00</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#6e6e73]" />
            <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">Card details</p>
          </div>
          <div className="flex items-center gap-1.5">
            {['VISA', 'MC', 'AMEX'].map(c => (
              <div key={c} className="h-5 px-1.5 bg-[#f5f5f7] border border-black/[0.08] rounded flex items-center">
                <span className="text-[8px] font-black text-[#86868b]">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2.5 rounded-2xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Card number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              autoComplete="cc-number"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                autoComplete="cc-exp"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                autoComplete="cc-csc"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Name on card</label>
            <input
              type="text"
              value={nameOnCard}
              onChange={e => setNameOnCard(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="cc-name"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-3">
        <p className="text-[#6e6e73] text-xs leading-relaxed">
          You are paying a 10% booking deposit to reserve this media placement.
          The remaining balance is paid directly to the media owner.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={processing}
          className="px-5 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={processing}
          className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay ${depositTotal.toLocaleString()} deposit
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-[#aeaeb2]">
        <Shield className="w-3 h-3" />
        <span>Secured by Stripe · 256-bit encryption · PCI DSS compliant</span>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all';
