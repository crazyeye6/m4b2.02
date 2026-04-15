import { Activity, TrendingDown, DollarSign } from 'lucide-react';

interface StatsBarProps {
  liveCount: number;
  avgDiscount: number;
  totalSavings: number;
}

export default function StatsBar({ liveCount, avgDiscount, totalSavings }: StatsBarProps) {
  const stats = [
    {
      icon: <Activity className="w-4 h-4 text-green-600" />,
      iconBg: 'bg-green-50',
      value: liveCount.toString(),
      label: 'Live opportunities',
      pulse: true,
    },
    {
      icon: <TrendingDown className="w-4 h-4 text-sky-600" />,
      iconBg: 'bg-sky-50',
      value: `${avgDiscount}%`,
      label: 'Avg discount',
      pulse: false,
    },
    {
      icon: <DollarSign className="w-4 h-4 text-orange-500" />,
      iconBg: 'bg-orange-50',
      value: `$${(totalSavings).toLocaleString()}`,
      label: 'Total buyer savings',
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
