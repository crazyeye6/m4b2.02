import { useState, useRef } from 'react';
import {
  ChevronRight, Search, Check, X, Download, Upload, AlertCircle, Loader2,
  Send, RotateCcw, Trash2, FileText, ChevronDown, ChevronUp,
  Table, LayoutList, AlertTriangle, CheckCircle, Pencil, ShieldAlert, ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ImportRow, ImportBatch, PublisherProfile, ImportTag, PreviousSlotSnapshot } from './types';
import { parseAdminCSV, downloadAdminTemplate } from './csvUtils';
import { TAG_CONFIG } from './index';

interface Props {
  publishers: PublisherProfile[];
  batches: ImportBatch[];
  onFetchPreviousSlots: (profileId: string) => Promise<PreviousSlotSnapshot[]>;
  onDone: () => void;
  onCancel: () => void;
}

type ViewMode = 'grouped' | 'table';

// Group rows by publisher_name → newsletter_name
function groupRows(rows: ImportRow[]): Map<string, Map<string, ImportRow[]>> {
  const pub = new Map<string, Map<string, ImportRow[]>>();
  for (const row of rows) {
    const pKey = row.publisher_name || '(no publisher)';
    const nKey = row.newsletter_name || '(no newsletter)';
    if (!pub.has(pKey)) pub.set(pKey, new Map());
    const newsletters = pub.get(pKey)!;
    if (!newsletters.has(nKey)) newsletters.set(nKey, []);
    newsletters.get(nKey)!.push(row);
  }
  return pub;
}

type PublisherValidationState =
  | { status: 'ok' }
  | { status: 'multi_publisher'; detected: string[] }
  | { status: 'mismatch'; detected: string[]; selected: string }
  | { status: 'awaiting_confirm'; detected: string[]; selected: string };

function normalizePublisherName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function validatePublisherMatch(
  csvRows: ImportRow[],
  selectedPublisher: PublisherProfile,
): PublisherValidationState {
  const detected = Array.from(
    new Set(csvRows.map(r => r.publisher_name?.trim()).filter(Boolean) as string[])
  );

  if (detected.length === 0) {
    // No publisher_name column at all — treat as ok, let other validations catch it
    return { status: 'ok' };
  }

  if (detected.length > 1) {
    return { status: 'multi_publisher', detected };
  }

  const csvNorm = normalizePublisherName(detected[0]);
  const selNorm = normalizePublisherName(selectedPublisher.newsletter_name);

  if (csvNorm !== selNorm) {
    return { status: 'mismatch', detected, selected: selectedPublisher.newsletter_name };
  }

  return { status: 'awaiting_confirm', detected, selected: selectedPublisher.newsletter_name };
}

