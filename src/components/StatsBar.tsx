import { Activity, TrendingDown, DollarSign } from 'lucide-react';

interface StatsBarProps {
  liveCount: number;
  avgDiscount: number;
  totalSavings: number;
}

export default function StatsBar({ liveCount, avgDiscount, totalSavings }: StatsBarProps) {
  const stats = [
    {
      icon: <Activity className="w-4 h-4 text-[#3fb950]" />,
      value: liveCount.toString(),
      label: 'Live opportunities',
      pulse: true,
    },
    {
      icon: <TrendingDown className="w-4 h-4 text-[#58a6ff]" />,
      value: `${avgDiscount}%`,
      label: 'Avg discount',
      pulse: false,
    },
    {
      icon: <DollarSign className="w-4 h-4 text-[#e3b341]" />,
      value: `$${(totalSavings).toLocaleString()}`,
      label: 'Total buyer savings',
      pulse: false,
    },
  ];

  return (
    <section className="py-6 border-y border-[#30363d] bg-[#161b22]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#30363d]">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-10 py-3 sm:py-0">
              <div className="w-8 h-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#e6edf3]">{stat.value}</span>
                  {stat.pulse && (
                    <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-[#8b949e] text-xs font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
