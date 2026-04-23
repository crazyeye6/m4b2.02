import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, RefreshCw, Loader2, CheckCircle, Send, Ban,
  RotateCcw, Eye, AlertTriangle, Zap, Check,
  ChevronDown, ChevronUp, LayoutList, Table, ExternalLink,
  AlertCircle, Package, Users, BookOpen, TrendingUp, Archive,
  RefreshCcw as SyncIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ImportBatch, ImportSlot } from './types';
import { TAG_CONFIG, STATUS_CONFIG, publishSlotToListings } from './index';

interface Props {
  batch: ImportBatch;
  updatingSlot: string | null;
  onUpdateSlotStatus: (id: string, status: ImportSlot['status'], notes?: string) => Promise<void>;
  onPublishSlot: (slot: ImportSlot) => Promise<void>;
  onSelectSlot: (slot: ImportSlot) => void;
  onBack: () => void;
  onRefresh: () => void;
  onRefreshStats?: () => void;
  publishers?: import('./types').PublisherProfile[];
  onPublisherRefreshed?: () => void;
}

type ViewMode = 'grouped' | 'table';
type SlotFilter = 'all' | 'pending_review' | 'needs_review' | 'approved' | 'published' | 'rejected';

interface PodcastGroup {
  name: string;
  slots: ImportSlot[];
  subscriberCount: string;
  niche: string;
}

