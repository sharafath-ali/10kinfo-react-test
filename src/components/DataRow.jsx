/**
 * DataRow.jsx
 * ─────────────────────────────────────────────────────────────
 * A single table row — wrapped in React.memo so it only re-renders
 * when its own data slice actually changes.
 */

import React, { memo } from 'react';

/* ── Helpers ─────────────────────────────────────────────────── */

function CategoryBadge({ category }) {
  const icons = {
    Inflation:  '📈',
    Employment: '👷',
    GDP:        '🏛️',
    Rates:      '🏦',
  };
  return (
    <span className={`cat-badge ${category}`} aria-label={`Category: ${category}`}>
      {icons[category] ?? '📊'} {category}
    </span>
  );
}

function SourceBadge({ source }) {
  return (
    <span className="source-badge" aria-label={`Source: ${source}`}>
      {source}
    </span>
  );
}

function SignalBadge({ signal }) {
  const map = {
    good:    { label: '▲ GOOD',    icon: '✅' },
    bad:     { label: '▼ BAD',     icon: '🔴' },
    neutral: { label: '— NEUTRAL', icon: '⚪' },
  };
  const { label, icon } = map[signal] ?? map.neutral;
  return (
    <span className={`signal-badge ${signal}`} aria-label={`Signal: ${signal}`}>
      {icon} {label}
    </span>
  );
}

function DeltaCell({ pctChange, isAlert, inflationAlertOn }) {
  if (pctChange === null) {
    return <span className="delta-null td-mono">—</span>;
  }

  const sign  = pctChange >= 0 ? '+' : '';
  const cls   = pctChange >= 0 ? 'delta-positive' : 'delta-negative';

  return (
    <span>
      <span className={`${cls} td-mono`}>
        {sign}{pctChange.toFixed(2)}%
      </span>
      {inflationAlertOn && isAlert && (
        <span className="delta-alert-chip" title="Inflation rose >5% from prior reading">
          ⚡ ALERT
        </span>
      )}
    </span>
  );
}

/* ── Main Row ─────────────────────────────────────────────────── */

function DataRow({ entry, index, inflationAlertOn }) {
  const rowClass = [
    inflationAlertOn && entry.isAlert ? 'row-alert' : '',
    entry.isNew ? 'row-new' : '',
  ].filter(Boolean).join(' ');

  return (
    <tr className={rowClass} data-id={entry.id}>
      <td className="td-mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
        {String(index + 1).padStart(3, '0')}
      </td>
      <td><SourceBadge source={entry.source} /></td>
      <td><CategoryBadge category={entry.category} /></td>
      <td>
        <span className="td-mono" style={{ fontWeight: 600 }}>
          {entry.displayValue}
        </span>
      </td>
      <td>
        <span className="td-mono" style={{ color: 'var(--text-secondary)' }}>
          {entry.numericValue >= 1e9
            ? `${(entry.numericValue / 1e9).toFixed(3)}B`
            : entry.numericValue >= 1e6
            ? `${(entry.numericValue / 1e6).toFixed(3)}M`
            : entry.numericValue.toLocaleString('en-US', { maximumFractionDigits: 4 })}
        </span>
      </td>
      <td>
        <span className="td-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {entry.dateDisplay}
        </span>
      </td>
      <td>
        <DeltaCell
          pctChange={entry.pctChange}
          isAlert={entry.isAlert}
          inflationAlertOn={inflationAlertOn}
        />
      </td>
      <td>
        <SignalBadge signal={entry.signal} />
      </td>
    </tr>
  );
}

// Only re-render if these props change
export default memo(DataRow, (prev, next) => {
  return (
    prev.entry.id          === next.entry.id &&
    prev.entry.numericValue === next.entry.numericValue &&
    prev.entry.isAlert      === next.entry.isAlert &&
    prev.entry.signal       === next.entry.signal &&
    prev.inflationAlertOn   === next.inflationAlertOn &&
    prev.index              === next.index
  );
});
