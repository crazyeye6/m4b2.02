import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export default function CountdownTimer({ deadline, compact = false }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(deadline));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const isUrgent = !time.expired && time.days === 0 && time.hours < 6;
  const isWarning = !time.expired && time.days === 0;

  if (time.expired) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-500 text-[11px] font-semibold px-2.5 py-1.5 rounded-full tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
        Closed
      </div>
    );
  }

  if (compact) {
    const bg = isUrgent
      ? 'bg-red-50 border-red-100 text-red-500'
      : isWarning
      ? 'bg-orange-50 border-orange-100 text-orange-500'
      : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73]';

    const label = time.days > 0
      ? `${time.days}d ${time.hours}h to claim`
      : `${time.hours}h ${time.minutes}m to claim`;

    return (
      <div className={`inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2.5 py-1.5 rounded-full ${bg}`}>
        <Clock className="w-3 h-3 flex-shrink-0" />
        {label}
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const textColor = isUrgent ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-[#1d1d1f]';

  return (
    <div className={`flex items-center gap-2 ${textColor}`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <div className="flex items-center gap-1 text-[12px] font-mono font-semibold tracking-tight">
        {time.days > 0 && (
          <>
            <span>{time.days}<span className="font-normal text-[10px] opacity-50">d</span></span>
            <span className="opacity-25">:</span>
          </>
        )}
        <span>{pad(time.hours)}<span className="font-normal text-[10px] opacity-50">h</span></span>
        <span className="opacity-25">:</span>
        <span>{pad(time.minutes)}<span className="font-normal text-[10px] opacity-50">m</span></span>
        <span className="opacity-25">:</span>
        <span>{pad(time.seconds)}<span className="font-normal text-[10px] opacity-50">s</span></span>
      </div>
    </div>
  );
}
