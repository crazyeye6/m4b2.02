import { useState, useMemo } from 'react';
import { Mail, ChevronLeft, CheckCircle, AlertTriangle, Loader2, DollarSign, Users, BarChart2, Tag, Shield, Zap, Plus, X, CircleUser as UserCircle, ArrowRight, ChevronRight, Info, Upload, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendSlotListedEmail } from '../lib/email';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/TagInput';
import SubmitByEmail from '../components/SubmitByEmail';
import CsvUpload from '../components/CsvUpload';
import type { MediaType } from '../types';

interface ListSlotPageProps {
  onBack: () => void;
  onEditProfile?: () => void;
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
  slot_type: string;
  date_label: string;
  posting_date_start: string;
  posting_time: string;
  deadline_at: string;
  original_price: string;
  discounted_price: string;
  slots_remaining: string;
  past_advertisers: string[];
  advertiser_input: string;
  seller_bio: string;
  seller_website_url: string;
  seller_company_url: string;
  seller_linkedin_url: string;
  seller_twitter_url: string;
  portfolio_links: string[];
  portfolio_input: string;
  tags: string[];
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
  slot_type: '',
  date_label: '',
  posting_date_start: '',
  posting_time: '',
  deadline_at: '',
  original_price: '',
  discounted_price: '',
  slots_remaining: '1',
  past_advertisers: [],
  advertiser_input: '',
  seller_bio: '',
  seller_website_url: '',
  seller_company_url: '',
  seller_linkedin_url: '',
  seller_twitter_url: '',
  portfolio_links: [],
  portfolio_input: '',
  tags: [],
};

const NEWSLETTER_SLOT_TYPES = ['Featured sponsor', 'Banner + mention', 'Dedicated send', 'Native ad', 'Footer sponsor', 'Solo blast'];
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

const STEPS = [
  { number: 1, title: 'The slot', desc: 'Name, type, dates & price' },
  { number: 2, title: 'Your audience', desc: 'Who reads your newsletter' },
  { number: 3, title: 'Review & publish', desc: 'Confirm and go live' },
];

