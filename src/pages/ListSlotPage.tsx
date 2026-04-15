import { useState, useMemo } from 'react';
import {
  Mail, Mic, Instagram, ChevronLeft, CheckCircle, AlertTriangle,
  Loader2, Info, DollarSign, Users, MapPin, Calendar, BarChart2,
  Tag, Shield, Zap, Plus, X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendSlotListedEmail } from '../lib/email';
import { useAuth } from '../context/AuthContext';
import type { MediaType } from '../types';

interface ListSlotPageProps {
  onBack: () => void;
}

interface FormData {
  media_type: MediaType;
  media_owner_name: string;
  media_company_name: string;
  property_name: string;
  audience: string;
  location: string;
  subscribers: string;
  open_rate: string;
  ctr: string;
  downloads: string;
  ad_type: string;
  followers: string;
  engagement_rate: string;
  deliverable: string;
  slot_type: string;
  date_label: string;
  deadline_at: string;
  original_price: string;
  discounted_price: string;
  slots_remaining: string;
  past_advertisers: string[];
  advertiser_input: string;
}

const INITIAL: FormData = {
  media_type: 'newsletter',
  media_owner_name: '',
  media_company_name: '',
  property_name: '',
  audience: '',
  location: '',
  subscribers: '',
  open_rate: '',
  ctr: '',
  downloads: '',
  ad_type: '',
  followers: '',
  engagement_rate: '',
  deliverable: '',
  slot_type: '',
  date_label: '',
  deadline_at: '',
  original_price: '',
  discounted_price: '',
  slots_remaining: '1',
  past_advertisers: [],
  advertiser_input: '',
};

const MEDIA_TYPES: Array<{ value: MediaType; label: string; icon: React.ReactNode; desc: string }> = [
  { value: 'newsletter', label: 'Newsletter', icon: <Mail className="w-5 h-5" />, desc: 'Email newsletter sponsorships and dedicated sends' },
  { value: 'podcast', label: 'Podcast', icon: <Mic className="w-5 h-5" />, desc: 'Pre-roll, mid-roll, and post-roll ad placements' },
  { value: 'influencer', label: 'Influencer', icon: <Instagram className="w-5 h-5" />, desc: 'Social media posts, reels, stories, and videos' },
];

const NEWSLETTER_SLOT_TYPES = ['Featured sponsor', 'Banner + mention', 'Dedicated send', 'Native ad', 'Footer sponsor', 'Solo blast'];
const PODCAST_AD_TYPES = ['Pre-roll', 'Mid-roll host read', 'Mid-roll produced', 'Post-roll', 'Sponsorship segment'];
const PODCAST_SLOT_TYPES = ['Pre-roll', 'Mid-roll host read', 'Mid-roll produced', 'Post-roll', 'Sponsorship segment'];
const INFLUENCER_DELIVERABLES = ['Reel + Stories', 'TikTok video', 'Post + Stories', 'YouTube integration', 'Instagram post', 'Dedicated reel', 'Story series'];
const INFLUENCER_SLOT_TYPES = ['Reel + Stories', 'TikTok video', 'Post + Stories', 'YouTube integration', 'Instagram post', 'Dedicated reel', 'Story series'];

const DATE_LABELS = ['Today', 'Tomorrow', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'This weekend', 'This week', 'Next 3 days'];

const LOCATIONS = ['US', 'UK', 'US / UK', 'Ireland / UK / US', 'UK / Europe', 'Europe', 'Global', 'APAC', 'LATAM'];

function getMinDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 16);
}

function getMaxDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 35);
  return d.toISOString().slice(0, 16);
}

