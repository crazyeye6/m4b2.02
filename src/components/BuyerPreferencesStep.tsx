import { useState } from 'react';
import { Bell, Globe, Tag, Clock, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import type { DigestPreferences } from '../context/AuthContext';
import TagInput from './TagInput';

interface BuyerPreferencesStepProps {
  onSave: (prefs: DigestPreferences) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'newsletter', label: 'Newsletter', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'podcast', label: 'Podcast', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'influencer', label: 'Influencer', color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

const LOCATION_OPTIONS = [
  'Global', 'US', 'UK', 'EU', 'Canada', 'Australia', 'Asia', 'Latin America',
];

export default function BuyerPreferencesStep({ onSave, onSkip, saving }: BuyerPreferencesStepProps) {
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('weekly');

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSave = async () => {
    await onSave({
      digest_enabled: true,
      digest_frequency: frequency,
      digest_media_types: selectedMediaTypes,
      digest_locations: selectedLocations,
      digest_tags: selectedTags,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bell className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-[#1d1d1f] font-semibold text-[15px]">Set up your opportunity alerts</h3>
          <p className="text-[#6e6e73] text-[12px] mt-0.5 leading-relaxed">
            Tell us what you're looking for and we'll send you a personalised digest of matching slots before they expire.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">
          Media type
        </label>
        <div className="flex flex-wrap gap-2">
          {MEDIA_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedMediaTypes(prev => toggle(prev, opt.value))}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                selectedMediaTypes.includes(opt.value)
                  ? opt.color
                  : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">
          <Globe className="w-3 h-3 inline mr-1" />
          Target audience location
        </label>
        <div className="flex flex-wrap gap-2">
          {LOCATION_OPTIONS.map(loc => (
            <button
              key={loc}
              type="button"
              onClick={() => setSelectedLocations(prev => toggle(prev, loc))}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                selectedLocations.includes(loc)
                  ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">
          <Tag className="w-3 h-3 inline mr-1" />
          Topics &amp; niches
        </label>
        <TagInput
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          maxTags={20}
          placeholder="Search topics… (e.g. SaaS, B2B, Finance)"
          chipVariant="filter"
          showHint={false}
        />
        {selectedTags.length > 0 && (
          <p className="text-[11px] text-green-600 mt-1.5 font-medium">{selectedTags.length} topic{selectedTags.length > 1 ? 's' : ''} selected</p>
        )}
      </div>

      <div>
        <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">
          <Clock className="w-3 h-3 inline mr-1" />
          Digest frequency
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['daily', 'weekly'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`py-2.5 rounded-2xl text-[13px] font-semibold border transition-all flex items-center justify-center gap-2 ${
                frequency === f
                  ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12]'
              }`}
            >
              {frequency === f && <CheckCircle className="w-3.5 h-3.5" />}
              {f === 'daily' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#aeaeb2] mt-1.5">
          {frequency === 'daily'
            ? 'Get alerted each morning with the latest slots.'
            : 'Receive a curated digest once a week.'}
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-[14px] transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          Save &amp; finish
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-3 rounded-2xl border border-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] transition-all"
        >
          Skip
        </button>
      </div>
      <p className="text-[11px] text-[#aeaeb2] text-center -mt-2">
        You can update these preferences any time in your dashboard.
      </p>
    </div>
  );
}
