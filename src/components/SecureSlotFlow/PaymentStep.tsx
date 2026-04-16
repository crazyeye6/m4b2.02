import { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import type { BuyerFormData, Listing } from '../../types';
import type { VatCalculation } from '../../lib/vat';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';

interface PaymentStepProps {
  listing: Listing;
  form: BuyerFormData;
  vat: VatCalculation;
  depositSubtotal: number;
  depositTotal: number;
  onSuccess: (stripePaymentIntentId: string) => Promise<{ ok: boolean; error?: string }> | void;
  onBack: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let stripePromise: ReturnType<typeof loadStripe> | null = null;
let resolvedKey: string | null = null;

async function getStripeInstance(): Promise<Stripe | null> {
  if (!resolvedKey) {
    const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (envKey && envKey.startsWith('pk_')) {
      resolvedKey = envKey;
    } else {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'stripe_publishable_key')
        .maybeSingle();
      const dbKey = data?.value;
      if (dbKey && dbKey.startsWith('pk_')) resolvedKey = dbKey;
    }
  }
  if (!resolvedKey) return null;
  if (!stripePromise) stripePromise = loadStripe(resolvedKey);
  return stripePromise;
}

async function createPaymentIntent(amountInCents: number, listingId: string, propertyName: string, buyerEmail: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        listing_id: listingId,
        property_name: propertyName,
        buyer_email: buyerEmail,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.client_secret) throw new Error(data.error ?? 'Failed to initialise payment');
  return data as { client_secret: string; payment_intent_id: string };
}

export default function PaymentStep({ listing, form, vat, depositSubtotal, depositTotal, onSuccess, onBack }: PaymentStepProps) {
  const [loading, setLoading] = useState(true);
  const [stripeReady, setStripeReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [noKey, setNoKey] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const paymentIntentIdRef = useRef<string | null>(null);
  const initialisedRef = useRef(false);

  const amountInCents = Math.round(depositTotal * 100);

  const initialise = useCallback(async () => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    setLoading(true);
    setStripeReady(false);
    setError('');
    try {
      const [stripe, intent] = await Promise.all([
        getStripeInstance(),
        createPaymentIntent(amountInCents, listing.id, listing.property_name, form.buyer_email),
      ]);

      if (!stripe) { setNoKey(true); setLoading(false); return; }

      stripeRef.current = stripe;
      paymentIntentIdRef.current = intent.payment_intent_id;

      const elements = stripe.elements({
        clientSecret: intent.client_secret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#1d1d1f',
            colorBackground: '#f5f5f7',
            colorText: '#1d1d1f',
            colorDanger: '#ef4444',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            borderRadius: '16px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: 'none',
              fontSize: '14px',
              padding: '12px',
            },
            '.Input:focus': {
              border: '1px solid rgba(0,0,0,0.2)',
              boxShadow: 'none',
              backgroundColor: '#ffffff',
            },
            '.Label': {
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#86868b',
            },
          },
        },
      });

      elementsRef.current = elements;

      const paymentElement = elements.create('payment', {
        layout: 'tabs',
        defaultValues: {
          billingDetails: {
            name: form.buyer_name || form.buyer_company || '',
            email: form.buyer_email,
          },
        },
      });

      paymentElement.on('ready', () => {
        setStripeReady(true);
        setLoading(false);
      });

      if (mountRef.current) {
        paymentElement.mount(mountRef.current);
      } else {
        await new Promise<void>(resolve => {
          const interval = setInterval(() => {
            if (mountRef.current) {
              clearInterval(interval);
              paymentElement.mount(mountRef.current);
              resolve();
            }
          }, 50);
        });
      }
    } catch (e: unknown) {
      initialisedRef.current = false;
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, [amountInCents, listing.id, listing.property_name, form.buyer_email, form.buyer_name, form.buyer_company]);

  useEffect(() => {
    initialise();
    return () => {
      elementsRef.current = null;
      stripeRef.current = null;
    };
  }, [initialise]);

  const handleSubmit = async () => {
    if (!stripeRef.current || !elementsRef.current || !paymentIntentIdRef.current) return;
    setError('');
    setProcessing(true);

    const { error: submitError } = await elementsRef.current.submit();
    if (submitError) {
      setError(submitError.message ?? 'Payment failed');
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: form.buyer_name || form.buyer_company,
            email: form.buyer_email,
          },
        },
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed');
      setProcessing(false);
      return;
    }

    try {
      const result = await onSuccess(paymentIntentIdRef.current);
      if (result && result.ok === false) {
        setError(result.error ?? 'Payment succeeded but booking could not be saved. Please contact support.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error after payment. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  if (noKey) {
    return (
      <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-3 rounded-2xl">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Payments are not yet configured. Please contact the site administrator to add the Stripe key in Admin &rarr; Settings.
      </div>
    );
  }

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
              <span className="text-[#6e6e73]">Reverse charge (0% VAT)</span>
              <span className="text-[#6e6e73]">$0.00</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2.5 rounded-2xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            {!stripeReady && (
              <button
                onClick={() => initialise()}
                className="mt-1.5 text-xs font-semibold underline hover:no-underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">Payment details</p>
        </div>
        <div className="p-4 min-h-[120px] relative">
          {(loading || !stripeReady) && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-[#aeaeb2] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing secure payment...
            </div>
          )}
          <div
            ref={mountRef}
            style={{ opacity: stripeReady ? 1 : 0, transition: 'opacity 0.3s' }}
          />
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
          disabled={processing || loading || !stripeReady}
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
