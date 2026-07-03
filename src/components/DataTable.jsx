/**
 * DataTable.jsx
 * ─────────────────────────────────────────────────────────────
 * Renders the filtered/sorted data in a sticky-header table.
 * Uses React.memo on DataRow for O(changed-rows) re-renders.
 */

import React, { memo } from 'react';
import DataRow from './DataRow';

const COLUMNS = [
  { key: '#',       label: '#' },
  { key: 'source',  label: 'Source' },
  { key: 'cat',     label: 'Category' },
  { key: 'value',   label: 'Raw Value' },
  { key: 'numeric', label: 'Numeric' },
  { key: 'date',    label: 'Timestamp' },
  { key: 'delta',   label: 'Δ Change' },
  { key: 'signal',  label: 'Signal' },
];

function DataTable({ filteredData, inflationAlertOn }) {
  return (
    <div className="data-table-container" role="region" aria-label="Economic data feed">
      {/* Table header row */}
      <div className="data-table-header">
        <span className="data-table-title">
          <span className="data-table-title-dot" aria-hidden="true" />
          Federal Reserve Economic Feed
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable table area */}
      <div className="table-scroll">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔎</span>
            <span className="empty-state-title">No entries match your filter</span>
            <span>Try adjusting the source search or category</span>
          </div>
        ) : (
          <table aria-label="Economic data table">
            <thead>
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th key={key} scope="col">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => (
                <DataRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  inflationAlertOn={inflationAlertOn}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default memo(DataTable);
