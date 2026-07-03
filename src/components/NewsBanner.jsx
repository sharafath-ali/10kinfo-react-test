/**
 * NewsBanner.jsx — Good / Bad / Mixed signal summary banner
 */
import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

function NewsBanner({ data }) {
  const { sentiment, good, bad } = useMemo(() => {
    let good = 0, bad = 0;
    data.forEach((e) => {
      if (e.signal === 'good') good++;
      else if (e.signal === 'bad') bad++;
    });
    const sentiment = good > bad ? 'good' : bad > good ? 'bad' : 'neutral';
    return { sentiment, good, bad };
  }, [data]);

  const config = {
    good: {
      icon: TrendingUp,
      label: 'Good News',
      desc: `${good} positive signals outpacing ${bad} negative — economic conditions improving.`,
      classes: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconClass: 'text-emerald-600',
      dotClass: 'bg-emerald-500',
    },
    bad: {
      icon: TrendingDown,
      label: 'Caution',
      desc: `${bad} negative signals outpacing ${good} positive — conditions may be deteriorating.`,
      classes: 'bg-red-50 border-red-200 text-red-800',
      iconClass: 'text-red-500',
      dotClass: 'bg-red-500',
    },
    neutral: {
      icon: Minus,
      label: 'Mixed Signals',
      desc: `${good} positive and ${bad} negative signals — market sentiment is balanced.`,
      classes: 'bg-slate-50 border-slate-200 text-slate-700',
      iconClass: 'text-slate-500',
      dotClass: 'bg-slate-400',
    },
  };

  const { icon: Icon, label, desc, classes, iconClass, dotClass } = config[sentiment];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-3 rounded-xl border mb-5 text-sm',
        classes
      )}
      role="status"
      aria-live="polite"
    >
      <span className={cn('flex h-2 w-2 rounded-full shrink-0', dotClass)} />
      <Icon className={cn('w-4 h-4 shrink-0', iconClass)} />
      <span className="font-semibold">{label}:</span>
      <span className="opacity-85">{desc}</span>
    </div>
  );
}

export default memo(NewsBanner);
