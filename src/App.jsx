/**
 * App.jsx — Fed-Watch Dashboard
 * ─────────────────────────────────────────────────────────────
 * Root component: wires together the live data hook,
 * filter state, and all sub-components.
 */

import { useState, useMemo, useCallback } from 'react';
import './App.css';

import { useFeedData }  from './hooks/useFeedData';
import StatusBar        from './components/StatusBar';
import SummaryPanel     from './components/SummaryPanel';
import ControlBar       from './components/ControlBar';
import NewsBanner       from './components/NewsBanner';
import DataTable        from './components/DataTable';

export default function App() {
  // ── Live data ──────────────────────────────────────────────
  const { data, lastUpdated, tickCount } = useFeedData();

  // ── Filter state ───────────────────────────────────────────
  const [searchQuery,       setSearchQuery]       = useState('');
  const [categoryFilter,    setCategoryFilter]    = useState('All');
  const [inflationAlertOn,  setInflationAlertOn]  = useState(false);

  // Stable callbacks (prevent ControlBar re-renders)
  const handleSearchChange   = useCallback((v) => setSearchQuery(v), []);
  const handleCategoryChange = useCallback((v) => setCategoryFilter(v), []);
  const handleAlertToggle    = useCallback(() => setInflationAlertOn((prev) => !prev), []);

  // ── Derived: filtered data ─────────────────────────────────
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return data.filter((entry) => {
      // Requirement B: case-insensitive partial match on source
      const sourceMatch = q === '' || entry.source.toLowerCase().includes(q);

      // Category filter
      const catMatch = categoryFilter === 'All' || entry.category === categoryFilter;

      return sourceMatch && catMatch;
    });
  }, [data, searchQuery, categoryFilter]);

  // ── Derived: alert count ───────────────────────────────────
  const alertCount = useMemo(
    () => data.filter((e) => e.isAlert).length,
    [data]
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* ── Sticky Header ─────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">📊</div>
          <div>
            <div className="header-title">FedWatch Dashboard</div>
            <div className="header-subtitle">Federal Reserve Economic Intelligence</div>
          </div>
        </div>

        <div className="header-right">
          <span style={{ fontSize: '12px', color: 'var(--blue-300)', fontFamily: 'JetBrains Mono, monospace' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* ── Status Bar ────────────────────────────────── */}
      <StatusBar
        lastUpdated={lastUpdated}
        tickCount={tickCount}
        totalEntries={data.length}
        alertCount={alertCount}
      />

      {/* ── Main Content ──────────────────────────────── */}
      <main className="main-content" id="main">

        {/* KPI Summary Cards */}
        <SummaryPanel data={data} />

        {/* Good / Bad Banner */}
        <NewsBanner data={filteredData} />

        {/* Filters */}
        <ControlBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          inflationAlertOn={inflationAlertOn}
          onInflationAlertToggle={handleAlertToggle}
          resultCount={filteredData.length}
          totalCount={data.length}
        />

        {/* Data Table */}
        <DataTable
          filteredData={filteredData}
          inflationAlertOn={inflationAlertOn}
        />
      </main>
    </div>
  );
}
