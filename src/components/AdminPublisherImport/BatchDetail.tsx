import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, RefreshCw, Loader2, CheckCircle, Send, Ban,
  RotateCcw, Eye, AlertTriangle, Zap, Check,
  ChevronDown, ChevronUp, LayoutList, Table, ExternalLink,
  AlertCircle, Package,
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
}

type ViewMode = 'grouped' | 'table';
type SlotFilter = 'all' | 'pending_review' | 'needs_review' | 'approved' | 'published' | 'rejected';

function groupSlots(slots: ImportSlot[]): Map<string, ImportSlot[]> {
  const map = new Map<string, ImportSlot[]>();
  for (const slot of slots) {
    const key = slot.media_name || '(unnamed newsletter)';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  return map;
}

export default function BatchDetail({
  batch, updatingSlot, onUpdateSlotStatus, onPublishSlot, onSelectSlot, onBack, onRefresh, onRefreshStats,
}: Props) {
  const [slots, setSlots]           = useState<ImportSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode]     = useState<ViewMode>('grouped');
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

  // ── Bulk actions ────────────────────────────────────────────────────────────

  const bulkApproveSelected = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const targets = slots.filter(s => selectedIds.has(s.id) && (s.status === 'pending_review' || s.status === 'needs_review'));
    for (const s of targets) {
      await supabase.from('csv_upload_slots')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
    setSelectedIds(new Set());
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  const bulkPublishSelected = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const targets = slots.filter(s => selectedIds.has(s.id) && s.status === 'approved');
    for (const s of targets) await publishSlotToListings(s);
    setSelectedIds(new Set());
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  const bulkRejectSelected = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const targets = slots.filter(s => selectedIds.has(s.id) && s.status !== 'published' && s.status !== 'rejected' && s.status !== 'expired');
    for (const s of targets) {
      await supabase.from('csv_upload_slots')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
    setSelectedIds(new Set());
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

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

  const fastPublish = async () => {
    setBulkLoading(true);
    const targets = slots.filter(s =>
      (s.import_tag === 'new' || s.import_tag === 'updated') &&
      s.status !== 'published' && s.status !== 'rejected' && s.status !== 'expired'
    );
    for (const s of targets) {
      await supabase.from('csv_upload_slots')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
    await loadSlots();
    const readyToPublish = slots.filter(s =>
      (s.import_tag === 'new' || s.import_tag === 'updated') &&
      s.status !== 'published' && s.status !== 'rejected' && s.status !== 'expired'
    );
    for (const s of readyToPublish) await publishSlotToListings({ ...s, status: 'approved' });
    await loadSlots();
    setBulkLoading(false);
    onRefreshStats?.();
  };

  // ── Counts ──────────────────────────────────────────────────────────────────

  const counts = {
    pending:    slots.filter(s => s.status === 'pending_review').length,
    review:     slots.filter(s => s.status === 'needs_review').length,
    approved:   slots.filter(s => s.status === 'approved').length,
    published:  slots.filter(s => s.status === 'published').length,
    rejected:   slots.filter(s => s.status === 'rejected').length,
  };
  const tagCounts = {
    new:       slots.filter(s => s.import_tag === 'new').length,
    updated:   slots.filter(s => s.import_tag === 'updated').length,
    unchanged: slots.filter(s => s.import_tag === 'unchanged').length,
    duplicate: slots.filter(s => s.import_tag === 'duplicate').length,
  };
  const fastPublishCount = slots.filter(s =>
    (s.import_tag === 'new' || s.import_tag === 'updated') && s.status !== 'published' && s.status !== 'rejected'
  ).length;

  const filteredSlots = slots.filter(s => slotFilter === 'all' || s.status === slotFilter);
  const grouped = groupSlots(filteredSlots);

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
      <div className="flex items-center gap-3">
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
        <div className="ml-auto flex items-center gap-2">
          <button onClick={refreshAll}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[12px] border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {fastPublishCount > 0 && (
            <button onClick={fastPublish} disabled={bulkLoading}
              className="flex items-center gap-1.5 text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50">
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Fast Publish {fastPublishCount} new/updated
            </button>
          )}
        </div>
      </div>

      {/* Batch metadata card */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-[14px] font-bold">{(batch.publisher_name || 'P').charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">{batch.publisher_name || 'Unknown Publisher'}</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {batch.filename} · uploaded {new Date(batch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Status stats */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Total', value: slots.length, cls: 'bg-slate-100 text-slate-700' },
              { label: 'Pending', value: counts.pending + counts.review, cls: 'bg-blue-100 text-blue-700' },
              { label: 'Approved', value: counts.approved, cls: 'bg-teal-100 text-teal-700' },
              { label: 'Live', value: counts.published, cls: 'bg-emerald-100 text-emerald-700' },
              { label: 'Rejected', value: counts.rejected, cls: 'bg-slate-100 text-slate-500' },
            ].map(s => (
              <div key={s.label} className={`px-3 py-1.5 rounded-xl text-center min-w-[52px] ${s.cls}`}>
                <p className="text-[16px] font-bold leading-none">{s.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide mt-0.5 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tag summary */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {(Object.entries(tagCounts) as [string, number][]).filter(([, v]) => v > 0).map(([tag, count]) => {
            const cfg = TAG_CONFIG[tag as keyof typeof TAG_CONFIG];
            return (
              <span key={tag} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 overflow-x-auto">
            {([
              ['all',          `All (${slots.length})`],
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
        <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-slate-300" />
            <span className="text-[11px] text-slate-500 font-medium select-none">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
          </label>
          <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

          {/* Contextual bulk actions for selected */}
          {selectedIds.size > 0 ? (
            <>
              <button onClick={bulkApproveSelected} disabled={bulkLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                <CheckCircle className="w-3 h-3" /> Approve selected
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
                <button onClick={bulkApproveAll} disabled={bulkLoading}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                  <CheckCircle className="w-3 h-3" /> Approve all pending
                </button>
              )}
              {counts.approved > 0 && (
                <button onClick={bulkPublishApproved} disabled={bulkLoading}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50">
                  <Send className="w-3 h-3" /> Publish all approved
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
            {Array.from(grouped.entries()).map(([nlName, nlSlots]) => {
              const isCollapsed = collapsedGroups.has(nlName);
              const nlCounts = {
                pending: nlSlots.filter(s => s.status === 'pending_review' || s.status === 'needs_review').length,
                live: nlSlots.filter(s => s.status === 'published').length,
              };
              const allNlSelected = nlSlots.every(s => selectedIds.has(s.id));

              return (
                <div key={nlName}>
                  {/* Newsletter group header */}
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 cursor-pointer" onClick={() => toggleGroup(nlName)}>
                    <input type="checkbox" checked={allNlSelected}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(prev => new Set([...prev, ...nlSlots.map(s => s.id)]));
                        else setSelectedIds(prev => { const n = new Set(prev); nlSlots.forEach(s => n.delete(s.id)); return n; });
                      }}
                      className="rounded border-slate-300"
                    />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                    <p className="text-[13px] font-semibold text-slate-800 flex-1">{nlName}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>{nlSlots.length} slot{nlSlots.length !== 1 ? 's' : ''}</span>
                      {nlCounts.pending > 0 && <span className="font-semibold text-orange-600">{nlCounts.pending} pending</span>}
                      {nlCounts.live > 0 && <span className="font-semibold text-emerald-600">{nlCounts.live} live</span>}
                    </div>
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-300" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-300" />}
                  </div>

                  {!isCollapsed && (
                    <div className="divide-y divide-slate-50">
                      {nlSlots.map(slot => (
                        <SlotRow
                          key={slot.id}
                          slot={slot}
                          selected={selectedIds.has(slot.id)}
                          updating={updatingSlot === slot.id}
                          onToggleSelect={() => setSelectedIds(prev => { const n = new Set(prev); n.has(slot.id) ? n.delete(slot.id) : n.add(slot.id); return n; })}
                          onUpdateStatus={handleUpdateStatus}
                          onPublish={handlePublish}
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
                  <th className="px-3 py-2.5 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSlots.map(slot => {
                  const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];
                  const sCfg = STATUS_CONFIG[slot.status];
                  return (
                    <tr key={slot.id}
                      className={`group transition-colors ${slot.status === 'rejected' ? 'opacity-40' : 'hover:bg-slate-50/60'}`}>
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
                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${sCfg.pill}`}>
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onSelectSlot(slot)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400" title="View details"><Eye className="w-3.5 h-3.5" /></button>
                          {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                            <button onClick={() => handleUpdateStatus(slot.id, 'approved')} className="p-1 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>
                          )}
                          {slot.status === 'approved' && (
                            <button onClick={() => handlePublish(slot)} className="p-1 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600" title="Publish"><Send className="w-3.5 h-3.5" /></button>
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
  slot, selected, updating, onToggleSelect, onUpdateStatus, onPublish, onViewDetails,
}: {
  slot: ImportSlot;
  selected: boolean;
  updating: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (id: string, status: ImportSlot['status']) => void;
  onPublish: (slot: ImportSlot) => void;
  onViewDetails: () => void;
}) {
  const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];
  const sCfg = STATUS_CONFIG[slot.status];
  const hasErrors = slot.validation_errors?.some(e => e.severity === 'error');

  return (
    <div className={`flex items-center gap-0 group transition-colors ${slot.status === 'rejected' ? 'opacity-40' : 'hover:bg-slate-50/50'}`}>
      {/* Status bar */}
      <div className={`w-[3px] self-stretch flex-shrink-0 ${sCfg.bar}`} />

      <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-2.5">
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
            <p className="text-[12px] font-bold text-slate-900">{slot.original_price ? `$${slot.original_price.replace(/[^0-9.]/g, '')}` : '—'}</p>
            {slot.slots_available && (
              <span className="text-[10px] text-slate-400">{slot.slots_available} slot{parseInt(slot.slots_available) !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
            {slot.send_date && <span>Send: {slot.send_date}</span>}
            {slot.deadline && <span>Deadline: {slot.deadline}</span>}
          </div>
        </div>

        {/* Status pill */}
        <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sCfg.pill}`}>
          {sCfg.label}
        </span>

        {/* Validation warning */}
        {hasErrors && (
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" title="Has validation errors" />
        )}

        {/* Row actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {updating ? (
            <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />
          ) : (
            <>
              <button onClick={onViewDetails} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors" title="Details">
                <Eye className="w-3.5 h-3.5" />
              </button>
              {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                <button onClick={() => onUpdateStatus(slot.id, 'approved')}
                  className="p-1.5 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600 transition-colors" title="Approve">
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              )}
              {slot.status === 'approved' && (
                <button onClick={() => onPublish(slot)}
                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Publish live">
                  <Send className="w-3.5 h-3.5" />
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
