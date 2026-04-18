import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface DropZoneProps {
  onFile: (file: File) => void;
  fileName?: string;
  onClear: () => void;
}

export default function DropZone({ onFile, fileName, onClear }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (fileName) {
    return (
      <div className="flex items-center gap-3 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl px-5 py-4">
        <div className="w-8 h-8 bg-white border border-black/[0.08] rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#1d1d1f]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#1d1d1f] font-semibold text-sm truncate">{fileName}</p>
          <p className="text-[#6e6e73] text-xs mt-0.5">CSV file ready to preview</p>
        </div>
        <button
          onClick={onClear}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.06] transition-colors shrink-0"
          aria-label="Remove file"
        >
          <X className="w-4 h-4 text-[#86868b]" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all px-6 py-10 text-center ${
        dragging
          ? 'border-[#1d1d1f] bg-[#f5f5f7]'
          : 'border-black/[0.10] hover:border-black/[0.20] bg-[#fafafa] hover:bg-[#f5f5f7]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="sr-only"
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-white border border-black/[0.08] rounded-2xl flex items-center justify-center shadow-sm">
          <Upload className="w-5 h-5 text-[#6e6e73]" />
        </div>
        <div>
          <p className="text-[#1d1d1f] font-semibold text-sm mb-1">
            Drag & drop your CSV here
          </p>
          <p className="text-[#86868b] text-xs">
            or <span className="text-[#1d1d1f] font-semibold underline underline-offset-2">click to browse</span> — .csv files only
          </p>
        </div>
      </div>
    </div>
  );
}
