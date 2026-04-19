import { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Props {
  reasons: string[];
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export default function WhyMatchPopover({ reasons, onClose, anchorRect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const style: React.CSSProperties = anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.bottom + 8,
        left: Math.min(anchorRect.left, window.innerWidth - 280),
        zIndex: 9999,
      }
    : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999 };

  const displayReasons = reasons.length
    ? reasons
    : ['Matches your selected category', 'Audience fits your targeting', 'Price is within budget range'];

  return (
    <div ref={ref} style={style} className="w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/15 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-slate-100">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <p className="text-[12px] font-semibold text-slate-800">Why this match?</p>
        <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <ul className="px-4 py-3 space-y-2">
        {displayReasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0 mt-1.5" />
            <p className="text-[12px] text-slate-600 leading-snug">{r}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
