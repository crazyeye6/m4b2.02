import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import type { CsvRow } from './types';
import { CSV_COLUMNS } from './types';

interface PreviewTableProps {
  rows: CsvRow[];
}

const VISIBLE_COLS = ['media_name', 'media_type', 'original_price', 'discount_price', 'deadline', 'audience_size'];

export default function PreviewTable({ rows }: PreviewTableProps) {
  const errorCount = rows.filter(r => r.hasErrors).length;
  const warningCount = rows.filter(r => !r.hasErrors && r.hasWarnings).length;
  const okCount = rows.filter(r => !r.hasErrors && !r.hasWarnings).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="rounded-2xl border border-black/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5f5f7] border-b border-black/[0.06]">
                <th className="text-left px-3 py-2.5 text-[#86868b] text-xs font-semibold w-10">#</th>
                <th className="text-left px-3 py-2.5 text-[#86868b] text-xs font-semibold w-8"></th>
                {VISIBLE_COLS.map(col => (
                  <th key={col} className="text-left px-3 py-2.5 text-[#86868b] text-xs font-semibold whitespace-nowrap">
                    {CSV_COLUMNS.find(c => c.key === col)?.label ?? col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {rows.map(row => (
                <tr
                  key={row.rowIndex}
                  className={`${
                    row.hasErrors
                      ? 'bg-red-50/60'
                      : row.hasWarnings
                      ? 'bg-amber-50/40'
                      : 'bg-white'
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
                  {VISIBLE_COLS.map(col => {
                    const val = row[col as keyof CsvRow] as string;
                    const colErrors = row.errors.filter(e => e.field === col);
                    return (
                      <td key={col} className="px-3 py-2.5 max-w-[160px]">
                        <p className={`text-xs truncate ${!val ? 'text-[#aeaeb2] italic' : 'text-[#1d1d1f]'}`}>
                          {val || '—'}
                        </p>
                        {colErrors.map((e, i) => (
                          <p key={i} className={`text-[10px] mt-0.5 ${e.severity === 'error' ? 'text-red-500' : 'text-amber-600'}`}>
                            {e.message}
                          </p>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.some(r => r.hasErrors) && (
        <p className="text-xs text-[#6e6e73] leading-relaxed">
          <span className="text-red-600 font-semibold">Rows with errors</span> will be submitted as "Needs Review" so admin can fix them manually. You can still submit now.
        </p>
      )}
    </div>
  );
}
