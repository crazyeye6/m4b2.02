import { Users, MapPin, BarChart2, Globe, FileText, ExternalLink, Pencil, Trash2, Radio } from 'lucide-react';
import type { MediaProfile } from '../../types';

interface Props {
  profile: MediaProfile;
  onEdit: () => void;
  onDelete: () => void;
}

function fmt(n: number | null): string {
  if (!n) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function ProfileCard({ profile, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl p-5 hover:border-black/[0.1] hover:shadow-md hover:shadow-black/[0.04] transition-all">
      <div className="flex items-start gap-4 mb-4">
        {profile.logo_url ? (
          <img
            src={profile.logo_url}
            alt={profile.newsletter_name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-black/[0.06]"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-black/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="text-[#6e6e73] font-bold text-lg">
              {profile.newsletter_name.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-[#1d1d1f] font-semibold text-base leading-tight truncate">{profile.newsletter_name || 'Untitled profile'}</h3>
          {profile.tagline && <p className="text-[#6e6e73] text-sm mt-0.5 line-clamp-2">{profile.tagline}</p>}
          {profile.category && (
            <span className="inline-block mt-1.5 text-[10px] font-semibold text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.06] px-2 py-0.5 rounded-lg">
              {profile.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] border border-transparent hover:border-black/[0.08] transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#86868b] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric icon={<Users className="w-3 h-3" />} label="Subscribers" value={fmt(profile.subscriber_count)} />
        <Metric icon={<BarChart2 className="w-3 h-3" />} label="Open rate" value={profile.open_rate || '—'} highlight />
        <Metric icon={<MapPin className="w-3 h-3" />} label="Geography" value={profile.primary_geography || '—'} />
        <Metric icon={<Radio className="w-3 h-3" />} label="Frequency" value={profile.publishing_frequency || '—'} />
      </div>

      {profile.audience_summary && (
        <p className="text-[#6e6e73] text-xs leading-relaxed line-clamp-2 mb-3">{profile.audience_summary}</p>
      )}

      {profile.past_advertisers && profile.past_advertisers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.past_advertisers.slice(0, 5).map(a => (
            <span key={a} className="text-[11px] text-[#6e6e73] bg-[#f5f5f7] border border-black/[0.06] px-2 py-0.5 rounded-lg">{a}</span>
          ))}
          {profile.past_advertisers.length > 5 && (
            <span className="text-[11px] text-[#aeaeb2] px-1 py-0.5">+{profile.past_advertisers.length - 5} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-black/[0.04]">
        {profile.website_url && (
          <ProfileLink href={profile.website_url} icon={<Globe className="w-3 h-3" />} label="Website" />
        )}
        {profile.media_kit_url && (
          <ProfileLink href={profile.media_kit_url} icon={<FileText className="w-3 h-3" />} label="Media kit" />
        )}
        {profile.sample_issue_url && (
          <ProfileLink href={profile.sample_issue_url} icon={<ExternalLink className="w-3 h-3" />} label="Sample issue" />
        )}
      </div>
    </div>
  );
}

function Metric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#f5f5f7] rounded-xl px-3 py-2">
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[#aeaeb2]">{icon}</span>
        <p className="text-[9px] font-semibold text-[#aeaeb2] uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm font-bold ${highlight ? 'text-green-600' : 'text-[#1d1d1f]'}`}>{value}</p>
    </div>
  );
}

function ProfileLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}
