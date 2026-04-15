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
      <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-2 py-1 rounded-md">
        <Clock className="w-3 h-3" />
        Claiming closed
      </div>
    );
  }

  if (compact) {
    const colorClass = isUrgent
      ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      : isWarning
      ? 'bg-yellow-500/15 border-yellow-500/20 text-yellow-400'
      : 'bg-amber-500/15 border-amber-500/20 text-amber-400';

    const label = time.days > 0
      ? `${time.days}d ${time.hours}h to claim`
      : `${time.hours}h ${time.minutes}m to claim`;

    return (
      <div className={`flex items-center gap-1.5 border text-xs font-bold px-2.5 py-1.5 rounded-lg ${colorClass}`}>
        <Clock className="w-3 h-3" />
        {label}
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const colorClass = isUrgent || isWarning ? 'text-yellow-400' : 'text-amber-400';

  return (
    <div className={`flex items-center gap-2 ${colorClass}`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <div className="flex items-center gap-1 text-xs font-mono font-bold">
        {time.days > 0 && (
          <>
            <span>{time.days}<span className="font-normal opacity-60 text-[10px]">d</span></span>
            <span className="opacity-30">:</span>
          </>
        )}
        <span>{pad(time.hours)}<span className="font-normal opacity-60 text-[10px]">h</span></span>
        <span className="opacity-30">:</span>
        <span>{pad(time.minutes)}<span className="font-normal opacity-60 text-[10px]">m</span></span>
        <span className="opacity-30">:</span>
        <span>{pad(time.seconds)}<span className="font-normal opacity-60 text-[10px]">s</span></span>
      </div>
    </div>
  );
}