export default function ImportWizard({ publishers, batches, onFetchPreviousSlots, onDone, onCancel }: Props) {
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [publisher, setPublisher] = useState<PublisherProfile | null>(null);
  const [publisherSearch, setPublisherSearch] = useState('');
  const [rows, setRows]           = useState<ImportRow[]>([]);
  const [fileName, setFileName]   = useState('');
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [viewMode, setViewMode]       = useState<ViewMode>('grouped');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [editValues, setEditValues]       = useState<Partial<ImportRow>>({});
  const [collapsedPublishers, setCollapsedPublishers] = useState<Set<string>>(new Set());
  const [collapsedNewsletters, setCollapsedNewsletters] = useState<Set<string>>(new Set());
  const [pubValidation, setPubValidation] = useState<PublisherValidationState | null>(null);
  const [pendingRows, setPendingRows] = useState<ImportRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = publishers.filter(p =>
    !publisherSearch ||
    p.newsletter_name.toLowerCase().includes(publisherSearch.toLowerCase()) ||
    p.seller_email?.toLowerCase().includes(publisherSearch.toLowerCase())
  );

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) { setHeaderError('Please upload a .csv file.'); return; }
    setFileName(file.name);
    setHeaderError(null);
    setPubValidation(null);
    setLoadingPrev(true);
    const prevSlots = publisher ? await onFetchPreviousSlots(publisher.id) : [];
    setLoadingPrev(false);

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const { rows: parsed, headerError: hErr } = parseAdminCSV(text, prevSlots);
      setHeaderError(hErr);
      if (hErr || parsed.length === 0) return;

      if (publisher) {
        const validation = validatePublisherMatch(parsed, publisher);
        if (validation.status === 'ok') {
          // No publisher_name column — proceed directly
          setRows(parsed);
          setStep(3);
        } else if (validation.status === 'mismatch' || validation.status === 'multi_publisher') {
          setPubValidation(validation);
          setPendingRows(parsed);
          // Stay on step 2 — show blocking error
        } else {
          // awaiting_confirm
          setPubValidation(validation);
          setPendingRows(parsed);
          // Show confirmation modal (stay on step 2)
        }
      } else {
        setRows(parsed);
        setStep(3);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    setRows(pendingRows);
    setPubValidation(null);
    setPendingRows([]);
    setStep(3);
  };

  const discardUpload = () => {
    setPubValidation(null);
    setPendingRows([]);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const saveEdit = () => {
    setRows(prev => prev.map(r => r.rowIndex === editingRowIdx ? { ...r, ...editValues } : r));
    setEditingRowIdx(null); setEditValues({});
  };

  const deleteRow = (idx: number) => setRows(prev => prev.filter(r => r.rowIndex !== idx));

  const deleteSelected = () => {
    setRows(prev => prev.filter(r => !selectedRows.has(r.rowIndex)));
    setSelectedRows(new Set());
  };

  const toggleSelect = (idx: number) => setSelectedRows(prev => {
    const n = new Set(prev);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });

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
        opportunity_type: row.sponsorship_type,
        original_price: row.price, discount_price: row.price, price: row.price,
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

  const tagCounts = rows.reduce((acc, r) => {
    acc[r.importTag] = (acc[r.importTag] || 0) + 1; return acc;
  }, {} as Record<ImportTag, number>);
  const errorCount   = rows.filter(r => r.hasErrors).length;
  const warningCount = rows.filter(r => !r.hasErrors && r.hasWarnings).length;
  const actionable   = (tagCounts.new || 0) + (tagCounts.updated || 0);

  const lastBatch = publisher ? batches.find(b => b.media_profile_id === publisher.id) : null;
  const grouped   = groupRows(rows);

  const togglePub = (key: string) => setCollapsedPublishers(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });
  const toggleNL = (key: string) => setCollapsedNewsletters(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  return (
    <div className="min-h-[500px] flex flex-col">
      {/* Wizard header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {([
              [1, 'Select Publisher'],
              [2, 'Upload CSV'],
              [3, 'Review & Submit'],
            ] as [number, string][]).map(([n, label], idx) => (
              <div key={n} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                <div className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${step === n ? 'text-slate-900' : step > n ? 'text-teal-600' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step > n ? 'bg-teal-500 text-white' : step === n ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step > n ? <Check className="w-3 h-3" /> : n}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex-1">

          {/* ── Step 1: Select publisher ── */}
          {step === 1 && (
            <div className="max-w-2xl">
              <h3 className="text-[16px] font-bold text-slate-900 mb-1">Select a publisher</h3>
              <p className="text-[13px] text-slate-500 mb-5">
                Choose which publisher this CSV belongs to. Slots will be compared against their existing inventory.
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" value={publisherSearch}
                  onChange={e => setPublisherSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                />
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {filtered.map(pub => {
                  const pubBatch = batches.find(b => b.media_profile_id === pub.id);
                  const selected = publisher?.id === pub.id;
                  return (
                    <button
                      key={pub.id}
                      onClick={() => { setPublisher(pub); setPubValidation(null); setPendingRows([]); setFileName(''); }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selected ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        {pub.logo_url
                          ? <img src={pub.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[11px] font-bold">{pub.newsletter_name.charAt(0)}</span>
                            </div>
                          )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">{pub.newsletter_name}</p>
                          <p className="text-[11px] text-slate-400">{pub.category} · {pub.subscriber_count?.toLocaleString() ?? '—'} subs</p>
                        </div>
                        {pubBatch && (
                          <span className="text-[9px] text-slate-400 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            Last: {new Date(pubBatch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {selected && <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-[13px] text-slate-400">No publishers found</div>
                )}
              </div>

              {publisher && lastBatch && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-900">Previous import found</span> — new CSV will be compared against {lastBatch.row_count} slots from {new Date(lastBatch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Rows tagged new/updated/unchanged automatically.
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)} disabled={!publisher}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 transition-all"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Upload ── */}
          {step === 2 && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] font-bold text-slate-900">
                  Upload CSV for <span className="text-teal-600">{publisher?.newsletter_name}</span>
                </h3>
                <button
                  onClick={downloadAdminTemplate}
                  className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download template
                </button>
              </div>
              <p className="text-[13px] text-slate-500 mb-5">
                Each row = one ad slot. Slots will be auto-compared against this publisher's existing inventory.
              </p>

              {loadingPrev && (
                <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-4 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  Loading existing slots for diff comparison…
                </div>
              )}

              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl px-8 py-14 cursor-pointer text-center transition-all select-none ${
                  isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <input ref={fileRef} type="file" accept=".csv" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-[14px] font-semibold text-slate-700 mb-1">
                  {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-[12px] text-slate-400">CSV only · One row per ad slot</p>
              </div>

              {headerError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-red-700">{headerError}</p>
                </div>
              )}

              {/* Publisher validation errors */}
              {pubValidation?.status === 'multi_publisher' && (
                <div className="mt-4 border border-red-300 bg-red-50 rounded-2xl overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-3.5 border-b border-red-200 bg-red-100/60">
                    <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-red-900">Multiple publishers detected</p>
                      <p className="text-[12px] text-red-700 mt-0.5">
                        This CSV contains data for multiple publishers. Please upload one publisher per CSV file.
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-2">Publishers found in CSV</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pubValidation.detected.map(name => (
                        <span key={name} className="text-[12px] font-semibold text-red-800 bg-white border border-red-200 px-2.5 py-1 rounded-lg">
                          {name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={discardUpload}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-red-700 bg-white border border-red-300 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Discard &amp; re-upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pubValidation?.status === 'mismatch' && (
                <div className="mt-4 border border-red-300 bg-red-50 rounded-2xl overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-3.5 border-b border-red-200 bg-red-100/60">
                    <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-red-900">Publisher mismatch detected</p>
                      <p className="text-[12px] text-red-700 mt-0.5">
                        The selected publisher does not match the <code className="font-mono bg-red-100 px-1 rounded text-[11px]">publisher_name</code> in the uploaded CSV.
                        Please select the correct publisher or upload a matching CSV file.
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-slate-500 w-28 flex-shrink-0">Selected publisher</span>
                      <span className="font-semibold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">{pubValidation.selected}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-slate-500 w-28 flex-shrink-0">Found in CSV</span>
                      <span className="font-semibold text-red-800 bg-white border border-red-200 px-2.5 py-1 rounded-lg">{pubValidation.detected[0]}</span>
                    </div>
                    <div className="mt-3 flex gap-2 pt-1">
                      <button
                        onClick={() => { discardUpload(); setStep(1); }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all"
                      >
                        <Search className="w-3.5 h-3.5" /> Re-select publisher
                      </button>
                      <button
                        onClick={discardUpload}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-red-700 bg-white border border-red-300 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Discard &amp; re-upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pubValidation?.status === 'awaiting_confirm' && (
                <div className="mt-4 border border-teal-300 bg-teal-50 rounded-2xl overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-3.5 border-b border-teal-200 bg-teal-100/60">
                    <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-teal-900">Publisher match confirmed</p>
                      <p className="text-[12px] text-teal-700 mt-0.5">
                        CSV publisher matches the selected publisher. Review and confirm before proceeding.
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 text-[12px] mb-3">
                      <span className="text-slate-500 w-28 flex-shrink-0">Importing for</span>
                      <span className="font-semibold text-teal-900 bg-white border border-teal-200 px-2.5 py-1 rounded-lg">{pubValidation.selected}</span>
                    </div>
                    <p className="text-[11px] text-teal-700 mb-3">
                      You are about to import <span className="font-semibold">{pendingRows.length} slot{pendingRows.length !== 1 ? 's' : ''}</span> for this publisher. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmImport}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm &amp; continue
                      </button>
                      <button
                        onClick={discardUpload}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                  Back
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div>
              {/* Summary header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Review <span className="text-teal-600">{rows.length} slot{rows.length !== 1 ? 's' : ''}</span>
                    {' '}<span className="text-slate-400 font-normal">for</span>{' '}
                    {publisher?.newsletter_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{fileName}</p>

                  {/* Newsletter + slot counts */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="font-medium">{grouped.size} publisher{grouped.size !== 1 ? 's' : ''} detected</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium">
                      {Array.from(grouped.values()).reduce((s, nl) => s + nl.size, 0)} newsletter{Array.from(grouped.values()).reduce((s, nl) => s + nl.size, 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium">{rows.length} slot{rows.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Tag pills */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {(Object.entries(tagCounts) as [ImportTag, number][]).filter(([, c]) => c > 0).map(([tag, count]) => {
                      const cfg = TAG_CONFIG[tag];
                      return (
                        <span key={tag} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {count} {cfg.label}
                        </span>
                      );
                    })}
                    {errorCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
                        <AlertCircle className="w-3 h-3" /> {errorCount} error{errorCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                        <AlertTriangle className="w-3 h-3" /> {warningCount} warning{warningCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View toggle */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setViewMode('grouped')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <LayoutList className="w-3 h-3" /> Grouped
                    </button>
                    <button onClick={() => setViewMode('table')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <Table className="w-3 h-3" /> Table
                    </button>
                  </div>

                  {selectedRows.size > 0 && (
                    <button onClick={deleteSelected}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" /> Delete {selectedRows.size}
                    </button>
                  )}
                  <button onClick={() => { setFileName(''); setRows([]); setPubValidation(null); setStep(2); }}
                    className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium border border-slate-200 px-3 py-1.5 rounded-xl hover:border-slate-300 transition-all">
                    <RotateCcw className="w-3.5 h-3.5" /> Re-upload
                  </button>
                </div>
              </div>

              {/* Error summary — prominent */}
              {errorCount > 0 && (
                <div className="mb-4 border border-red-200 bg-red-50 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-red-200 bg-red-100/50">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <p className="text-[12px] font-semibold text-red-800">
                      {errorCount} row{errorCount !== 1 ? 's' : ''} with validation errors — will be flagged as "Needs Review" and not auto-published
                    </p>
                  </div>
                  <div className="px-3.5 py-2 space-y-1">
                    {rows.filter(r => r.hasErrors).map(r => (
                      <div key={r.rowIndex} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-red-400 w-12 flex-shrink-0 pt-0.5">Row {r.rowIndex}</span>
                        <div className="flex flex-wrap gap-1">
                          {r.errors.filter(e => e.severity === 'error').map((e, i) => (
                            <span key={i} className="text-[10px] text-red-700 bg-white border border-red-100 px-1.5 py-0.5 rounded-md">
                              {e.field}: {e.message}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Grouped view ── */}
              {viewMode === 'grouped' && (
                <div className="space-y-3 mb-5">
                  {Array.from(grouped.entries()).map(([pubName, newsletters]) => {
                    const pubRows = Array.from(newsletters.values()).flat();
                    const pubErrors = pubRows.filter(r => r.hasErrors).length;
                    const isPubCollapsed = collapsedPublishers.has(pubName);
                    return (
                      <div key={pubName} className="border border-slate-200 rounded-2xl overflow-hidden">
                        {/* Publisher header */}
                        <button
                          onClick={() => togglePub(pubName)}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">{pubName.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-900">{pubName}</p>
                            <p className="text-[11px] text-slate-400">{pubRows.length} slots · {newsletters.size} newsletter{newsletters.size !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {pubErrors > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">{pubErrors} errors</span>}
                            {isPubCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {!isPubCollapsed && (
                          <div className="divide-y divide-slate-100">
                            {Array.from(newsletters.entries()).map(([nlName, nlRows]) => {
                              const nlKey = `${pubName}__${nlName}`;
                              const isNLCollapsed = collapsedNewsletters.has(nlKey);
                              const nlErrors = nlRows.filter(r => r.hasErrors).length;
                              return (
                                <div key={nlName}>
                                  {/* Newsletter sub-header */}
                                  <button
                                    onClick={() => toggleNL(nlKey)}
                                    className="w-full flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 transition-colors text-left border-b border-slate-100"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                    <p className="text-[12px] font-semibold text-slate-700 flex-1">{nlName}</p>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                      {nlRows[0]?.subscriber_count && <span>{nlRows[0].subscriber_count} subs</span>}
                                      <span>·</span>
                                      <span>{nlRows.length} slot{nlRows.length !== 1 ? 's' : ''}</span>
                                      {nlErrors > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">{nlErrors} errors</span>}
                                    </div>
                                    {isNLCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-300" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-300" />}
                                  </button>

                                  {/* Slot rows */}
                                  {!isNLCollapsed && (
                                    <div className="divide-y divide-slate-50">
                                      {nlRows.map(row => (
                                        <GroupedSlotRow
                                          key={row.rowIndex}
                                          row={row}
                                          selected={selectedRows.has(row.rowIndex)}
                                          editing={editingRowIdx === row.rowIndex}
                                          editValues={editValues}
                                          onToggleSelect={() => toggleSelect(row.rowIndex)}
                                          onStartEdit={() => { setEditingRowIdx(row.rowIndex); setEditValues({ ...row }); }}
                                          onEditChange={(k, v) => setEditValues(ev => ({ ...ev, [k]: v }))}
                                          onSaveEdit={saveEdit}
                                          onCancelEdit={() => setEditingRowIdx(null)}
                                          onDelete={() => deleteRow(row.rowIndex)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Table view ── */}
              {viewMode === 'table' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-3 py-2.5 w-8">
                            <input type="checkbox"
                              checked={selectedRows.size === rows.length && rows.length > 0}
                              onChange={e => setSelectedRows(e.target.checked ? new Set(rows.map(r => r.rowIndex)) : new Set())}
                              className="rounded border-slate-300" />
                          </th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Tag</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Newsletter</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Type</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Price</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Send Date</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Deadline</th>
                          <th className="px-3 py-2.5 text-left font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Status</th>
                          <th className="px-3 py-2.5 w-16" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.map(row => {
                          const tCfg = TAG_CONFIG[row.importTag];
                          const isEditing = editingRowIdx === row.rowIndex;
                          return (
                            <tr key={row.rowIndex}
                              className={`group transition-colors ${row.hasErrors ? 'bg-red-50/40' : row.importTag === 'unchanged' ? 'opacity-60' : 'hover:bg-slate-50/60'}`}>
                              <td className="px-3 py-2.5">
                                <input type="checkbox" checked={selectedRows.has(row.rowIndex)}
                                  onChange={() => toggleSelect(row.rowIndex)} className="rounded border-slate-300" />
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
                                  <span className={`w-1 h-1 rounded-full ${tCfg.dot}`} />{tCfg.label}
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
                                  <td className="px-2 py-1"><input value={editValues.newsletter_name ?? ''} onChange={e => setEditValues(v => ({ ...v, newsletter_name: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.sponsorship_type ?? ''} onChange={e => setEditValues(v => ({ ...v, sponsorship_type: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.price ?? ''} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.send_date ?? ''} onChange={e => setEditValues(v => ({ ...v, send_date: e.target.value }))} className="w-28 border border-slate-300 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.deadline ?? ''} onChange={e => setEditValues(v => ({ ...v, deadline: e.target.value }))} className="w-28 border border-slate-300 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1" />
                                  <td className="px-2 py-1">
                                    <div className="flex gap-1">
                                      <button onClick={saveEdit} className="p-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg"><Check className="w-3 h-3" /></button>
                                      <button onClick={() => setEditingRowIdx(null)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg"><X className="w-3 h-3" /></button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-2.5 font-medium text-slate-900 max-w-[140px] truncate">{row.newsletter_name || '—'}</td>
                                  <td className="px-3 py-2.5 text-slate-500 truncate max-w-[120px]">{row.sponsorship_type || '—'}</td>
                                  <td className="px-3 py-2.5 font-semibold text-slate-900">{row.price || '—'}</td>
                                  <td className="px-3 py-2.5 text-slate-500">{row.send_date || '—'}</td>
                                  <td className="px-3 py-2.5 text-slate-500">{row.deadline || '—'}</td>
                                  <td className="px-3 py-2.5">
                                    {row.hasErrors
                                      ? <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full"><AlertCircle className="w-2.5 h-2.5" /> Error</span>
                                      : row.hasWarnings
                                      ? <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" /> Warn</span>
                                      : <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full"><CheckCircle className="w-2.5 h-2.5" /> OK</span>
                                    }
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingRowIdx(row.rowIndex); setEditValues({ ...row }); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><Pencil className="w-3 h-3" /></button>
                                      <button onClick={() => deleteRow(row.rowIndex)} className="p-1 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
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
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-[13px] text-slate-600 font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                  Back
                </button>
                <div className="flex items-center gap-3">
                  {actionable > 0 && (
                    <p className="text-[12px] text-slate-400 hidden sm:block">
                      <span className="text-slate-900 font-semibold">{actionable}</span> new/updated ready to review after submit
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || rows.length === 0}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl disabled:opacity-40 transition-all shadow-sm"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Submitting…' : `Submit ${rows.length} row${rows.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Grouped slot row ──────────────────────────────────────────────────────────

function GroupedSlotRow({
  row, selected, editing, editValues,
  onToggleSelect, onStartEdit, onEditChange, onSaveEdit, onCancelEdit, onDelete,
}: {
  row: ImportRow;
  selected: boolean;
  editing: boolean;
  editValues: Partial<ImportRow>;
  onToggleSelect: () => void;
  onStartEdit: () => void;
  onEditChange: (key: string, value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const tCfg = TAG_CONFIG[row.importTag];

  return (
    <div className={`flex items-start gap-3 px-5 py-3 group transition-colors ${row.hasErrors ? 'bg-red-50/40' : row.importTag === 'unchanged' ? 'opacity-55 hover:opacity-80' : 'hover:bg-slate-50/60'}`}>
      {/* Left: checkbox + status bar */}
      <div className="flex items-center gap-2 pt-0.5 flex-shrink-0">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="rounded border-slate-300" />
        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${tCfg.dot}`} />
      </div>

      {/* Center: data */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {([
              ['newsletter_name', 'Newsletter'],
              ['sponsorship_type', 'Type'],
              ['price', 'Price'],
              ['slots_available', 'Slots'],
              ['send_date', 'Send Date'],
              ['deadline', 'Deadline'],
              ['subscriber_count', 'Subscribers'],
              ['niche', 'Niche'],
              ['booking_url', 'Booking URL'],
              ['description', 'Description'],
            ] as [string, string][]).map(([k, label]) => (
              <div key={k}>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{label}</label>
                <input
                  value={(editValues as Record<string, string>)[k] ?? ''}
                  onChange={e => onEditChange(k, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 flex-wrap">
            {/* Import tag */}
            <span className={`flex-shrink-0 mt-0.5 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
              {tCfg.label}
            </span>
            {row.changedFields.length > 0 && row.changedFields.map(f => (
              <span key={f} className="text-[8px] font-semibold text-sky-600 bg-sky-50 border border-sky-100 px-1 py-0.5 rounded mt-0.5 flex-shrink-0">{f} changed</span>
            ))}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-slate-800">{row.sponsorship_type || '—'}</span>
                <span className="text-[12px] font-bold text-slate-900">{row.price ? `$${row.price.replace(/[^0-9.]/g, '')}` : '—'}</span>
                {row.slots_available && <span className="text-[11px] text-slate-400">{row.slots_available} slot{parseInt(row.slots_available) !== 1 ? 's' : ''}</span>}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {row.send_date && <span className="text-[11px] text-slate-400">Send: {row.send_date}</span>}
                {row.deadline && <span className="text-[11px] text-slate-400">Deadline: {row.deadline}</span>}
              </div>

              {/* Validation issues */}
              {(row.hasErrors || row.hasWarnings) && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {row.errors.map((err, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${err.severity === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {err.severity === 'error' ? <AlertCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                      {err.field}: {err.message}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
        {editing ? (
          <>
            <button onClick={onSaveEdit} className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold rounded-lg transition-all">
              <Check className="w-3 h-3" /> Save
            </button>
            <button onClick={onCancelEdit} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onStartEdit} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500" title="Delete row">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
