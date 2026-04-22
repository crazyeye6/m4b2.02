import { Globe, FileText, Users, MapPin, BarChart2, Radio, Tag, Link, Image } from 'lucide-react';
import type { MediaProfileFormData } from './types';
import { CATEGORIES, GEOGRAPHIES, AUDIENCE_TYPES, FREQUENCIES, AD_FORMAT_OPTIONS } from './types';

interface Props {
  form: MediaProfileFormData;
  onChange: (f: MediaProfileFormData) => void;
}

function Field({ label, icon, hint, children }: { label: string; icon: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5">
        <span className="text-[#aeaeb2]">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#aeaeb2] mt-1">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.22] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.22] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
    />
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.22] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function MultiChip({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-xl border transition-all ${
              active
                ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                : 'bg-[#f5f5f7] text-[#6e6e73] border-black/[0.08] hover:border-black/[0.18]'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileForm({ form, onChange }: Props) {
  const set = (key: keyof MediaProfileFormData) => (v: string) => onChange({ ...form, [key]: v });

  const toggleAdFormat = (f: string) => {
    const current = form.ad_formats;
    onChange({ ...form, ad_formats: current.includes(f) ? current.filter(x => x !== f) : [...current, f] });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Newsletter / Media Name" icon={<FileText className="w-3 h-3" />}>
          <Input value={form.newsletter_name} onChange={set('newsletter_name')} placeholder="e.g. The Rundown AI" />
        </Field>
        <Field label="Tagline" icon={<Tag className="w-3 h-3" />} hint="Short one-liner shown on cards">
          <Input value={form.tagline} onChange={set('tagline')} placeholder="e.g. AI news for operators & builders" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Category" icon={<Tag className="w-3 h-3" />}>
          <Select value={form.category} onChange={set('category')} options={CATEGORIES} placeholder="Select category..." />
        </Field>
        <Field label="Primary Geography" icon={<MapPin className="w-3 h-3" />}>
          <Select value={form.primary_geography} onChange={set('primary_geography')} options={GEOGRAPHIES} placeholder="Select geography..." />
        </Field>
        <Field label="Audience Type" icon={<Users className="w-3 h-3" />}>
          <Select value={form.audience_type} onChange={set('audience_type')} options={AUDIENCE_TYPES} placeholder="Select audience type..." />
        </Field>
      </div>

      <Field label="Audience Summary" icon={<Users className="w-3 h-3" />} hint="Describe who reads this — buyers use this to assess fit">
        <Textarea
          value={form.audience_summary}
          onChange={set('audience_summary')}
          placeholder="e.g. 85,000+ tech operators, founders, and AI practitioners — mostly US/UK based, decision-makers in SaaS and B2B"
          rows={3}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Subscriber Count" icon={<Users className="w-3 h-3" />}>
          <Input value={form.subscriber_count} onChange={set('subscriber_count')} placeholder="e.g. 85000" type="number" />
        </Field>
        <Field label="Open Rate" icon={<BarChart2 className="w-3 h-3" />}>
          <Input value={form.open_rate} onChange={set('open_rate')} placeholder="e.g. 42%" />
        </Field>
        <Field label="Publishing Frequency" icon={<Radio className="w-3 h-3" />}>
          <Select value={form.publishing_frequency} onChange={set('publishing_frequency')} options={FREQUENCIES} placeholder="Select frequency..." />
        </Field>
      </div>

      <Field label="Available Ad Formats" icon={<Tag className="w-3 h-3" />} hint="Select all formats you offer">
        <MultiChip options={AD_FORMAT_OPTIONS} selected={form.ad_formats} onToggle={toggleAdFormat} />
      </Field>

      <Field label="Past Advertisers" icon={<Users className="w-3 h-3" />} hint="Comma-separated brand names — builds buyer trust">
        <Input value={form.past_advertisers} onChange={set('past_advertisers')} placeholder="e.g. Notion, Linear, Stripe, Vercel" />
      </Field>

      <div className="pt-2 border-t border-black/[0.06]">
        <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-4">Links &amp; Media</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Newsletter Website" icon={<Globe className="w-3 h-3" />}>
            <Input value={form.website_url} onChange={set('website_url')} placeholder="https://yoursite.com" type="url" />
          </Field>
          <Field label="Logo URL" icon={<Image className="w-3 h-3" />} hint="Direct link to your logo image">
            <Input value={form.logo_url} onChange={set('logo_url')} placeholder="https://..." type="url" />
          </Field>
          <Field label="Media Kit URL" icon={<Link className="w-3 h-3" />}>
            <Input value={form.media_kit_url} onChange={set('media_kit_url')} placeholder="https://..." type="url" />
          </Field>
          <Field label="Sample Issue URL" icon={<FileText className="w-3 h-3" />}>
            <Input value={form.sample_issue_url} onChange={set('sample_issue_url')} placeholder="https://..." type="url" />
          </Field>
        </div>
      </div>
    </div>
  );
}
