import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Download, CheckCircle, AlertCircle, AlertTriangle, Loader2,
  RotateCcw, Send, Trash2, Pencil, Check, X, ChevronDown, ChevronUp,
  LayoutList, Table, Clock, Package, FileText, Eye, ArrowRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { parseCSV, downloadTemplate } from '../CsvUpload/csvUtils';
import type { CsvRow } from '../CsvUpload/types';

// ── Mirrored status config (read-only for sellers) ────────────────────────────

const SLOT_STATUS: Record<string, { label: string; pill: string }> = {
  pending_review: { label: 'Pending Review', pill: 'bg-blue-100 text-blue-700' },
  needs_review:   { label: 'Needs Review',   pill: 'bg-orange-100 text-orange-700' },
  approved:       { label: 'Approved',        pill: 'bg-teal-100 text-teal-700' },
  rejected:       { label: 'Rejected',        pill: 'bg-slate-100 text-slate-500' },
  published:      { label: 'Live',            pill: 'bg-emerald-100 text-emerald-700' },
  expired:        { label: 'Expired',         pill: 'bg-slate-50 text-slate-400' },
};

// ── Group rows by newsletter_name ─────────────────────────────────────────────

function groupByNewsletter(rows: CsvRow[]): Map<string, CsvRow[]> {
  const map = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const key = row.newsletter_name || '(no newsletter)';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return map;
}

// ── Past batch types ──────────────────────────────────────────────────────────

interface PastBatch {
  id: string;
  publisher_name: string;
  filename: string;
  row_count: number;
  status: string;
  created_at: string;
  import_week: string | null;
}

interface PastSlot {
  id: string;
  media_name: string;
  opportunity_type: string;
  original_price: string;
  send_date: string;
  deadline: string;
  slots_available: string;
  status: string;
  validation_errors: Array<{ field: string; severity: string; message: string }>;
}

type ViewMode = 'grouped' | 'table';

// ── Main component ────────────────────────────────────────────────────────────