export default function ListSlotPage({ onBack }: ListSlotPageProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const discount = useMemo(() => {
    const orig = parseFloat(form.original_price);
    const disc = parseFloat(form.discounted_price);
    if (!orig || !disc || orig <= 0 || disc >= orig) return null;
    return Math.round(((orig - disc) / orig) * 100);
  }, [form.original_price, form.discounted_price]);

  const savings = useMemo(() => {
    const orig = parseFloat(form.original_price);
    const disc = parseFloat(form.discounted_price);
    if (!orig || !disc) return null;
    return orig - disc;
  }, [form.original_price, form.discounted_price]);

  const addAdvertiser = () => {
    const val = form.advertiser_input.trim();
    if (!val || form.past_advertisers.includes(val)) return;
    set('past_advertisers', [...form.past_advertisers, val]);
    set('advertiser_input', '');
  };

  const removeAdvertiser = (a: string) =>
    set('past_advertisers', form.past_advertisers.filter(x => x !== a));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.media_owner_name.trim()) e.media_owner_name = 'Required';
    if (!form.media_company_name.trim()) e.media_company_name = 'Required';
    if (!form.property_name.trim()) e.property_name = 'Required';
    if (!form.audience.trim()) e.audience = 'Required';
    if (!form.location) e.location = 'Required';
    if (!form.slot_type) e.slot_type = 'Required';
    if (!form.date_label) e.date_label = 'Required';
    if (!form.deadline_at) e.deadline_at = 'Required';
    if (!form.original_price || isNaN(parseFloat(form.original_price))) e.original_price = 'Required';
    if (!form.discounted_price || isNaN(parseFloat(form.discounted_price))) e.discounted_price = 'Required';
    if (parseFloat(form.discounted_price) >= parseFloat(form.original_price)) {
      e.discounted_price = 'Must be less than original price';
    }
    if (!form.slots_remaining || parseInt(form.slots_remaining) < 1) e.slots_remaining = 'Required';

    if (form.media_type === 'newsletter') {
      if (!form.subscribers) e.subscribers = 'Required';
    }
    if (form.media_type === 'podcast') {
      if (!form.downloads) e.downloads = 'Required';
      if (!form.ad_type) e.ad_type = 'Required';
    }
    if (form.media_type === 'influencer') {
      if (!form.followers) e.followers = 'Required';
      if (!form.deliverable) e.deliverable = 'Required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      media_type: form.media_type,
      media_owner_name: form.media_owner_name.trim(),
      media_company_name: form.media_company_name.trim(),
      property_name: form.property_name.trim(),
      audience: form.audience.trim(),
      location: form.location,
      subscribers: form.media_type === 'newsletter' && form.subscribers ? parseInt(form.subscribers) : null,
      open_rate: form.media_type === 'newsletter' && form.open_rate ? form.open_rate.trim() : null,
      ctr: form.media_type === 'newsletter' && form.ctr ? form.ctr.trim() : null,
      downloads: form.media_type === 'podcast' && form.downloads ? parseInt(form.downloads) : null,
      ad_type: form.media_type === 'podcast' && form.ad_type ? form.ad_type : null,
      followers: form.media_type === 'influencer' && form.followers ? parseInt(form.followers) : null,
      engagement_rate: form.media_type === 'influencer' && form.engagement_rate ? form.engagement_rate.trim() : null,
      deliverable: form.media_type === 'influencer' && form.deliverable ? form.deliverable : null,
      slot_type: form.slot_type,
      date_label: form.date_label,
      deadline_at: new Date(form.deadline_at).toISOString(),
      original_price: parseInt(form.original_price),
      discounted_price: parseInt(form.discounted_price),
      slots_remaining: parseInt(form.slots_remaining),
      past_advertisers: form.past_advertisers,
      status: 'live',
    };

    const { error } = await supabase.from('listings').insert(payload);
    setSubmitting(false);
    if (error) {
      setErrors({ media_owner_name: error.message });
      return;
    }

    if (user?.email) {
      const originalPrice = parseInt(form.original_price);
      const discountedPrice = parseInt(form.discounted_price);
      const discountPct = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
      sendSlotListedEmail(user.email, {
        property_name: payload.property_name,
        media_type: payload.media_type,
        discounted_price: discountedPrice,
        discount: discountPct,
        deadline_at: payload.deadline_at,
        slots_remaining: payload.slots_remaining,
        seller_name: profile?.display_name || form.media_owner_name,
      });
    }

    setSubmitted(true);
  };

  if (submitted) {
    return <SuccessScreen onBack={onBack} propertyName={form.property_name} />;
  }

  const slotTypeOptions =
    form.media_type === 'newsletter' ? NEWSLETTER_SLOT_TYPES :
    form.media_type === 'podcast' ? PODCAST_SLOT_TYPES :
    INFLUENCER_SLOT_TYPES;

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to marketplace
        </button>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            For sellers
          </div>
          <h1 className="text-4xl font-black text-white mb-3">List your slot</h1>
          <p className="text-gray-400 text-lg">
            Fill unsold inventory before the deadline. Buyers discover your opportunity and can secure it instantly.
          </p>
        </div>

        <div className="space-y-8">
          <Section title="Media type" icon={<Tag className="w-4 h-4 text-amber-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MEDIA_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { set('media_type', t.value); set('slot_type', ''); set('ad_type', ''); set('deliverable', ''); }}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all
                    ${form.media_type === t.value
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-white/[0.02] border-white/8 text-gray-400 hover:border-white/15 hover:text-white'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${form.media_type === t.value ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5'}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="About you" icon={<Users className="w-4 h-4 text-amber-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Your name" required error={errors.media_owner_name}>
                <input
                  type="text"
                  value={form.media_owner_name}
                  onChange={e => set('media_owner_name', e.target.value)}
                  placeholder="Rachel Byrne"
                  className={inputCls(!!errors.media_owner_name)}
                />
              </Field>
              <Field label="Company / publication name" required error={errors.media_company_name}>
                <input
                  type="text"
                  value={form.media_company_name}
                  onChange={e => set('media_company_name', e.target.value)}
                  placeholder="Northstar Media"
                  className={inputCls(!!errors.media_company_name)}
                />
              </Field>
              <Field label={form.media_type === 'newsletter' ? 'Newsletter name' : form.media_type === 'podcast' ? 'Podcast / show name' : 'Account / channel name'} required error={errors.property_name} className="sm:col-span-2">
                <input
                  type="text"
                  value={form.property_name}
                  onChange={e => set('property_name', e.target.value)}
                  placeholder={form.media_type === 'newsletter' ? 'SaaS Growth Weekly' : form.media_type === 'podcast' ? 'The Commerce Playbook' : 'Emily Morgan IG'}
                  className={inputCls(!!errors.property_name)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Audience" icon={<Users className="w-4 h-4 text-amber-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Audience description" required error={errors.audience} className="sm:col-span-2">
                <input
                  type="text"
                  value={form.audience}
                  onChange={e => set('audience', e.target.value)}
                  placeholder={form.media_type === 'newsletter' ? 'B2B SaaS founders and marketers' : form.media_type === 'podcast' ? 'eCommerce operators and founders' : 'Travel and lifestyle enthusiasts'}
                  className={inputCls(!!errors.audience)}
                />
              </Field>
              <Field label="Primary geography" required error={errors.location}>
                <SelectOrCustom
                  value={form.location}
                  onChange={v => set('location', v)}
                  options={LOCATIONS}
                  placeholder="Select or type..."
                  hasError={!!errors.location}
                />
              </Field>

              {form.media_type === 'newsletter' && (
                <>
                  <Field label="Subscribers" required error={errors.subscribers}>
                    <input
                      type="number"
                      value={form.subscribers}
                      onChange={e => set('subscribers', e.target.value)}
                      placeholder="42000"
                      min="0"
                      className={inputCls(!!errors.subscribers)}
                    />
                  </Field>
                  <Field label="Open rate" hint="e.g. 44%">
                    <input
                      type="text"
                      value={form.open_rate}
                      onChange={e => set('open_rate', e.target.value)}
                      placeholder="44%"
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="Click-through rate (CTR)" hint="e.g. 3.6%">
                    <input
                      type="text"
                      value={form.ctr}
                      onChange={e => set('ctr', e.target.value)}
                      placeholder="3.6%"
                      className={inputCls(false)}
                    />
                  </Field>
                </>
              )}

              {form.media_type === 'podcast' && (
                <>
                  <Field label="Downloads per episode" required error={errors.downloads}>
                    <input
                      type="number"
                      value={form.downloads}
                      onChange={e => set('downloads', e.target.value)}
                      placeholder="28000"
                      min="0"
                      className={inputCls(!!errors.downloads)}
                    />
                  </Field>
                  <Field label="Ad type" required error={errors.ad_type}>
                    <SelectField
                      value={form.ad_type}
                      onChange={v => set('ad_type', v)}
                      options={PODCAST_AD_TYPES}
                      placeholder="Select ad type"
                      hasError={!!errors.ad_type}
                    />
                  </Field>
                </>
              )}

              {form.media_type === 'influencer' && (
                <>
                  <Field label="Followers" required error={errors.followers}>
                    <input
                      type="number"
                      value={form.followers}
                      onChange={e => set('followers', e.target.value)}
                      placeholder="320000"
                      min="0"
                      className={inputCls(!!errors.followers)}
                    />
                  </Field>
                  <Field label="Engagement rate" hint="e.g. 4.8%">
                    <input
                      type="text"
                      value={form.engagement_rate}
                      onChange={e => set('engagement_rate', e.target.value)}
                      placeholder="4.8%"
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="Deliverable" required error={errors.deliverable} className="sm:col-span-2">
                    <SelectField
                      value={form.deliverable}
                      onChange={v => { set('deliverable', v); set('slot_type', v); }}
                      options={INFLUENCER_DELIVERABLES}
                      placeholder="Select deliverable"
                      hasError={!!errors.deliverable}
                    />
                  </Field>
                </>
              )}
            </div>
          </Section>

          <Section title="Slot details" icon={<BarChart2 className="w-4 h-4 text-amber-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.media_type !== 'influencer' && (
                <Field label="Slot type" required error={errors.slot_type}>
                  <SelectField
                    value={form.slot_type}
                    onChange={v => set('slot_type', v)}
                    options={slotTypeOptions}
                    placeholder="Select slot type"
                    hasError={!!errors.slot_type}
                  />
                </Field>
              )}

              <Field label="Slot runs" required error={errors.date_label} hint="When does this ad run?">
                <SelectOrCustom
                  value={form.date_label}
                  onChange={v => set('date_label', v)}
                  options={DATE_LABELS}
                  placeholder="e.g. Friday, This week..."
                  hasError={!!errors.date_label}
                />
              </Field>

              <Field label="Listing deadline" required error={errors.deadline_at} hint="When does this offer expire?" className="sm:col-span-2">
                <input
                  type="datetime-local"
                  value={form.deadline_at}
                  onChange={e => set('deadline_at', e.target.value)}
                  min={getMinDeadline()}
                  max={getMaxDeadline()}
                  className={inputCls(!!errors.deadline_at) + ' [color-scheme:dark]'}
                />
                <p className="text-gray-600 text-xs mt-1.5">Buyers can secure the slot up until this date and time.</p>
              </Field>

              <Field label="Slots available" required error={errors.slots_remaining}>
                <input
                  type="number"
                  value={form.slots_remaining}
                  onChange={e => set('slots_remaining', e.target.value)}
                  min="1"
                  max="10"
                  className={inputCls(!!errors.slots_remaining)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Pricing" icon={<DollarSign className="w-4 h-4 text-amber-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Original / standard rate ($)" required error={errors.original_price} hint="Your regular published rate">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={e => set('original_price', e.target.value)}
                    placeholder="1000"
                    min="1"
                    className={inputCls(!!errors.original_price) + ' pl-7'}
                  />
                </div>
              </Field>
              <Field label="Discounted ask price ($)" required error={errors.discounted_price} hint="The price you're listing at">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={form.discounted_price}
                    onChange={e => set('discounted_price', e.target.value)}
                    placeholder="700"
                    min="1"
                    className={inputCls(!!errors.discounted_price) + ' pl-7'}
                  />
                </div>
              </Field>
            </div>

            {discount !== null && savings !== null && (
              <div className="mt-3 flex items-center gap-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded">-{discount}%</span>
                  <span className="text-emerald-400 text-sm font-semibold">Buyers save ${savings.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Info className="w-3 h-3" />
                  Discounts of 20–40% attract the most buyer activity
                </div>
              </div>
            )}
          </Section>

          <Section title="Past advertisers" icon={<Shield className="w-4 h-4 text-amber-400" />} optional>
            <p className="text-gray-500 text-sm mb-3">Add recognizable brand names to build trust with buyers.</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={form.advertiser_input}
                onChange={e => set('advertiser_input', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAdvertiser())}
                placeholder="e.g. HubSpot, Notion, Shopify"
                className={inputCls(false) + ' flex-1'}
              />
              <button
                type="button"
                onClick={addAdvertiser}
                className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {form.past_advertisers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.past_advertisers.map(a => (
                  <span key={a} className="flex items-center gap-1.5 text-sm text-gray-300 bg-white/6 border border-white/8 px-3 py-1 rounded-lg">
                    {a}
                    <button onClick={() => removeAdvertiser(a)} className="text-gray-600 hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="Geographic reach" icon={<MapPin className="w-4 h-4 text-amber-400" />}>
            <div className="bg-amber-500/6 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400 leading-relaxed">
                Your listing will be live immediately after submission and visible to all buyers on the marketplace. Once a buyer secures your slot, you'll be notified to review their brief and confirm the booking.
              </div>
            </div>
          </Section>

          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm px-4 py-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Please fix the errors above before submitting.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-black" />}
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-white text-sm font-medium px-6 py-3.5 rounded-xl border border-white/8 hover:border-white/15 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ onBack, propertyName }: { onBack: () => void; propertyName: string }) {
  return (
    <div className="min-h-screen bg-[#08080f] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Listing live!</h2>
        <p className="text-gray-400 text-lg mb-2">
          <span className="text-white font-semibold">{propertyName}</span> is now visible to all buyers on the marketplace.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          You'll be notified when a buyer secures your slot. Make sure to respond within the hold window.
        </p>
        <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-left space-y-3 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Listing published and live</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Visible to all active buyers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Countdown timer started</span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl transition-all"
        >
          View marketplace
        </button>
      </div>
    </div>
  );
}

function Section({
  title, icon, children, optional,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; optional?: boolean;
}) {
  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-white font-semibold text-sm uppercase tracking-wide">{title}</h2>
        {optional && <span className="text-gray-600 text-xs font-normal normal-case">(optional)</span>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label, required, hint, error, children, className,
}: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-gray-400 font-medium mb-1.5">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
        {hint && <span className="text-gray-600 font-normal ml-1.5">— {hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return `w-full bg-white/5 border ${hasError ? 'border-yellow-500/50 focus:border-yellow-500/70' : 'border-white/10 focus:border-amber-500/50'} rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors`;
}

function SelectField({
  value, onChange, options, placeholder, hasError,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; hasError: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-[#0d0d14] border ${hasError ? 'border-yellow-500/50' : 'border-white/10 focus:border-amber-500/50'} rounded-lg px-3 py-2.5 text-sm outline-none transition-colors [color-scheme:dark] ${value ? 'text-white' : 'text-gray-600'}`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SelectOrCustom({
  value, onChange, options, placeholder, hasError,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; hasError: boolean;
}) {
  const [custom, setCustom] = useState(false);
  const isCustom = custom || (value && !options.includes(value));

  if (isCustom) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls(hasError) + ' flex-1'}
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setCustom(false); onChange(''); }}
          className="text-gray-500 hover:text-white border border-white/10 rounded-lg px-3 py-2.5 text-sm transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`flex-1 bg-[#0d0d14] border ${hasError ? 'border-yellow-500/50' : 'border-white/10 focus:border-amber-500/50'} rounded-lg px-3 py-2.5 text-sm outline-none transition-colors [color-scheme:dark] ${value ? 'text-white' : 'text-gray-600'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <button
        type="button"
        onClick={() => setCustom(true)}
        className="text-gray-500 hover:text-white border border-white/10 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap"
        title="Enter custom value"
      >
        Custom
      </button>
    </div>
  );
}
