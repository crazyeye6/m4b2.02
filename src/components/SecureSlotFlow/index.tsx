import { useState, useMemo, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslations } from '../../hooks/useTranslations';
import { sendBookingConfirmationEmails } from '../../lib/email';
import type { Listing, BuyerFormData, DepositBooking } from '../../types';
import { calculateVAT, detectUserCountry, getCountryInfo } from '../../lib/vat';
import { useAuth } from '../../context/AuthContext';
import FastEntry from './FastEntry';
import BuyerDetails from './BuyerDetails';
import BookingInfo from './BookingInfo';
import SummaryPanel from './SummaryPanel';
import PaymentStep from './PaymentStep';
import BookingConfirmation from './BookingConfirmation';

interface SecureSlotFlowProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: (listing: Listing) => void;
  inline?: boolean;
}

interface PaymentSuccessResult {
  ok: boolean;
  error?: string;
}

export type Step = 'entry' | 'details' | 'booking' | 'summary' | 'payment' | 'confirmation';


function storageKey(listingId: string) {
  return `etw_checkout:${listingId}`;
}

function loadPersistedForm(listingId: string): Partial<BuyerFormData> | null {
  try {
    const raw = localStorage.getItem(storageKey(listingId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Partial<BuyerFormData>;
  } catch {
    return null;
  }
}

function buildInitialForm(
  profile: import('../../context/AuthContext').UserProfile | null,
  user: import('@supabase/supabase-js').User | null,
  listingId: string,
): BuyerFormData {
  const detectedCountry = detectUserCountry();
  const detectedCountryInfo = getCountryInfo(detectedCountry);
  const persisted = loadPersistedForm(listingId);
  const defaults: BuyerFormData = {
    purchase_type: 'business',
    buyer_email: user?.email ?? '',
    buyer_country: detectedCountryInfo.name,
    buyer_country_code: detectedCountry,
    buyer_name: profile?.display_name ?? '',
    buyer_company: profile?.company ?? '',
    buyer_vat_number: '',
    brand_name: profile?.company ?? '',
    campaign_start_date: '',
    campaign_note: '',
    buyer_website: profile?.seller_website_url ?? profile?.website ?? '',
    buyer_phone: profile?.phone ?? '',
    message_to_creator: '',
    booking_notes: '',
  };
  return { ...defaults, ...(persisted ?? {}) };
}

export default function SecureSlotFlow({ listing, onClose, onSuccess, inline = false }: SecureSlotFlowProps) {
  const { user, profile } = useAuth();
  const tx = useTranslations();
  const STEPS: { key: Step; label: string }[] = [
    { key: 'entry', label: tx.flow.stepEmail },
    { key: 'details', label: tx.flow.stepDetails },
    { key: 'booking', label: tx.flow.stepCampaign },
    { key: 'summary', label: tx.flow.stepReview },
    { key: 'payment', label: tx.flow.stepPay },
    { key: 'confirmation', label: tx.flow.stepDone },
  ];
  const [step, setStep] = useState<Step>('entry');
  const [form, setForm] = useState<BuyerFormData>(() => buildInitialForm(profile, user, listing.id));
  const [vatNumberValid, setVatNumberValid] = useState<boolean | null>(null);
  const [booking, setBooking] = useState<DepositBooking | null>(null);
  const persistTimerRef = useRef<number | null>(null);

  const slotsCount = 1;
  const totalPrice = listing.discounted_price * slotsCount;
  const depositSubtotal = Math.round(totalPrice * 0.05);

  const vat = useMemo(() =>
    calculateVAT(depositSubtotal, form.buyer_country_code, form.purchase_type, vatNumberValid === true),
    [depositSubtotal, form.buyer_country_code, form.purchase_type, vatNumberValid]
  );

  const depositTotal = Math.round(vat.total);
  const balanceAmount = totalPrice - depositSubtotal;

  useEffect(() => {
    if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey(listing.id), JSON.stringify(form));
      } catch {
        // storage unavailable
      }
    }, 250);
    return () => {
      if (persistTimerRef.current) window.clearTimeout(persistTimerRef.current);
    };
  }, [form, listing.id]);

  const updateForm = (updates: Partial<BuyerFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handlePaymentSuccess = async ({
    booking_id,
    reference_number,
  }: { stripe_payment_intent_id: string; booking_id: string; reference_number: string }): Promise<PaymentSuccessResult> => {
    const { data, error } = await supabase
      .from('deposit_bookings')
      .select('*')
      .eq('id', booking_id)
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        error: `Payment processed (ref ${reference_number}). Booking will be confirmed shortly — if not, please contact support.`,
      };
    }

    const effectiveBuyerName = data.buyer_name;
    const effectiveBuyerCompany = data.buyer_company;
    const effectiveCountry = data.buyer_country;

    await sendBookingConfirmationEmails(form.buyer_email, listing.seller_email || '', {
      reference_number,
      property_name: listing.property_name,
      media_owner_name: listing.media_owner_name,
      date_label: listing.date_label,
      slot_type: listing.slot_type,
      deposit_amount: depositTotal,
      balance_amount: balanceAmount,
      total_price: totalPrice,
      seller_name: listing.media_owner_name,
      seller_email: listing.seller_email || '',
      buyer_name: effectiveBuyerName,
      buyer_email: form.buyer_email,
      buyer_company: effectiveBuyerCompany,
      buyer_phone: form.buyer_phone || '',
      buyer_website: form.buyer_website || '',
      buyer_country: effectiveCountry,
      message_to_creator: form.campaign_note || '',
    });

    try {
      localStorage.removeItem(storageKey(listing.id));
    } catch {
      // ignore
    }

    setBooking({ ...data, listing });
    setStep('confirmation');
    onSuccess(listing);
    return { ok: true };
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const isConfirmed = step === 'confirmation';

  const StepIndicator = () => (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div key={s.key} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all
                ${done ? 'bg-green-600 text-white' : active ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] border border-black/[0.08] text-[#aeaeb2]'}`}
              >
                {done ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block whitespace-nowrap ${active ? 'text-[#1d1d1f]' : done ? 'text-green-600' : 'text-[#aeaeb2]'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1.5 transition-colors ${done ? 'bg-green-300' : 'bg-black/[0.08]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const content = (
    <>
      {step === 'entry' && (
        <FastEntry form={form} onChange={updateForm} onContinue={() => setStep('details')} />
      )}
      {step === 'details' && (
        <BuyerDetails form={form} onChange={updateForm} vatNumberValid={vatNumberValid} onVatValidation={setVatNumberValid} onContinue={() => setStep('booking')} onBack={() => setStep('entry')} />
      )}
      {step === 'booking' && (
        <BookingInfo form={form} onChange={updateForm} listing={listing} onContinue={() => setStep('summary')} onBack={() => setStep('details')} />
      )}
      {step === 'summary' && (
        <SummaryPanel listing={listing} form={form} vat={vat} depositSubtotal={depositSubtotal} depositTotal={depositTotal} balanceAmount={balanceAmount} totalPrice={totalPrice} onContinue={() => setStep('payment')} onBack={() => setStep('booking')} />
      )}
      {step === 'payment' && (
        <PaymentStep listing={listing} form={form} vat={vat} depositSubtotal={depositSubtotal} depositTotal={depositTotal} slotsCount={slotsCount} onSuccess={handlePaymentSuccess} onBack={() => setStep('summary')} />
      )}
      {step === 'confirmation' && booking && (
        <BookingConfirmation booking={booking} listing={listing} depositTotal={depositTotal} onClose={onClose} />
      )}
    </>
  );

  if (inline) {
    return (
      <div className="bg-white border border-black/[0.08] rounded-3xl w-full shadow-sm flex flex-col">
        <div className="border-b border-black/[0.06] px-6 pt-5 pb-4">
          <StepIndicator />
        </div>
        <div className="p-6 flex-1">{content}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={!isConfirmed ? onClose : undefined}
      />

      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg max-h-[94vh] overflow-y-auto shadow-2xl shadow-black/[0.12] flex flex-col">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 pt-5 pb-4 z-10">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest">{tx.checkout.secureSlot}</span>
              </div>
              <h2 className="text-[#1d1d1f] font-bold text-base leading-tight truncate max-w-[280px]">
                {listing.property_name}
              </h2>
              <p className="text-[#aeaeb2] text-xs mt-0.5">{listing.media_owner_name}</p>
            </div>
            {!isConfirmed && (
              <button
                onClick={onClose}
                className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors ml-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <StepIndicator />
        </div>

        <div className="p-6 flex-1">{content}</div>
      </div>
    </div>
  );
}
