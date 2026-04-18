import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Pencil } from 'lucide-react';
import type { CsvRow, CsvColumnKey } from './types';
import { CSV_COLUMNS } from './types';
import { validateRow } from './csvUtils';

interface PreviewTableProps {
  rows: CsvRow[];
  onRowChange: (rowIndex: number, updated: CsvRow) => void;
}

const EDITABLE_COLS: CsvColumnKey[] = [
  'newsletter_name',
  'subscriber_count',
  'niche',
  'audience_description',
  'sponsorship_type',
  'original_price',
  'discount_price',
  'slots_available',
  'deadline',
  'booking_url',
  'description',
];

const VISIBLE_COLS: CsvColumnKey[] = [
  'newsletter_name',
  'subscriber_count',
  'sponsorship_type',
  'original_price',
  'discount_price',
  'deadline',
];

const COL_LABELS: Record<CsvColumnKey, string> = {
  newsletter_name: 'Newsletter',
  subscriber_count: 'Subscribers',
  niche: 'Niche',
  audience_description: 'Audience description',
  sponsorship_type: 'Sponsorship type',
  original_price: 'Orig. price',
  discount_price: 'Disc. price',
  slots_available: 'Slots',
  deadline: 'Deadline',
  booking_url: 'Booking URL',
  description: 'Description',
};

interface EditingCell {
  rowIndex: number;
  col: CsvColumnKey;
}

interface EditRowModalProps {
  row: CsvRow;
  onSave: (updated: CsvRow) => void;
  onClose: () => void;
}

