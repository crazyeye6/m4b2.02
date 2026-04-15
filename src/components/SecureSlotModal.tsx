import { X, Shield, CheckCircle, Loader2, Lock, Zap, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Listing, SlotBooking } from '../types';
import CountdownTimer from './CountdownTimer';

interface SecureSlotModalProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: (listing: Listing, type: 'review' | 'proceed') => void;
}

const INITIAL: Omit<SlotBooking, 'listing_id'> = {
  company_name: '',
  contact_name: '',
  email: '',
  campaign_name: '',
  campaign_url: '',
  brief: '',
  budget_confirmed: false,
  creative_ready: false,
  booking_type: 'review',
};

export default function SecureSlotModal({ listing, onClose, onSuccess }: SecureSlotModalProps) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [bookingType, setBookingType] = useState<'review' | 'proceed'>('review');
  const [error, setError] = useState('');

  const discount = Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100);

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.company_name.trim()) return 'Company name is required';
    if (!form.contact_name.trim()) return 'Contact name is required';
    if (!form.email.trim() || !form.email.includes('@')) return 'Valid email is required';
    if (!form.campaign_name.trim()) return 'Campaign name is required';
    if (!form.brief.trim()) return 'Brief is required';
    if (!form.budget_confirmed) return 'Please confirm your budget';
    return '';
  };

  const handleSubmit = async (type: 'review' | 'proceed') => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);

    const booking: SlotBooking = { ...form, listing_id: listing.id, booking_type: type };

    const { error: dbErr } = await supabase.from('slot_bookings').insert(booking);
    if (dbErr) { setError(dbErr.message); setSubmitting(false); return; }

    const holdExpires = new Date(Date.now() + (type === 'review' ? 86400000 : 21600000)).toISOString();
    await supabase
      .from('listings')
      .update({
        status: type === 'review' ? 'pending_review' : 'securing',
        hold_expires_at: holdExpires,
      })
      .eq('id', listing.id);

    setBookingType(type);
    setSubmitting(false);
    setStep('success');
    onSuccess(listing, type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-start justify-between z-10">
          <div>
            <h2 className="text-[#1d1d1f] font-bold text-lg">Secure Slot</h2>
            <p className="text-[#aeaeb2] text-sm mt-0.5">{listing.property_name}</p>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors mt-0.5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'success' ? (
          <SuccessState listing={listing} bookingType={bookingType} onClose={onClose} />
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[#86868b] text-xs uppercase tracking-wide font-semibold">Securing</p>
                  <p className="text-[#1d1d1f] font-bold">{listing.slot_type} — {listing.date_label}</p>
                </div>
                <CountdownTimer deadline={listing.deadline_at} compact />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-[#1d1d1f]">${listing.discounted_price.toLocaleString()}</span>
                <span className="text-[#aeaeb2] line-through text-sm pb-1">${listing.original_price.toLocaleString()}</span>
                <span className="text-green-600 text-sm font-semibold pb-1">-{discount}%</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-[#1d1d1f] text-sm font-semibold uppercase tracking-wide">Campaign details</h3>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Company name" required>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={e => update('company_name', e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
                  />
                </Field>
                <Field label="Contact name" required>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={e => update('contact_name', e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
                  />
                </Field>
              </div>

              <Field label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="jane@acme.com"
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
                />
              </Field>

              <Field label="Campaign name" required>
                <input
                  type="text"
                  value={form.campaign_name}
                  onChange={e => update('campaign_name', e.target.value)}
                  placeholder="Q2 Product Launch"
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
                />
              </Field>

              <Field label="Campaign URL">
                <input
                  type="url"
                  value={form.campaign_url}
                  onChange={e => update('campaign_url', e.target.value)}
                  placeholder="https://acme.com/product"
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
                />
              </Field>

              <Field label="Brief" required>
                <textarea
                  value={form.brief}
                  onChange={e => update('brief', e.target.value)}
                  placeholder="What are you promoting? Who's the target audience? Any key messages?"
                  rows={3}
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
                />
              </Field>

              <div className="space-y-2">
                <CheckItem
                  checked={form.budget_confirmed}
                  onChange={v => update('budget_confirmed', v)}
                  label={`I confirm the budget of $${listing.discounted_price.toLocaleString()} for this placement`}
                />
                <CheckItem
                  checked={form.creative_ready}
                  onChange={v => update('creative_ready', v)}
                  label="Creative assets are ready (or will be within 24 hours)"
                />
              </div>
            </div>

            <div className="border-t border-black/[0.06] pt-4 space-y-3">
              <p className="text-[#86868b] text-xs">Choose how you want to proceed:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSubmit('review')}
                  disabled={submitting}
                  className="flex flex-col items-center gap-1.5 border border-black/[0.08] hover:border-black/[0.15] hover:bg-[#f5f5f7] rounded-2xl px-4 py-3.5 text-center transition-all group"
                >
                  <Shield className="w-5 h-5 text-[#6e6e73] group-hover:scale-110 transition-transform" />
                  <span className="text-[#1d1d1f] text-sm font-semibold">Secure for Review</span>
                  <span className="text-[#aeaeb2] text-xs">Hold up to 24 hours</span>
                </button>
                <button
                  onClick={() => handleSubmit('proceed')}
                  disabled={submitting}
                  className="flex flex-col items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] rounded-2xl px-4 py-3.5 text-center transition-all group"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 text-white group-hover:scale-110 transition-transform fill-white" />
                  )}
                  <span className="text-white text-sm font-bold">Secure & Proceed</span>
                  <span className="text-white/50 text-xs">Hold up to 6 hours</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckItem({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 text-left w-full"
    >
      <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
        ${checked ? 'bg-[#1d1d1f] border-[#1d1d1f]' : 'border-black/[0.15] bg-[#f5f5f7]'}`}
      >
        {checked && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      <span className="text-[#6e6e73] text-sm leading-snug">{label}</span>
    </button>
  );
}

function SuccessState({ listing, bookingType, onClose }: { listing: Listing; bookingType: 'review' | 'proceed'; onClose: () => void }) {
  const holdHours = bookingType === 'review' ? 24 : 6;
  return (
    <div className="p-8 text-center flex flex-col items-center gap-5">
      <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-3xl flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-[#1d1d1f] font-bold text-xl mb-2">Slot Secured!</h3>
        <p className="text-[#6e6e73] text-sm leading-relaxed max-w-xs mx-auto">
          <strong className="text-[#1d1d1f]">{listing.property_name}</strong> is now on hold for{' '}
          <strong className="text-[#1d1d1f]">{holdHours} hours</strong>. The seller has been notified.
        </p>
      </div>
      <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4 w-full text-left space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#86868b]">Status</span>
          <span className={`font-semibold ${bookingType === 'review' ? 'text-orange-600' : 'text-blue-600'}`}>
            {bookingType === 'review' ? 'Pending Review' : 'Being Secured'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#86868b]">Hold expires</span>
          <span className="text-[#1d1d1f] font-medium">In {holdHours} hours</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#86868b]">Price locked</span>
          <span className="text-green-600 font-bold">${listing.discounted_price.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-[#aeaeb2]">
        <Lock className="w-3 h-3" />
        A confirmation has been sent to your email
      </div>
      <button onClick={onClose} className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold py-3 rounded-2xl transition-all">
        Done
      </button>
    </div>
  );
}
