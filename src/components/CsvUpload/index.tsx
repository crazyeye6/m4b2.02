import { useState, useCallback } from 'react';
import { Download, Upload, CheckCircle, AlertCircle, Loader2, RotateCcw, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { parseCSV, downloadTemplate } from './csvUtils';
import DropZone from './DropZone';
import PreviewTable from './PreviewTable';
import type { CsvRow, UploadStep } from './types';
import { CSV_COLUMNS } from './types';

interface CsvUploadProps {
  variant?: 'full' | 'compact';
}

export default function CsvUpload({ variant = 'full' }: CsvUploadProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<UploadStep>('idle');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setHeaderError(null);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      if (result.headerError) {
        setHeaderError(result.headerError);
        setStep('error');
        setFileName(file.name);
        return;
      }
      setFileName(file.name);
      setRows(result.rows);
      setStep('preview');
    };
    reader.readAsText(file);
  }, []);

  const handleClear = () => {
    setStep('idle');
    setFileName('');
    setRows([]);
    setHeaderError(null);
    setSubmitError(null);
    setBatchId(null);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setStep('submitting');
    setSubmitError(null);

    const { data: batch, error: batchErr } = await supabase
      .from('csv_upload_batches')
      .insert({
        seller_user_id: user.id,
        seller_email: user.email ?? '',
        filename: fileName,
        row_count: rows.length,
        status: 'pending_review',
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
      status: (row.hasErrors ? 'needs_review' : 'pending_review') as string,
      media_name: row.newsletter_name,
      media_type: 'newsletter',
      audience_size: row.subscriber_count,
      opportunity_type: row.sponsorship_type,
      original_price: row.original_price,
      discount_price: row.discount_price,
      slots_available: row.slots_available,
      deadline: row.deadline,
      category: row.niche,
      audience_description: row.audience_description,
      booking_url: row.booking_url,
      description: row.description,
      validation_errors: row.errors,
    }));

    const { error: slotsErr } = await supabase.from('csv_upload_slots').insert(slotRows);

    if (slotsErr) {
      setSubmitError('Batch created but some slots failed to save. Please contact support.');
    }

    setBatchId(batch.id);
    setStep('done');
  };

  if (variant === 'compact') {
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[#1d1d1f] font-semibold text-sm mb-0.5">Upload multiple slots at once</p>
            <p className="text-[#6e6e73] text-xs leading-relaxed">Download the CSV template, fill in your slots, then upload below.</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f] text-xs font-semibold px-3 py-2 rounded-xl transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download template
          </button>
        </div>

        {step !== 'done' && (
          <DropZone
            onFile={handleFile}
            fileName={step !== 'idle' ? fileName : undefined}
            onClear={handleClear}
          />
        )}

        {step === 'error' && headerError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold text-sm">Invalid CSV format</p>
              <p className="text-red-600 text-xs mt-0.5 leading-relaxed">{headerError}</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {step === 'preview' && rows.length > 0 && (
          <>
            <PreviewTable
              rows={rows}
              onRowChange={(rowIndex, updated) => {
                setRows(prev => prev.map(r => r.rowIndex === rowIndex ? updated : r));
              }}
            />
            {!user && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-sm">You must be signed in to submit. Please log in first.</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f] font-semibold px-4 py-3 rounded-2xl transition-all text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Choose different file
              </button>
              <button
                onClick={handleSubmit}
                disabled={!user}
                className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-2xl transition-all text-sm flex-1"
              >
                <Upload className="w-4 h-4" />
                Submit {rows.length} slot{rows.length !== 1 ? 's' : ''} for review
              </button>
            </div>
          </>
        )}

        {step === 'submitting' && (
          <div className="flex items-center justify-center gap-3 py-6">
            <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
            <p className="text-[#1d1d1f] font-semibold text-sm">Submitting {rows.length} slots…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[#1d1d1f] font-semibold text-sm mb-0.5">{rows.length} slot{rows.length !== 1 ? 's' : ''} submitted</p>
              <p className="text-[#6e6e73] text-xs">Our team will review and publish your listings shortly.</p>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-xs font-semibold transition-colors mt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Upload another file
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-black/[0.08] text-[#6e6e73] text-[11px] font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            Bulk Upload
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-[-0.02em] mb-3">
            Upload multiple newsletter slots via CSV
          </h2>
          <p className="text-[#6e6e73] text-lg max-w-xl mx-auto leading-relaxed">
            Upload a file with your available sponsorship slots and we'll create draft listings for review. Best for newsletter publishers with multiple opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Download className="w-4 h-4" />, title: 'Download the template', desc: 'Use our pre-formatted CSV template for fastest processing' },
            { icon: <Upload className="w-4 h-4" />, title: 'Fill and upload', desc: 'Add your opportunities, one row per slot, then upload' },
            { icon: <CheckCircle className="w-4 h-4" />, title: 'Preview and confirm', desc: 'Review parsed rows and fix issues before submitting' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm">
              <div className="w-8 h-8 bg-[#f5f5f7] border border-black/[0.06] rounded-xl flex items-center justify-center mb-3 text-[#1d1d1f]">
                {icon}
              </div>
              <p className="text-[#1d1d1f] font-semibold text-sm mb-1">{title}</p>
              <p className="text-[#6e6e73] text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-5">
          <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[#1d1d1f] font-semibold text-base">Required CSV format</h3>
              <p className="text-[#6e6e73] text-sm mt-0.5">Your file must include these column headers. Download the template to get started instantly.</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shrink-0"
            >
              <Download className="w-4 h-4" />
              Download template
            </button>
          </div>
          <div className="p-6">
            <div className="bg-[#fafafa] border border-black/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-black/[0.05] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/[0.08]" />
                </div>
                <span className="text-[#aeaeb2] text-xs ml-1">newsletter-slots-template.csv — header row</span>
              </div>
              <div className="p-5 overflow-x-auto">
                <div className="flex flex-wrap gap-2">
                  {CSV_COLUMNS.map(({ key, required }) => (
                    <span
                      key={key}
                      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg border ${
                        required
                          ? 'bg-[#1d1d1f] text-white border-transparent'
                          : 'bg-white text-[#6e6e73] border-black/[0.08]'
                      }`}
                    >
                      {key}
                      {required && <span className="text-[9px] font-bold opacity-60 uppercase tracking-wide">req</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl overflow-hidden shadow-sm mb-8">
          <div className="px-6 py-5 border-b border-black/[0.06]">
            <h3 className="text-[#1d1d1f] font-semibold text-base">Upload your CSV</h3>
            <p className="text-[#6e6e73] text-sm mt-0.5">
              {step === 'idle' && 'Select or drag your CSV file to preview rows before submitting.'}
              {step === 'preview' && `${rows.length} row${rows.length !== 1 ? 's' : ''} detected — review the preview below then submit.`}
              {step === 'error' && 'There was a problem reading your file. See the error below.'}
              {step === 'submitting' && 'Submitting your opportunities for review…'}
              {step === 'done' && 'Your opportunities have been submitted and are pending admin review.'}
            </p>
          </div>
          <div className="p-6 space-y-5">
            {step !== 'done' && (
              <DropZone
                onFile={handleFile}
                fileName={step !== 'idle' ? fileName : undefined}
                onClear={handleClear}
              />
            )}

            {step === 'error' && headerError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-semibold text-sm">Invalid CSV format</p>
                  <p className="text-red-600 text-xs mt-0.5 leading-relaxed">{headerError}</p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {step === 'preview' && rows.length > 0 && (
              <>
                <PreviewTable
                  rows={rows}
                  onRowChange={(rowIndex, updated) => {
                    setRows(prev => prev.map(r => r.rowIndex === rowIndex ? updated : r));
                  }}
                />
                {!user && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">You must be signed in to submit opportunities. Please log in first.</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={handleClear}
                    className="flex items-center justify-center gap-2 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f] font-semibold px-5 py-3.5 rounded-2xl transition-all text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Choose different file
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!user}
                    className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3.5 rounded-2xl transition-all text-sm flex-1"
                  >
                    <Upload className="w-4 h-4" />
                    Submit {rows.length} opportunit{rows.length !== 1 ? 'ies' : 'y'} for review
                  </button>
                </div>
              </>
            )}

            {step === 'submitting' && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
                <p className="text-[#1d1d1f] font-semibold text-sm">Submitting {rows.length} opportunities…</p>
              </div>
            )}

            {step === 'done' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl px-5 py-5">
                  <div className="w-9 h-9 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold text-sm mb-1">
                      {rows.length} opportunit{rows.length !== 1 ? 'ies' : 'y'} submitted successfully
                    </p>
                    <p className="text-green-700 text-xs leading-relaxed">
                      Each row has been added to the admin review queue. Nothing is published automatically — we'll review each listing and notify you once approved.
                    </p>
                    {batchId && (
                      <p className="text-green-600/70 text-[10px] font-mono mt-2">Batch ID: {batchId}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload another CSV
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1d1d1f] rounded-3xl p-6 sm:p-8">
          <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-4">What happens after upload</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: '01', title: 'CSV is parsed', desc: 'Each row is read and validated automatically' },
              { step: '02', title: 'Drafts created', desc: 'Every valid row becomes a separate draft listing' },
              { step: '03', title: 'Admin review', desc: 'We check each draft and fix any flagged issues' },
              { step: '04', title: 'Published', desc: 'Approved listings go live for buyers to discover' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex sm:flex-col gap-4 sm:gap-2">
                <div className="shrink-0 sm:mb-1">
                  <span className="text-white/30 font-mono font-bold text-xs">{step}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
