import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import type { Newsletter } from '../../types';
import type { NewsletterFormData } from './types';
import { NEWSLETTER_NICHES, SEND_FREQUENCIES, GEOGRAPHIES, BLANK_FORM } from './types';

interface Props {
  existing?: Newsletter;
  onSave: (form: NewsletterFormData) => Promise<void>;
  onCancel: () => void;
}

export default function NewsletterForm({ existing, onSave, onCancel }: Props) {
  const [form, setForm] = useState<NewsletterFormData>(
    existing
      ? {
          name: existing.name,
          publisher_name: existing.publisher_name,
          subscriber_count: existing.subscriber_count?.toString() ?? '',
          avg_open_rate: existing.avg_open_rate ?? '',
          niche: existing.niche ?? '',
          primary_geography: existing.primary_geography ?? '',
          send_frequency: existing.send_frequency ?? '',
          description: existing.description ?? '',
          website_url: existing.website_url ?? '',
        }
      : { ...BLANK_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewsletterFormData, string>>>({});

  const set = (field: keyof NewsletterFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Newsletter name is required';
    if (!form.publisher_name.trim()) e.publisher_name = 'Publisher name is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1d1d1f] font-semibold text-sm">{existing ? 'Edit newsletter' : 'Add newsletter'}</h3>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-xl text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
            Newsletter name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. SaaS Insider"
            className={`w-full bg-[#f5f5f7] border ${errors.name ? 'border-red-400' : 'border-black/[0.08]'} focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all`}
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
            Publisher / Company <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.publisher_name}
            onChange={e => set('publisher_name', e.target.value)}
            placeholder="e.g. B2B Growth Co."
            className={`w-full bg-[#f5f5f7] border ${errors.publisher_name ? 'border-red-400' : 'border-black/[0.08]'} focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all`}
          />
          {errors.publisher_name && <p className="text-red-500 text-[10px] mt-1">{errors.publisher_name}</p>}
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Subscriber count</label>
          <input
            type="number"
            value={form.subscriber_count}
            onChange={e => set('subscriber_count', e.target.value)}
            placeholder="e.g. 45000"
            min="0"
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Avg open rate</label>
          <input
            type="text"
            value={form.avg_open_rate}
            onChange={e => set('avg_open_rate', e.target.value)}
            placeholder="e.g. 42%"
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Niche / Category</label>
          <select
            value={form.niche}
            onChange={e => set('niche', e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
          >
            <option value="">Select niche…</option>
            {NEWSLETTER_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Primary geography</label>
          <select
            value={form.primary_geography}
            onChange={e => set('primary_geography', e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
          >
            <option value="">Select geography…</option>
            {GEOGRAPHIES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Send frequency</label>
          <select
            value={form.send_frequency}
            onChange={e => set('send_frequency', e.target.value)}
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all [color-scheme:light]"
          >
            <option value="">Select frequency…</option>
            {SEND_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Website URL</label>
          <input
            type="url"
            value={form.website_url}
            onChange={e => set('website_url', e.target.value)}
            placeholder="https://yournewsletter.com"
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="Brief description of your newsletter, audience, and what makes it unique…"
          className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {existing ? 'Save changes' : 'Add newsletter'}
        </button>
        <button
          onClick={onCancel}
          className="text-[#6e6e73] hover:text-[#1d1d1f] text-sm px-3 py-2 rounded-xl border border-black/[0.08] hover:border-black/[0.15] transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
