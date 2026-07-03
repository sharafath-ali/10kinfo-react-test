/**
 * ControlBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Search (by source, case-insensitive partial match),
 * category filter dropdown, and inflation-alert toggle.
 */

import React, { memo } from 'react';

const CATEGORIES = ['All', 'Inflation', 'Employment', 'GDP', 'Rates'];

function ControlBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  inflationAlertOn,
  onInflationAlertToggle,
  resultCount,
  totalCount,
}) {
  return (
    <div className="control-bar" role="toolbar" aria-label="Feed controls">

      {/* ── Search by Source ─────────────────── */}
      <div className="control-section">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="source-search"
            type="text"
            className="search-input"
            placeholder="Search source… e.g. fed, bls, bea"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search by source (case-insensitive partial match)"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="control-divider" role="separator" />

      {/* ── Category Filter ──────────────────── */}
      <div className="control-section">
        <label htmlFor="category-filter" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          CATEGORY
        </label>
        <select
          id="category-filter"
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="control-divider" role="separator" />

      {/* ── Inflation Alert Toggle ───────────── */}
      <div className="control-section">
        <label
          htmlFor="inflation-toggle"
          className="toggle-wrapper"
          aria-label={`Highlight inflation over 5% — ${inflationAlertOn ? 'on' : 'off'}`}
        >
          <div
            id="inflation-toggle"
            role="switch"
            aria-checked={inflationAlertOn}
            className={`toggle-track ${inflationAlertOn ? 'active' : ''}`}
            onClick={onInflationAlertToggle}
            onKeyDown={(e) => e.key === 'Enter' && onInflationAlertToggle()}
            tabIndex={0}
          >
            <div className="toggle-thumb" />
          </div>
          <span className="toggle-label">Inflation Alert &gt;5%</span>
        </label>

        <div className={`alert-badge-toggle ${inflationAlertOn ? '' : 'off'}`} aria-hidden="true">
          {inflationAlertOn ? '🔥 ACTIVE' : '○ OFF'}
        </div>
      </div>

      {/* ── Result Count ─────────────────────── */}
      <div className="results-count" aria-live="polite">
        Showing <strong>{resultCount}</strong> of {totalCount} entries
      </div>
    </div>
  );
}

export default memo(ControlBar);
