import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Listing, BuyerFormData, DepositBooking } from '../../types';
import BookingSummary from './BookingSummary';
import BuyerDetailsForm from './BuyerDetailsForm';
import PaymentStep from './PaymentStep';
import BookingConfirmation from './BookingConfirmation';

interface SecureSlotFlowProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: (listing: Listing) => void;
}

type Step = 'summary' | 'details' | 'payment' | 'confirmation';

const INITIAL_FORM: BuyerFormData = {
  buyer_name: '',
  buyer_email: '',
  buyer_company: '',
  buyer_website: '',
  buyer_phone: '',
  buyer_country: '',
  message_to_creator: '',
  booking_notes: '',
};

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `ETW-${year}-${rand}`;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'details', label: 'Your Details' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirmation', label: 'Confirmed' },
];

export default function SecureSlotFlow({ listing, onClose, onSuccess }: SecureSlotFlowProps) {
  const [step, setStep] = useState<Step>('summary');
  const [form, setForm] = useState<BuyerFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [booking, setBooking] = useState<DepositBooking | null>(null);
  const slotsCount = 1;

  const totalPrice = listing.discounted_price * slotsCount;
  const depositAmount = Math.round(totalPrice * 0.1);
  const balanceAmount = totalPrice - depositAmount;

  const updateForm = (k: keyof BuyerFormData, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
  };

  const validateDetails = (): string => {
    if (!form.buyer_name.trim()) return 'Full name is required';
    if (!form.buyer_company.trim()) return 'Company name is required';
    if (!form.buyer_email.trim() || !form.buyer_email.includes('@')) return 'Valid email is required';
    if (!form.buyer_country) return 'Please select your billing country';
    return '';
  };

  const handleDetailsNext = () => {
    const err = validateDetails();
    if (err) { setFormError(err); return; }
    setFormError('');
    setStep('payment');
  };

  const handlePaymentSuccess = async (stripePaymentIntentId: string) => {
    const referenceNumber = generateReference();

    const bookingData = {
      reference_number: referenceNumber,
      listing_id: listing.id,
      buyer_name: form.buyer_name,
      buyer_email: form.buyer_email,
      buyer_company: form.buyer_company,
      buyer_website: form.buyer_website || '',
      buyer_phone: form.buyer_phone || '',
      buyer_country: form.buyer_country,
      message_to_creator: form.message_to_creator || '',
      booking_notes: form.booking_notes || '',
      slots_count: slotsCount,
      price_per_slot: listing.discounted_price,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      balance_amount: balanceAmount,
      stripe_payment_intent_id: stripePaymentIntentId,
      stripe_charge_id: `ch_demo_${Date.now()}`,
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

      setBooking({ ...data, listing });
      setStep('confirmation');
      onSuccess(listing);
    }
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const isConfirmed = step === 'confirmation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isConfirmed ? onClose : undefined} />

      <div className="relative bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-[#111118] border-b border-white/8 px-6 py-4 z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-lg">Secure Slot</h2>
              <p className="text-gray-500 text-sm mt-0.5 truncate max-w-[260px]">{listing.property_name}</p>
            </div>
            {!isConfirmed && (
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mt-0.5 ml-3 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all
                      ${done ? 'bg-emerald-500 text-black' : active ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-600'}`}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[11px] font-medium whitespace-nowrap ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px flex-1 mx-2 transition-colors ${done ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 flex-1">
          {step === 'summary' && (
            <BookingSummary
              listing={listing}
              slotsCount={slotsCount}
              onContinue={() => setStep('details')}
            />
          )}

          {step === 'details' && (
            <BuyerDetailsForm
              form={form}
              onChange={updateForm}
              onContinue={handleDetailsNext}
              onBack={() => setStep('summary')}
              error={formError}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              listing={listing}
              form={form}
              slotsCount={slotsCount}
              depositAmount={depositAmount}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep('details')}
            />
          )}

          {step === 'confirmation' && booking && (
            <BookingConfirmation
              booking={booking}
              listing={listing}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
