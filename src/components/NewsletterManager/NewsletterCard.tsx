import { CreditCard as Edit2, Trash2, Users, BarChart2, Globe, Mail, Zap } from 'lucide-react';
import type { Newsletter } from '../../types';

interface Props {
  newsletter: Newsletter;
  onEdit: () => void;
  onDelete: () => void;
  onCreateListing: () => void;
}

export default function NewsletterCard({ newsletter, onEdit, onDelete, onCreateListing }: Props) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl p-4 hover:border-black/[0.12] transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#f5f5f7] border border-black/[0.06] rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-[#1d1d1f] font-bold text-sm">{newsletter.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-[#1d1d1f] font-semibold text-sm truncate">{newsletter.name}</h4>
              <p className="text-[#6e6e73] text-xs truncate">{newsletter.publisher_name}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="w-7 h-7 flex items-center justify-center rounded-xl text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
                title="Edit newsletter"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="w-7 h-7 flex items-center justify-center rounded-xl text-[#aeaeb2] hover:text-red-500 hover:bg-red-50 transition-all"
                title="Delete newsletter"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2.5">
            {newsletter.subscriber_count && (
              <Stat icon={<Users className="w-3 h-3" />} value={newsletter.subscriber_count.toLocaleString()} />
            )}
            {newsletter.avg_open_rate && (
              <Stat icon={<BarChart2 className="w-3 h-3" />} value={`${newsletter.avg_open_rate} open`} />
            )}
            {newsletter.niche && (
              <Stat icon={<Mail className="w-3 h-3" />} value={newsletter.niche} />
            )}
            {newsletter.primary_geography && (
              <Stat icon={<Globe className="w-3 h-3" />} value={newsletter.primary_geography} />
            )}
            {newsletter.send_frequency && (
              <Stat icon={<Zap className="w-3 h-3" />} value={newsletter.send_frequency} />
            )}
          </div>

          {newsletter.description && (
            <p className="text-[#86868b] text-xs mt-2 line-clamp-2 leading-relaxed">{newsletter.description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-black/[0.04]">
        <button
          onClick={onCreateListing}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f] hover:text-[#3a3a3c] bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.08] px-3 py-1.5 rounded-xl transition-all"
        >
          + New listing for this newsletter
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-[#6e6e73]">
      <span className="text-[#aeaeb2]">{icon}</span>
      {value}
    </span>
  );
}
