import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, X, Save, BookOpen, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { MediaProfile } from '../../types';
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import type { MediaProfileFormData } from './types';
import { EMPTY_FORM } from './types';

function profileToForm(p: MediaProfile): MediaProfileFormData {
  return {
    newsletter_name: p.newsletter_name,
    tagline: p.tagline,
    category: p.category,
    audience_summary: p.audience_summary,
    primary_geography: p.primary_geography,
    audience_type: p.audience_type,
    subscriber_count: p.subscriber_count != null ? String(p.subscriber_count) : '',
    open_rate: p.open_rate,
    publishing_frequency: p.publishing_frequency,
    ad_formats: p.ad_formats,
    past_advertisers: p.past_advertisers.join(', '),
    media_kit_url: p.media_kit_url,
    sample_issue_url: p.sample_issue_url,
    website_url: p.website_url,
    logo_url: p.logo_url,
  };
}

interface Props {
  onProfilesChanged?: (profiles: MediaProfile[]) => void;
}

export default function MediaProfileEditor({ onProfilesChanged }: Props) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<MediaProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MediaProfile | null | 'new'>(null);
  const [form, setForm] = useState<MediaProfileFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showNameChangeForm, setShowNameChangeForm] = useState(false);
  const [nameChangeReason, setNameChangeReason] = useState('');
  const [requestedName, setRequestedName] = useState('');
  const [submittingNameChange, setSubmittingNameChange] = useState(false);
  const [nameChangeSent, setNameChangeSent] = useState(false);

  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('media_profiles')
      .select('*')
      .eq('seller_user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    const list = (data as MediaProfile[]) ?? [];
    setProfiles(list);
    onProfilesChanged?.(list);
    setLoading(false);
  }, [user, onProfilesChanged]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const openNew = () => { setForm(EMPTY_FORM); setEditing('new'); setShowNameChangeForm(false); setNameChangeSent(false); };
  const openEdit = (p: MediaProfile) => { setForm(profileToForm(p)); setEditing(p); setShowNameChangeForm(false); setNameChangeSent(false); };
  const closeEditor = () => { setEditing(null); setSaved(false); setShowNameChangeForm(false); setNameChangeSent(false); };

  const openNameChangeForm = () => {
    if (!editing || editing === 'new') return;
    setRequestedName(editing.newsletter_name);
    setNameChangeReason('');
    setShowNameChangeForm(true);
  };

  const submitNameChange = async () => {
    if (!user || !editing || editing === 'new') return;
    if (!requestedName.trim() || !nameChangeReason.trim()) return;
    setSubmittingNameChange(true);
    await supabase.from('name_change_requests').insert({
      entity_type: 'publisher',
      entity_id: editing.id,
      current_name: editing.newsletter_name,
      requested_name: requestedName.trim(),
      reason: nameChangeReason.trim(),
      seller_user_id: user.id,
      seller_email: user.email ?? '',
    });
    setSubmittingNameChange(false);
    setNameChangeSent(true);
    setShowNameChangeForm(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      seller_user_id: user.id,
      seller_email: user.email ?? '',
      ...(editing === 'new' ? { newsletter_name: form.newsletter_name } : {}),
      tagline: form.tagline,
      category: form.category,
      audience_summary: form.audience_summary,
      primary_geography: form.primary_geography,
      audience_type: form.audience_type,
      subscriber_count: form.subscriber_count ? parseInt(form.subscriber_count, 10) : null,
      open_rate: form.open_rate,
      publishing_frequency: form.publishing_frequency,
      ad_formats: form.ad_formats,
      past_advertisers: form.past_advertisers
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      media_kit_url: form.media_kit_url,
      sample_issue_url: form.sample_issue_url,
      website_url: form.website_url,
      logo_url: form.logo_url,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (editing === 'new') {
      await supabase.from('media_profiles').insert(payload);
    } else if (editing) {
      await supabase.from('media_profiles').update(payload).eq('id', editing.id);
    }

    setSaving(false);
    setSaved(true);
    await fetchProfiles();
    setTimeout(() => { setSaved(false); closeEditor(); }, 1200);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('media_profiles').update({ is_active: false }).eq('id', deleteId);
    setDeleteId(null);
    setDeleting(false);
    await fetchProfiles();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[#1d1d1f] font-semibold text-base">Media / Newsletter Profiles</h3>
          <p className="text-[#6e6e73] text-xs mt-0.5">Create one profile per newsletter. Link each slot to a profile so buyers get full context automatically.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add profile
        </button>
      </div>

      {profiles.length === 0 && !editing && (
        <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl px-6 py-8 text-center">
          <div className="w-12 h-12 bg-white border border-black/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-[#aeaeb2]" />
          </div>
          <p className="text-[#1d1d1f] font-semibold text-sm mb-1">No media profiles yet</p>
          <p className="text-[#6e6e73] text-xs mb-4 max-w-xs mx-auto">
            Create a profile for each newsletter or media property. Link it to your slots so buyers see full context without you repeating yourself.
          </p>
          <button
            onClick={openNew}
            className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            Create first profile
          </button>
        </div>
      )}

      {profiles.map(p => (
        <ProfileCard
          key={p.id}
          profile={p}
          onEdit={() => openEdit(p)}
          onDelete={() => setDeleteId(p.id)}
        />
      ))}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">

            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[#1d1d1f] font-semibold">
                  {editing === 'new' ? 'New media profile' : 'Edit media profile'}
                </h2>
                <p className="text-[#6e6e73] text-xs mt-0.5">Fill out once — reuse across all your slot listings.</p>
              </div>
              <button onClick={closeEditor} className="text-[#aeaeb2] hover:text-[#1d1d1f] w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {saved ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <p className="text-[#1d1d1f] font-semibold">Profile saved!</p>
                  <p className="text-[#6e6e73] text-sm">You can now link this profile to your slot listings.</p>
                </div>
              ) : showNameChangeForm ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                    <p className="text-[#1d1d1f] font-semibold text-sm">Request name change</p>
                    <p className="text-[#6e6e73] text-xs">Current name: <span className="font-semibold text-[#1d1d1f]">{editing !== 'new' ? editing.newsletter_name : ''}</span></p>
                    <div>
                      <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5">Requested name</label>
                      <input
                        type="text"
                        value={requestedName}
                        onChange={e => setRequestedName(e.target.value)}
                        className="w-full bg-white border border-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all"
                        placeholder="New name..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5">Reason for change <span className="text-red-400">*</span></label>
                      <textarea
                        value={nameChangeReason}
                        onChange={e => setNameChangeReason(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-blue-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-[#1d1d1f] text-sm outline-none transition-all resize-none"
                        placeholder="Briefly explain why the name needs to change..."
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setShowNameChangeForm(false)}
                        className="px-4 py-2 rounded-xl border border-black/[0.08] text-[#6e6e73] text-sm font-medium hover:text-[#1d1d1f] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitNameChange}
                        disabled={submittingNameChange || !requestedName.trim() || !nameChangeReason.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold transition-all"
                      >
                        {submittingNameChange ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Submit request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {nameChangeSent && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-green-800 text-sm font-medium">Name change request submitted. An admin will review it shortly.</p>
                    </div>
                  )}
                  <ProfileForm form={form} onChange={setForm} isEditing={editing !== 'new'} onRequestNameChange={openNameChangeForm} />
                </>
              )}
            </div>

            {!saved && (
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] px-6 py-4 flex gap-3">
                <button
                  onClick={closeEditor}
                  className="px-5 py-2.5 rounded-xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.newsletter_name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white border border-black/[0.08] rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-[#1d1d1f] font-semibold">Delete this profile?</p>
                <p className="text-[#6e6e73] text-xs">Existing listings linked to it will still show their stored data.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-all">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
