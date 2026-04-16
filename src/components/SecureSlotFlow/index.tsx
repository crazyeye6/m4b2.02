import { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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

export type Step = 'entry' | 'details' | 'booking' | 'summary' | 'payment' | 'confirmation';

const STEPS: { key: Step; label: string }[] = [
  { key: 'entry', label: 'Email' },
  { key: 'details', label: 'Details' },
  { key: 'booking', label: 'Campaign' },
  { key: 'summary', label: 'Review' },
  { key: 'payment', label: 'Pay' },
  { key: 'confirmation', label: 'Done' },
];

function buildInitialForm(
  profile: import('../../context/AuthContext').UserProfile | null,
  user: import('@supabase/supabase-js').User | null,
): BuyerFormData {
  const detectedCountry = detectUserCountry();
  const detectedCountryInfo = getCountryInfo(detectedCountry);
  return {
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
}

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `ETW-${year}-${rand}`;
}

export default function SecureSlotFlow({ listing, onClose, onSuccess, inline = false }: SecureSlotFlowProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>('entry');
  const [form, setForm] = useState<BuyerFormData>(() => buildInitialForm(profile, user));
  const [vatNumberValid, setVatNumberValid] = useState<boolean | null>(null);
  const [booking, setBooking] = useState<DepositBooking | null>(null);

  const slotsCount = 1;
  const totalPrice = listing.discounted_price * slotsCount;
  const depositSubtotal = Math.round(totalPrice * 0.1);

  const vat = useMemo(() =>
    calculateVAT(depositSubtotal, form.buyer_country_code, form.purchase_type, vatNumberValid === true),
    [depositSubtotal, form.buyer_country_code, form.purchase_type, vatNumberValid]
  );

  const depositTotal = Math.round(vat.total);
  const balanceAmount = totalPrice - depositSubtotal;

  const updateForm = (updates: Partial<BuyerFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handlePaymentSuccess = async (stripePaymentIntentId: string) => {
    const referenceNumber = generateReference();

    const bookingData = {
      reference_number: referenceNumber,
      listing_id: listing.id,
      buyer_name: form.buyer_name,
      buyer_email: form.buyer_email,
      buyer_company: form.purchase_type === 'business' ? form.buyer_company : form.buyer_name,
      buyer_website: form.buyer_website || '',
      buyer_phone: form.buyer_phone || '',
      buyer_country: form.buyer_country,
      message_to_creator: form.campaign_note || '',
      booking_notes: `Brand: ${form.brand_name}. VAT: ${form.buyer_vat_number || 'N/A'}`,
      slots_count: slotsCount,
      price_per_slot: listing.discounted_price,
      total_price: totalPrice,
      deposit_amount: depositTotal,
      balance_amount: balanceAmount,
      stripe_payment_intent_id: stripePaymentIntentId,
      stripe_charge_id: `ch_${Date.now()}`,
      payment_status: 'paid' as const,
      status: 'secured' as const,
      seller_name: listing.media_owner_name,
      seller_email: listing.seller_email || '',
      seller_phone: listing.seller_phone || '',
      seller_website: listing.seller_website || '',
    };

    const { data, error } = await supabase
      .from('deposit_bookings')
      .insert(bookingData)
      .select()
      .single();

    if (!error && data) {
      await supabase
        .from('listings')
        .update({
          status: 'secured',
          slots_remaining: Math.max(0, listing.slots_remaining - slotsCount),
        })
        .eq('id', listing.id);

      sendBookingConfirmationEmails(form.buyer_email, listing.seller_email || '', {
        reference_number: referenceNumber,
        property_name: listing.property_name,
        media_owner_name: listing.media_owner_name,
        date_label: listing.date_label,
        slot_type: listing.slot_type,
        deposit_amount: depositTotal,
        balance_amount: balanceAmount,
        total_price: totalPrice,
        seller_name: listing.media_owner_name,
        seller_email: listing.seller_email || '',
        buyer_name: form.buyer_name,
        buyer_email: form.buyer_email,
        buyer_company: form.purchase_type === 'business' ? form.buyer_company : form.buyer_name,
        buyer_phone: form.buyer_phone || '',
        buyer_website: form.buyer_website || '',
        buyer_country: form.buyer_country,
        message_to_creator: form.campaign_note || '',
      });

      setBooking({ ...data, listing });
      setStep('confirmation');
      onSuccess(listing);
    }
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

  if (inline) {
    return (
      <div className="bg-white border border-black/[0.08] rounded-3xl w-full shadow-sm flex flex-col">
        <div className="border-b border-black/[0.06] px-6 pt-5 pb-4">
          <StepIndicator />
        </div>
        <div className="p-6 flex-1">
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
            <PaymentStep listing={listing} form={form} vat={vat} depositSubtotal={depositSubtotal} depositTotal={depositTotal} onSuccess={handlePaymentSuccess} onBack={() => setStep('summary')} />
          )}
          {step === 'confirmation' && booking && (
            <BookingConfirmation booking={booking} listing={listing} depositTotal={depositTotal} onClose={onClose} />
          )}
        </div>
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
                <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-widest">Secure Slot</span>
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

        <div className="p-6 flex-1">
          {step === 'entry' && (
            <FastEntry
              form={form}
              onChange={updateForm}
              onContinue={() => setStep('details')}
            />
          )}

          {step === 'details' && (
            <BuyerDetails
              form={form}
              onChange={updateForm}
              vatNumberValid={vatNumberValid}
              onVatValidation={setVatNumberValid}
              onContinue={() => setStep('booking')}
              onBack={() => setStep('entry')}
            />
          )}

          {step === 'booking' && (
            <BookingInfo
              form={form}
              onChange={updateForm}
              listing={listing}
              onContinue={() => setStep('summary')}
              onBack={() => setStep('details')}
            />
          )}

          {step === 'summary' && (
            <SummaryPanel
              listing={listing}
              form={form}
              vat={vat}
              depositSubtotal={depositSubtotal}
              depositTotal={depositTotal}
              balanceAmount={balanceAmount}
              totalPrice={totalPrice}
              onContinue={() => setStep('payment')}
              onBack={() => setStep('booking')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              listing={listing}
              form={form}
              vat={vat}
              depositSubtotal={depositSubtotal}
              depositTotal={depositTotal}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep('summary')}
            />
          )}

          {step === 'confirmation' && booking && (
            <BookingConfirmation
              booking={booking}
              listing={listing}
              depositTotal={depositTotal}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