function EditRowModal({ row, onSave, onClose }: EditRowModalProps) {
  const [draft, setDraft] = useState<Record<CsvColumnKey, string>>(() => {
    const d = {} as Record<CsvColumnKey, string>;
    EDITABLE_COLS.forEach(col => { d[col] = row[col] as string; });
    return d;
  });

  const liveValidation = validateRow(draft, row.rowIndex);

  const handleSave = () => {
    onSave(liveValidation);
  };

  const errorCols = new Set(liveValidation.errors.filter(e => e.severity === 'error').map(e => e.field));
  const warnCols = new Set(liveValidation.errors.filter(e => e.severity === 'warning').map(e => e.field));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/[0.12]">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-[#1d1d1f] font-semibold text-sm">Edit row #{row.rowIndex}</h3>
            <p className="text-[#aeaeb2] text-xs mt-0.5">
              {liveValidation.hasErrors
                ? `${liveValidation.errors.filter(e => e.severity === 'error').length} error${liveValidation.errors.filter(e => e.severity === 'error').length > 1 ? 's' : ''} remaining`
                : liveValidation.hasWarnings
                ? 'Warnings only — can submit'
                : 'All fields valid'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#f5f5f7] text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors"
          >
            <AlertCircle className="w-4 h-4 hidden" />
            <span className="text-lg leading-none font-light">&times;</span>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {EDITABLE_COLS.map(col => {
            const colDef = CSV_COLUMNS.find(c => c.key === col);
            const hasError = errorCols.has(col);
            const hasWarn = warnCols.has(col);
            const colErrors = liveValidation.errors.filter(e => e.field === col);
            return (
              <div key={col}>
                <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                  {COL_LABELS[col]}
                  {colDef?.required && <span className="ml-1 text-red-400">*</span>}
                </label>
                {col === 'description' || col === 'audience_description' ? (
                  <textarea
                    value={draft[col]}
                    onChange={e => setDraft(d => ({ ...d, [col]: e.target.value }))}
                    rows={3}
                    className={`w-full text-sm px-3 py-2.5 rounded-xl border outline-none transition-all resize-none ${
                      hasError
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : hasWarn
                        ? 'border-amber-300 bg-amber-50/40 focus:border-amber-400'
                        : 'border-black/[0.10] bg-[#fafafa] focus:border-black/[0.25] focus:bg-white'
                    }`}
                  />
                ) : (
                  <input
                    type="text"
                    value={draft[col]}
                    onChange={e => setDraft(d => ({ ...d, [col]: e.target.value }))}
                    className={`w-full text-sm px-3 py-2.5 rounded-xl border outline-none transition-all ${
                      hasError
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : hasWarn
                        ? 'border-amber-300 bg-amber-50/40 focus:border-amber-400'
                        : 'border-black/[0.10] bg-[#fafafa] focus:border-black/[0.25] focus:bg-white'
                    }`}
                  />
                )}
                {colErrors.map((e, i) => (
                  <p key={i} className={`text-[10px] mt-1 ${e.severity === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
                    {e.message}
                  </p>
                ))}
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#f5f5f7] border border-black/[0.08] hover:border-black/[0.16] text-[#1d1d1f] font-semibold py-2.5 rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

interface InlineCellProps {
  row: CsvRow;
  col: CsvColumnKey;
  isEditing: boolean;
  onStartEdit: () => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

function InlineCell({ row, col, isEditing, onStartEdit, onCommit, onCancel }: InlineCellProps) {
  const val = row[col] as string;
  const colErrors = row.errors.filter(e => e.field === col);
  const hasError = colErrors.some(e => e.severity === 'error');
  const hasWarn = colErrors.some(e => e.severity === 'warning');
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(val);

  useEffect(() => {
    if (isEditing) {
      setDraft(val);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isEditing, val]);

  if (isEditing) {
    return (
      <td className="px-2 py-1.5 min-w-[120px]">
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); onCommit(draft); }
            if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
            if (e.key === 'Tab') { e.preventDefault(); onCommit(draft); }
          }}
          onBlur={() => onCommit(draft)}
          className={`w-full text-xs px-2 py-1 rounded-lg border outline-none transition-all ${
            hasError
              ? 'border-red-400 bg-red-50'
              : hasWarn
              ? 'border-amber-400 bg-amber-50/50'
              : 'border-[#1d1d1f]/40 bg-white'
          }`}
          autoFocus
        />
      </td>
    );
  }

  return (
    <td
      className={`px-2 py-2.5 max-w-[150px] group cursor-pointer`}
      onClick={onStartEdit}
      title="Click to edit"
    >
      <div className="flex items-center gap-1">
        <span className={`text-xs truncate block flex-1 ${!val ? 'text-[#aeaeb2] italic' : 'text-[#1d1d1f]'}`}>
          {val || '—'}
        </span>
        <Pencil className="w-2.5 h-2.5 text-[#aeaeb2] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
      </div>
      {colErrors.map((e, i) => (
        <p key={i} className={`text-[10px] mt-0.5 leading-tight ${e.severity === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
          {e.message}
        </p>
      ))}
    </td>
  );
}

export default function PreviewTable({ rows, onRowChange }: PreviewTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editModalRow, setEditModalRow] = useState<CsvRow | null>(null);

  const errorCount = rows.filter(r => r.hasErrors).length;
  const warningCount = rows.filter(r => !r.hasErrors && r.hasWarnings).length;
  const okCount = rows.filter(r => !r.hasErrors && !r.hasWarnings).length;

  const commitCell = (row: CsvRow, col: CsvColumnKey, value: string) => {
    const raw: Record<string, string> = {};
    EDITABLE_COLS.forEach(c => { raw[c] = row[c] as string; });
    raw[col] = value;
    const updated = validateRow(raw, row.rowIndex);
    onRowChange(row.rowIndex, updated);
    setEditingCell(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5" />
          {okCount} ready
        </span>
        {warningCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            {warningCount} with warnings
          </span>
        )}
        {errorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorCount} with errors
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] text-xs font-semibold px-2.5 py-1 rounded-lg">
          {rows.length} total rows
        </span>
        <span className="ml-auto text-[11px] text-[#aeaeb2] flex items-center gap-1">
          <Pencil className="w-3 h-3" />
          Click any cell to edit
        </span>
      </div>

      <div className="rounded-2xl border border-black/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5f5f7] border-b border-black/[0.06]">
                <th className="text-left px-3 py-2.5 text-[#86868b] text-xs font-semibold w-10">#</th>
                <th className="text-left px-3 py-2.5 text-[#86868b] text-xs font-semibold w-8"></th>
                {VISIBLE_COLS.map(col => (
                  <th key={col} className="text-left px-2 py-2.5 text-[#86868b] text-xs font-semibold whitespace-nowrap">
                    {COL_LABELS[col]}
                  </th>
                ))}
                <th className="text-left px-3 py-2.5 text-[#86868b] text-xs font-semibold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {rows.map(row => (
                <tr
                  key={row.rowIndex}
                  className={`transition-colors ${
                    row.hasErrors
                      ? 'bg-red-50/60 hover:bg-red-50/80'
                      : row.hasWarnings
                      ? 'bg-amber-50/40 hover:bg-amber-50/60'
                      : 'bg-white hover:bg-[#fafafa]'
                  }`}
                >
                  <td className="px-3 py-2.5 text-[#aeaeb2] text-xs font-mono">{row.rowIndex}</td>
                  <td className="px-3 py-2.5">
                    {row.hasErrors ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    ) : row.hasWarnings ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </td>
                  {VISIBLE_COLS.map(col => (
                    <InlineCell
                      key={col}
                      row={row}
                      col={col}
                      isEditing={editingCell?.rowIndex === row.rowIndex && editingCell?.col === col}
                      onStartEdit={() => setEditingCell({ rowIndex: row.rowIndex, col })}
                      onCommit={value => commitCell(row, col, value)}
                      onCancel={() => setEditingCell(null)}
                    />
                  ))}
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setEditModalRow(row)}
                      className="flex items-center gap-1 text-[#6e6e73] hover:text-[#1d1d1f] text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit all
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.some(r => r.hasErrors) && (
        <p className="text-xs text-[#6e6e73] leading-relaxed">
          <span className="text-red-600 font-semibold">Rows with errors</span> will be submitted as "Needs Review". Fix errors above to submit them as clean drafts, or submit now and let admin resolve them.
        </p>
      )}

      {editModalRow && (
        <EditRowModal
          row={rows.find(r => r.rowIndex === editModalRow.rowIndex) ?? editModalRow}
          onSave={updated => {
            onRowChange(updated.rowIndex, updated);
            setEditModalRow(null);
          }}
          onClose={() => setEditModalRow(null)}
        />
      )}
    </div>
  );
}
