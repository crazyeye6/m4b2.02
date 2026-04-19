import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactModalProps {
  onClose: () => void;
}

const SUBJECTS = [
  'General enquiry',
  'Buying — question about a listing',
  'Selling — listing my slot',
  'Billing or deposit issue',
  'Technical problem',
  'Partnership or press',
  'Other',
];

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
const INBOX = 'hello@updates.endingthisweek.media';

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
}

export default function ContactModal({ onClose }: ContactModalProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const token = await getToken();
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact_form',
          to: INBOX,
          data: {
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject,
            message: form.message.trim(),
          },
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to send message');
      }

      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f5f5f7] rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#1d1d1f]" />
            </div>
            <div>
              <h2 className="text-[#1d1d1f] font-semibold text-[15px] leading-tight">Contact us</h2>
              <p className="text-[#aeaeb2] text-[11px]">We reply within one business day</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors text-[#aeaeb2] hover:text-[#1d1d1f]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center px-8 py-16 text-center gap-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-[#1d1d1f] font-semibold text-[17px] mb-1">Message sent</p>
                <p className="text-[#6e6e73] text-[14px] leading-relaxed">
                  Thanks for reaching out. We'll get back to you at <span className="font-medium text-[#1d1d1f]">{form.email}</span> within one business day.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-6 py-2.5 rounded-2xl text-[14px] transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-widest mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] hover:border-black/[0.12] focus:border-black/[0.2] focus:bg-white rounded-xl px-3.5 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-widest mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-[#f5f5f7] border border-black/[0.06] hover:border-black/[0.12] focus:border-black/[0.2] focus:bg-white rounded-xl px-3.5 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-widest mb-1.5">
                  Subject
                </label>
                <select
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] hover:border-black/[0.12] focus:border-black/[0.2] focus:bg-white rounded-xl px-3.5 py-2.5 text-[14px] text-[#1d1d1f] outline-none transition-all appearance-none cursor-pointer"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-widest mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder="Tell us what you need help with..."
                  rows={5}
                  className="w-full bg-[#f5f5f7] border border-black/[0.06] hover:border-black/[0.12] focus:border-black/[0.2] focus:bg-white rounded-xl px-3.5 py-2.5 text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-all resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-700 leading-snug">{errorMsg}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1 pb-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:bg-[#aeaeb2] text-white font-semibold py-3 rounded-2xl text-[14px] transition-all"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {status === 'loading' ? 'Sending…' : 'Send message'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] text-[#6e6e73] hover:text-[#1d1d1f] text-[14px] font-medium transition-all"
                >
                  Cancel
                </button>
              </div>

              <p className="text-center text-[11px] text-[#aeaeb2] pb-1">
                Sending to <span className="font-medium">{INBOX}</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
