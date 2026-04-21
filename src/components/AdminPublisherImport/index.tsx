import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, ChevronRight, Search, Plus, CheckCircle, AlertTriangle, XCircle, Trash2, CreditCard as Edit3, Eye, Send, RefreshCw, Download, X, Users, ExternalLink, ChevronDown, ChevronUp, Check, Ban, AlertCircle, Loader2, RotateCcw, Package, Zap, ArrowRight, FileText, Diff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ImportRow, ImportBatch, ImportSlot, PublisherProfile, ImportTag, PreviousSlotSnapshot } from './types';
import { parseAdminCSV, downloadAdminTemplate, buildFingerprint } from './csvUtils';

// ── Tag config ────────────────────────────────────────────────────────────────

const TAG_CONFIG: Record<ImportTag, { label: string; color: string; bg: string; border: string; dot: string }> = {
  new:       { label: 'New',       color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  updated:   { label: 'Updated',   color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200',     dot: 'bg-sky-500' },
  unchanged: { label: 'Unchanged', color: 'text-slate-500',   bg: 'bg-slate-50',    border: 'border-slate-200',   dot: 'bg-slate-300' },
  duplicate: { label: 'Duplicate', color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  dot: 'bg-orange-400' },
};

const SLOT_STATUS_CONFIG: Record<ImportSlot['status'], { label: string; color: string; bg: string; border: string; barColor: string }> = {
  pending_review: { label: 'Pending',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    barColor: 'bg-blue-400' },
  needs_review:   { label: 'Review',   color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  barColor: 'bg-orange-400' },
  approved:       { label: 'Approved', color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200',    barColor: 'bg-teal-400' },
  rejected:       { label: 'Rejected', color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   barColor: 'bg-slate-300' },
  published:      { label: 'Live',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', barColor: 'bg-emerald-500' },
  expired:        { label: 'Expired',  color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200',   barColor: 'bg-slate-200' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onRefreshStats?: () => void;
}

// ── Root component ────────────────────────────────────────────────────────────

export default function AdminPublisherImport({ onRefreshStats }: Props) {
  const [view, setView] = useState<'batches' | 'new_import'>('batches');
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [publishers, setPublishers] = useState<PublisherProfile[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchSlots, setBatchSlots] = useState<Record<string, ImportSlot[]>>({});
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ImportSlot | null>(null);

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

  const loadBatchSlots = useCallback(async (batchId: string) => {
    const { data } = await supabase
      .from('csv_upload_slots')
      .select('*')
      .eq('batch_id', batchId)
      .order('row_index');
    setBatchSlots(prev => ({ ...prev, [batchId]: (data as ImportSlot[]) ?? [] }));
  }, []);

  useEffect(() => { loadBatches(); loadPublishers(); }, [loadBatches, loadPublishers]);

  const toggleBatch = async (id: string) => {
    if (expandedBatch === id) { setExpandedBatch(null); return; }
    setExpandedBatch(id);
    if (!batchSlots[id]) await loadBatchSlots(id);
  };

  const updateSlotStatus = async (slotId: string, status: ImportSlot['status'], notes?: string) => {
    setUpdatingSlot(slotId);
    await supabase
      .from('csv_upload_slots')
      .update({ status, admin_notes: notes ?? '', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
      .eq('id', slotId);
    if (expandedBatch) await loadBatchSlots(expandedBatch);
    await loadBatches();
    setUpdatingSlot(null);
    onRefreshStats?.();
  };

  const publishSlot = useCallback(async (slot: ImportSlot) => {
    setUpdatingSlot(slot.id);
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

      if (error) throw error;

      await supabase
        .from('csv_upload_slots')
        .update({ status: 'published', listing_id: newListing?.id ?? null, reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', slot.id);

      if (expandedBatch) await loadBatchSlots(expandedBatch);
      await loadBatches();
      setSelectedSlot(null);
      onRefreshStats?.();
    } catch (err) { console.error('Publish failed:', err); }
    setUpdatingSlot(null);
  }, [expandedBatch, loadBatchSlots, loadBatches, onRefreshStats]);

  const bulkAction = async (batchId: string, action: 'approve_pending' | 'publish_approved' | 'reject_pending') => {
    const slots = batchSlots[batchId] ?? [];
    if (action === 'approve_pending') {
      const targets = slots.filter(s => s.status === 'pending_review' || s.status === 'needs_review');
      for (const s of targets) {
        await supabase.from('csv_upload_slots')
          .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
          .eq('id', s.id);
      }
      await loadBatchSlots(batchId);
      await loadBatches();
      onRefreshStats?.();
    } else if (action === 'publish_approved') {
      const targets = slots.filter(s => s.status === 'approved');
      for (const s of targets) await publishSlot(s);
    } else {
      const targets = slots.filter(s => s.status === 'pending_review' || s.status === 'needs_review');
      for (const s of targets) {
        await supabase.from('csv_upload_slots')
          .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
          .eq('id', s.id);
      }
      await loadBatchSlots(batchId);
      await loadBatches();
      onRefreshStats?.();
    }
  };

  // Fast-path: approve all new+updated then publish them in one click
  const fastPublishBatch = async (batchId: string) => {
    const slots = batchSlots[batchId] ?? [];
    const targets = slots.filter(s =>
      (s.import_tag === 'new' || s.import_tag === 'updated') &&
      s.status !== 'published' && s.status !== 'rejected'
    );
    // Approve all, then publish all
    for (const s of targets) {
      await supabase.from('csv_upload_slots')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: 'Admin', updated_at: new Date().toISOString() })
        .eq('id', s.id);
    }
    await loadBatchSlots(batchId);
    const approved = (batchSlots[batchId] ?? slots).filter(s => s.status === 'approved');
    for (const s of approved) await publishSlot({ ...s, status: 'approved' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1d1d1f] tracking-[-0.01em]">Publisher CSV Imports</h2>
          <p className="text-[13px] text-[#6e6e73] mt-0.5">Weekly publisher inventory — upload, compare, and publish in seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { loadBatches(); loadPublishers(); }}
            className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm border border-black/[0.08] hover:border-black/[0.15] px-3 py-1.5 rounded-xl transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setView('new_import')}
            className="flex items-center gap-1.5 bg-[#1d1d1f] text-white text-sm font-medium px-4 py-1.5 rounded-xl hover:bg-black transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Import
          </button>
        </div>
      </div>

      {view === 'new_import' ? (
        <NewImportWizard
          publishers={publishers}
          batches={batches}
          onDone={async () => { setView('batches'); await loadBatches(); onRefreshStats?.(); }}
          onCancel={() => setView('batches')}
        />
      ) : (
        <BatchList
          batches={batches}
          loading={loadingBatches}
          expandedBatch={expandedBatch}
          batchSlots={batchSlots}
          updatingSlot={updatingSlot}
          onToggleBatch={toggleBatch}
          onUpdateSlotStatus={updateSlotStatus}
          onPublishSlot={publishSlot}
          onBulkAction={bulkAction}
          onFastPublish={fastPublishBatch}
          onSelectSlot={setSelectedSlot}
        />
      )}

      {selectedSlot && (
        <SlotDetailDrawer
          slot={selectedSlot}
          updating={updatingSlot === selectedSlot.id}
          onStatusChange={(status, notes) => updateSlotStatus(selectedSlot.id, status, notes)}
          onPublish={() => publishSlot(selectedSlot)}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}

// ── New Import Wizard ─────────────────────────────────────────────────────────

function NewImportWizard({ publishers, batches, onDone, onCancel }: {
  publishers: PublisherProfile[];
  batches: ImportBatch[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [publisher, setPublisher] = useState<PublisherProfile | null>(null);
  const [publisherSearch, setPublisherSearch] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<ImportRow>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [loadingPrev, setLoadingPrev] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = publishers.filter(p =>
    !publisherSearch ||
    p.newsletter_name.toLowerCase().includes(publisherSearch.toLowerCase()) ||
    p.seller_email.toLowerCase().includes(publisherSearch.toLowerCase())
  );

  // Fetch previous slots for this publisher to do diff comparison
  const fetchPreviousSlots = async (profileId: string): Promise<PreviousSlotSnapshot[]> => {
    const { data } = await supabase
      .from('csv_upload_slots')
      .select('id, slot_fingerprint, send_date, deadline, original_price, opportunity_type, slots_available, status')
      .eq('media_profile_id', profileId)
      .in('status', ['published', 'approved', 'pending_review'])
      .order('created_at', { ascending: false });

    if (!data) return [];
    // Deduplicate: keep only the most recent slot per fingerprint
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
        send_date: s.send_date,
        deadline: s.deadline,
        price: s.original_price,
        sponsorship_type: s.opportunity_type,
        slots_available: s.slots_available,
        status: s.status,
      }));
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) { setHeaderError('Please upload a CSV file.'); return; }
    setFileName(file.name);
    setLoadingPrev(true);
    const prevSlots = publisher ? await fetchPreviousSlots(publisher.id) : [];
    setLoadingPrev(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows: parsed, headerError: hErr } = parseAdminCSV(text, prevSlots);
      setHeaderError(hErr);
      setRows(parsed);
      if (!hErr && parsed.length > 0) setStep(3);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const startEdit = (row: ImportRow) => { setEditingRow(row.rowIndex); setEditValues({ ...row }); };
  const saveEdit = () => {
    setRows(prev => prev.map(r => r.rowIndex === editingRow ? { ...r, ...editValues } : r));
    setEditingRow(null); setEditValues({});
  };

  const handleSubmit = async () => {
    if (!publisher || rows.length === 0) return;
    setSubmitting(true);
    try {
      const monday = new Date();
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      const importWeek = monday.toISOString().split('T')[0];

      const { data: batch, error: batchErr } = await supabase
        .from('csv_upload_batches')
        .insert([{
          seller_email: publisher.seller_email, filename: fileName,
          row_count: rows.length, status: 'pending_review',
          uploaded_by_admin: true, media_profile_id: publisher.id,
          publisher_name: publisher.newsletter_name, import_week: importWeek,
        }])
        .select('id').maybeSingle();

      if (batchErr || !batch) throw batchErr;

      await supabase.from('csv_upload_slots').insert(rows.map(row => ({
        batch_id: batch.id, row_index: row.rowIndex,
        status: row.hasErrors ? 'needs_review' : (row.importTag === 'unchanged' ? 'approved' : 'pending_review'),
        media_name: row.newsletter_name || publisher.newsletter_name,
        media_type: 'newsletter', audience_size: row.subscriber_count,
        opportunity_type: row.sponsorship_type, original_price: row.price, discount_price: row.price,
        slots_available: row.slots_available || '1', send_date: row.send_date,
        deadline: row.deadline, category: row.niche || publisher.category,
        booking_url: row.booking_url, description: row.description,
        validation_errors: row.errors, media_profile_id: publisher.id,
        slot_fingerprint: row.fingerprint, import_tag: row.importTag,
        previous_slot_id: row.previousSlotId, admin_notes: '',
      })));

      onDone();
    } catch (err) { console.error('Submit error:', err); }
    setSubmitting(false);
  };

  // Summary counts
  const tagCounts = rows.reduce((acc, r) => { acc[r.importTag] = (acc[r.importTag] || 0) + 1; return acc; }, {} as Record<ImportTag, number>);
  const actionableCount = (tagCounts.new || 0) + (tagCounts.updated || 0);
  const errorCount = rows.filter(r => r.hasErrors).length;

  // Last batch for this publisher
  const lastBatch = publisher ? batches.find(b => b.media_profile_id === publisher.id) : null;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
      {/* Wizard steps bar */}
      <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {([
            [1, 'Select Publisher'], [2, 'Upload CSV'], [3, 'Review & Submit'],
          ] as [number, string][]).map(([n, label], idx) => (
            <div key={n} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#aeaeb2]" />}
              <div className={`flex items-center gap-1.5 text-sm font-medium ${step === n ? 'text-[#1d1d1f]' : step > n ? 'text-teal-600' : 'text-[#aeaeb2]'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step > n ? 'bg-teal-500 text-white' : step === n ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#aeaeb2]'}`}>
                  {step > n ? <Check className="w-3 h-3" /> : n}
                </span>
                {label}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onCancel} className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-6">
        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="max-w-2xl">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">Select a publisher</h3>
            <p className="text-[13px] text-[#6e6e73] mb-5">Choose which publisher this CSV is for. Slots will be compared against their existing inventory.</p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
              <input type="text" value={publisherSearch} onChange={e => setPublisherSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-black/[0.08] rounded-xl bg-[#f5f5f7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/[0.1] transition-all" />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.map(pub => {
                const pubBatch = batches.find(b => b.media_profile_id === pub.id);
                return (
                  <button key={pub.id} onClick={() => setPublisher(pub)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${publisher?.id === pub.id ? 'border-teal-300 bg-teal-50' : 'border-black/[0.06] bg-[#f5f5f7] hover:bg-white hover:border-black/[0.12]'}`}>
                    <div className="flex items-center gap-3">
                      {pub.logo_url
                        ? <img src={pub.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[11px] font-bold">{pub.newsletter_name.charAt(0)}</span>
                          </div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{pub.newsletter_name}</p>
                        <p className="text-[11px] text-[#6e6e73]">{pub.category} · {pub.subscriber_count?.toLocaleString() ?? '—'} subs</p>
                      </div>
                      {pubBatch && (
                        <span className="text-[9px] text-[#aeaeb2] border border-black/[0.06] bg-white px-2 py-0.5 rounded-full flex-shrink-0">
                          Last: {new Date(pubBatch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {publisher?.id === pub.id && <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && <div className="text-center py-8 text-[13px] text-[#aeaeb2]">No publishers found</div>}
            </div>
            {publisher && lastBatch && (
              <div className="mt-4 p-3 bg-[#f5f5f7] border border-black/[0.06] rounded-xl flex items-start gap-2.5">
                <FileText className="w-3.5 h-3.5 text-[#6e6e73] mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-[#6e6e73]">
                  <span className="font-semibold text-[#1d1d1f]">Previous import found</span> — new CSV will be compared against {lastBatch.row_count} slots from {new Date(lastBatch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.
                  Rows will be tagged as new, updated, or unchanged automatically.
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setStep(2)} disabled={!publisher}
                className="flex items-center gap-2 bg-[#1d1d1f] text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-40 hover:bg-black transition-all">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Upload CSV for <span className="text-teal-600">{publisher?.newsletter_name}</span></h3>
              <button onClick={downloadAdminTemplate} className="flex items-center gap-1.5 text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] font-medium transition-colors">
                <Download className="w-3.5 h-3.5" /> Template
              </button>
            </div>
            <p className="text-[13px] text-[#6e6e73] mb-5">Each row = one ad slot. Rows will be auto-compared to existing inventory for this publisher.</p>
            {loadingPrev && (
              <div className="flex items-center gap-2 text-[12px] text-[#6e6e73] mb-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading existing slots for comparison…
              </div>
            )}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl px-8 py-14 cursor-pointer text-center transition-all ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-black/[0.1] bg-[#f5f5f7] hover:border-black/[0.2] hover:bg-white'}`}>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
              <div className="w-10 h-10 bg-white border border-black/[0.08] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-5 h-5 text-[#6e6e73]" />
              </div>
              <p className="text-[14px] font-semibold text-[#1d1d1f] mb-1">{isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}</p>
              <p className="text-[12px] text-[#aeaeb2]">CSV only · One row per ad slot</p>
            </div>
            {headerError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-red-700">{headerError}</p>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium px-4 py-2.5 rounded-xl border border-black/[0.08] transition-all">
                Back
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div>
            {/* Diff summary bar */}
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
                  {rows.length} rows for <span className="text-teal-600">{publisher?.newsletter_name}</span>
                </h3>
                <p className="text-[12px] text-[#6e6e73] mt-0.5">{fileName}</p>
                {/* Tag summary chips */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {(Object.entries(tagCounts) as [ImportTag, number][]).map(([tag, count]) => {
                    const cfg = TAG_CONFIG[tag];
                    return (
                      <span key={tag} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {count} {cfg.label}
                      </span>
                    );
                  })}
                  {errorCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle className="w-3 h-3" /> {errorCount} errors
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedRows.size > 0 && (
                  <button onClick={() => { setRows(prev => prev.filter(r => !selectedRows.has(r.rowIndex))); setSelectedRows(new Set()); }}
                    className="flex items-center gap-1.5 text-[12px] text-red-600 font-medium border border-red-200 bg-red-50 px-3 py-1.5 rounded-xl">
                    <Trash2 className="w-3.5 h-3.5" /> Delete {selectedRows.size}
                  </button>
                )}
                <button onClick={() => { setFileName(''); setRows([]); setStep(2); }}
                  className="flex items-center gap-1.5 text-[12px] text-[#6e6e73] font-medium border border-black/[0.08] px-3 py-1.5 rounded-xl">
                  <RotateCcw className="w-3.5 h-3.5" /> Re-upload
                </button>
              </div>
            </div>

            {/* Preview table */}
            <div className="border border-black/[0.06] rounded-xl overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-[#f5f5f7] border-b border-black/[0.06]">
                      <th className="px-3 py-2.5 text-left w-8">
                        <input type="checkbox"
                          checked={selectedRows.size === rows.length && rows.length > 0}
                          onChange={e => setSelectedRows(e.target.checked ? new Set(rows.map(r => r.rowIndex)) : new Set())}
                          className="rounded" />
                      </th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Tag</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Newsletter</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Niche</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Type</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Price</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Send</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[#1d1d1f]">Deadline</th>
                      <th className="px-3 py-2.5 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03]">
                    {rows.map(row => {
                      const tagCfg = TAG_CONFIG[row.importTag];
                      const isEditing = editingRow === row.rowIndex;
                      return (
                        <tr key={row.rowIndex}
                          className={`group transition-colors ${row.hasErrors ? 'bg-red-50/50' : row.importTag === 'unchanged' ? 'opacity-60' : 'hover:bg-[#f5f5f7]/40'}`}>
                          <td className="px-3 py-2.5">
                            <input type="checkbox" checked={selectedRows.has(row.rowIndex)} onChange={() => setSelectedRows(prev => { const n = new Set(prev); n.has(row.rowIndex) ? n.delete(row.rowIndex) : n.add(row.rowIndex); return n; })} className="rounded" />
                          </td>
                          {/* Tag badge */}
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tagCfg.bg} ${tagCfg.border} ${tagCfg.color}`}>
                              <span className={`w-1 h-1 rounded-full ${tagCfg.dot}`} />
                              {tagCfg.label}
                            </span>
                            {row.changedFields.length > 0 && (
                              <div className="flex flex-wrap gap-0.5 mt-0.5">
                                {row.changedFields.map(f => (
                                  <span key={f} className="text-[8px] text-sky-600 font-medium bg-sky-50 px-1 rounded">{f}</span>
                                ))}
                              </div>
                            )}
                          </td>
                          {isEditing ? (
                            <>
                              <td className="px-2 py-1.5"><input value={editValues.newsletter_name ?? ''} onChange={e => setEditValues(v => ({ ...v, newsletter_name: e.target.value }))} className="w-full border border-black/[0.1] rounded-lg px-2 py-1 text-[11px]" /></td>
                              <td className="px-2 py-1.5"><input value={editValues.niche ?? ''} onChange={e => setEditValues(v => ({ ...v, niche: e.target.value }))} className="w-full border border-black/[0.1] rounded-lg px-2 py-1 text-[11px]" /></td>
                              <td className="px-2 py-1.5"><input value={editValues.sponsorship_type ?? ''} onChange={e => setEditValues(v => ({ ...v, sponsorship_type: e.target.value }))} className="w-full border border-black/[0.1] rounded-lg px-2 py-1 text-[11px]" /></td>
                              <td className="px-2 py-1.5"><input value={editValues.price ?? ''} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="w-24 border border-black/[0.1] rounded-lg px-2 py-1 text-[11px]" /></td>
                              <td className="px-2 py-1.5"><input value={editValues.send_date ?? ''} onChange={e => setEditValues(v => ({ ...v, send_date: e.target.value }))} className="w-28 border border-black/[0.1] rounded-lg px-2 py-1 text-[11px]" /></td>
                              <td className="px-2 py-1.5"><input value={editValues.deadline ?? ''} onChange={e => setEditValues(v => ({ ...v, deadline: e.target.value }))} className="w-28 border border-black/[0.1] rounded-lg px-2 py-1 text-[11px]" /></td>
                              <td className="px-2 py-1.5">
                                <div className="flex gap-1">
                                  <button onClick={saveEdit} className="p-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg"><Check className="w-3 h-3" /></button>
                                  <button onClick={() => setEditingRow(null)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg"><X className="w-3 h-3" /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2.5 font-medium text-[#1d1d1f] max-w-[160px] truncate">{row.newsletter_name || '—'}</td>
                              <td className="px-3 py-2.5 text-[#6e6e73] truncate">{row.niche || '—'}</td>
                              <td className="px-3 py-2.5 text-[#6e6e73] truncate">{row.sponsorship_type || '—'}</td>
                              <td className="px-3 py-2.5 font-semibold text-[#1d1d1f]">{row.price ? `$${row.price.replace(/[^0-9.]/g, '')}` : '—'}</td>
                              <td className="px-3 py-2.5 text-[#6e6e73]">{row.send_date || '—'}</td>
                              <td className="px-3 py-2.5 text-[#6e6e73]">{row.deadline || '—'}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => startEdit(row)} className="p-1 hover:bg-[#f5f5f7] rounded-lg text-[#6e6e73]"><Edit3 className="w-3 h-3" /></button>
                                  <button onClick={() => setRows(prev => prev.filter(r => r.rowIndex !== row.rowIndex))} className="p-1 hover:bg-red-50 rounded-lg text-[#6e6e73] hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {errorCount > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-[12px] font-semibold text-red-800 mb-1">Rows with errors will be saved as "Needs Review" and won't auto-publish.</p>
                {rows.filter(r => r.hasErrors).map(r => (
                  <p key={r.rowIndex} className="text-[11px] text-red-700">Row {r.rowIndex}: {r.errors.filter(e => e.severity === 'error').map(e => e.message).join(' · ')}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[#6e6e73] text-sm font-medium px-4 py-2.5 rounded-xl border border-black/[0.08]">Back</button>
              <div className="flex items-center gap-2">
                {actionableCount > 0 && (
                  <p className="text-[12px] text-[#6e6e73]">
                    <span className="text-[#1d1d1f] font-semibold">{actionableCount}</span> new/updated slots ready to review after submit
                  </p>
                )}
                <button onClick={handleSubmit} disabled={submitting || rows.length === 0}
                  className="flex items-center gap-2 bg-[#1d1d1f] text-white text-sm font-medium px-6 py-2.5 rounded-xl disabled:opacity-40 hover:bg-black transition-all">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Submitting…' : `Submit ${rows.length} rows`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Batch List ────────────────────────────────────────────────────────────────

function BatchList({
  batches, loading, expandedBatch, batchSlots, updatingSlot,
  onToggleBatch, onUpdateSlotStatus, onPublishSlot, onBulkAction, onFastPublish, onSelectSlot,
}: {
  batches: ImportBatch[];
  loading: boolean;
  expandedBatch: string | null;
  batchSlots: Record<string, ImportSlot[]>;
  updatingSlot: string | null;
  onToggleBatch: (id: string) => void;
  onUpdateSlotStatus: (id: string, status: ImportSlot['status'], notes?: string) => void;
  onPublishSlot: (slot: ImportSlot) => void;
  onBulkAction: (batchId: string, action: 'approve_pending' | 'publish_approved' | 'reject_pending') => void;
  onFastPublish: (batchId: string) => void;
  onSelectSlot: (slot: ImportSlot) => void;
}) {
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-[#6e6e73] animate-spin" /></div>;

  if (batches.length === 0) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-black/[0.06]">
      <Package className="w-8 h-8 text-[#aeaeb2] mx-auto mb-3" />
      <p className="text-[14px] font-semibold text-[#6e6e73]">No imports yet</p>
      <p className="text-[12px] text-[#aeaeb2] mt-1">Click "New Import" to upload your first publisher CSV</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {batches.map(batch => {
        const slots = batchSlots[batch.id] ?? [];
        const isExpanded = expandedBatch === batch.id;

        // Status counts
        const counts = {
          pending: slots.filter(s => s.status === 'pending_review').length,
          needs_review: slots.filter(s => s.status === 'needs_review').length,
          approved: slots.filter(s => s.status === 'approved').length,
          published: slots.filter(s => s.status === 'published').length,
          rejected: slots.filter(s => s.status === 'rejected').length,
        };
        // Tag counts (only available once slots are loaded)
        const tagCounts = {
          new: slots.filter(s => s.import_tag === 'new').length,
          updated: slots.filter(s => s.import_tag === 'updated').length,
          unchanged: slots.filter(s => s.import_tag === 'unchanged').length,
          duplicate: slots.filter(s => s.import_tag === 'duplicate').length,
        };
        const hasActionable = counts.pending + counts.needs_review + counts.approved > 0;
        const fastPublishCount = slots.filter(s => (s.import_tag === 'new' || s.import_tag === 'updated') && s.status !== 'published' && s.status !== 'rejected').length;

        return (
          <div key={batch.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
            {/* Batch header row */}
            <div className="px-5 py-4 flex items-center gap-4">
              <button onClick={() => onToggleBatch(batch.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-[12px] font-bold">{(batch.publisher_name || 'P').charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-[#1d1d1f]">{batch.publisher_name || 'Unknown Publisher'}</p>
                    {batch.import_week && (
                      <span className="text-[10px] bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        w/c {batch.import_week}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-[11px] text-[#aeaeb2]">{batch.filename} · {batch.row_count} rows · {new Date(batch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    {/* Tag mini-badges only when loaded */}
                    {isExpanded && slots.length > 0 && (
                      <div className="flex items-center gap-1">
                        {tagCounts.new > 0      && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">{tagCounts.new} new</span>}
                        {tagCounts.updated > 0  && <span className="text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-full">{tagCounts.updated} updated</span>}
                        {tagCounts.unchanged > 0 && <span className="text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full">{tagCounts.unchanged} unchanged</span>}
                        {tagCounts.duplicate > 0 && <span className="text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded-full">{tagCounts.duplicate} dup</span>}
                      </div>
                    )}
                  </div>
                </div>
                {/* Status dot strip */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {counts.needs_review > 0 && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">{counts.needs_review} review</span>}
                  {counts.pending > 0      && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{counts.pending} pending</span>}
                  {counts.approved > 0     && <span className="text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{counts.approved} approved</span>}
                  {counts.published > 0    && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{counts.published} live</span>}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#aeaeb2] ml-1" /> : <ChevronDown className="w-4 h-4 text-[#aeaeb2] ml-1" />}
                </div>
              </button>

              {/* Fast-path publish button */}
              {isExpanded && fastPublishCount > 0 && (
                <button
                  onClick={() => onFastPublish(batch.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm"
                  title="Approve & publish all new/updated slots in one click"
                >
                  <Zap className="w-3 h-3" />
                  Publish {fastPublishCount} new/updated
                </button>
              )}
            </div>

            {/* Expanded slots */}
            {isExpanded && (
              <div className="border-t border-black/[0.06]">
                {/* Bulk actions toolbar */}
                {hasActionable && (
                  <div className="px-5 py-2.5 bg-[#f5f5f7]/60 border-b border-black/[0.04] flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#aeaeb2] font-semibold uppercase tracking-widest mr-1">Bulk</span>
                    <button onClick={() => onBulkAction(batch.id, 'approve_pending')}
                      className="flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-all">
                      <CheckCircle className="w-3 h-3" /> Approve all pending
                    </button>
                    <button onClick={() => onBulkAction(batch.id, 'publish_approved')}
                      className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all">
                      <Send className="w-3 h-3" /> Publish all approved
                    </button>
                    <button onClick={() => onBulkAction(batch.id, 'reject_pending')}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#6e6e73] hover:text-red-600 bg-[#f5f5f7] hover:bg-red-50 border border-black/[0.08] hover:border-red-200 px-2.5 py-1 rounded-lg transition-all">
                      <Ban className="w-3 h-3" /> Reject all pending
                    </button>
                  </div>
                )}

                {slots.length === 0 ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 text-[#aeaeb2] animate-spin" /></div>
                ) : (
                  <div className="divide-y divide-black/[0.03]">
                    {slots.map(slot => {
                      const sCfg = SLOT_STATUS_CONFIG[slot.status];
                      const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];
                      const isUpdating = updatingSlot === slot.id;
                      return (
                        <div key={slot.id}
                          className={`flex items-center gap-0 group transition-colors hover:bg-[#f5f5f7]/40 ${slot.status === 'rejected' ? 'opacity-40' : ''}`}>
                          {/* Status bar on left edge */}
                          <div className={`w-1 self-stretch flex-shrink-0 ${sCfg.barColor}`} />
                          <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-2.5">
                            {/* Import tag */}
                            <span className={`flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
                              {tCfg.label}
                            </span>
                            {/* Changed fields micro-badges */}
                            {slot.import_tag === 'updated' && (slot as ImportSlot & { changedFields?: string[] }).changedFields?.map((f: string) => (
                              <span key={f} className="text-[8px] font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-1 py-0.5 rounded flex-shrink-0">{f}</span>
                            ))}
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-[#1d1d1f] truncate">{slot.media_name}</p>
                              <p className="text-[10px] text-[#aeaeb2]">
                                {slot.opportunity_type || '—'} · {slot.send_date || 'no send date'} · deadline {slot.deadline || '—'}
                              </p>
                            </div>
                            <p className="text-[13px] font-bold text-[#1d1d1f] flex-shrink-0">
                              {slot.original_price ? `$${slot.original_price.replace(/[^0-9.]/g, '')}` : '—'}
                            </p>
                            {slot.validation_errors?.some(e => e.severity === 'error') && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" title="Has validation errors" />
                            )}
                            {/* Row actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 text-[#aeaeb2] animate-spin" />
                              ) : (
                                <>
                                  <button onClick={() => onSelectSlot(slot)} title="Details"
                                    className="p-1 hover:bg-[#f5f5f7] rounded-lg text-[#6e6e73]"><Eye className="w-3.5 h-3.5" /></button>
                                  {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                                    <button onClick={() => onUpdateSlotStatus(slot.id, 'approved')} title="Approve"
                                      className="p-1 hover:bg-teal-50 rounded-lg text-[#6e6e73] hover:text-teal-600"><CheckCircle className="w-3.5 h-3.5" /></button>
                                  )}
                                  {slot.status === 'approved' && (
                                    <button onClick={() => onPublishSlot(slot)} title="Publish live"
                                      className="p-1 hover:bg-emerald-50 rounded-lg text-[#6e6e73] hover:text-emerald-600"><Send className="w-3.5 h-3.5" /></button>
                                  )}
                                  {slot.status !== 'rejected' && slot.status !== 'published' && slot.status !== 'expired' && (
                                    <button onClick={() => onUpdateSlotStatus(slot.id, 'rejected')} title="Reject"
                                      className="p-1 hover:bg-red-50 rounded-lg text-[#6e6e73] hover:text-red-500"><Ban className="w-3.5 h-3.5" /></button>
                                  )}
                                  {slot.status === 'rejected' && (
                                    <button onClick={() => onUpdateSlotStatus(slot.id, 'pending_review')} title="Restore"
                                      className="p-1 hover:bg-[#f5f5f7] rounded-lg text-[#6e6e73]"><RotateCcw className="w-3.5 h-3.5" /></button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Slot Detail Drawer ────────────────────────────────────────────────────────

function SlotDetailDrawer({ slot, updating, onStatusChange, onPublish, onClose }: {
  slot: ImportSlot;
  updating: boolean;
  onStatusChange: (status: ImportSlot['status'], notes?: string) => void;
  onPublish: () => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(slot.admin_notes || '');
  const sCfg = SLOT_STATUS_CONFIG[slot.status];
  const tCfg = TAG_CONFIG[slot.import_tag ?? 'new'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-1 ${sCfg.barColor}`} />
        <div className="px-5 py-4 border-b border-black/[0.06] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f]">{slot.media_name}</h3>
              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
                {tCfg.label}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sCfg.bg} ${sCfg.border} ${sCfg.color}`}>
              {sCfg.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f5f5f7] rounded-xl text-[#6e6e73]"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Changed fields notice */}
          {slot.import_tag === 'updated' && (slot as ImportSlot & { changedFields?: string[] }).changedFields?.length > 0 && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2">
              <Diff className="w-3.5 h-3.5 text-sky-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-sky-800">Updated from previous batch</p>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  Changed: {(slot as ImportSlot & { changedFields?: string[] }).changedFields?.join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 text-[12px]">
            {[
              ['Category', slot.category],
              ['Type', slot.opportunity_type],
              ['Price', slot.original_price ? `$${slot.original_price.replace(/[^0-9.]/g, '')}` : '—'],
              ['Audience', slot.audience_size ? `${slot.audience_size} subs` : '—'],
              ['Send Date', slot.send_date || '—'],
              ['Deadline', slot.deadline || '—'],
              ['Slots', slot.slots_available || '1'],
              ['Listing', slot.listing_id ? slot.listing_id.slice(0, 8) + '…' : 'Not published'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#f5f5f7] rounded-xl px-3 py-2">
                <p className="text-[9px] text-[#aeaeb2] font-semibold uppercase tracking-widest mb-0.5">{label}</p>
                <p className="font-semibold text-[#1d1d1f] truncate">{value}</p>
              </div>
            ))}
          </div>

          {slot.booking_url && (
            <a href={slot.booking_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-teal-600 hover:text-teal-700 font-medium">
              <ExternalLink className="w-3.5 h-3.5" /> {slot.booking_url}
            </a>
          )}

          {slot.description && (
            <div className="bg-[#f5f5f7] rounded-xl px-3 py-2.5">
              <p className="text-[9px] text-[#aeaeb2] font-semibold uppercase tracking-widest mb-1">Description</p>
              <p className="text-[12px] text-[#1d1d1f] leading-relaxed">{slot.description}</p>
            </div>
          )}

          {slot.validation_errors?.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
              <p className="text-[10px] font-semibold text-orange-800 uppercase tracking-widest mb-1.5">Validation Issues</p>
              <ul className="space-y-1">
                {slot.validation_errors.map((e, i) => (
                  <li key={i} className={`text-[11px] flex items-start gap-1.5 ${e.severity === 'error' ? 'text-red-700' : 'text-orange-700'}`}>
                    {e.severity === 'error' ? <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                    <span><strong>{e.field}:</strong> {e.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-widest block mb-1.5">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes…"
              className="w-full border border-black/[0.08] rounded-xl px-3 py-2 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-black/[0.1] bg-[#f5f5f7] focus:bg-white transition-all" />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-black/[0.06] flex items-center gap-2 flex-wrap">
          {updating ? (
            <Loader2 className="w-4 h-4 text-[#aeaeb2] animate-spin" />
          ) : (
            <>
              {(slot.status === 'pending_review' || slot.status === 'needs_review') && (
                <button onClick={() => onStatusChange('approved', notes)}
                  className="flex items-center gap-1.5 text-[12px] font-medium bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {slot.status === 'approved' && (
                <button onClick={onPublish}
                  className="flex items-center gap-1.5 text-[12px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl">
                  <Send className="w-3.5 h-3.5" /> Publish Live
                </button>
              )}
              {slot.status !== 'rejected' && slot.status !== 'published' && slot.status !== 'expired' && (
                <button onClick={() => onStatusChange('rejected', notes)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#6e6e73] hover:text-red-600 border border-black/[0.08] hover:border-red-200 hover:bg-red-50 px-3.5 py-2 rounded-xl">
                  <Ban className="w-3.5 h-3.5" /> Reject
                </button>
              )}
              {slot.status === 'rejected' && (
                <button onClick={() => onStatusChange('pending_review', notes)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#6e6e73] border border-black/[0.08] px-3.5 py-2 rounded-xl">
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              )}
            </>
          )}
          <button onClick={onClose} className="ml-auto text-[12px] text-[#6e6e73] font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}
