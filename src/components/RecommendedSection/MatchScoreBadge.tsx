import type { ScoredListing } from '../../lib/matchScore';

interface Props {
  score: number;
  label: ScoredListing['label'];
  compact?: boolean;
}

export default function MatchScoreBadge({ score, label, compact = false }: Props) {
  const colors =
    score >= 90
      ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: '#10b981' }
      : score >= 75
      ? { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', bar: '#14b8a6' }
      : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', bar: '#94a3b8' };

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>
        <span>{score}</span>
        <span className="opacity-60">/ 100</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="relative w-7 h-7 flex-shrink-0">
        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle
            cx="14" cy="14" r="11" fill="none"
            stroke={colors.bar} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 11}`}
            strokeDashoffset={`${2 * Math.PI * 11 * (1 - score / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold ${colors.text}`}>
          {score}
        </span>
      </div>
      <div>
        <p className={`text-[10px] font-bold leading-none ${colors.text}`}>{score} – {label}</p>
        <p className="text-[9px] text-slate-400 leading-none mt-0.5">Match Score</p>
      </div>
    </div>
  );
}
