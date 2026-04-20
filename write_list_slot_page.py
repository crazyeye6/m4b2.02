import os

content = r"""import { useState, useEffect } from 'react';
import { ArrowLeft, Check, ChevronRight, Loader2, BookOpen, Users, BarChart2, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { MediaProfile, Newsletter } from '../types';

interface ListSlotPageProps {
  onBack: () => void;
  onEditProfile: () => void;
  preselectedNewsletterId?: string | null;
}

interface FormState {
  newsletter_id: string | null;
  property_name: string;
  media_company_name: string;
  media_owner_name: string;
  audience: string;
  location: string;
  subscribers: string;
  open_rate: string;
  slot_type: string;
  date_label: string;
  posting_date_start: string;
  posting_date_end: string;
  posting_time: string;
  deadline_at: string;
  original_price: string;
  slots_total: string;
  deliverables_detail: string;
  past_advertisers: string;
  auto_discount_enabled: boolean;
  media_profile_id: string | null;
}

const BLANK: FormState = {
  newsletter_id: null,
  property_name: '',
  media_company_name: '',
  media_owner_name: '',
  audience: '',
  location: '',
  subscribers: '',
  open_rate: '',
  slot_type: 'Sponsored post',
  date_label: '',
  posting_date_start: '',
  posting_date_end: '',
  posting_time: '',
  deadline_at: '',
  original_price: '',
  slots_total: '1',
  deliverables_detail: '',
  past_advertisers: '',
  auto_discount_enabled: true,
  media_profile_id: null,
};

const SLOT_TYPES = [
  'Sponsored post', 'Dedicated send', 'Banner ad', 'Classified ad',
  'Podcast ad', 'Social post', 'Product feature', 'Newsletter mention', 'Other',
];

const AUDIENCE_OPTIONS = [
  'B2B SaaS', 'Marketing', 'Finance', 'Fintech', 'Startup', 'Tech', 'AI',
  'eCommerce', 'Health & Wellness', 'Fitness', 'Food', 'Travel', 'Fashion & Beauty',
  'Education', 'Crypto', 'Investing', 'Real Estate', 'Climate', 'Sports', 'Entertainment',
  'Creator Economy', 'HR & People', 'Product', 'Design', 'Dev & Engineering', 'General',
];

const GEOGRAPHIES = [
  'US', 'UK', 'US / UK', 'Ireland / UK / US', 'UK / Europe', 'Europe',
  'Global', 'APAC', 'LATAM', 'Canada', 'Australia', 'Middle East',
];

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-[#1d1d1f] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{number}</span>
        <h2 className="text-[#1d1d1f] font-semibold text-base">{title}</h2>
      </div>
      {subtitle && <p className="text-[#6e6e73] text-sm ml-8">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all [color-scheme:light]"
    />
  );
}

export default function ListSlotPage({ onBack, onEditProfile, preselectedNewsletterId }: ListSlotPageProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<FormState>({ ...BLANK, newsletter_id: preselectedNewsletterId ?? null });
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [mediaProfiles, setMediaProfiles] = useState<MediaProfile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'general', string>>>({});

  const set = (field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('newsletters').select('*').eq('seller_user_id', user.id).eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('media_profiles').select('*').eq('seller_user_id', user.id).eq('is_active', true).order('created_at', { ascending: true }),
    ]).then(([nlRes, mpRes]) => {
      setNewsletters((nlRes.data as Newsletter[]) ?? []);
      setMediaProfiles((mpRes.data as MediaProfile[]) ?? []);
    });
  }, [user]);

  const selectedNewsletter = newsletters.find(n => n.id === form.newsletter_id) ?? null;
  void selectedNewsletter;

  useEffect(() => {
    const nl = newsletters.find(n => n.id === form.newsletter_id);
    if (!nl) return;
    setForm(prev => ({
      ...prev,
      property_name: nl.name || prev.property_name,
      media_company_name: nl.publisher_name || prev.media_company_name,
      subscribers: nl.subscriber_count?.toString() ?? prev.subscribers,
      open_rate: nl.avg_open_rate ?? prev.open_rate,
      location: nl.primary_geography ?? prev.location,
      audience: nl.niche ?? prev.audience,
    }));
  }, [form.newsletter_id]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.property_name.trim()) e.property_name = 'Newsletter name is required';
    if (!form.slot_type) e.slot_type = 'Slot type is required';
    if (!form.date_label.trim()) e.date_label = 'Issue date / label is required';
    if (!form.deadline_at) e.deadline_at = 'Booking deadline is required';
    if (!form.original_price || isNaN(Number(form.original_price)) || Number(form.original_price) <= 0) {
      e.original_price = 'Valid price is required';
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!user) return;
    setSubmitting(true);

    const price = Math.round(Number(form.original_price));
    const pastAdvertisers = form.past_advertisers
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Record<string, any> = {
      media_type: 'newsletter',
      seller_user_id: user.id,
      seller_email: user.email,
      media_owner_name: form.media_owner_name.trim() || profile?.display_name || user.email || '',
      media_company_name: form.media_company_name.trim(),
      property_name: form.property_name.trim(),
      audience: form.audience || 'General',
      location: form.location || 'Global',
      subscribers: form.subscribers ? parseInt(form.subscribers, 10) : null,
      open_rate: form.open_rate.trim() || null,
      slot_type: form.slot_type,
      date_label: form.date_label.trim(),
      posting_date_start: form.posting_date_start || null,
      posting_date_end: form.posting_date_end || null,
      posting_time: form.posting_time || null,
      deadline_at: new Date(form.deadline_at).toISOString(),
      original_price: price,
      discounted_price: price,
      slots_remaining: parseInt(form.slots_total, 10) || 1,
      slots_total: parseInt(form.slots_total, 10) || 1,
      past_advertisers: pastAdvertisers,
      deliverables_detail: form.deliverables_detail.trim() || null,
      status: 'live',
      auto_discount_enabled: form.auto_discount_enabled,
      newsletter_id: form.newsletter_id || null,
      media_profile_id: form.media_profile_id || null,
    };

    const { error } = await supabase.from('listings').insert(payload);
    if (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-3xl flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-[#1d1d1f] text-2xl font-semibold mb-2 tracking-[-0.02em]">Listing published!</h2>
        <p className="text-[#6e6e73] text-[15px] mb-8 text-center max-w-sm leading-relaxed">
          Your slot is now live on EndingThisWeek.media and will be matched with relevant buyers.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setSubmitted(false); setForm({ ...BLANK }); }}
            className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all"
          >
            List another slot
          </button>
          <button
            onClick={onBack}
            className="border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] font-semibold px-6 py-3 rounded-2xl text-sm transition-all"
          >
            Back to site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-[52px]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#aeaeb2]" />
          <span className="text-[#1d1d1f] font-semibold text-sm">List a slot</span>
        </div>

        <h1 className="text-[#1d1d1f] text-2xl font-semibold tracking-[-0.02em] mb-1">List an ad slot</h1>
        <p className="text-[#6e6e73] text-[15px] mb-8 leading-relaxed">
          Add your slot details below. Buyers will see this listing and can reserve it with a 5% deposit.
        </p>

        <div className="space-y-6">

          <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
            <SectionHeader
              number="1"
              title="Select a newsletter"
              subtitle={newsletters.length === 0 ? 'No newsletters yet — fill in details manually below.' : 'Pick one to auto-fill your newsletter data.'}
            />

            {newsletters.length > 0 ? (
              <div className="space-y-2">
                {newsletters.map(nl => (
                  <button
                    key={nl.id}
                    onClick={() => set('newsletter_id', nl.id === form.newsletter_id ? null : nl.id)}
                    className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                      form.newsletter_id === nl.id
                        ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] border-black/[0.06] hover:border-black/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${form.newsletter_id === nl.id ? 'bg-white/10' : 'bg-white border border-black/[0.06]'}`}>
                        <span className={`font-bold text-sm ${form.newsletter_id === nl.id ? 'text-white' : 'text-[#1d1d1f]'}`}>{nl.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${form.newsletter_id === nl.id ? 'text-white' : 'text-[#1d1d1f]'}`}>{nl.name}</p>
                        <div className={`flex items-center gap-3 mt-0.5 flex-wrap ${form.newsletter_id === nl.id ? 'text-white/60' : 'text-[#6e6e73]'}`}>
                          {nl.subscriber_count && (
                            <span className="flex items-center gap-1 text-[10px]">
                              <Users className="w-2.5 h-2.5" />
                              {nl.subscriber_count.toLocaleString()}
                            </span>
                          )}
                          {nl.avg_open_rate && (
                            <span className="flex items-center gap-1 text-[10px]">
                              <BarChart2 className="w-2.5 h-2.5" />
                              {nl.avg_open_rate} open
                            </span>
                          )}
                          {nl.niche && (
                            <span className="text-[10px]">{nl.niche}</span>
                          )}
                          {nl.primary_geography && (
                            <span className="flex items-center gap-1 text-[10px]">
                              <Globe className="w-2.5 h-2.5" />
                              {nl.primary_geography}
                            </span>
                          )}
                        </div>
                      </div>
                      {form.newsletter_id === nl.id && (
                        <Check className="w-4 h-4 text-white flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => set('newsletter_id', null)}
                  className="w-full text-center text-xs text-[#6e6e73] hover:text-[#1d1d1f] py-1 transition-colors"
                >
                  or fill in details manually
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4">
                <BookOpen className="w-5 h-5 text-[#aeaeb2] flex-shrink-0" />
                <div>
                  <p className="text-[#1d1d1f] text-sm font-medium">No newsletters saved yet</p>
                  <p className="text-[#6e6e73] text-xs mt-0.5">
                    Add newsletters in your{' '}
                    <button onClick={onEditProfile} className="text-[#1d1d1f] font-semibold hover:underline">Seller Dashboard</button>
                    {' '}to speed up future listings.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
            <SectionHeader number="2" title="About the slot" />

            <div className="space-y-4">
              <div>
                <FieldLabel required>Newsletter name</FieldLabel>
                <TextInput value={form.property_name} onChange={v => set('property_name', v)} placeholder="e.g. SaaS Insider" />
                {errors.property_name && <p className="text-red-500 text-[10px] mt-1">{errors.property_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Publisher / Company</FieldLabel>
                  <TextInput value={form.media_company_name} onChange={v => set('media_company_name', v)} placeholder="e.g. B2B Growth Co." />
                </div>
                <div>
                  <FieldLabel required>Slot type</FieldLabel>
                  <select
                    value={form.slot_type}
                    onChange={e => set('slot_type', e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                  >
                    {SLOT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Niche / Audience</FieldLabel>
                  <select
                    value={form.audience}
                    onChange={e => set('audience', e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                  >
                    <option value="">Select niche…</option>
                    {AUDIENCE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Primary geography</FieldLabel>
                  <select
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                  >
                    <option value="">Select geography…</option>
                    {GEOGRAPHIES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Subscriber count</FieldLabel>
                  <TextInput type="number" value={form.subscribers} onChange={v => set('subscribers', v)} placeholder="e.g. 45000" />
                </div>
                <div>
                  <FieldLabel>Avg open rate</FieldLabel>
                  <TextInput value={form.open_rate} onChange={v => set('open_rate', v)} placeholder="e.g. 42%" />
                </div>
              </div>

              <div>
                <FieldLabel required>Issue date / label</FieldLabel>
                <TextInput value={form.date_label} onChange={v => set('date_label', v)} placeholder="e.g. May 12, 2026 issue" />
                {errors.date_label && <p className="text-red-500 text-[10px] mt-1">{errors.date_label}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Issue start date</FieldLabel>
                  <TextInput type="date" value={form.posting_date_start} onChange={v => set('posting_date_start', v)} />
                </div>
                <div>
                  <FieldLabel>Issue end date</FieldLabel>
                  <TextInput type="date" value={form.posting_date_end} onChange={v => set('posting_date_end', v)} />
                </div>
              </div>

              <div>
                <FieldLabel required>Booking deadline</FieldLabel>
                <input
                  type="datetime-local"
                  value={form.deadline_at}
                  onChange={e => set('deadline_at', e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                />
                {errors.deadline_at && <p className="text-red-500 text-[10px] mt-1">{errors.deadline_at}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Price (USD)</FieldLabel>
                  <TextInput type="number" value={form.original_price} onChange={v => set('original_price', v)} placeholder="e.g. 1500" />
                  {errors.original_price && <p className="text-red-500 text-[10px] mt-1">{errors.original_price}</p>}
                </div>
                <div>
                  <FieldLabel>Slots available</FieldLabel>
                  <TextInput type="number" value={form.slots_total} onChange={v => set('slots_total', v)} placeholder="1" />
                </div>
              </div>

              <div>
                <FieldLabel>Deliverables detail</FieldLabel>
                <textarea
                  value={form.deliverables_detail}
                  onChange={e => set('deliverables_detail', e.target.value)}
                  rows={3}
                  placeholder="Describe what is included: word count, placement, format, any restrictions…"
                  className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
                />
              </div>

              <div>
                <FieldLabel>Past advertisers (comma-separated)</FieldLabel>
                <TextInput value={form.past_advertisers} onChange={v => set('past_advertisers', v)} placeholder="e.g. Notion, Linear, Figma" />
              </div>

              {mediaProfiles.length > 0 && (
                <div>
                  <FieldLabel>Link a media profile</FieldLabel>
                  <select
                    value={form.media_profile_id ?? ''}
                    onChange={e => set('media_profile_id', e.target.value || null)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
                  >
                    <option value="">No profile linked</option>
                    {mediaProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.newsletter_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
            <SectionHeader number="3" title="Pricing mode" subtitle="Control how your price changes as the deadline approaches." />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => set('auto_discount_enabled', true)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  form.auto_discount_enabled
                    ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                    : 'bg-[#f5f5f7] border-black/[0.06] hover:border-black/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold text-sm ${form.auto_discount_enabled ? 'text-white' : 'text-[#1d1d1f]'}`}>Auto-Discount</p>
                  {form.auto_discount_enabled && <Check className="w-4 h-4 text-white" />}
                </div>
                <p className={`text-xs leading-relaxed ${form.auto_discount_enabled ? 'text-white/60' : 'text-[#6e6e73]'}`}>
                  Price drops automatically: minus 10% at 3-5 days, minus 20% at 1-3 days, minus 30% under 24h. Fills slots faster.
                </p>
              </button>

              <button
                onClick={() => set('auto_discount_enabled', false)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  !form.auto_discount_enabled
                    ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                    : 'bg-[#f5f5f7] border-black/[0.06] hover:border-black/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold text-sm ${!form.auto_discount_enabled ? 'text-white' : 'text-[#1d1d1f]'}`}>Fixed Price</p>
                  {!form.auto_discount_enabled && <Check className="w-4 h-4 text-white" />}
                </div>
                <p className={`text-xs leading-relaxed ${!form.auto_discount_enabled ? 'text-white/60' : 'text-[#6e6e73]'}`}>
                  Your listing price stays fixed at the amount you set until the deadline passes.
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white border border-black/[0.06] rounded-3xl p-6">
            <SectionHeader number="4" title="Publish" />

            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-4 mb-5 space-y-2">
              <p className="text-[#1d1d1f] font-semibold text-sm">
                {form.property_name || 'Your newsletter'} — {form.slot_type}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-[#6e6e73]">
                {form.original_price && <span>${Number(form.original_price).toLocaleString()}</span>}
                {form.date_label && <span>{form.date_label}</span>}
                {form.location && <span>{form.location}</span>}
                <span>{form.auto_discount_enabled ? 'Auto-Discount active' : 'Fixed price'}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Publishing…' : 'Publish listing'}
            </button>
            <p className="text-[#aeaeb2] text-[11px] text-center mt-3">
              Your listing will be visible immediately. Buyers pay a 5% deposit to reserve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

file_path = '/tmp/cc-agent/65802475/project/src/pages/ListSlotPage.tsx'
os.makedirs(os.path.dirname(file_path), exist_ok=True)

with open(file_path, 'w') as f:
    f.write(content)

print('SUCCESS: File written to', file_path)
print('File size:', os.path.getsize(file_path), 'bytes')
