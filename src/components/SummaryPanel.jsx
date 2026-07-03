/**
 * SummaryPanel.jsx — 4 KPI cards with trend indicators
 */
import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function getTrend(data, category) {
  const entries = data.filter((e) => e.category === category);
  if (entries.length < 2) return { value: entries[0]?.displayValue ?? '—', direction: 0 };
  const last   = entries[entries.length - 1];
  const prev   = entries[entries.length - 2];
  const dir    = last.numericValue > prev.numericValue ? 1 :
                 last.numericValue < prev.numericValue ? -1 : 0;
  const pct    = prev.numericValue !== 0
    ? Math.abs(((last.numericValue - prev.numericValue) / prev.numericValue) * 100)
    : 0;
  return { value: last.displayValue, direction: dir, pct };
}

const CARDS = [
  { key: 'Inflation',  label: 'CPI Inflation',   emoji: '📈', topColor: 'from-red-400 to-orange-400',    sentimentUp: 'bad'  },
  { key: 'Employment', label: 'Employment',       emoji: '👷', topColor: 'from-emerald-400 to-teal-400', sentimentUp: 'good' },
  { key: 'GDP',        label: 'GDP Growth',       emoji: '🏛️', topColor: 'from-blue-400 to-cyan-400',    sentimentUp: 'good' },
  { key: 'Rates',      label: 'Fed Funds Rate',   emoji: '🏦', topColor: 'from-amber-400 to-yellow-400', sentimentUp: 'bad'  },
];

function TrendLine({ direction, pct, sentimentUp }) {
  if (direction === 0) {
    return (
      <div className="flex items-center gap-1 text-slate-400 text-xs">
        <Minus className="w-3.5 h-3.5" />
        <span>Unchanged</span>
      </div>
    );
  }
  const isGood   = direction > 0 ? sentimentUp === 'good' : sentimentUp !== 'good';
  const colorCls = isGood ? 'text-emerald-600' : 'text-red-500';
  const Icon     = direction > 0 ? TrendingUp : TrendingDown;
  const label    = direction > 0 ? 'Rising' : 'Falling';
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${colorCls}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {pct > 0 && (
        <span className="text-[10px] opacity-70">({pct.toFixed(3)}%)</span>
      )}
    </div>
  );
}

function SummaryPanel({ data }) {
  const trends = useMemo(() => {
    const result = {};
    CARDS.forEach(({ key }) => { result[key] = getTrend(data, key); });
    return result;
  }, [data]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {CARDS.map(({ key, label, emoji, topColor, sentimentUp }) => {
        const { value, direction, pct } = trends[key];
        return (
          <Card
            key={key}
            className="relative overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Color accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topColor}`} />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{emoji}</span>
                <span>{label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-slate-800 tracking-tight mb-2">
                {value}
              </div>
              <TrendLine direction={direction} pct={pct} sentimentUp={sentimentUp} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default memo(SummaryPanel);
