import { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Package, Loader2, Upload,
  BarChart3, CheckCircle, Clock, Send, Zap, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ImportBatch, ImportSlot, PublisherProfile, PreviousSlotSnapshot } from './types';
import { buildFingerprint } from './csvUtils';
import ImportWizard from './ImportWizard';
import BatchDetail from './BatchDetail';
import SlotDetailDrawer from './SlotDetailDrawer';

// ── Config ────────────────────────────────────────────────────────────────────

export const TAG_CONFIG = {
  new:       { label: 'New',       color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500',  pill: 'bg-emerald-100 text-emerald-700' },
  updated:   { label: 'Updated',   color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200',     dot: 'bg-sky-500',      pill: 'bg-sky-100 text-sky-700' },
  unchanged: { label: 'Unchanged', color: 'text-slate-500',   bg: 'bg-slate-50',    border: 'border-slate-200',   dot: 'bg-slate-300',    pill: 'bg-slate-100 text-slate-500' },
  duplicate: { label: 'Duplicate', color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  dot: 'bg-orange-400',   pill: 'bg-orange-100 text-orange-700' },
} as const;

export const STATUS_CONFIG = {
  pending_review: { label: 'Pending',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    bar: 'bg-blue-400',    pill: 'bg-blue-100 text-blue-700' },
  needs_review:   { label: 'Review',   color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  bar: 'bg-orange-400',  pill: 'bg-orange-100 text-orange-700' },
  approved:       { label: 'Approved', color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200',    bar: 'bg-teal-400',    pill: 'bg-teal-100 text-teal-700' },
  rejected:       { label: 'Rejected', color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   bar: 'bg-slate-300',   pill: 'bg-slate-100 text-slate-500' },
  published:      { label: 'Live',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700' },
  expired:        { label: 'Expired',  color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200',   bar: 'bg-slate-200',   pill: 'bg-slate-50 text-slate-400' },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { onRefreshStats?: () => void }

type DashView = 'dashboard' | 'import' | 'batch';

// ── Publish helper (shared) ───────────────────────────────────────────────────

export async function publishSlotToListings(slot: ImportSlot): Promise<{ error: string | null }> {
  try {
    const deadlineDate = slot.deadline ? new Date(slot.deadline) : new Date(Date.now() + 7 * 86400000);
    const price = Math.round(parseFloat(slot.original_price.replace(/[€$£,]/g, '')) || 0);
    const subs  = parseInt(slot.audience_size.replace(/,/g, '').replace(/k$/i, '000')) || 0;

    const { data: newListing, error } = await supabase
      .from('listings')
      .insert([{
        media_type: 'newsletter',
        media_owner_name: slot.media_name, media_company_name: slot.media_name, property_name: slot.media_name,
        audience: slot.audience_size, subscribers: subs,
        slot_type: slot.opportunity_type || 'Sponsored Post',
        date_label: slot.send_date || '',
        deadline_at: deadlineDate.toISOString(),
        original_price: price, discounted_price: price,
        slots_remaining: parseInt(slot.slots_available) || 1,
        slots_total: parseInt(slot.slots_available) || 1,
        booking_url: slot.booking_url || '',
        deliverables_detail: slot.description || '',
        status: 'live', location: '',
        media_profile_id: slot.media_profile_id || null,
        auto_discount_enabled: true,
        ...(slot.send_date ? { posting_date_start: slot.send_date } : {}),
      }])
      .select('id')
      .maybeSingle();

    if (error) return { error: error.message };

    await supabase
      .from('csv_upload_slots')
      .update({ status: 'published', listing_id: newListing?.id ?? null, reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
      .eq('id', slot.id);

    return { error: null };
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Root component ────────────────────────────────────────────────────────────

export default function AdminPublisherImport({ onRefreshStats }: Props) {
  const [view, setView]               = useState<DashView>('dashboard');
  const [batches, setBatches]         = useState<ImportBatch[]>([]);
  const [publishers, setPublishers]   = useState<PublisherProfile[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [activeBatch, setActiveBatch] = useState<ImportBatch | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ImportSlot | null>(null);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);
  const [batchFilter, setBatchFilter] = useState<'all' | 'pending' | 'published' | 'needs_review'>('all');

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    const { data } = await supabase
      .from('csv_upload_batches')
      .select('*')
      .eq('uploaded_by_admin', true)
      .order('created_at', { ascending: false });
    setBatches((data as ImportBatch[]) ?? []);
    setLoadingBatches(false);
  }, []);

  const loadPublishers = useCallback(async () => {
    const { data } = await supabase
      .from('media_profiles')
      .select('id,newsletter_name,category,subscriber_count,seller_email,logo_url,website_url,tagline,audience_summary,primary_geography,is_active,updated_at')
      .order('newsletter_name');
    setPublishers((data as PublisherProfile[]) ?? []);
  }, []);

  useEffect(() => { loadBatches(); loadPublishers(); }, [loadBatches, loadPublishers]);

  const fetchPreviousSlots = async (profileId: string): Promise<PreviousSlotSnapshot[]> => {
    const { data } = await supabase
      .from('csv_upload_slots')
      .select('id, slot_fingerprint, send_date, deadline, original_price, opportunity_type, slots_available, status')
      .eq('media_profile_id', profileId)
      .in('status', ['published', 'approved', 'pending_review'])
      .order('created_at', { ascending: false });

    if (!data) return [];
    const seen = new Set<string>();
    return (data as Array<{
      id: string; slot_fingerprint: string; send_date: string; deadline: string;
      original_price: string; opportunity_type: string; slots_available: string; status: string;
    }>)
      .filter(s => {
        const fp = s.slot_fingerprint || buildFingerprint(s.send_date, s.opportunity_type);
        if (seen.has(fp)) return false;
        seen.add(fp);
        return true;
      })
      .map(s => ({
        id: s.id,
        fingerprint: s.slot_fingerprint || buildFingerprint(s.send_date, s.opportunity_type),
        send_date: s.send_date, deadline: s.deadline,
        price: s.original_price, sponsorship_type: s.opportunity_type,
        slots_available: s.slots_available, status: s.status,
      }));
  };

  const updateSlotStatus = async (slotId: string, status: ImportSlot['status'], notes?: string) => {
    setUpdatingSlot(slotId);
    await supabase.from('csv_upload_slots')
      .update({ status, admin_notes: notes ?? '', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
      .eq('id', slotId);
    setUpdatingSlot(null);
    onRefreshStats?.();
  };

  const publishSlot = async (slot: ImportSlot) => {
    setUpdatingSlot(slot.id);
    await publishSlotToListings(slot);
    setUpdatingSlot(null);
    if (selectedSlot?.id === slot.id) setSelectedSlot({ ...slot, status: 'published' });
    onRefreshStats?.();
  };

  // ── Dash stats ──────────────────────────────────────────────────────────────
  const totalBatches   = batches.length;
  const thisWeekBatches = batches.filter(b => {
    const d = new Date(b.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400_000);
    return d > weekAgo;
  }).length;
  const totalRows = batches.reduce((s, b) => s + (b.row_count || 0), 0);

  const filteredBatches = batches.filter(b => {
    if (batchFilter === 'all') return true;
    if (batchFilter === 'pending') return b.status === 'pending_review';
    if (batchFilter === 'published') return b.status === 'published';
    if (batchFilter === 'needs_review') return b.status === 'needs_review';
    return true;
  });

  if (view === 'import') {
    return (
      <ImportWizard
        publishers={publishers}
        batches={batches}
        onFetchPreviousSlots={fetchPreviousSlots}
        onDone={async () => { setView('dashboard'); await loadBatches(); onRefreshStats?.(); }}
        onCancel={() => setView('dashboard')}
      />
    );
  }

  if (view === 'batch' && activeBatch) {
    return (
      <>
        <BatchDetail
          batch={activeBatch}
          updatingSlot={updatingSlot}
          onUpdateSlotStatus={updateSlotStatus}
          onPublishSlot={publishSlot}
          onSelectSlot={setSelectedSlot}
          onBack={() => { setView('dashboard'); setActiveBatch(null); }}
          onRefresh={loadBatches}
          onRefreshStats={onRefreshStats}
        />
        {selectedSlot && (
          <SlotDetailDrawer
            slot={selectedSlot}
            updating={updatingSlot === selectedSlot.id}
            onStatusChange={async (status, notes) => { await updateSlotStatus(selectedSlot.id, status, notes); setSelectedSlot({ ...selectedSlot, status }); }}
            onPublish={() => publishSlot(selectedSlot)}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </>
    );
  }

  // ── Dashboard view ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Publisher CSV Imports</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">Weekly inventory management — upload, review, and publish in minutes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadBatches(); loadPublishers(); }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setView('import')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Import
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Batches',    value: totalBatches,    icon: <Package className="w-4 h-4 text-slate-400" />,    accent: false },
          { label: 'This Week',        value: thisWeekBatches, icon: <Clock className="w-4 h-4 text-blue-400" />,       accent: thisWeekBatches > 0 },
          { label: 'Total Slots',      value: totalRows,       icon: <BarChart3 className="w-4 h-4 text-teal-400" />,   accent: false },
          { label: 'Publishers',       value: publishers.length, icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, accent: false },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className={`text-[22px] font-bold tracking-tight leading-none ${s.accent ? 'text-blue-600' : 'text-slate-900'}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + batch list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            {([
              ['all',          'All'],
              ['pending',      'Pending'],
              ['needs_review', 'Needs Review'],
              ['published',    'Published'],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setBatchFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  batchFilter === val
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                {val !== 'all' && (
                  <span className="ml-1.5 text-[10px] tabular-nums">
                    {batches.filter(b =>
                      val === 'pending' ? b.status === 'pending_review' :
                      val === 'needs_review' ? b.status === 'needs_review' :
                      val === 'published' ? b.status === 'published' : true
                    ).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-slate-400">{filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}</p>
        </div>

        {/* Batch rows */}
        {loadingBatches ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[14px] font-semibold text-slate-500">No imports yet</p>
            <p className="text-[12px] text-slate-400 mt-1">Click "New Import" to upload a publisher CSV</p>
            <button
              onClick={() => setView('import')}
              className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> New Import
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBatches.map(batch => (
              <BatchRow
                key={batch.id}
                batch={batch}
                onOpen={() => { setActiveBatch(batch); setView('batch'); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Batch summary row (dashboard list) ────────────────────────────────────────

function BatchRow({ batch, onOpen }: { batch: ImportBatch; onOpen: () => void }) {
  const date = new Date(batch.created_at);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const statusCfg = STATUS_CONFIG[batch.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending_review;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
    >
      {/* Publisher avatar */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white text-[13px] font-bold">{(batch.publisher_name || 'P').charAt(0)}</span>
      </div>

      {/* Core info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[14px] font-semibold text-slate-900 truncate">{batch.publisher_name || 'Unknown Publisher'}</p>
          {batch.import_week && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">
              w/c {batch.import_week}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>{batch.filename}</span>
          <span>·</span>
          <span>{batch.row_count} rows</span>
          <span>·</span>
          <span>{dateStr} {timeStr}</span>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.pill}`}>
          {statusCfg.label}
        </span>

        {/* Quick publish hint if there are publishable slots */}
        {(batch.status === 'pending_review' || batch.status === 'approved') && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-teal-600 bg-teal-50 border border-teal-100 px-2 py-1 rounded-full">
            <Zap className="w-2.5 h-2.5" /> Review
          </span>
        )}

        <span className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-300 group-hover:text-slate-600 transition-colors">
          <Send className="w-3.5 h-3.5 rotate-0" />
        </span>
      </div>
    </button>
  );
}
