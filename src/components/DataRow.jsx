/**
 * DataRow.jsx — Memoized table row with shadcn Badges
 */
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ── Category badge config ─────────────────────────────────────────────────
const CAT_CONFIG = {
  Inflation:  { variant: 'destructive', emoji: '📈' },
  Employment: { variant: 'success',     emoji: '👷' },
  GDP:        { variant: 'info',        emoji: '🏛️' },
  Rates:      { variant: 'warning',     emoji: '🏦' },
};

const SIGNAL_CONFIG = {
  good:    { variant: 'success',     label: '▲ Good',    emoji: '✅' },
  bad:     { variant: 'destructive', label: '▼ Bad',     emoji: '🔴' },
  neutral: { variant: 'ghost',       label: '— Neutral', emoji: '⚪' },
};

// ── Sub-components ────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const { variant, emoji } = CAT_CONFIG[category] ?? { variant: 'ghost', emoji: '📊' };
  return <Badge variant={variant}>{emoji} {category}</Badge>;
}

function SourceBadge({ source }) {
  return <Badge variant="navy" className="font-mono text-[11px]">{source}</Badge>;
}

function SignalBadge({ signal }) {
  const { variant, label } = SIGNAL_CONFIG[signal] ?? SIGNAL_CONFIG.neutral;
  return <Badge variant={variant}>{label}</Badge>;
}

function DeltaCell({ pctChange, isAlert, inflationAlertOn }) {
  if (pctChange === null) {
    return <span className="text-muted-foreground font-mono text-xs">—</span>;
  }
  const sign    = pctChange >= 0 ? '+' : '';
  const colorCls = pctChange >= 0 ? 'text-red-500 font-semibold' : 'text-emerald-600 font-semibold';

  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('font-mono text-xs', colorCls)}>
        {sign}{pctChange.toFixed(3)}%
      </span>
      {inflationAlertOn && isAlert && (
        <span className="glow-alert inline-flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          ⚡ ALERT
        </span>
      )}
    </span>
  );
}

// ── Main Row ──────────────────────────────────────────────────────────────
function DataRow({ entry, index, inflationAlertOn }) {
  const isAlertRow = inflationAlertOn && entry.isAlert;

  return (
    <TableRow
      className={cn(
        entry.isNew ? 'row-new' : '',
        isAlertRow ? 'row-alert' : '',
      )}
      data-id={entry.id}
    >
      {/* Index */}
      <TableCell className="text-muted-foreground font-mono text-[11px] w-10">
        {String(index + 1).padStart(3, '0')}
      </TableCell>

      {/* Source */}
      <TableCell><SourceBadge source={entry.source} /></TableCell>

      {/* Category */}
      <TableCell><CategoryBadge category={entry.category} /></TableCell>

      {/* Display Value */}
      <TableCell>
        <span className="font-mono font-semibold text-slate-800 text-sm">
          {entry.displayValue}
        </span>
      </TableCell>

      {/* Numeric */}
      <TableCell>
        <span className="font-mono text-xs text-slate-500">
          {entry.numericValue >= 1e9
            ? `${(entry.numericValue / 1e9).toFixed(4)}B`
            : entry.numericValue >= 1e6
            ? `${(entry.numericValue / 1e6).toFixed(4)}M`
            : entry.numericValue.toLocaleString('en-US', { maximumFractionDigits: 4 })}
        </span>
      </TableCell>

      {/* Date */}
      <TableCell>
        <span className="font-mono text-xs text-slate-500">{entry.dateDisplay}</span>
      </TableCell>

      {/* Delta */}
      <TableCell>
        <DeltaCell
          pctChange={entry.pctChange}
          isAlert={entry.isAlert}
          inflationAlertOn={inflationAlertOn}
        />
      </TableCell>

      {/* Signal */}
      <TableCell><SignalBadge signal={entry.signal} /></TableCell>
    </TableRow>
  );
}

// Custom equality — only re-render if this row's data actually changed
export default memo(DataRow, (prev, next) =>
  prev.entry.id           === next.entry.id &&
  prev.entry.numericValue === next.entry.numericValue &&
  prev.entry.isAlert      === next.entry.isAlert &&
  prev.entry.signal       === next.entry.signal &&
  prev.inflationAlertOn   === next.inflationAlertOn &&
  prev.index              === next.index
);