export default function SellerCsvUpload() {
  const { user } = useAuth();

  // Upload flow state
  const [step, setStep] = useState<'idle' | 'preview' | 'submitting' | 'done' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedBatchId, setSubmittedBatchId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<CsvRow>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  // Past batches state
  const [batches, setBatches] = useState<PastBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchSlots, setBatchSlots] = useState<Record<string, PastSlot[]>>({});
  const [loadingSlots, setLoadingSlots] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    if (!user) return;
    setLoadingBatches(true);
    const { data } = await supabase
      .from('csv_upload_batches')
      .select('id,publisher_name,filename,row_count,status,created_at,import_week')
      .or(`seller_user_id.eq.${user.id},seller_email.eq.${user.email}`)
      .eq('uploaded_by_admin', false)
      .order('created_at', { ascending: false })
      .limit(20);
    setBatches((data as PastBatch[]) ?? []);
    setLoadingBatches(false);
  }, [user]);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  const loadBatchSlots = async (batchId: string) => {
    if (batchSlots[batchId]) return;
    setLoadingSlots(batchId);
    const { data } = await supabase
      .from('csv_upload_slots')
      .select('id,media_name,opportunity_type,original_price,send_date,deadline,slots_available,status,validation_errors')
      .eq('batch_id', batchId)
      .order('row_index');
    setBatchSlots(prev => ({ ...prev, [batchId]: (data as PastSlot[]) ?? [] }));
    setLoadingSlots(null);
  };

  const toggleBatch = async (id: string) => {
    if (expandedBatch === id) { setExpandedBatch(null); return; }
    setExpandedBatch(id);
    await loadBatchSlots(id);
  };

  // ── File processing ─────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setHeaderError('Please upload a .csv file.');
      setStep('error');
      return;
    }
    setFileName(file.name);
    setHeaderError(null);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const { rows: parsed, headerError: hErr } = parseCSV(text);
      if (hErr) { setHeaderError(hErr); setStep('error'); return; }
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const resetUpload = () => {
    setStep('idle'); setFileName(''); setRows([]); setHeaderError(null);
    setSubmitError(null); setSubmittedBatchId(null); setEditingRow(null);
    setEditValues({}); setSelectedRows(new Set());
  };

  // ── Inline editing ──────────────────────────────────────────────────────────

  const saveEdit = () => {
    setRows(prev => prev.map(r => r.rowIndex === editingRow ? { ...r, ...editValues } : r));
    setEditingRow(null); setEditValues({});
  };

  const deleteRow = (idx: number) => {
    setRows(prev => prev.filter(r => r.rowIndex !== idx));
    setSelectedRows(prev => { const n = new Set(prev); n.delete(idx); return n; });
  };

  const deleteSelected = () => {
    setRows(prev => prev.filter(r => !selectedRows.has(r.rowIndex)));
    setSelectedRows(new Set());
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!user || rows.length === 0) return;
    setStep('submitting');
    setSubmitError(null);

    const publisherName = rows[0]?.publisher_name ?? '';

    const { data: batch, error: batchErr } = await supabase
      .from('csv_upload_batches')
      .insert({
        seller_user_id: user.id,
        seller_email: user.email ?? '',
        filename: fileName,
        row_count: rows.length,
        status: 'pending_review',
        publisher_name: publisherName,
        uploaded_by_admin: false,
      })
      .select('id')
      .single();

    if (batchErr || !batch) {
      setSubmitError('Failed to create upload batch. Please try again.');
      setStep('preview');
      return;
    }

    const slotRows = rows.map(row => ({
      batch_id: batch.id,
      row_index: row.rowIndex,
      status: row.hasErrors ? 'needs_review' : 'pending_review',
      media_name: row.newsletter_name,
      media_type: 'newsletter',
      audience_size: row.subscriber_count,
      opportunity_type: row.sponsorship_type,
      original_price: row.price,
      discount_price: row.price,
      price: row.price,
      slots_available: row.slots_available || '1',
      send_date: row.send_date,
      deadline: row.deadline,
      category: row.niche,
      booking_url: row.booking_url,
      description: row.description,
      validation_errors: row.errors,
    }));

    const { error: slotsErr } = await supabase.from('csv_upload_slots').insert(slotRows);

    if (slotsErr) {
      setSubmitError('Slots could not be saved. Please try again.');
      setStep('preview');
      return;
    }

    setSubmittedBatchId(batch.id);
    setStep('done');
    await loadBatches();
  };

  // ── Counts ──────────────────────────────────────────────────────────────────

  const errorCount   = rows.filter(r => r.hasErrors).length;
  const warningCount = rows.filter(r => !r.hasErrors && r.hasWarnings).length;
  const okCount      = rows.filter(r => !r.hasErrors && !r.hasWarnings).length;
  const grouped = groupByNewsletter(rows);

  const toggleGroup = (key: string) => setCollapsedGroups(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Section header */}
      <div>
        <h3 className="text-[16px] font-bold text-slate-900 mb-1">Upload Newsletter Slots via CSV</h3>
        <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl">
          Upload one CSV to add or update slots across one or more newsletters you own. Rows are grouped by newsletter and reviewed before going live.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Card header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Upload className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                {step === 'idle' && 'Upload CSV file'}
                {step === 'error' && 'Upload error'}
                {step === 'preview' && `Preview — ${rows.length} row${rows.length !== 1 ? 's' : ''} parsed`}
                {step === 'submitting' && 'Submitting…'}
                {step === 'done' && 'Slots submitted'}
              </p>
              <p className="text-[11px] text-slate-400">
                {step === 'idle' && 'One row per ad slot · same format as admin import'}
                {step === 'preview' && `${okCount} ready · ${errorCount} errors · ${warningCount} warnings`}
                {step === 'done' && 'Pending admin review'}
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white px-3 py-2 rounded-xl transition-all flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Template
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── IDLE: drop zone ── */}
          {step === 'idle' && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl px-8 py-12 cursor-pointer text-center transition-all select-none ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-[14px] font-semibold text-slate-700 mb-1">{isDragging ? 'Drop CSV here' : 'Drag & drop or click to upload'}</p>
              <p className="text-[12px] text-slate-400">CSV only · Use the template for correct column names</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {step === 'error' && headerError && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-red-800 mb-0.5">Invalid CSV format</p>
                  <p className="text-[12px] text-red-700 leading-relaxed">{headerError}</p>
                </div>
              </div>
              <button onClick={resetUpload}
                className="flex items-center gap-2 text-[13px] text-slate-600 font-medium border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Try again
              </button>
            </div>
          )}

          {/* ── PREVIEW ── */}
          {step === 'preview' && rows.length > 0 && (
            <>
              {/* Summary + controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {okCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <CheckCircle className="w-3 h-3" /> {okCount} ready
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                      <AlertTriangle className="w-3 h-3" /> {warningCount} warnings
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
                      <AlertCircle className="w-3 h-3" /> {errorCount} errors
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setViewMode('grouped')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                      <LayoutList className="w-3 h-3" /> Grouped
                    </button>
                    <button onClick={() => setViewMode('table')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                      <Table className="w-3 h-3" /> Table
                    </button>
                  </div>
                  {selectedRows.size > 0 && (
                    <button onClick={deleteSelected}
                      className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-2.5 py-1.5 rounded-xl transition-all">
                      <Trash2 className="w-3 h-3" /> Remove {selectedRows.size}
                    </button>
                  )}
                  <button onClick={resetUpload}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium border border-slate-200 px-2.5 py-1.5 rounded-xl hover:border-slate-300 transition-all">
                    <RotateCcw className="w-3 h-3" /> Re-upload
                  </button>
                </div>
              </div>

              {/* Error summary */}
              {errorCount > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-[12px] font-semibold text-red-800 mb-1.5">
                    {errorCount} row{errorCount !== 1 ? 's' : ''} have errors — they'll be flagged for admin review
                  </p>
                  {rows.filter(r => r.hasErrors).map(r => (
                    <div key={r.rowIndex} className="flex items-start gap-2 mt-1">
                      <span className="text-[10px] font-bold text-red-400 w-12 flex-shrink-0">Row {r.rowIndex}</span>
                      <p className="text-[11px] text-red-700">{r.errors.filter(e => e.severity === 'error').map(e => e.message).join(' · ')}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Grouped view ── */}
              {viewMode === 'grouped' && (
                <div className="space-y-2">
                  {Array.from(grouped.entries()).map(([nlName, nlRows]) => {
                    const isCollapsed = collapsedGroups.has(nlName);
                    const nlErrors = nlRows.filter(r => r.hasErrors).length;
                    return (
                      <div key={nlName} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Newsletter header */}
                        <button
                          onClick={() => toggleGroup(nlName)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                          <p className="text-[13px] font-semibold text-slate-800 flex-1">{nlName}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            {nlRows[0]?.subscriber_count && <span>{nlRows[0].subscriber_count} subs</span>}
                            <span>·</span>
                            <span>{nlRows.length} slot{nlRows.length !== 1 ? 's' : ''}</span>
                            {nlErrors > 0 && (
                              <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                                {nlErrors} errors
                              </span>
                            )}
                          </div>
                          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-300" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-300" />}
                        </button>

                        {!isCollapsed && (
                          <div className="divide-y divide-slate-50">
                            {nlRows.map(row => (
                              <PreviewSlotRow
                                key={row.rowIndex}
                                row={row}
                                selected={selectedRows.has(row.rowIndex)}
                                editing={editingRow === row.rowIndex}
                                editValues={editValues}
                                onToggleSelect={() => setSelectedRows(prev => {
                                  const n = new Set(prev); n.has(row.rowIndex) ? n.delete(row.rowIndex) : n.add(row.rowIndex); return n;
                                })}
                                onStartEdit={() => { setEditingRow(row.rowIndex); setEditValues({ ...row }); }}
                                onEditChange={(k, v) => setEditValues(ev => ({ ...ev, [k]: v }))}
                                onSaveEdit={saveEdit}
                                onCancelEdit={() => setEditingRow(null)}
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

              {/* ── Table view ── */}
              {viewMode === 'table' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
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
                          {['Status', 'Newsletter', 'Type', 'Price', 'Send Date', 'Deadline', ''].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-500 text-[11px] uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.map(row => {
                          const isEditing = editingRow === row.rowIndex;
                          return (
                            <tr key={row.rowIndex}
                              className={`group transition-colors ${row.hasErrors ? 'bg-red-50/40' : 'hover:bg-slate-50/60'}`}>
                              <td className="px-3 py-2.5">
                                <input type="checkbox" checked={selectedRows.has(row.rowIndex)}
                                  onChange={() => setSelectedRows(prev => { const n = new Set(prev); n.has(row.rowIndex) ? n.delete(row.rowIndex) : n.add(row.rowIndex); return n; })}
                                  className="rounded border-slate-300" />
                              </td>
                              <td className="px-3 py-2.5">
                                {row.hasErrors
                                  ? <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full"><AlertCircle className="w-2.5 h-2.5" /> Error</span>
                                  : row.hasWarnings
                                  ? <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full"><AlertTriangle className="w-2.5 h-2.5" /> Warn</span>
                                  : <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full"><CheckCircle className="w-2.5 h-2.5" /> OK</span>
                                }
                              </td>
                              {isEditing ? (
                                <>
                                  <td className="px-2 py-1"><input value={editValues.newsletter_name ?? ''} onChange={e => setEditValues(v => ({ ...v, newsletter_name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.sponsorship_type ?? ''} onChange={e => setEditValues(v => ({ ...v, sponsorship_type: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.price ?? ''} onChange={e => setEditValues(v => ({ ...v, price: e.target.value }))} className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.send_date ?? ''} onChange={e => setEditValues(v => ({ ...v, send_date: e.target.value }))} className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1"><input value={editValues.deadline ?? ''} onChange={e => setEditValues(v => ({ ...v, deadline: e.target.value }))} className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-[11px]" /></td>
                                  <td className="px-2 py-1">
                                    <div className="flex gap-1">
                                      <button onClick={saveEdit} className="p-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg"><Check className="w-3 h-3" /></button>
                                      <button onClick={() => setEditingRow(null)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg"><X className="w-3 h-3" /></button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-2.5 font-semibold text-slate-900 truncate max-w-[130px]">{row.newsletter_name || '—'}</td>
                                  <td className="px-3 py-2.5 text-slate-500 truncate max-w-[110px]">{row.sponsorship_type || '—'}</td>
                                  <td className="px-3 py-2.5 font-semibold text-slate-900">{row.price || '—'}</td>
                                  <td className="px-3 py-2.5 text-slate-500">{row.send_date || '—'}</td>
                                  <td className="px-3 py-2.5 text-slate-500">{row.deadline || '—'}</td>
                                  <td className="px-3 py-2.5">
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingRow(row.rowIndex); setEditValues({ ...row }); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><Pencil className="w-3 h-3" /></button>
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

              {submitError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-red-700">{submitError}</p>
                </div>
              )}

              {/* Submit footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[12px] text-slate-400 leading-relaxed max-w-xs">
                  Slots go to admin review before going live. You'll be notified once approved.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!user || rows.length === 0}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit {rows.length} slot{rows.length !== 1 ? 's' : ''} for review
                </button>
              </div>
            </>
          )}

          {/* ── SUBMITTING ── */}
          {step === 'submitting' && (
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
              <p className="text-[14px] font-semibold text-slate-700">Submitting {rows.length} slots…</p>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
                <div className="w-9 h-9 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-emerald-800 mb-0.5">
                    {rows.length} slot{rows.length !== 1 ? 's' : ''} submitted for review
                  </p>
                  <p className="text-[12px] text-emerald-700 leading-relaxed">
                    Our team will review each slot and publish approved ones to the marketplace. Nothing goes live automatically.
                  </p>
                  {submittedBatchId && (
                    <p className="text-[10px] text-emerald-600/60 font-mono mt-1.5">Batch: {submittedBatchId.slice(0, 8)}…</p>
                  )}
                </div>
              </div>
              <button onClick={resetUpload}
                className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-900 font-medium transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Upload another file
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── How it works (only on idle) ── */}
      {step === 'idle' && (
        <div className="bg-slate-900 rounded-2xl px-5 py-5">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">How it works</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { n: '1', title: 'Download template', desc: 'Get the CSV with all required column names' },
              { n: '2', title: 'Fill in your slots', desc: 'One row = one ad slot. Group by newsletter name' },
              { n: '3', title: 'Preview & fix issues', desc: 'Review parsed rows and edit before submitting' },
              { n: '4', title: 'Admin reviews & publishes', desc: 'Approved slots go live in the marketplace' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <span className="text-[11px] font-mono font-bold text-white/20 flex-shrink-0 pt-0.5">{s.n}</span>
                <div>
                  <p className="text-[12px] font-semibold text-white mb-0.5">{s.title}</p>
                  <p className="text-[11px] text-white/40 leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Past uploads ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-slate-900">Upload History</p>
          <button onClick={loadBatches} className="text-slate-400 hover:text-slate-700 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingBatches ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-7 h-7 text-slate-200 mx-auto mb-2" />
            <p className="text-[13px] text-slate-400">No uploads yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {batches.map(batch => {
              const sCfg = SLOT_STATUS[batch.status] ?? SLOT_STATUS.pending_review;
              const isExpanded = expandedBatch === batch.id;
              const slots = batchSlots[batch.id] ?? [];

              return (
                <div key={batch.id}>
                  <button
                    onClick={() => toggleBatch(batch.id)}
                    className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">{batch.publisher_name || batch.filename}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{batch.row_count} slots</span>
                        <span>·</span>
                        <span>{new Date(batch.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {batch.import_week && <><span>·</span><span>w/c {batch.import_week}</span></>}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${sCfg.pill}`}>
                      {sCfg.label}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-300" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {loadingSlots === batch.id ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-center text-[12px] text-slate-400 py-6">No slots found</p>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {slots.map(slot => {
                            const ssCfg = SLOT_STATUS[slot.status] ?? SLOT_STATUS.pending_review;
                            const hasErrors = slot.validation_errors?.some(e => e.severity === 'error');
                            return (
                              <div key={slot.id} className="flex items-center gap-3 px-5 py-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-semibold text-slate-800 truncate">{slot.media_name}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                                    {slot.opportunity_type && <span>{slot.opportunity_type}</span>}
                                    {slot.original_price && <><span>·</span><span className="font-semibold text-slate-600">${slot.original_price.replace(/[^0-9.]/g, '')}</span></>}
                                    {slot.send_date && <><span>·</span><span>Send: {slot.send_date}</span></>}
                                    {slot.deadline && <><span>·</span><span>Deadline: {slot.deadline}</span></>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {hasErrors && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" title="Has validation issues" />}
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ssCfg.pill}`}>
                                    {ssCfg.label}
                                  </span>
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
        )}
      </div>

      {/* Status legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Slot Statuses</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { status: 'pending_review', desc: 'Waiting for admin review' },
            { status: 'needs_review',   desc: 'Has issues that need checking' },
            { status: 'approved',       desc: 'Approved, ready to publish' },
            { status: 'published',      desc: 'Live in the marketplace' },
            { status: 'rejected',       desc: 'Not approved — contact support' },
            { status: 'expired',        desc: 'Deadline has passed' },
          ].map(({ status, desc }) => {
            const cfg = SLOT_STATUS[status];
            return (
              <div key={status} className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.pill}`}>{cfg.label}</span>
                <span className="text-[11px] text-slate-400">{desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Grouped preview slot row ──────────────────────────────────────────────────

function PreviewSlotRow({
  row, selected, editing, editValues,
  onToggleSelect, onStartEdit, onEditChange, onSaveEdit, onCancelEdit, onDelete,
}: {
  row: CsvRow;
  selected: boolean;
  editing: boolean;
  editValues: Partial<CsvRow>;
  onToggleSelect: () => void;
  onStartEdit: () => void;
  onEditChange: (k: string, v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 group transition-colors ${row.hasErrors ? 'bg-red-50/30' : 'hover:bg-slate-50/60'}`}>
      <div className="flex items-center gap-2 pt-0.5 flex-shrink-0">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="rounded border-slate-300" />
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${row.hasErrors ? 'bg-red-400' : row.hasWarnings ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      </div>

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
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-slate-800">{row.sponsorship_type || '—'}</span>
              <span className="text-[12px] font-bold text-slate-900">{row.price || '—'}</span>
              {row.slots_available && (
                <span className="text-[11px] text-slate-400">{row.slots_available} slot{parseInt(row.slots_available) !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {row.send_date && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Send: {row.send_date}</span>}
              {row.deadline && <span className="text-[11px] text-slate-400">Deadline: {row.deadline}</span>}
            </div>
            {(row.hasErrors || row.hasWarnings) && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {row.errors.map((err, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${err.severity === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {err.severity === 'error' ? <AlertCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                    {err.field}: {err.message}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
        {editing ? (
          <>
            <button onClick={onSaveEdit} className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold rounded-lg">
              <Check className="w-3 h-3" /> Save
            </button>
            <button onClick={onCancelEdit} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-3 h-3" /></button>
          </>
        ) : (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onStartEdit} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
