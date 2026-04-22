import { useState } from 'react';
import {
  X, CheckCircle, Send, Ban, RotateCcw, ExternalLink,
  XCircle, AlertTriangle, Loader2, ArrowUpRight, Diff,
  Pencil, Save, Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ImportSlot } from './types';
import { TAG_CONFIG, STATUS_CONFIG } from './index';

interface Props {
  slot: ImportSlot;
  updating: boolean;
  onStatusChange: (status: ImportSlot['status'], notes?: string) => void;
  onPublish: () => void;
  onClose: () => void;
}

interface EditableFields {
  opportunity_type: string;
  original_price: string;
  slots_available: string;
  send_date: string;
  deadline: string;
  booking_url: string;
  description: string;
  audience_size: string;
  category: string;
}

export default function SlotDetailDrawer({ slot, updating, onStatusChange, onPublish, onClose }: Props) {
  const [notes, setNotes] = useState(slot.admin_notes || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFields, setEditFields] = useState<EditableFields>({
    opportunity_type: slot.opportunity_type || '',
    original_price:   slot.original_price || '',
    slots_available:  slot.slots_available || '1',
    send_date:        slot.send_date || '',
    deadline:         slot.deadline || '',
    booking_url:      slot.booking_url || '',
    description:      slot.description || '',
    audience_size:    slot.audience_size || '',
    category:         slot.category || '',
  });

  const sCfg = STATUS_CONFIG[slot.status];
  const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];
  const hasErrors = slot.validation_errors?.some(e => e.severity === 'error');

  const set = (k: keyof EditableFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditFields(prev => ({ ...prev, [k]: e.target.value }));

  const saveEdits = async () => {
    setSaving(true);
    await supabase
      .from('csv_upload_slots')
      .update({
        opportunity_type: editFields.opportunity_type,
        original_price:   editFields.original_price,
        discount_price:   editFields.original_price,
        slots_available:  editFields.slots_available,
        send_date:        editFields.send_date,
        deadline:         editFields.deadline,
        booking_url:      editFields.booking_url,
        description:      editFields.description,
        audience_size:    editFields.audience_size,
        category:         editFields.category,
        updated_at:       new Date().toISOString(),
      })
      .eq('id', slot.id);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top status bar */}
        <div className={`h-1 ${sCfg.bar}`} />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-[15px] font-bold text-slate-900 truncate">{slot.media_name}</h3>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
                <span className={`w-1 h-1 rounded-full ${tCfg.dot}`} />{tCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${sCfg.pill}`}>
                {sCfg.label}
              </span>
              {hasErrors && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  <XCircle className="w-2.5 h-2.5" /> Has errors
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!editing && slot.status !== 'published' && slot.status !== 'expired' && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[62vh] overflow-y-auto">

          {/* Change diff notice */}
          {slot.import_tag === 'updated' && (slot as ImportSlot & { changedFields?: string[] }).changedFields?.length > 0 && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5">
              <Diff className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-sky-800">Updated from previous batch</p>
                <p className="text-[11px] text-sky-600 mt-0.5">
                  Changed: {(slot as ImportSlot & { changedFields?: string[] }).changedFields?.join(', ')}
                </p>
              </div>
            </div>
          )}

          {editing ? (
            /* ── Edit mode ── */
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Editing slot fields</p>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  ['opportunity_type', 'Sponsorship Type', 'text'],
                  ['original_price',   'Price (USD)',      'text'],
                  ['slots_available',  'Slots Available',  'text'],
                  ['send_date',        'Send Date',        'date'],
                  ['deadline',         'Booking Deadline', 'date'],
                  ['audience_size',    'Audience / Subs',  'text'],
                  ['category',         'Niche / Category', 'text'],
                ] as [keyof EditableFields, string, string][]).map(([k, label, type]) => (
                  <div key={k}>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                    <input
                      type={type}
                      value={editFields[k]}
                      onChange={set(k)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all [color-scheme:light]"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Booking URL</label>
                <input
                  type="url"
                  value={editFields.booking_url}
                  onChange={set('booking_url')}
                  placeholder="https://…"
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                <textarea
                  value={editFields.description}
                  onChange={set('description')}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-[12px] resize-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
                />
              </div>
            </div>
          ) : (
            /* ── Read mode ── */
            <>
              {/* Slot details grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Sponsorship Type', slot.opportunity_type || '—'],
                  ['Price', slot.original_price ? `$${slot.original_price.replace(/[^0-9.]/g, '')}` : '—'],
                  ['Audience / Subs', slot.audience_size ? `${slot.audience_size}` : '—'],
                  ['Slots Available', slot.slots_available || '1'],
                  ['Send Date', slot.send_date || '—'],
                  ['Deadline', slot.deadline || '—'],
                  ['Niche / Category', slot.category || '—'],
                  ['Listing ID', slot.listing_id ? slot.listing_id.slice(0, 8) + '…' : 'Not published'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Booking URL */}
              {slot.booking_url && (
                <a href={slot.booking_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[12px] text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="truncate">{slot.booking_url}</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                </a>
              )}

              {/* Description */}
              {slot.description && (
                <div className="bg-slate-50 rounded-xl px-3.5 py-3">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Description</p>
                  <p className="text-[12px] text-slate-700 leading-relaxed">{slot.description}</p>
                </div>
              )}
            </>
          )}

          {/* Validation errors — always visible */}
          {slot.validation_errors?.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-3">
              <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-2">Validation Issues</p>
              <ul className="space-y-1.5">
                {slot.validation_errors.map((e, i) => (
                  <li key={i} className={`flex items-start gap-2 text-[11px] ${e.severity === 'error' ? 'text-red-700' : 'text-orange-700'}`}>
                    {e.severity === 'error'
                      ? <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />
                      : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-orange-500" />}
                    <span><strong>{e.field}:</strong> {e.message}</span>
                  </li>
                ))}
              </ul>
              {hasErrors && (
                <p className="text-[10px] text-red-600 mt-2 font-medium">
                  Fix these errors above, then approve and publish.
                </p>
              )}
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Admin Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional internal notes…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 bg-slate-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Action footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          {editing ? (
            <>
              <button
                onClick={saveEdits}
                disabled={saving}
                className="flex items-center gap-1.5 text-[12px] font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all"
              >
                Cancel
              </button>
            </>
          ) : updating ? (
            <div className="flex items-center gap-2 text-[12px] text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Updating…
            </div>
          ) : (
            <>
              {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                <>
                  <button onClick={() => onStatusChange('approved', notes)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-all">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  {!hasErrors && (
                    <button onClick={() => { onStatusChange('approved', notes); setTimeout(onPublish, 300); }}
                      className="flex items-center gap-1.5 text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all">
                      <Zap className="w-3.5 h-3.5" /> Approve & Publish
                    </button>
                  )}
                </>
              )}
              {slot.status === 'approved' && (
                <button onClick={onPublish}
                  className="flex items-center gap-1.5 text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all">
                  <Send className="w-3.5 h-3.5" /> Publish Live
                </button>
              )}
              {slot.status === 'published' && slot.listing_id && (
                <a href={`/listing/${slot.listing_id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all">
                  <ExternalLink className="w-3.5 h-3.5" /> View Live Listing
                </a>
              )}
              {slot.status !== 'rejected' && slot.status !== 'published' && slot.status !== 'expired' && (
                <button onClick={() => onStatusChange('rejected', notes)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                  <Ban className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              {slot.status === 'rejected' && (
                <button onClick={() => onStatusChange('pending_review', notes)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all">
                  <RotateCcw className="w-3.5 h-3.5" /> Restore to Pending
                </button>
              )}
            </>
          )}
          <button onClick={onClose} className="ml-auto text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
