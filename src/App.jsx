/**
 * App.jsx — FedWatch Dashboard root
 * Tailwind + shadcn/ui version
 */

import { useState, useMemo, useCallback } from 'react';

import { useFeedData }  from '@/hooks/useFeedData';
import StatusBar        from '@/components/StatusBar';
import SummaryPanel     from '@/components/SummaryPanel';
import ControlBar       from '@/components/ControlBar';
import NewsBanner       from '@/components/NewsBanner';
import DataTable        from '@/components/DataTable';
import { BarChart2 }    from 'lucide-react';

export default function App() {
  // ── Live data ─────────────────────────────────────────────
  const { data, lastUpdated, tickCount } = useFeedData();

  // ── Filter state ───────────────────────────────────────────
  const [searchQuery,      setSearchQuery]      = useState('');
  const [categoryFilter,   setCategoryFilter]   = useState('All');
  const [inflationAlertOn, setInflationAlertOn] = useState(false);

  const handleSearchChange   = useCallback((v) => setSearchQuery(v), []);
  const handleCategoryChange = useCallback((v) => setCategoryFilter(v), []);
  const handleAlertToggle    = useCallback(() => setInflationAlertOn((p) => !p), []);

  // ── Filtered data ──────────────────────────────────────────
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((entry) => {
      const sourceMatch = q === '' || entry.source.toLowerCase().includes(q);
      const catMatch    = categoryFilter === 'All' || entry.category === categoryFilter;
      return sourceMatch && catMatch;
    });
  }, [data, searchQuery, categoryFilter]);

  const alertCount = useMemo(() => data.filter((e) => e.isAlert).length, [data]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* ════════════════════════════════════════════
          STICKY: Brand header + Status bar only
          ════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 flex flex-col shadow-lg">

        {/* Brand Header — 64px */}
        <header className="bg-slate-900 border-b border-slate-700 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-md shadow-blue-900/30">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                FedWatch Dashboard
              </h1>
              <p className="text-[11px] text-blue-400 uppercase tracking-widest font-medium leading-none">
                Federal Reserve Intelligence
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
        </header>

        {/* Status Bar — slim dark strip */}
        <StatusBar
          lastUpdated={lastUpdated}
          tickCount={tickCount}
          totalEntries={data.length}
          alertCount={alertCount}
        />

      </div>
      {/* ════════════════════════════════════════════ */}

      {/* ── Scrollable page content ────────────────── */}
      <main className="flex-1 px-6 py-6 max-w-screen-2xl mx-auto w-full">

        {/* KPI Summary Cards */}
        <SummaryPanel data={data} />

        {/* Good / Bad News Banner */}
        <NewsBanner data={filteredData} />

        {/* Filter Controls */}
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

        {/* Data Feed Table */}
        <DataTable
          filteredData={filteredData}
          inflationAlertOn={inflationAlertOn}
        />

      </main>
    </div>
  );
}