function buildNewsletterGroups(slots: ImportSlot[]): PodcastGroup[] {
  const map = new Map<string, ImportSlot[]>();
  for (const slot of slots) {
    const key = slot.media_name || '(unnamed podcast)';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return Array.from(map.entries()).map(([name, nlSlots]) => ({
    name,
    slots: nlSlots,
    subscriberCount: nlSlots[0]?.audience_size || '',
    niche: nlSlots[0]?.category || '',
  }));
}

export default function BatchDetail({
  batch, updatingSlot, onUpdateSlotStatus, onPublishSlot, onSelectSlot, onBack, onRefresh, onRefreshStats, publishers, onPublisherRefreshed,
}: Props) {
  const [slots, setSlots]           = useState<ImportSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode]     = useState<ViewMode>('grouped');
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('csv_upload_slots')
      .select('*')
      .eq('batch_id', batch.id)
      .order('row_index');
    setSlots((data as ImportSlot[]) ?? []);
    setLoading(false);
  }, [batch.id]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const refreshAll = async () => { await loadSlots(); onRefresh(); };

  const handleUpdateStatus = async (slotId: string, status: ImportSlot['status'], notes?: string) => {
    await onUpdateSlotStatus(slotId, status, notes);
    await loadSlots();
  };

  const handlePublish = async (slot: ImportSlot) => {
    await onPublishSlot(slot);
    await loadSlots();
  };

  const handleApproveAndPublish = async (slot: ImportSlot) => {
    await supabase.from('csv_upload_slots')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
      .eq('id', slot.id);
    await publishSlotToListings({ ...slot, status: 'approved' });
    await loadSlots();
    onRefreshStats?.();
  };

  // ── Bulk actions ────────────────────────────────────────────────────────────

  const runBulk = async (fn: (targets: ImportSlot[]) => Promise<void>, filter: (s: ImportSlot) => boolean) => {
    setBulkLoading(true);
    const targets = selectedIds.size > 0
      ? slots.filter(s => selectedIds.has(s.id) && filter(s))
      : slots.filter(filter);
    await fn(targets);
    setSelectedIds(new Set());
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  const bulkApproveSelected = () => runBulk(
    async targets => {
      for (const s of targets) {
        await supabase.from('csv_upload_slots')
          .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
          .eq('id', s.id);
      }
    },
    s => s.status === 'pending_review' || s.status === 'needs_review'
  );

  const bulkPublishSelected = () => runBulk(
    async targets => { for (const s of targets) await publishSlotToListings(s); },
    s => s.status === 'approved'
  );

  const bulkRejectSelected = () => runBulk(
    async targets => {
      for (const s of targets) {
        await supabase.from('csv_upload_slots')
          .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
          .eq('id', s.id);
      }
    },
    s => s.status !== 'published' && s.status !== 'rejected' && s.status !== 'expired'
  );

  const bulkApproveAll = async () => {
    setBulkLoading(true);
    const targets = slots.filter(s => s.status === 'pending_review' || s.status === 'needs_review');
    for (const s of targets) {
      await supabase.from('csv_upload_slots')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  const bulkPublishApproved = async () => {
    setBulkLoading(true);
    const targets = slots.filter(s => s.status === 'approved');
    for (const s of targets) await publishSlotToListings(s);
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  const bulkSaveAsDraft = () => runBulk(
    async targets => {
      for (const s of targets) {
        await supabase.from('csv_upload_slots')
          .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
          .eq('id', s.id);
      }
    },
    s => s.status === 'pending_review' || s.status === 'needs_review'
  );

  // Refresh the publisher's media_profile with data from the batch's slots
  const syncPublisherProfile = async () => {
    if (!batch.media_profile_id) return;
    setSyncingProfile(true);
    const slotsForSync = slots.filter(s => s.audience_size || s.category);
    const firstSlot = slotsForSync[0];
    if (firstSlot) {
      const subCount = firstSlot.audience_size
        ? parseInt(firstSlot.audience_size.replace(/[^0-9]/g, '')) || null
        : null;
      const updates: Record<string, string | number | null> = {};
      if (subCount) updates.subscriber_count = subCount;
      if (firstSlot.category) updates.category = firstSlot.category;
      updates.updated_at = new Date().toISOString();
      await supabase.from('media_profiles').update(updates).eq('id', batch.media_profile_id);
    }
    setSyncingProfile(false);
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 3000);
    onPublisherRefreshed?.();
  };

  const fastPublish = async () => {
    setBulkLoading(true);
    const targets = slots.filter(s =>
      (s.import_tag === 'new' || s.import_tag === 'updated') &&
      s.status !== 'published' && s.status !== 'rejected' && s.status !== 'expired' &&
      !s.validation_errors?.some(e => e.severity === 'error')
    );
    for (const s of targets) {
      await supabase.from('csv_upload_slots')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', s.id);
      await publishSlotToListings({ ...s, status: 'approved' });
    }
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  // ── Counts ──────────────────────────────────────────────────────────────────

  const counts = {
    pending:   slots.filter(s => s.status === 'pending_review').length,
    review:    slots.filter(s => s.status === 'needs_review').length,
    approved:  slots.filter(s => s.status === 'approved').length,
    published: slots.filter(s => s.status === 'published').length,
    rejected:  slots.filter(s => s.status === 'rejected').length,
  };
  const tagCounts = {
    new:       slots.filter(s => s.import_tag === 'new').length,
    updated:   slots.filter(s => s.import_tag === 'updated').length,
    unchanged: slots.filter(s => s.import_tag === 'unchanged').length,
    duplicate: slots.filter(s => s.import_tag === 'duplicate').length,
  };
  const fastPublishCount = slots.filter(s =>
    (s.import_tag === 'new' || s.import_tag === 'updated') &&
    s.status !== 'published' && s.status !== 'rejected' &&
    !s.validation_errors?.some(e => e.severity === 'error')
  ).length;
  const errorCount = slots.filter(s => s.validation_errors?.some(e => e.severity === 'error')).length;

  const publishPct = slots.length > 0 ? Math.round((counts.published / slots.length) * 100) : 0;

  const filteredSlots = slots.filter(s => slotFilter === 'all' || s.status === slotFilter);
  const nlGroups = buildNewsletterGroups(filteredSlots);

  const selectable = filteredSlots.filter(s => s.status !== 'published' && s.status !== 'expired');
  const allSelected = selectable.length > 0 && selectable.every(s => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(selectable.map(s => s.id)));
  };

  const toggleGroup = (key: string) => setCollapsedGroups(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Back + title */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Imports
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-[13px] font-semibold text-slate-900 truncate">{batch.publisher_name}</span>
        {batch.import_week && (
          <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
            w/c {batch.import_week}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button onClick={refreshAll}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[12px] border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {batch.media_profile_id && (
            <button onClick={syncPublisherProfile} disabled={syncingProfile || syncDone}
              className={`flex items-center gap-1.5 text-[12px] font-semibold border px-3 py-1.5 rounded-xl transition-all ${syncDone ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
              {syncingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : syncDone ? <Check className="w-3.5 h-3.5" /> : <SyncIcon className="w-3.5 h-3.5" />}
              {syncDone ? 'Profile synced' : 'Sync profile'}
            </button>
          )}
          {fastPublishCount > 0 && (
            <button onClick={fastPublish} disabled={bulkLoading}
              className="flex items-center gap-1.5 text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50">
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Fast Publish {fastPublishCount}
            </button>
          )}
        </div>
      </div>

      {/* Batch header card */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
        <div className="flex items-start gap-4 flex-wrap">
          {/* Publisher identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-[15px] font-bold">{(batch.publisher_name || 'P').charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold text-slate-900 truncate">{batch.publisher_name || 'Unknown Publisher'}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {batch.filename} · {new Date(batch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Status counters */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Total',    value: slots.length,                        cls: 'bg-slate-100 text-slate-700' },
              { label: 'Pending',  value: counts.pending + counts.review,      cls: (counts.pending + counts.review) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500' },
              { label: 'Approved', value: counts.approved,                     cls: counts.approved > 0 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500' },
              { label: 'Live',     value: counts.published,                    cls: counts.published > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500' },
              { label: 'Rejected', value: counts.rejected,                     cls: 'bg-slate-100 text-slate-500' },
            ].map(s => (
              <div key={s.label} className={`px-3 py-2 rounded-xl text-center min-w-[52px] ${s.cls}`}>
                <p className="text-[17px] font-bold leading-none">{s.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress + tag summary row */}
        <div className="mt-4 space-y-2.5">
          {/* Publish progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500">Publish progress</span>
              <span className="text-[11px] font-bold text-slate-700">{publishPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${publishPct}%` }} />
            </div>
          </div>

          {/* Tags + newsletter/slot summary */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <BookOpen className="w-3 h-3 text-slate-300" />
              <span className="font-medium">{nlGroups.length} podcast{nlGroups.length !== 1 ? 's' : ''}</span>
              <span className="text-slate-300">·</span>
              <span className="font-medium">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
            </div>
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-2.5 h-2.5" /> {errorCount} validation error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            <div className="flex items-center gap-1 flex-wrap">
              {(Object.entries(tagCounts) as [string, number][]).filter(([, v]) => v > 0).map(([tag, count]) => {
                const cfg = TAG_CONFIG[tag as keyof typeof TAG_CONFIG];
                return (
                  <span key={tag} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                    {count} {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-xl p-1 overflow-x-auto">
            {([
              ['all',            `All (${slots.length})`],
              ['pending_review', `Pending (${counts.pending})`],
              ['needs_review',   `Review (${counts.review})`],
              ['approved',       `Approved (${counts.approved})`],
              ['published',      `Live (${counts.published})`],
              ['rejected',       `Rejected (${counts.rejected})`],
            ] as const).map(([val, label]) => (
              <button key={val} onClick={() => setSlotFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${slotFilter === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 flex-shrink-0">
            <button onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <LayoutList className="w-3 h-3" /> Grouped
            </button>
            <button onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <Table className="w-3 h-3" /> Table
            </button>
          </div>
        </div>

        {/* Bulk actions bar */}
        <div className="px-4 py-2.5 bg-slate-50/40 border-b border-slate-100 flex items-center gap-2 flex-wrap min-h-[44px]">
          <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-slate-300" />
            <span className="text-[11px] text-slate-500 font-medium select-none">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
          </label>
          <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

          {selectedIds.size > 0 ? (
            <>
              <button onClick={bulkApproveSelected} disabled={bulkLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                <CheckCircle className="w-3 h-3" /> Approve selected
              </button>
              <button onClick={bulkSaveAsDraft} disabled={bulkLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                <Archive className="w-3 h-3" /> Save as draft
              </button>
              <button onClick={bulkPublishSelected} disabled={bulkLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                <Send className="w-3 h-3" /> Publish selected
              </button>
              <button onClick={bulkRejectSelected} disabled={bulkLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                <Ban className="w-3 h-3" /> Reject selected
              </button>
            </>
          ) : (
            <>
              {(counts.pending + counts.review) > 0 && (
                <>
                  <button onClick={bulkApproveAll} disabled={bulkLoading}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                    <CheckCircle className="w-3 h-3" /> Approve all pending
                  </button>
                  <button
                    onClick={async () => {
                      setBulkLoading(true);
                      for (const s of slots.filter(x => x.status === 'pending_review' || x.status === 'needs_review')) {
                        await supabase.from('csv_upload_slots')
                          .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
                          .eq('id', s.id);
                      }
                      await loadSlots(); setBulkLoading(false); onRefreshStats?.();
                    }}
                    disabled={bulkLoading}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                    <Archive className="w-3 h-3" /> Save all as draft
                  </button>
                </>
              )}
              {counts.approved > 0 && (
                <button onClick={bulkPublishApproved} disabled={bulkLoading}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                  <Send className="w-3 h-3" /> Publish all approved ({counts.approved})
                </button>
              )}
            </>
          )}

          {bulkLoading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin ml-1" />}
        </div>

        {/* Slot content */}
        {filteredSlots.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-[13px] text-slate-400">No slots match this filter</p>
          </div>
        ) : viewMode === 'grouped' ? (
          // ── Grouped view ──
          <div className="divide-y divide-slate-100">
            {nlGroups.map(group => {
              const isCollapsed = collapsedGroups.has(group.name);
              const nlCounts = {
                pending: group.slots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length,
                approved: group.slots.filter(s => s.status === 'approved').length,
                live: group.slots.filter(s => s.status === 'published').length,
                errors: group.slots.filter(s => s.validation_errors?.some(e => e.severity === 'error')).length,
              };
              const allNlSelected = group.slots.every(s => selectedIds.has(s.id));

              return (
                <div key={group.name}>
                  {/* Podcast group header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-slate-50/60 hover:bg-slate-50 cursor-pointer select-none"
                    onClick={() => toggleGroup(group.name)}
                  >
                    <input type="checkbox" checked={allNlSelected}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(prev => new Set([...prev, ...group.slots.map(s => s.id)]));
                        else setSelectedIds(prev => { const n = new Set(prev); group.slots.forEach(s => n.delete(s.id)); return n; });
                      }}
                      className="rounded border-slate-300 flex-shrink-0"
                    />

                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-bold text-slate-900 truncate">{group.name}</p>
                        {group.niche && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{group.niche}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        {group.subscriberCount && (
                          <span className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {group.subscriberCount} subs
                          </span>
                        )}
                        <span>{group.slots.length} slot{group.slots.length !== 1 ? 's' : ''}</span>
                        {nlCounts.pending > 0 && <span className="font-semibold text-orange-600">{nlCounts.pending} pending</span>}
                        {nlCounts.approved > 0 && <span className="font-semibold text-teal-600">{nlCounts.approved} approved</span>}
                        {nlCounts.live > 0 && <span className="font-semibold text-emerald-600">{nlCounts.live} live</span>}
                        {nlCounts.errors > 0 && <span className="font-semibold text-red-500">{nlCounts.errors} error{nlCounts.errors !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>

                    {/* Group quick actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      {nlCounts.pending > 0 && (
                        <button
                          onClick={async () => {
                            setBulkLoading(true);
                            for (const s of group.slots.filter(x => x.status === 'pending_review' || x.status === 'needs_review')) {
                              await supabase.from('csv_upload_slots')
                                .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
                                .eq('id', s.id);
                            }
                            await loadSlots(); setBulkLoading(false); onRefreshStats?.();
                          }}
                          disabled={bulkLoading}
                          className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-white border border-teal-200 hover:bg-teal-50 px-2 py-1 rounded-lg transition-all"
                          title="Approve all pending in this newsletter"
                        >
                          <Check className="w-2.5 h-2.5" /> Approve all
                        </button>
                      )}
                    </div>

                    <TrendingUp className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                  </div>

                  {!isCollapsed && (
                    <div className="divide-y divide-slate-50">
                      {group.slots.map(slot => (
                        <SlotRow
                          key={slot.id}
                          slot={slot}
                          selected={selectedIds.has(slot.id)}
                          updating={updatingSlot === slot.id || bulkLoading}
                          onToggleSelect={() => setSelectedIds(prev => { const n = new Set(prev); n.has(slot.id) ? n.delete(slot.id) : n.add(slot.id); return n; })}
                          onUpdateStatus={handleUpdateStatus}
                          onPublish={handlePublish}
                          onApproveAndPublish={handleApproveAndPublish}
                          onViewDetails={() => onSelectSlot(slot)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // ── Table view ──
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-3 py-2.5 w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-slate-300" />
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Tag</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Newsletter</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Type</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Price</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Send Date</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Deadline</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Status</th>
                  <th className="px-3 py-2.5 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSlots.map(slot => {
                  const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];
                  const sCfg = STATUS_CONFIG[slot.status];
                  const hasErrors = slot.validation_errors?.some(e => e.severity === 'error');
                  return (
                    <tr key={slot.id}
                      className={`group transition-colors ${slot.status === 'rejected' ? 'opacity-40' : hasErrors ? 'bg-red-50/20' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={selectedIds.has(slot.id)}
                          onChange={() => setSelectedIds(prev => { const n = new Set(prev); n.has(slot.id) ? n.delete(slot.id) : n.add(slot.id); return n; })}
                          className="rounded border-slate-300" />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
                          <span className={`w-1 h-1 rounded-full ${tCfg.dot}`} />{tCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900 max-w-[140px] truncate">{slot.media_name}</td>
                      <td className="px-3 py-2.5 text-slate-500 truncate max-w-[120px]">{slot.opportunity_type || '—'}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{slot.original_price ? `$${slot.original_price.replace(/[^0-9.]/g, '')}` : '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500">{slot.send_date || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500">{slot.deadline || '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${sCfg.pill}`}>
                            {sCfg.label}
                          </span>
                          {hasErrors && <AlertCircle className="w-3 h-3 text-red-400" />}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onSelectSlot(slot)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400" title="View details"><Eye className="w-3.5 h-3.5" /></button>
                          {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                            <>
                              <button onClick={() => handleUpdateStatus(slot.id, 'approved')} className="p-1 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleApproveAndPublish(slot)} className="p-1 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600" title="Approve & Publish"><Zap className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                          {slot.status === 'approved' && (
                            <button onClick={() => handlePublish(slot)} className="p-1 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600" title="Publish"><Send className="w-3.5 h-3.5" /></button>
                          )}
                          {slot.status === 'published' && slot.listing_id && (
                            <a href={`/listing/${slot.listing_id}`} target="_blank" rel="noopener noreferrer"
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700" title="View live listing">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {slot.status !== 'rejected' && slot.status !== 'published' && slot.status !== 'expired' && (
                            <button onClick={() => handleUpdateStatus(slot.id, 'rejected')} className="p-1 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500" title="Reject"><Ban className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Slot row (grouped view) ───────────────────────────────────────────────────

function SlotRow({
  slot, selected, updating, onToggleSelect, onUpdateStatus, onPublish, onApproveAndPublish, onViewDetails,
}: {
  slot: ImportSlot;
  selected: boolean;
  updating: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (id: string, status: ImportSlot['status']) => void;
  onPublish: (slot: ImportSlot) => void;
  onApproveAndPublish: (slot: ImportSlot) => void;
  onViewDetails: () => void;
}) {
  const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];
  const sCfg = STATUS_CONFIG[slot.status];
  const hasErrors = slot.validation_errors?.some(e => e.severity === 'error');
  const hasWarnings = slot.validation_errors?.some(e => e.severity === 'warning');

  return (
    <div className={`flex items-center gap-0 group transition-colors ${slot.status === 'rejected' ? 'opacity-40' : hasErrors ? 'bg-red-50/30' : 'hover:bg-slate-50/50'}`}>
      {/* Status bar */}
      <div className={`w-[3px] self-stretch flex-shrink-0 ${sCfg.bar}`} />

      <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="rounded border-slate-300 flex-shrink-0" />

        {/* Import tag */}
        <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
          {tCfg.label}
        </span>

        {/* Changed field badges */}
        {slot.import_tag === 'updated' && (slot as ImportSlot & { changedFields?: string[] }).changedFields?.map((f: string) => (
          <span key={f} className="text-[8px] font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-1 py-0.5 rounded flex-shrink-0">{f}</span>
        ))}

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[12px] font-semibold text-slate-900 truncate">{slot.opportunity_type || 'Sponsored Slot'}</p>
            <p className="text-[12px] font-bold text-emerald-700">{slot.original_price ? `$${slot.original_price.replace(/[^0-9.]/g, '')}` : '—'}</p>
            {slot.slots_available && parseInt(slot.slots_available) > 1 && (
              <span className="text-[10px] text-slate-400">{slot.slots_available} slots</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
            {slot.send_date && <span>Send: <span className="font-medium text-slate-600">{slot.send_date}</span></span>}
            {slot.deadline && <span>Deadline: <span className="font-medium text-slate-600">{slot.deadline}</span></span>}
          </div>
          {/* Validation issues inline */}
          {(hasErrors || hasWarnings) && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {slot.validation_errors?.slice(0, 3).map((e, i) => (
                <span key={i} className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded ${e.severity === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {e.severity === 'error' ? <AlertCircle className="w-2 h-2" /> : <AlertTriangle className="w-2 h-2" />}
                  {e.field}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status pill */}
        <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sCfg.pill}`}>
          {sCfg.label}
        </span>

        {/* Row actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {updating ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />
          ) : (
            <>
              <button onClick={onViewDetails} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors" title="Details">
                <Eye className="w-3.5 h-3.5" />
              </button>
              {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                <>
                  <button onClick={() => onUpdateStatus(slot.id, 'approved')}
                    className="p-1.5 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600 transition-colors" title="Approve only">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  {!hasErrors && (
                    <button onClick={() => onApproveAndPublish(slot)}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-emerald-600 rounded-lg text-slate-400 hover:text-white bg-transparent hover:shadow-sm transition-all text-[10px] font-semibold" title="Approve & Publish immediately">
                      <Zap className="w-3 h-3" />
                      <span className="hidden sm:inline">Publish</span>
                    </button>
                  )}
                </>
              )}
              {slot.status === 'approved' && (
                <button onClick={() => onPublish(slot)}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-600 rounded-lg text-emerald-600 hover:text-white transition-all text-[10px] font-semibold border border-emerald-200 hover:border-emerald-600" title="Publish live">
                  <Send className="w-3 h-3" />
                  <span className="hidden sm:inline">Publish</span>
                </button>
              )}
              {slot.status === 'published' && slot.listing_id && (
                <a href={`/listing/${slot.listing_id}`} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700" title="View live listing">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {slot.status !== 'rejected' && slot.status !== 'published' && slot.status !== 'expired' && (
                <button onClick={() => onUpdateStatus(slot.id, 'rejected')}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Reject">
                  <Ban className="w-3.5 h-3.5" />
                </button>
              )}
              {slot.status === 'rejected' && (
                <button onClick={() => onUpdateStatus(slot.id, 'pending_review')}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="Restore">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
