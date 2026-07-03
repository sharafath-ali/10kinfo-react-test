/**
 * SummaryPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Four KPI cards: latest Inflation, Employment, GDP, and Rate values
 * with trend arrows derived from normalized data.
 */

import React, { memo, useMemo } from 'react';

function getTrend(data, category) {
  const entries = data.filter((e) => e.category === category);
  if (entries.length < 2) return { value: entries[0]?.displayValue ?? '—', direction: 0 };
  const last   = entries[entries.length - 1];
  const prev   = entries[entries.length - 2];
  const direction = last.numericValue > prev.numericValue ? 1 : last.numericValue < prev.numericValue ? -1 : 0;
  return { value: last.displayValue, direction };
}

const CARDS = [
  {
    key: 'Inflation',
    label: 'Inflation',
    icon: '📈',
    cssClass: 'inflation',
    /** For inflation: up = bad, down = good */
    sentimentUp: 'bad',
    sentimentDown: 'good',
  },
  {
    key: 'Employment',
    label: 'Employment',
    icon: '👷',
    cssClass: 'employment',
    sentimentUp: 'good',
    sentimentDown: 'bad',
  },
  {
    key: 'GDP',
    label: 'GDP Growth',
    icon: '🏛️',
    cssClass: 'gdp',
    sentimentUp: 'good',
    sentimentDown: 'bad',
  },
  {
    key: 'Rates',
    label: 'Fed Funds Rate',
    icon: '🏦',
    cssClass: 'rates',
    sentimentUp: 'bad',
    sentimentDown: 'good',
  },
];

function TrendArrow({ direction, sentimentUp, sentimentDown }) {
  if (direction === 0) return <span className="trend-flat">— Flat</span>;
  if (direction > 0) {
    const cls = sentimentUp === 'good' ? 'trend-up' : 'trend-down';
    return <span className={cls}>▲ Rising</span>;
  }
  const cls = sentimentDown === 'good' ? 'trend-up' : 'trend-down';
  return <span className={cls}>▼ Falling</span>;
}

function SummaryPanel({ data }) {
  const trends = useMemo(() => {
    const result = {};
    CARDS.forEach(({ key }) => {
      result[key] = getTrend(data, key);
    });
    return result;
  }, [data]);

  return (
    <div className="summary-panel" role="region" aria-label="Key economic indicators">
      {CARDS.map(({ key, label, icon, cssClass, sentimentUp, sentimentDown }) => {
        const { value, direction } = trends[key];
        return (
          <div key={key} className={`summary-card ${cssClass}`} aria-label={`${label} card`}>
            <div className="summary-card-label">{icon} {label}</div>
            <div className="summary-card-value td-mono">{value}</div>
            <div className="summary-card-meta">
              <TrendArrow
                direction={direction}
                sentimentUp={sentimentUp}
                sentimentDown={sentimentDown}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(SummaryPanel);
