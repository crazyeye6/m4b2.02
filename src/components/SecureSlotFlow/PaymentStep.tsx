import { useState } from 'react';
import { Lock, CreditCard, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import type { BuyerFormData, Listing } from '../../types';

interface PaymentStepProps {
  listing: Listing;
  form: BuyerFormData;
  slotsCount: number;
  depositAmount: number;
  onSuccess: (stripePaymentIntentId: string) => void;
  onBack: () => void;
}

export default function PaymentStep({ listing, form, slotsCount, depositAmount, onSuccess, onBack }: PaymentStepProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState(form.buyer_name);
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

    const dummyPaymentIntentId = `pi_demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setProcessing(false);
    onSuccess(dummyPaymentIntentId);
  };

  return (
    <div className="space-y-5">
      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-xs uppercase tracking-wide font-semibold mb-1">Deposit due today</p>
            <p className="text-white text-3xl font-black">${depositAmount.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-1">10% of total slot price · Charged by EndingThisWeek.media</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">Secure</span>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Card details</p>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-6 h-4 bg-white/10 rounded-sm flex items-center justify-center">
              <span className="text-[8px] font-black text-white">VISA</span>
            </div>
            <div className="w-6 h-4 bg-white/10 rounded-sm flex items-center justify-center">
              <span className="text-[8px] font-black text-yellow-400">MC</span>
            </div>
            <div className="w-6 h-4 bg-white/10 rounded-sm flex items-center justify-center">
              <span className="text-[8px] font-black text-blue-400">AMEX</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm px-3 py-2.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1.5">Card number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1.5">Expiry date</label>
              <input
                type="text"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-medium mb-1.5">CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-medium mb-1.5">Name on card</label>
            <input
              type="text"
              value={nameOnCard}
              onChange={e => setNameOnCard(e.target.value)}
              placeholder="Jane Smith"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-950/20 border border-amber-500/15 rounded-xl p-4">
        <p className="text-amber-400/80 text-xs font-semibold mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Demo mode
        </p>
        <p className="text-gray-500 text-xs leading-relaxed">
          This is a demo using a simulated payment flow. In production, payments are processed securely via Stripe. No real charge will be made.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          disabled={processing}
          className="px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={processing}
          className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay ${depositAmount.toLocaleString()} deposit
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe · 256-bit SSL encryption</span>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors';
