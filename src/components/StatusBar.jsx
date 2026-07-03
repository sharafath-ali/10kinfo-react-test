/**
 * StatusBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Sticky top status strip: live tick indicator, total entries,
 * alert count, last updated time.
 */

import React, { memo } from 'react';

function StatusBar({ lastUpdated, tickCount, totalEntries, alertCount }) {
  const timeStr = lastUpdated?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) ?? '--:--:--';

  return (
    <div className="status-bar" role="status" aria-live="polite">
      {/* Live indicator */}
      <div className="status-item">
        <span className="live-dot" aria-label="Live feed active" />
        <span className="status-value">LIVE FEED</span>
      </div>

      {/* Last updated */}
      <div className="status-item">
        <span className="status-label">UPDATED</span>
        <span className="status-value td-mono">{timeStr}</span>
      </div>

      {/* Tick count */}
      <div className="status-item">
        <span className="status-label">TICKS</span>
        <span className="tick-badge td-mono">{tickCount}</span>
      </div>

      {/* Total entries */}
      <div className="status-item">
        <span className="status-label">ENTRIES</span>
        <span className="status-value td-mono">{totalEntries}</span>
      </div>

      {/* Alert count */}
      {alertCount > 0 && (
        <div className="status-item">
          <span style={{ color: '#ef4444', fontWeight: 700 }}>
            ⚠ {alertCount} INFLATION ALERT{alertCount > 1 ? 'S' : ''}
          </span>
        </div>
      )}

      {/* Data source tag */}
      <div className="status-item" style={{ marginLeft: 'auto' }}>
        <span className="status-label">SOURCE</span>
        <span className="status-value">Federal Reserve Mock Feed</span>
      </div>
    </div>
  );
}

export default memo(StatusBar);
