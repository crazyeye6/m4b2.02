import { X, Hash } from 'lucide-react';

interface TagChipProps {
  label: string;
  onRemove: () => void;
  variant?: 'default' | 'filter';
}

export function TagChip({ label, onRemove, variant = 'default' }: TagChipProps) {
  if (variant === 'filter') {
    return (
      <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-full text-[12px] font-semibold bg-teal-50 border border-teal-200 text-teal-700 whitespace-nowrap">
        <Hash className="w-2.5 h-2.5 opacity-70" />
        {label}
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-teal-200 transition-colors ml-0.5"
          aria-label={`Remove ${label}`}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-lg text-[12px] font-semibold bg-[#1d1d1f] text-white">
      <Hash className="w-2.5 h-2.5 opacity-50" />
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-md hover:bg-white/20 transition-colors ml-0.5"
        aria-label={`Remove ${label}`}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
