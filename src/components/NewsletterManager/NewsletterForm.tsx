import { useState } from 'react';
import { Loader2, Save, X, Lock, Send, CheckCircle } from 'lucide-react';
import type { Newsletter } from '../../types';
import type { NewsletterFormData } from './types';
import { SEND_FREQUENCIES, BLANK_FORM } from './types';
import TagComboInput from '../TagInput/TagComboInput';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Props {
  existing?: Newsletter;
  onSave: (form: NewsletterFormData) => Promise<void>;
  onCancel: () => void;
}

type NameChangeTarget = 'name' | 'publisher_name' | null;

export default function NewsletterForm({ existing, onSave, onCancel }: Props) {
  const { user } = useAuth();
  const [nameChangeTarget, setNameChangeTarget] = useState<NameChangeTarget>(null);
  const [requestedName, setRequestedName] = useState('');
  const [nameChangeReason, setNameChangeReason] = useState('');
  const [submittingNameChange, setSubmittingNameChange] = useState(false);
  const [nameChangeSent, setNameChangeSent] = useState<NameChangeTarget>(null);

  const openNameChange = (target: NameChangeTarget) => {
    if (!target) return;
    setNameChangeTarget(target);
    setRequestedName(target === 'name' ? (existing?.name ?? '') : (existing?.publisher_name ?? ''));
    setNameChangeReason('');
  };

  const submitNameChange = async () => {
    if (!user || !existing || !nameChangeTarget) return;
    if (!requestedName.trim() || !nameChangeReason.trim()) return;
    setSubmittingNameChange(true);
    const currentName = nameChangeTarget === 'name' ? existing.name : existing.publisher_name;
    await supabase.from('name_change_requests').insert({
      entity_type: 'newsletter',
      entity_id: existing.id,
      current_name: currentName ?? '',
      requested_name: requestedName.trim(),
      reason: nameChangeReason.trim(),
      seller_user_id: user.id,
      seller_email: user.email ?? '',
    });
    setSubmittingNameChange(false);
    setNameChangeSent(nameChangeTarget);
    setNameChangeTarget(null);
  };

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
    if (!form.name.trim()) e.name = 'Podcast name is required';
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
        <h3 className="text-[#1d1d1f] font-semibold text-sm">{existing ? 'Edit podcast' : 'Add podcast'}</h3>
        <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-xl text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {nameChangeSent && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">Name change request submitted. An admin will review it shortly.</p>
        </div>
      )}

      {nameChangeTarget && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="text-[#1d1d1f] font-semibold text-sm">
            Request {nameChangeTarget === 'name' ? 'podcast' : 'publisher'} name change
          </p>
          <p className="text-[#6e6e73] text-xs">
            Current: <span className="font-semibold text-[#1d1d1f]">{nameChangeTarget === 'name' ? existing?.name : existing?.publisher_name}</span>
          </p>
          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Requested name</label>
            <input
              type="text"
              value={requestedName}
              onChange={e => setRequestedName(e.target.value)}
              className="w-full bg-white border border-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all"
              placeholder="New name..."
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Reason <span className="text-red-400">*</span></label>
            <textarea
              value={nameChangeReason}
              onChange={e => setNameChangeReason(e.target.value)}
              rows={2}
              className="w-full bg-white border border-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all resize-none"
              placeholder="Briefly explain why the name needs to change..."
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setNameChangeTarget(null)} className="px-3 py-2 rounded-xl border border-black/[0.08] text-[#6e6e73] text-sm font-medium hover:text-[#1d1d1f] transition-all">
              Cancel
            </button>
            <button
              onClick={submitNameChange}
              disabled={submittingNameChange || !requestedName.trim() || !nameChangeReason.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold transition-all"
            >
              {submittingNameChange ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit request
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
            Podcast name <span className="text-red-400">*</span>
          </label>
          {existing ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm">
                <Lock className="w-3 h-3 text-[#aeaeb2] shrink-0" />
                <span className="truncate">{form.name || '—'}</span>
              </div>
              <button
                type="button"
                onClick={() => openNameChange('name')}
                className="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 px-2.5 py-2 rounded-xl transition-all whitespace-nowrap"
              >
                Request change
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. The SaaS Operator"
              className={`w-full bg-[#f5f5f7] border ${errors.name ? 'border-red-400' : 'border-black/[0.08]'} focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all`}
            />
          )}
          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">
            Host / Company <span className="text-red-400">*</span>
          </label>
          {existing ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm">
                <Lock className="w-3 h-3 text-[#aeaeb2] shrink-0" />
                <span className="truncate">{form.publisher_name || '—'}</span>
              </div>
              <button
                type="button"
                onClick={() => openNameChange('publisher_name')}
                className="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 px-2.5 py-2 rounded-xl transition-all whitespace-nowrap"
              >
                Request change
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={form.publisher_name}
              onChange={e => set('publisher_name', e.target.value)}
              placeholder="e.g. Meridian Audio"
              className={`w-full bg-[#f5f5f7] border ${errors.publisher_name ? 'border-red-400' : 'border-black/[0.08]'} focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all`}
            />
          )}
          {errors.publisher_name && <p className="text-red-500 text-[10px] mt-1">{errors.publisher_name}</p>}
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Downloads per episode</label>
          <input
            type="number"
            value={form.subscriber_count}
            onChange={e => set('subscriber_count', e.target.value)}
            placeholder="e.g. 25000"
            min="0"
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Audience size / engagement</label>
          <input
            type="text"
            value={form.avg_open_rate}
            onChange={e => set('avg_open_rate', e.target.value)}
            placeholder="e.g. 3.5%"
            className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Niche / Category</label>
          <TagComboInput
            value={form.niche}
            onChange={v => set('niche', v)}
            tagType="niche"
            placeholder="e.g. B2B SaaS, Tech…"
            allowFreeText
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Primary geography</label>
          <TagComboInput
            value={form.primary_geography}
            onChange={v => set('primary_geography', v)}
            tagType="geography"
            placeholder="e.g. US, UK, Global…"
            allowFreeText
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Release frequency</label>
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
          <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Website / Listen link</label>
          <input
            type="url"
            value={form.website_url}
            onChange={e => set('website_url', e.target.value)}
            placeholder="https://yourpodcast.com"
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
          placeholder="Brief description of your podcast, audience, and what makes it unique…"
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
          {existing ? 'Save changes' : 'Add podcast'}
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
