import { useState, useMemo } from 'react';
import { Mail, Mic, Instagram, ChevronLeft, CheckCircle, AlertTriangle, Loader2, Info, DollarSign, Users, MapPin, BarChart2, Tag, Shield, Zap, Plus, X, CircleUser as UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendSlotListedEmail } from '../lib/email';
import { useAuth } from '../context/AuthContext';
import TagInput from '../components/TagInput';
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
  downloads: string;
  ad_type: string;
  followers: string;
  engagement_rate: string;
  deliverable: string;
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
  seller_instagram_url: string;
  seller_youtube_url: string;
  seller_tiktok_url: string;
  seller_podcast_url: string;
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
  downloads: '',
  ad_type: '',
  followers: '',
  engagement_rate: '',
  deliverable: '',
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
  seller_instagram_url: '',
  seller_youtube_url: '',
  seller_tiktok_url: '',
  seller_podcast_url: '',
  portfolio_links: [],
  portfolio_input: '',
  tags: [],
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

export default function ListSlotPage({ onBack, onEditProfile }: ListSlotPageProps) {
  const { user, profile } = useAuth();

  const profileDefaults: Partial<FormData> = profile ? {
    media_owner_name: profile.display_name || '',
    media_company_name: profile.company || '',
    seller_bio: profile.seller_bio || profile.bio || '',
    seller_website_url: profile.seller_website_url || profile.website || '',
    seller_company_url: profile.seller_company_url || '',
    seller_linkedin_url: profile.seller_linkedin_url || '',
    seller_twitter_url: profile.seller_twitter_url || '',
    seller_instagram_url: profile.seller_instagram_url || '',
    seller_youtube_url: profile.seller_youtube_url || '',
    seller_tiktok_url: profile.seller_tiktok_url || '',
    seller_podcast_url: profile.seller_podcast_url || '',
  } : {};

  const [form, setForm] = useState<FormData>({ ...INITIAL, ...profileDefaults });
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
    if (!user) {
      setErrors({ media_owner_name: 'You must be signed in to list a slot.' });
      return;
    }
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      seller_user_id: user!.id,
      seller_email: user!.email,
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
      seller_instagram_url: (profile?.seller_instagram_url || form.seller_instagram_url).trim() || null,
      seller_youtube_url: (profile?.seller_youtube_url || form.seller_youtube_url).trim() || null,
      seller_tiktok_url: (profile?.seller_tiktok_url || form.seller_tiktok_url).trim() || null,
      seller_podcast_url: (profile?.seller_podcast_url || form.seller_podcast_url).trim() || null,
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

    if (insertedListing && form.tags.length > 0) {
      for (const tagName of form.tags) {
        const displayName = tagName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const { data: tagRow } = await supabase
          .from('tags')
          .upsert({ name: tagName, display_name: displayName }, { onConflict: 'name' })
          .select('id')
          .maybeSingle();
        if (tagRow) {
          await supabase
            .from('listing_tags')
            .insert({ listing_id: insertedListing.id, tag_id: tagRow.id });
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

  const slotTypeOptions =
    form.media_type === 'newsletter' ? NEWSLETTER_SLOT_TYPES :
    form.media_type === 'podcast' ? PODCAST_SLOT_TYPES :
    INFLUENCER_SLOT_TYPES;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] font-medium mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to marketplace
        </button>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] text-[#6e6e73] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            For sellers
          </div>
          <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-3 tracking-[-0.02em]">List your slot</h1>
          <p className="text-[#6e6e73] text-[17px] font-light">
            Fill unsold inventory before the deadline. Buyers discover your opportunity and can secure it instantly.
          </p>
        </div>

        <div className="space-y-8">
          <Section title="Media type" icon={<Tag className="w-4 h-4 text-[#6e6e73]" />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MEDIA_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { set('media_type', t.value); set('slot_type', ''); set('ad_type', ''); set('deliverable', ''); }}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all
                    ${form.media_type === t.value
                      ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-sm'
                      : 'bg-white border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12] hover:text-[#1d1d1f]'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${form.media_type === t.value ? 'bg-white/20 text-white' : 'bg-[#f5f5f7] text-[#6e6e73]'}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className={`font-semibold text-[13px] ${form.media_type === t.value ? 'text-white' : 'text-[#1d1d1f]'}`}>{t.label}</p>
                    <p className={`text-[11px] mt-0.5 leading-snug ${form.media_type === t.value ? 'text-white/60' : 'text-[#aeaeb2]'}`}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="About you" icon={<Users className="w-4 h-4 text-[#6e6e73]" />}>
            {profile && (
              <div className="flex items-center gap-2 text-[12px] text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.08] rounded-2xl px-3 py-2.5 mb-4">
                <UserCircle className="w-3.5 h-3.5 text-[#6e6e73] flex-shrink-0" />
                <span>Pre-filled from your account profile. <button type="button" onClick={onEditProfile} className="text-[#1d1d1f] hover:text-[#3a3a3c] underline transition-colors">Edit profile</button> to update.</span>
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

          <Section title="Audience" icon={<Users className="w-4 h-4 text-[#6e6e73]" />}>
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

          <Section title="Slot details" icon={<BarChart2 className="w-4 h-4 text-[#6e6e73]" />}>
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

              <Field label="Air date" required error={errors.date_label} hint="The exact date your ad will publish" className="sm:col-span-2">
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

              <Field label="Time of day" hint="Optional — time your ad goes live">
                <input
                  type="time"
                  value={form.posting_time}
                  onChange={e => set('posting_time', e.target.value)}
                  className={inputCls(false) + ' [color-scheme:light]'}
                />
              </Field>

              <Field label="Claim deadline" required error={errors.deadline_at} hint="Last chance for buyers to register interest" className="sm:col-span-2">
                <input
                  type="datetime-local"
                  value={form.deadline_at}
                  onChange={e => set('deadline_at', e.target.value)}
                  min={getMinDeadline()}
                  max={getMaxDeadline()}
                  className={inputCls(!!errors.deadline_at) + ' [color-scheme:light]'}
                />
                <p className="text-gray-600 text-xs mt-1.5">Buyers must claim their interest before this date. This is not the ad publish date — set it early enough to allow time for ad copy handover.</p>
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

          <Section title="Pricing" icon={<DollarSign className="w-4 h-4 text-[#6e6e73]" />}>
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
              <div className="mt-3 flex items-center gap-4 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#1d1d1f] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
                  <span className="text-green-600 text-[13px] font-semibold">Buyers save ${savings.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#aeaeb2] text-[11px]">
                  <Info className="w-3 h-3" />
                  Discounts of 20–40% attract the most buyer activity
                </div>
              </div>
            )}
          </Section>

          <Section title="Tags" icon={<Tag className="w-4 h-4 text-[#6e6e73]" />} optional>
            <p className="text-gray-500 text-sm mb-3">Add tags to help buyers discover your listing by topic, niche, or format.</p>
            <TagInput
              selectedTags={form.tags}
              onChange={tags => set('tags', tags)}
              maxTags={10}
            />
          </Section>

          <Section title="Past advertisers" icon={<Shield className="w-4 h-4 text-[#6e6e73]" />} optional>
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
          </Section>

          {profile ? (
            <Section title="Your profile" icon={<Shield className="w-4 h-4 text-[#1d1d1f]" />}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-5 h-5 text-[#6e6e73]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1d1d1f] font-semibold text-[14px]">{profile.display_name || 'Your account'}</p>
                  <p className="text-[#6e6e73] text-[12px] mt-0.5">{profile.company}</p>
                  {(profile.seller_bio || profile.bio) && (
                    <p className="text-[#3a3a3c] text-[12px] mt-2 leading-relaxed line-clamp-2">{profile.seller_bio || profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {(profile.seller_website_url || profile.website) && (
                      <span className="text-[#6e6e73] text-[11px] truncate max-w-[180px]">{profile.seller_website_url || profile.website}</span>
                    )}
                    {profile.seller_linkedin_url && <span className="text-[#6e6e73] text-[11px]">LinkedIn</span>}
                    {profile.seller_twitter_url && <span className="text-[#6e6e73] text-[11px]">Twitter / X</span>}
                    {profile.seller_instagram_url && <span className="text-[#6e6e73] text-[11px]">Instagram</span>}
                    {profile.seller_podcast_url && <span className="text-[#6e6e73] text-[11px]">Podcast</span>}
                  </div>
                </div>
                {onEditProfile && (
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="flex-shrink-0 text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all font-medium bg-[#f5f5f7]"
                  >
                    Edit profile
                  </button>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-black/[0.06]">
                <p className="text-[#aeaeb2] text-[11px]">Your contact info, bio, and social links are pulled from your account profile and shown on all your listings. <span className="text-[#1d1d1f] font-medium">Update them once in your profile — they apply everywhere.</span></p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-400 font-medium mb-2">Past work / portfolio links <span className="text-gray-600 font-normal">(optional — up to 5)</span></p>
                <div className="space-y-2">
                  {form.portfolio_links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex-1 text-[13px] text-[#3a3a3c] bg-[#f5f5f7] border border-black/[0.06] rounded-2xl px-3 py-2 truncate">{link}</span>
                      <button
                        type="button"
                        onClick={() => set('portfolio_links', form.portfolio_links.filter((_, j) => j !== i))}
                        className="text-[#aeaeb2] hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {form.portfolio_links.length < 5 && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={form.portfolio_input}
                        onChange={e => set('portfolio_input', e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = form.portfolio_input.trim();
                            if (v && !form.portfolio_links.includes(v)) {
                              set('portfolio_links', [...form.portfolio_links, v]);
                              set('portfolio_input', '');
                            }
                          }
                        }}
                        placeholder="https://yoursite.com/media-kit"
                        className={inputCls(false) + ' flex-1'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const v = form.portfolio_input.trim();
                          if (v && !form.portfolio_links.includes(v)) {
                            set('portfolio_links', [...form.portfolio_links, v]);
                            set('portfolio_input', '');
                          }
                        }}
                        className="flex items-center gap-1 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.15] text-[#1d1d1f] text-[13px] px-3 py-2 rounded-2xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Section>
          ) : (
            <Section title="Your profile" icon={<Shield className="w-4 h-4 text-[#1d1d1f]" />} optional>
              <p className="text-[#6e6e73] text-[13px] mb-4">Help buyers verify your credibility. Add a short bio and links to your online presence.</p>
              <div className="space-y-4">
                <Field label="Short bio / about" hint="1–2 sentences about you or your publication">
                  <textarea
                    value={form.seller_bio}
                    onChange={e => set('seller_bio', e.target.value)}
                    placeholder={
                      form.media_type === 'newsletter'
                        ? 'SaaS Growth Weekly is a twice-weekly newsletter for B2B founders, curated by Rachel Byrne since 2020.'
                        : form.media_type === 'podcast'
                        ? 'The Commerce Playbook covers eCommerce strategy with 28k downloads per episode across 4 years.'
                        : 'Lifestyle creator with 320k followers across Instagram and TikTok, focused on sustainable travel.'
                    }
                    rows={3}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-3 text-[#1d1d1f] text-[14px] placeholder-[#aeaeb2] outline-none transition-all resize-none"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Personal website" hint="Your main site or publication">
                    <input type="url" value={form.seller_website_url} onChange={e => set('seller_website_url', e.target.value)} placeholder="https://yoursite.com" className={inputCls(false)} />
                  </Field>
                  <Field label="Company page" hint="Business or brand page">
                    <input type="url" value={form.seller_company_url} onChange={e => set('seller_company_url', e.target.value)} placeholder="https://yourcompany.com" className={inputCls(false)} />
                  </Field>
                  <Field label="LinkedIn" hint="Profile or company page">
                    <input type="url" value={form.seller_linkedin_url} onChange={e => set('seller_linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" className={inputCls(false)} />
                  </Field>
                  <Field label="Twitter / X">
                    <input type="url" value={form.seller_twitter_url} onChange={e => set('seller_twitter_url', e.target.value)} placeholder="https://x.com/yourhandle" className={inputCls(false)} />
                  </Field>
                  {form.media_type === 'influencer' && (
                    <>
                      <Field label="Instagram">
                        <input type="url" value={form.seller_instagram_url} onChange={e => set('seller_instagram_url', e.target.value)} placeholder="https://instagram.com/yourhandle" className={inputCls(false)} />
                      </Field>
                      <Field label="TikTok">
                        <input type="url" value={form.seller_tiktok_url} onChange={e => set('seller_tiktok_url', e.target.value)} placeholder="https://tiktok.com/@yourhandle" className={inputCls(false)} />
                      </Field>
                      <Field label="YouTube">
                        <input type="url" value={form.seller_youtube_url} onChange={e => set('seller_youtube_url', e.target.value)} placeholder="https://youtube.com/@yourchannel" className={inputCls(false)} />
                      </Field>
                    </>
                  )}
                  {form.media_type === 'podcast' && (
                    <Field label="Podcast page" hint="Apple, Spotify, etc.">
                      <input type="url" value={form.seller_podcast_url} onChange={e => set('seller_podcast_url', e.target.value)} placeholder="https://open.spotify.com/show/..." className={inputCls(false)} />
                    </Field>
                  )}
                </div>
                <Field label="Past work / portfolio links" hint="Media kit, case studies, sample content — up to 5 links">
                  <div className="space-y-2">
                    {form.portfolio_links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex-1 text-[13px] text-[#3a3a3c] bg-[#f5f5f7] border border-black/[0.06] rounded-2xl px-3 py-2 truncate">{link}</span>
                        <button type="button" onClick={() => set('portfolio_links', form.portfolio_links.filter((_, j) => j !== i))} className="text-[#aeaeb2] hover:text-red-500 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.portfolio_links.length < 5 && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={form.portfolio_input}
                          onChange={e => set('portfolio_input', e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const v = form.portfolio_input.trim();
                              if (v && !form.portfolio_links.includes(v)) { set('portfolio_links', [...form.portfolio_links, v]); set('portfolio_input', ''); }
                            }
                          }}
                          placeholder="https://yoursite.com/media-kit"
                          className={inputCls(false) + ' flex-1'}
                        />
                        <button
                          type="button"
                          onClick={() => { const v = form.portfolio_input.trim(); if (v && !form.portfolio_links.includes(v)) { set('portfolio_links', [...form.portfolio_links, v]); set('portfolio_input', ''); } }}
                          className="flex items-center gap-1 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.15] text-[#1d1d1f] text-[13px] px-3 py-2 rounded-2xl transition-colors"
                        >
                          <Plus className="w-4 h-4" />Add
                        </button>
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            </Section>
          )}

          <Section title="Geographic reach" icon={<MapPin className="w-4 h-4 text-[#1d1d1f]" />}>
            <div className="bg-[#f5f5f7] border border-black/[0.08] rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#6e6e73] flex-shrink-0 mt-0.5" />
              <div className="text-[13px] text-[#6e6e73] leading-relaxed">
                Your listing will be live immediately after submission and visible to all buyers on the marketplace. Once a buyer secures your slot, you'll be notified to review their brief and confirm the booking.
              </div>
            </div>
          </Section>

          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 text-orange-600 text-[13px] px-4 py-3 rounded-2xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Please fix the errors above before submitting.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-50 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
            <button
              onClick={onBack}
              className="text-[#6e6e73] hover:text-[#1d1d1f] text-[14px] font-medium px-6 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] bg-white transition-all"
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-3 tracking-[-0.02em]">Listing live!</h2>
        <p className="text-[#6e6e73] text-[15px] mb-2">
          <span className="text-[#1d1d1f] font-semibold">{propertyName}</span> is now visible to all buyers on the marketplace.
        </p>
        <p className="text-[#aeaeb2] text-[13px] mb-8">
          You'll be notified when a buyer secures your slot. Make sure to respond within the hold window.
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

function Section({
  title, icon, children, optional,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; optional?: boolean;
}) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-[#1d1d1f] font-semibold text-[12px] uppercase tracking-widest">{title}</h2>
        {optional && <span className="text-[#aeaeb2] text-[11px] font-normal normal-case">(optional)</span>}
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
