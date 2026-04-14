import { AlertTriangle } from 'lucide-react';
import type { BuyerFormData } from '../../types';

interface BuyerDetailsFormProps {
  form: BuyerFormData;
  onChange: (k: keyof BuyerFormData, v: string) => void;
  onContinue: () => void;
  onBack: () => void;
  error: string;
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Spain', 'Italy', 'Sweden', 'Denmark', 'Norway',
  'Switzerland', 'Singapore', 'Japan', 'South Korea', 'India', 'Brazil',
  'Mexico', 'South Africa', 'UAE', 'Other',
];

export default function BuyerDetailsForm({ form, onChange, onContinue, onBack, error }: BuyerDetailsFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white text-sm font-semibold mb-1">Your details</h3>
        <p className="text-gray-400 text-xs">Shared with the creator after deposit payment</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm px-4 py-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" required>
            <input
              type="text"
              value={form.buyer_name}
              onChange={e => onChange('buyer_name', e.target.value)}
              placeholder="Jane Smith"
              className={inputCls}
            />
          </Field>
          <Field label="Company name" required>
            <input
              type="text"
              value={form.buyer_company}
              onChange={e => onChange('buyer_company', e.target.value)}
              placeholder="Acme Inc."
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Email address" required>
          <input
            type="email"
            value={form.buyer_email}
            onChange={e => onChange('buyer_email', e.target.value)}
            placeholder="jane@acme.com"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Website" optional>
            <input
              type="url"
              value={form.buyer_website}
              onChange={e => onChange('buyer_website', e.target.value)}
              placeholder="https://acme.com"
              className={inputCls}
            />
          </Field>
          <Field label="Phone / WhatsApp" optional>
            <input
              type="tel"
              value={form.buyer_phone}
              onChange={e => onChange('buyer_phone', e.target.value)}
              placeholder="+1 555 0100"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Billing country" required>
          <select
            value={form.buyer_country}
            onChange={e => onChange('buyer_country', e.target.value)}
            className={selectCls}
          >
            <option value="">Select country...</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Message to creator" optional>
          <textarea
            value={form.message_to_creator}
            onChange={e => onChange('message_to_creator', e.target.value)}
            placeholder="Tell the creator about your brand, campaign goals, or anything relevant..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Booking notes / requirements" optional>
          <textarea
            value={form.booking_notes}
            onChange={e => onChange('booking_notes', e.target.value)}
            placeholder="Any specific requirements, scheduling preferences, or creative notes..."
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm font-medium transition-all"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, optional, children }: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 font-medium mb-1.5">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
        {optional && <span className="text-gray-400 ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors';
const selectCls = 'w-full bg-[#1a1a28] border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-colors';