export default function ListSlotPage({ onBack, onEditProfile }: ListSlotPageProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);

  const profileDefaults: Partial<FormData> = profile ? {
    media_owner_name: profile.display_name || '',
    media_company_name: profile.company || '',
    seller_bio: profile.seller_bio || profile.bio || '',
    seller_website_url: profile.seller_website_url || profile.website || '',
    seller_company_url: profile.seller_company_url || '',
    seller_linkedin_url: profile.seller_linkedin_url || '',
    seller_twitter_url: profile.seller_twitter_url || '',
  } : {};

  const [form, setForm] = useState<FormData>({ ...INITIAL, ...profileDefaults });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [altMethod, setAltMethod] = useState<'email' | 'csv' | null>(null);

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

  const validateStep1 = (): Partial<Record<keyof FormData, string>> => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.property_name.trim()) e.property_name = 'Required';
    if (!form.slot_type) e.slot_type = 'Required';
    if (!form.date_label) e.date_label = 'Required';
    if (!form.deadline_at) e.deadline_at = 'Required';
    if (!form.original_price || isNaN(parseFloat(form.original_price))) e.original_price = 'Required';
    if (!form.discounted_price || isNaN(parseFloat(form.discounted_price))) e.discounted_price = 'Required';
    if (parseFloat(form.discounted_price) >= parseFloat(form.original_price)) {
      e.discounted_price = 'Must be less than original price';
    }
    if (!form.slots_remaining || parseInt(form.slots_remaining) < 1) e.slots_remaining = 'Required';
    return e;
  };

  const validateStep2 = (): Partial<Record<keyof FormData, string>> => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.subscribers) e.subscribers = 'Required';
    if (!form.audience.trim()) e.audience = 'Required';
    if (!form.location) e.location = 'Required';
    if (!form.media_owner_name.trim()) e.media_owner_name = 'Required';
    if (!form.media_company_name.trim()) e.media_company_name = 'Required';
    return e;
  };

  const handleNext = () => {
    if (step === 1) {
      const e = validateStep1();
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(2);
    } else if (step === 2) {
      const e = validateStep2();
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrors({ media_owner_name: 'You must be signed in to list a slot.' });
      return;
    }
    const e1 = validateStep1();
    const e2 = validateStep2();
    const allErrors = { ...e1, ...e2 };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStep(Object.keys(e1).length > 0 ? 1 : 2);
      return;
    }

    setSubmitting(true);

    const payload = {
      seller_user_id: user!.id,
      seller_email: user!.email,
      media_type: 'newsletter' as MediaType,
      media_owner_name: form.media_owner_name.trim(),
      media_company_name: form.media_company_name.trim(),
      property_name: form.property_name.trim(),
      audience: form.audience.trim(),
      location: form.location,
      subscribers: form.subscribers ? parseInt(form.subscribers) : null,
      open_rate: form.open_rate ? form.open_rate.trim() : null,
      ctr: form.ctr ? form.ctr.trim() : null,
      downloads: null,
      ad_type: null,
      followers: null,
      engagement_rate: null,
      deliverable: null,
      slot_type: form.slot_type,
      date_label: form.date_label,
      posting_date_start: form.posting_date_start || null,
      posting_time: form.posting_time || null,
      deadline_at: new Date(form.deadline_at).toISOString(),
      original_price: parseInt(form.original_price),
      discounted_price: parseInt(form.discounted_price),
      slots_remaining: parseInt(form.slots_remaining),
      past_advertisers: form.past_advertisers,
      status: 'live',
      seller_bio: (profile?.seller_bio || profile?.bio || form.seller_bio).trim() || null,
      seller_website_url: (profile?.seller_website_url || profile?.website || form.seller_website_url).trim() || null,
      seller_company_url: (profile?.seller_company_url || form.seller_company_url).trim() || null,
      seller_linkedin_url: (profile?.seller_linkedin_url || form.seller_linkedin_url).trim() || null,
      seller_twitter_url: (profile?.seller_twitter_url || form.seller_twitter_url).trim() || null,
      seller_instagram_url: null,
      seller_youtube_url: null,
      seller_tiktok_url: null,
      seller_podcast_url: null,
      portfolio_links: form.portfolio_links.length > 0 ? form.portfolio_links : null,
    };

    const { data: insertedListing, error } = await supabase
      .from('listings')
      .insert(payload)
      .select('id')
      .maybeSingle();

    if (error) {
      setSubmitting(false);
      setErrors({ media_owner_name: error.message });
      return;
    }

    if (insertedListing) {
      const geoSlugs: Array<{ name: string; displayName: string }> = [];
      const locationLower = (payload.location || '').toLowerCase();
      const GEO_MAP: Record<string, string> = {
        us: 'US', uk: 'UK', europe: 'Europe', ireland: 'Ireland',
        global: 'Global', australia: 'Australia', canada: 'Canada',
        asia: 'Asia', latam: 'LatAm', 'middle-east': 'Middle East',
      };
      for (const [slug, displayName] of Object.entries(GEO_MAP)) {
        const keyword = slug === 'latam' ? 'latam' : slug.replace('-', ' ');
        if (locationLower.includes(keyword) || locationLower.includes(slug)) {
          geoSlugs.push({ name: slug, displayName });
        }
      }

      const nicheSlugs: Array<{ name: string; displayName: string }> = [];
      const audienceLower = (payload.audience || '').toLowerCase();
      const NICHE_MAP: Record<string, string> = {
        saas: 'SaaS', ecommerce: 'eCommerce', fintech: 'Fintech', startup: 'Startup',
        marketing: 'Marketing', fitness: 'Fitness', beauty: 'Beauty', travel: 'Travel',
        crypto: 'Crypto', ai: 'AI', b2b: 'B2B', b2c: 'B2C', health: 'Health',
        tech: 'Tech', food: 'Food', fashion: 'Fashion', education: 'Education', finance: 'Finance',
      };
      for (const [slug, displayName] of Object.entries(NICHE_MAP)) {
        if (audienceLower.includes(slug)) {
          nicheSlugs.push({ name: slug, displayName });
        }
      }

      const allTagsToLink = [
        ...form.tags.map(name => ({ name, displayName: name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), tagType: 'general' as const })),
        ...geoSlugs.map(t => ({ ...t, tagType: 'geography' as const })),
        ...nicheSlugs.map(t => ({ ...t, tagType: 'niche' as const })),
      ];

      for (const { name, displayName, tagType } of allTagsToLink) {
        const { data: tagRow } = await supabase
          .from('tags')
          .upsert({ name, display_name: displayName, tag_type: tagType }, { onConflict: 'name' })
          .select('id')
          .maybeSingle();
        if (tagRow) {
          await supabase
            .from('listing_tags')
            .insert({ listing_id: insertedListing.id, tag_id: tagRow.id })
            .then(() => {});
        }
      }
    }

    setSubmitting(false);

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

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-24">

        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] font-medium mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {step === 1 ? 'Back to marketplace' : 'Back'}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-[11px] font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <Mail className="w-3 h-3" />
            Newsletter Publisher
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] mb-2 tracking-[-0.02em]">List your newsletter slot</h1>
          <p className="text-[#6e6e73] text-[16px] font-light">
            Got an unsold sponsorship this week? Fill your slot before it goes out.
          </p>
        </div>

        {/* Alt submission options — two large option cards */}
        {step === 1 && (
          <div className="mb-8">
            <p className="text-[#6e6e73] text-[13px] font-medium mb-3">Prefer not to fill a form?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email option */}
              <div className={`rounded-3xl border transition-all overflow-hidden ${altMethod === 'email' ? 'border-[#1d1d1f]/20 shadow-md' : 'border-black/[0.06] shadow-sm'}`}>
                <button
                  type="button"
                  onClick={() => setAltMethod(prev => prev === 'email' ? null : 'email')}
                  className="w-full bg-white hover:bg-[#fafafa] transition-colors p-5 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1d1d1f] font-semibold text-[15px] mb-1 tracking-[-0.01em]">Submit your slots by email</p>
                      <p className="text-[#6e6e73] text-[13px] leading-relaxed">No form needed — send us your slot details and we'll build the listing for you.</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#aeaeb2] shrink-0 mt-1 transition-transform ${altMethod === 'email' ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {altMethod === 'email' && (
                  <div className="border-t border-black/[0.06]">
                    <SubmitByEmail variant="compact" />
                  </div>
                )}
              </div>

              {/* CSV option */}
              <div className={`rounded-3xl border transition-all overflow-hidden ${altMethod === 'csv' ? 'border-[#1d1d1f]/20 shadow-md' : 'border-black/[0.06] shadow-sm'}`}>
                <button
                  type="button"
                  onClick={() => setAltMethod(prev => prev === 'csv' ? null : 'csv')}
                  className="w-full bg-white hover:bg-[#fafafa] transition-colors p-5 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1d1d1f] font-semibold text-[15px] mb-1 tracking-[-0.01em]">Upload via CSV</p>
                      <p className="text-[#6e6e73] text-[13px] leading-relaxed">Got multiple slots? Upload them all at once with our CSV template.</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#aeaeb2] shrink-0 mt-1 transition-transform ${altMethod === 'csv' ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {altMethod === 'csv' && (
                  <div className="border-t border-black/[0.06]">
                    <CsvUpload variant="compact" />
                  </div>
                )}
              </div>
            </div>
            {(altMethod === 'email' || altMethod === 'csv') && (
              <p className="text-center text-[#aeaeb2] text-[12px] mt-4">Or scroll down to fill the form instead</p>
            )}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all
                  ${step > s.number ? 'bg-green-500 text-white' : step === s.number ? 'bg-[#1d1d1f] text-white' : 'bg-[#e5e5ea] text-[#aeaeb2]'}`}
                >
                  {step > s.number ? <CheckCircle className="w-4 h-4" /> : s.number}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className={`text-[12px] font-semibold truncate ${step === s.number ? 'text-[#1d1d1f]' : step > s.number ? 'text-green-600' : 'text-[#aeaeb2]'}`}>{s.title}</p>
                  <p className="text-[10px] text-[#aeaeb2] truncate">{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-all ${step > s.number ? 'bg-green-300' : 'bg-[#e5e5ea]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: The Slot */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
              <SectionHeader number="1" title="About your newsletter" />

              <div className="space-y-4">
                <Field label="Newsletter name" required error={errors.property_name} hint="e.g. SaaS Growth Weekly">
                  <input
                    type="text"
                    value={form.property_name}
                    onChange={e => set('property_name', e.target.value)}
                    placeholder="SaaS Growth Weekly"
                    className={inputCls(!!errors.property_name)}
                    autoFocus
                  />
                </Field>

                <Field label="Sponsorship type" required error={errors.slot_type} hint="What the buyer gets">
                  <SelectField
                    value={form.slot_type}
                    onChange={v => set('slot_type', v)}
                    options={NEWSLETTER_SLOT_TYPES}
                    placeholder="Select a type..."
                    hasError={!!errors.slot_type}
                  />
                </Field>
              </div>
            </div>

            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
              <SectionHeader number="2" title="Dates" />

              <div className="space-y-4">
                <Field label="Newsletter send date" required error={errors.date_label} hint="The date your ad will go out">
                  <input
                    type="date"
                    value={form.posting_date_start}
                    onChange={e => {
                      const v = e.target.value;
                      set('posting_date_start', v);
                      if (v) {
                        const d = new Date(v + 'T00:00:00');
                        const label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
                        set('date_label', label);
                      } else {
                        set('date_label', '');
                      }
                    }}
                    min={new Date().toISOString().slice(0, 10)}
                    className={inputCls(!!errors.date_label) + ' [color-scheme:light]'}
                  />
                </Field>

                <Field label="Booking deadline" required error={errors.deadline_at}>
                  <input
                    type="datetime-local"
                    value={form.deadline_at}
                    onChange={e => set('deadline_at', e.target.value)}
                    min={getMinDeadline()}
                    max={getMaxDeadline()}
                    className={inputCls(!!errors.deadline_at) + ' [color-scheme:light]'}
                  />
                  <div className="mt-2 flex items-start gap-1.5">
                    <Info className="w-3 h-3 text-[#aeaeb2] flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#aeaeb2] leading-relaxed">The last point buyers can book. Set this a few days before your send date to allow time for ad copy handover.</p>
                  </div>
                </Field>

                <Field label="Number of slots available" required error={errors.slots_remaining}>
                  <input
                    type="number"
                    value={form.slots_remaining}
                    onChange={e => set('slots_remaining', e.target.value)}
                    min="1"
                    max="10"
                    className={inputCls(!!errors.slots_remaining) + ' max-w-[120px]'}
                  />
                </Field>
              </div>
            </div>

            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
              <SectionHeader number="3" title="Pricing" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Standard rate" required error={errors.original_price} hint="Your usual rate">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] text-sm">$</span>
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
                <Field label="Your asking price" required error={errors.discounted_price} hint="The discounted rate">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] text-sm">$</span>
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
                <div className="mt-3 flex items-center gap-4 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                  <span className="bg-[#1d1d1f] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0">-{discount}%</span>
                  <span className="text-green-700 text-[13px] font-semibold">Buyers save ${savings.toLocaleString()}</span>
                  <span className="text-[#aeaeb2] text-[11px] ml-auto">Aim for 20–40% for best results</span>
                </div>
              )}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-[13px] px-4 py-3 rounded-2xl">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Please fix the highlighted fields above.
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-8 py-4 rounded-2xl transition-all text-[15px]"
            >
              Continue — Your Audience
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Audience */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
              <SectionHeader number="1" title="Audience" />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <Field label="Primary geography" required error={errors.location}>
                    <SelectOrCustom
                      value={form.location}
                      onChange={v => set('location', v)}
                      options={LOCATIONS}
                      placeholder="Select..."
                      hasError={!!errors.location}
                    />
                  </Field>
                </div>

                <Field label="Audience description" required error={errors.audience} hint="Who reads your newsletter">
                  <input
                    type="text"
                    value={form.audience}
                    onChange={e => set('audience', e.target.value)}
                    placeholder="B2B SaaS founders and growth marketers"
                    className={inputCls(!!errors.audience)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Open rate" hint="e.g. 44%">
                    <input
                      type="text"
                      value={form.open_rate}
                      onChange={e => set('open_rate', e.target.value)}
                      placeholder="44%"
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="CTR" hint="e.g. 3.6%">
                    <input
                      type="text"
                      value={form.ctr}
                      onChange={e => set('ctr', e.target.value)}
                      placeholder="3.6%"
                      className={inputCls(false)}
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
              <SectionHeader number="2" title="About you" />

              {profile && (
                <div className="flex items-center gap-2 text-[12px] text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2.5 mb-4">
                  <UserCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Pre-filled from your account. <button type="button" onClick={onEditProfile} className="text-[#1d1d1f] underline transition-colors">Edit profile</button> to update.</span>
                </div>
              )}

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
                <Field label="Publication / company name" required error={errors.media_company_name}>
                  <input
                    type="text"
                    value={form.media_company_name}
                    onChange={e => set('media_company_name', e.target.value)}
                    placeholder="Northstar Media"
                    className={inputCls(!!errors.media_company_name)}
                  />
                </Field>
              </div>
            </div>

            {/* Optional extras — collapsible feel but always visible */}
            <details className="group">
              <summary className="flex items-center justify-between gap-3 bg-white border border-black/[0.06] rounded-2xl px-5 py-4 cursor-pointer list-none shadow-sm hover:border-black/[0.10] transition-all">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#aeaeb2]" />
                  <div>
                    <p className="text-[#1d1d1f] font-semibold text-[13px]">Build trust with buyers</p>
                    <p className="text-[#aeaeb2] text-[11px]">Past advertisers, tags, bio & links — optional but recommended</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#aeaeb2] group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>

              <div className="mt-3 space-y-4">
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm">
                  <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-3">Past advertisers</p>
                  <p className="text-[#6e6e73] text-[13px] mb-3">Recognizable brand names help buyers trust your listing.</p>
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
                      className="flex items-center gap-1.5 bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.08] text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-2xl transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {form.past_advertisers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.past_advertisers.map(a => (
                        <span key={a} className="flex items-center gap-1.5 text-[13px] text-[#3a3a3c] bg-white border border-black/[0.06] px-3 py-1.5 rounded-full">
                          {a}
                          <button onClick={() => removeAdvertiser(a)} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm">
                  <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-3">Tags</p>
                  <p className="text-[#6e6e73] text-[13px] mb-3">Help buyers find your listing by topic or niche.</p>
                  <TagInput
                    selectedTags={form.tags}
                    onChange={tags => set('tags', tags)}
                    maxTags={10}
                  />
                </div>

                {!profile && (
                  <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm">
                    <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-3">Bio & links</p>
                    <div className="space-y-3">
                      <Field label="Short bio" hint="1–2 sentences about your newsletter">
                        <textarea
                          value={form.seller_bio}
                          onChange={e => set('seller_bio', e.target.value)}
                          placeholder="SaaS Growth Weekly is a twice-weekly newsletter for B2B founders, curated since 2020."
                          rows={2}
                          className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-3 text-[#1d1d1f] text-[14px] placeholder-[#aeaeb2] outline-none transition-all resize-none"
                        />
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Website">
                          <input type="url" value={form.seller_website_url} onChange={e => set('seller_website_url', e.target.value)} placeholder="https://yoursite.com" className={inputCls(false)} />
                        </Field>
                        <Field label="LinkedIn">
                          <input type="url" value={form.seller_linkedin_url} onChange={e => set('seller_linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." className={inputCls(false)} />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </details>

            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-[13px] px-4 py-3 rounded-2xl">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Please fix the highlighted fields above.
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-8 py-4 rounded-2xl transition-all text-[15px]"
            >
              Continue — Review & Publish
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
              <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-4">Your listing preview</p>

              <div className="space-y-3">
                <ReviewRow icon={<Mail className="w-3.5 h-3.5" />} label="Newsletter" value={form.property_name} />
                <ReviewRow icon={<Tag className="w-3.5 h-3.5" />} label="Sponsorship type" value={form.slot_type} />
                <ReviewRow icon={<BarChart2 className="w-3.5 h-3.5" />} label="Send date" value={form.date_label || '—'} />
                <ReviewRow icon={<Users className="w-3.5 h-3.5" />} label="Subscribers" value={form.subscribers ? `${parseInt(form.subscribers).toLocaleString()}` : '—'} />
                <ReviewRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Asking price" value={form.discounted_price ? `$${parseInt(form.discounted_price).toLocaleString()}` : '—'} accent={discount !== null ? `-${discount}% off` : undefined} />
                <ReviewRow icon={<Shield className="w-3.5 h-3.5" />} label="Slots available" value={form.slots_remaining} />
              </div>

              <div className="mt-5 pt-5 border-t border-black/[0.06] flex items-center justify-between">
                <div>
                  <button onClick={() => { setErrors({}); setStep(1); }} className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] font-medium transition-colors">Edit slot details</button>
                  <span className="text-[#e5e5ea] mx-2">·</span>
                  <button onClick={() => { setErrors({}); setStep(2); }} className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] font-medium transition-colors">Edit audience</button>
                </div>
              </div>
            </div>

            <div className="bg-[#1d1d1f] rounded-3xl p-5">
              <p className="text-white font-semibold text-[14px] mb-1">What happens after you publish</p>
              <div className="space-y-2 mt-3">
                {[
                  'Your slot goes live immediately on the marketplace',
                  'Buyers browse and can reserve your slot with a 10% deposit',
                  "You'll be notified when a buyer secures — then you exchange contact details",
                  'Buyer sends ad copy, you send the newsletter, balance is paid direct to you',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 text-white/60 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <p className="text-white/70 text-[13px] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {!user && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-[13px]">You must be signed in to publish a listing.</p>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-[13px] px-4 py-3 rounded-2xl">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Some required fields are missing. Please go back and check.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !user}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-2xl transition-all text-[15px] shadow-sm shadow-green-600/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
            <p className="text-center text-[11px] text-[#aeaeb2]">Your listing goes live immediately and is visible to all buyers on the marketplace.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="w-6 h-6 rounded-full bg-[#1d1d1f] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{number}</span>
      <h2 className="text-[#1d1d1f] font-semibold text-[15px]">{title}</h2>
    </div>
  );
}

function ReviewRow({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-black/[0.04] last:border-0">
      <span className="text-[#aeaeb2] flex-shrink-0">{icon}</span>
      <span className="text-[#6e6e73] text-[13px] flex-shrink-0 min-w-[120px]">{label}</span>
      <span className="text-[#1d1d1f] text-[13px] font-semibold flex-1 truncate">{value}</span>
      {accent && <span className="flex-shrink-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">{accent}</span>}
    </div>
  );
}

function SuccessScreen({ onBack, propertyName }: { onBack: () => void; propertyName: string }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-3 tracking-[-0.02em]">Listing live!</h2>
        <p className="text-[#6e6e73] text-[15px] mb-2">
          <span className="text-[#1d1d1f] font-semibold">{propertyName}</span> is now visible to all buyers on the marketplace.
        </p>
        <p className="text-[#aeaeb2] text-[13px] mb-8">
          You'll be notified when a buyer reserves your slot. Make sure to respond promptly so the booking can proceed.
        </p>
        <div className="bg-white border border-black/[0.06] rounded-3xl p-5 text-left space-y-3 mb-6 shadow-sm">
          {[
            'Listing published and live',
            'Visible to all active buyers',
            'Countdown timer started',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-[13px]">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-[#3a3a3c]">{item}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold py-3.5 rounded-2xl transition-all"
        >
          View marketplace
        </button>
      </div>
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
      <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="text-[#aeaeb2] font-normal normal-case ml-1.5">— {hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-orange-500 text-[11px] mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return `w-full bg-[#f5f5f7] border ${hasError ? 'border-red-300 focus:border-red-400' : 'border-black/[0.08] focus:border-black/[0.2] focus:bg-white'} rounded-2xl px-3 py-3 text-[#1d1d1f] text-[14px] placeholder-[#aeaeb2] outline-none transition-all`;
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
      className={`w-full bg-[#f5f5f7] border ${hasError ? 'border-red-300' : 'border-black/[0.08] focus:border-black/[0.2]'} rounded-2xl px-3 py-3 text-[14px] outline-none transition-all [color-scheme:light] ${value ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}
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
          className="text-[#aeaeb2] hover:text-[#1d1d1f] border border-black/[0.08] rounded-2xl px-3 py-3 text-[13px] transition-colors"
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
        className={`flex-1 bg-[#f5f5f7] border ${hasError ? 'border-red-300' : 'border-black/[0.08] focus:border-black/[0.2]'} rounded-2xl px-3 py-3 text-[14px] outline-none transition-all [color-scheme:light] ${value ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <button
        type="button"
        onClick={() => setCustom(true)}
        className="text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.15] bg-[#f5f5f7] rounded-2xl px-3 py-3 text-[12px] font-medium transition-colors whitespace-nowrap"
        title="Enter custom value"
      >
        Custom
      </button>
    </div>
  );
}
