/**
 * StatusBar.jsx — slim top strip with live indicator & feed stats
 */
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, RefreshCw, Database, AlertTriangle } from 'lucide-react';

function StatusBar({ lastUpdated, tickCount, totalEntries, alertCount }) {
  const timeStr = lastUpdated?.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }) ?? '--:--:--';

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-2 flex items-center gap-6 flex-wrap">

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs font-semibold text-emerald-400 tracking-wider">LIVE</span>
      </div>

      {/* Updated time */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs text-slate-500">Updated</span>
        <span className="text-xs font-mono text-blue-300">{timeStr}</span>
      </div>

      {/* Tick count */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="text-xs text-slate-500">Ticks</span>
        <Badge variant="navy" className="text-[10px] px-2 py-0 font-mono">{tickCount}</Badge>
      </div>

      {/* Entry count */}
      <div className="flex items-center gap-1.5 text-slate-400">
        <Database className="w-3.5 h-3.5" />
        <span className="text-xs text-slate-500">Entries</span>
        <span className="text-xs font-mono text-blue-300">{totalEntries}</span>
      </div>

      {/* Alert count */}
      {alertCount > 0 && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {alertCount} Inflation Alert{alertCount > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Source tag */}
      <div className="ml-auto flex items-center gap-1.5 text-slate-500">
        <Activity className="w-3.5 h-3.5" />
        <span className="text-xs">Federal Reserve Mock Feed</span>
      </div>
    </div>
  );
}

export default memo(StatusBar);
