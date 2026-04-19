import { useState } from 'react';
import { X, Check, Sparkles, ArrowRight } from 'lucide-react';
import type { BuyerPreferences, PrefCategory, PrefLocation, PrefGoal, PrefTiming, PrefAudienceSize } from '../hooks/useBuyerPreferences';

interface Props {
  prefs: BuyerPreferences;
  onSave: (prefs: Partial<BuyerPreferences>) => void;
  onClose: () => void;
}

const CATEGORIES: PrefCategory[] = ['SaaS', 'Marketing', 'Business', 'Finance', 'E-commerce', 'Creator', 'Tech', 'DTC'];
const LOCATIONS: PrefLocation[] = ['UK', 'Ireland', 'US', 'Europe', 'Global'];
const GOALS: Array<{ value: PrefGoal; label: string; desc: string }> = [
  { value: 'awareness', label: 'Brand Awareness', desc: 'Reach new audiences broadly' },
  { value: 'conversions', label: 'Conversions', desc: 'Drive direct-response actions' },
  { value: 'lead_generation', label: 'Lead Generation', desc: 'Capture emails and sign-ups' },
];
const TIMINGS: Array<{ value: PrefTiming; label: string }> = [
  { value: 'last_minute', label: 'Last minute (24h)' },
  { value: 'next_3_days', label: 'Next 3 days' },
  { value: 'this_week', label: 'This week' },
];
const AUDIENCE_SIZES: Array<{ value: PrefAudienceSize; label: string; desc: string }> = [
  { value: 'small', label: 'Small niche', desc: 'Under 30K — tight, engaged' },
  { value: 'mid', label: 'Mid-size', desc: '10K–150K — balanced reach' },
  { value: 'large', label: 'Large reach', desc: '50K+ — maximum impressions' },
];

const BUDGET_PRESETS = [
  { label: 'Any', min: 0, max: 0 },
  { label: 'Under $250', min: 0, max: 250 },
  { label: '$250–$500', min: 250, max: 500 },
  { label: '$500–$1K', min: 500, max: 1000 },
  { label: '$1K–$2.5K', min: 1000, max: 2500 },
  { label: '$2.5K+', min: 2500, max: 0 },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-150
        ${active
          ? 'bg-slate-900 text-white border-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.18)]'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'}`}
    >
      {active && <Check className="w-3 h-3 flex-shrink-0" />}
      {children}
    </button>
  );
}

export default function PreferencesModal({ prefs, onSave, onClose }: Props) {
  const [cats, setCats] = useState<PrefCategory[]>(prefs.categories);
  const [locs, setLocs] = useState<PrefLocation[]>(prefs.locations);
  const [goal, setGoal] = useState<PrefGoal | null>(prefs.goal);
  const [timing, setTiming] = useState<PrefTiming | null>(prefs.timing);
  const [audSize, setAudSize] = useState<PrefAudienceSize | null>(prefs.audienceSize);
  const [budgetMin, setBudgetMin] = useState(prefs.budgetMin);
  const [budgetMax, setBudgetMax] = useState(prefs.budgetMax);

  const toggleCat = (c: PrefCategory) =>
    setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const toggleLoc = (l: PrefLocation) =>
    setLocs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const setBudget = (min: number, max: number) => {
    if (budgetMin === min && budgetMax === max) { setBudgetMin(0); setBudgetMax(0); }
    else { setBudgetMin(min); setBudgetMax(max); }
  };

  const handleSave = () => {
    onSave({ categories: cats, locations: locs, goal, timing, audienceSize: audSize, budgetMin, budgetMax, hasCompletedOnboarding: true });
    onClose();
  };

  const matchedBudget = BUDGET_PRESETS.find(b => b.min === budgetMin && b.max === budgetMax);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-slate-900/25 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight">Your Preferences</h2>
            <p className="text-[12px] text-slate-400">We'll match the best opportunities to your goals.</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">

          {/* Categories */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Preferred Categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <Chip key={c} active={cats.includes(c)} onClick={() => toggleCat(c)}>{c}</Chip>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Target Audience Location</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(l => (
                <Chip key={l} active={locs.includes(l)} onClick={() => toggleLoc(l)}>{l}</Chip>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Budget Range</p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map(b => (
                <Chip
                  key={b.label}
                  active={!!(matchedBudget && matchedBudget.label === b.label)}
                  onClick={() => setBudget(b.min, b.max)}
                >
                  {b.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Campaign Goal */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Campaign Goal</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGoal(prev => prev === g.value ? null : g.value)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150
                    ${goal === g.value
                      ? 'bg-slate-900 text-white border-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.18)]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
                >
                  <p className={`text-[13px] font-semibold leading-tight mb-0.5 ${goal === g.value ? 'text-white' : 'text-slate-900'}`}>{g.label}</p>
                  <p className={`text-[11px] leading-snug ${goal === g.value ? 'text-slate-300' : 'text-slate-400'}`}>{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Preferred Timing</p>
            <div className="flex flex-wrap gap-2">
              {TIMINGS.map(t => (
                <Chip key={t.value} active={timing === t.value} onClick={() => setTiming(prev => prev === t.value ? null : t.value)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Audience size */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Audience Size Preference</p>
            <div className="grid grid-cols-3 gap-2">
              {AUDIENCE_SIZES.map(a => (
                <button
                  key={a.value}
                  onClick={() => setAudSize(prev => prev === a.value ? null : a.value)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150
                    ${audSize === a.value
                      ? 'bg-slate-900 text-white border-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.18)]'
                      : 'bg-white border-slate-200 hover:border-slate-400'}`}
                >
                  <p className={`text-[12px] font-semibold leading-tight mb-0.5 ${audSize === a.value ? 'text-white' : 'text-slate-900'}`}>{a.label}</p>
                  <p className={`text-[10px] leading-snug ${audSize === a.value ? 'text-slate-300' : 'text-slate-400'}`}>{a.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-[14px] transition-all shadow-[0_4px_16px_rgba(15,23,42,0.18)] hover:shadow-[0_6px_22px_rgba(15,23,42,0.24)]"
          >
            Save Preferences
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-100" />
          </button>
        </div>
      </div>
    </div>
  );
}
