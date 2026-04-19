import { useState } from 'react';
import { Sparkles, ArrowRight, X, Check } from 'lucide-react';
import type { BuyerPreferences, PrefLocation } from '../hooks/useBuyerPreferences';
import TagInput from './TagInput';

interface Props {
  onSave: (partial: Partial<BuyerPreferences>) => void;
  onSkip: () => void;
}

const LOCATIONS: PrefLocation[] = ['UK', 'Ireland', 'US', 'Europe', 'Global'];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-semibold border-2 transition-all duration-150
        ${active
          ? 'bg-slate-900 text-white border-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.18)] scale-[1.02]'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'}`}
    >
      {active && <Check className="w-3 h-3 flex-shrink-0" />}
      {children}
    </button>
  );
}

export default function PreferencesOnboarding({ onSave, onSkip }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [locs, setLocs] = useState<PrefLocation[]>([]);

  const toggleLoc = (l: PrefLocation) =>
    setLocs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const handleSave = () => {
    onSave({ tags, locations: locs, hasCompletedOnboarding: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onSkip} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-900/25 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-slate-900" />

        <div className="p-6 sm:p-7">
          <button onClick={onSkip} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-slate-900 leading-tight">Personalize your feed</p>
              <p className="text-[13px] text-slate-400">Tell us what you're looking for — takes 10 seconds.</p>
            </div>
          </div>

          {/* Niche / Audience / Location Tags */}
          <div className="mb-5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Niche / Audience / Location Tags</p>
            <p className="text-[12px] text-slate-400 mb-3">Search or add tags for the niches, audiences, and locations you care about.</p>
            <TagInput
              selectedTags={tags}
              onChange={setTags}
              maxTags={15}
              placeholder="e.g. saas, uk, b2b, finance, creator..."
              showHint
            />
          </div>

          {/* Locations */}
          <div className="mb-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Where is your audience?</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(l => (
                <Chip key={l} active={locs.includes(l)} onClick={() => toggleLoc(l)}>{l}</Chip>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="px-5 py-3 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all"
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={tags.length === 0 && locs.length === 0}
              className="flex-1 group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-6 py-3 rounded-xl text-[14px] transition-all shadow-[0_4px_16px_rgba(15,23,42,0.18)] hover:shadow-[0_6px_22px_rgba(15,23,42,0.24)] disabled:shadow-none"
            >
              Show my matches
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-100" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
