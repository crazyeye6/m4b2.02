import { Activity, Clock, Users } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

interface StatsBarProps {
  liveCount: number;
  avgDiscount: number;
  totalSavings: number;
  closingSoon?: number;
  totalReach?: number;
}

export default function StatsBar({ liveCount, closingSoon = 0, totalReach = 0 }: StatsBarProps) {
  const { formatPrice: _fp } = useLocale();
  void _fp;
  const reachLabel = totalReach >= 1000000
    ? `${(totalReach / 1000000).toFixed(1)}M`
    : totalReach >= 1000
    ? `${Math.round(totalReach / 1000)}k`
    : totalReach > 0 ? totalReach.toString() : '—';

  const stats = [
    {
      icon: <Activity className="w-4 h-4 text-green-600" />,
      iconBg: 'bg-green-50',
      value: liveCount.toString(),
      label: 'Open slots this week',
      pulse: true,
    },
    {
      icon: <Clock className="w-4 h-4 text-red-500" />,
      iconBg: 'bg-red-50',
      value: closingSoon > 0 ? closingSoon.toString() : '—',
      label: 'Slots closing in 48 hours',
      pulse: false,
    },
    {
      icon: <Users className="w-4 h-4 text-sky-600" />,
      iconBg: 'bg-sky-50',
      value: reachLabel,
      label: 'Total audience reach available',
      pulse: false,
    },
  ];

  return (
    <section className="py-8 border-y border-black/[0.06] bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-4 px-12 py-4 sm:py-0">
              <div className={`w-9 h-9 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[22px] font-semibold text-[#1d1d1f] tracking-[-0.02em]">{stat.value}</span>
                  {stat.pulse && (
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-[#6e6e73] text-[12px] font-medium mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
