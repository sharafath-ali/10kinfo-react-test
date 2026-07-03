/**
 * useFeedData.js
 * ─────────────────────────────────────────────────────────────
 * Custom hook: manages the normalized data state and 2-second
 * live-update simulation. Uses stable references to prevent
 * unnecessary re-renders.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import rawData from '../data/Sample-data.json';
import { normalizeData } from '../utils/normalizeData';
import { computeInflationDeltas, enrichWithSignals } from '../utils/inflationAlert';

// ─── Seed data (normalize once at module load) ────────────────────────────────
const SEED_DATA = enrichWithSignals(computeInflationDeltas(normalizeData(rawData)));

// ─── Mock update generator ────────────────────────────────────────────────────

const SOURCES    = ['FED', 'BLS', 'BEA', 'TREASURY'];
const CATEGORIES = ['Inflation', 'Employment', 'GDP', 'Rates'];

let nextId = SEED_DATA.length + 1;

// Category-specific baselines when no seed data exists yet
const CATEGORY_DEFAULTS = {
  Inflation:  1_200_000_000,   // ~$1.2B
  Employment: 420_000,          // ~420,000 people
  GDP:        2.4,              // ~2.4%
  Rates:      5.25,             // ~5.25%
};

function generateLiveEntry(baseEntries) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const source   = SOURCES[Math.floor(Math.random() * SOURCES.length)];

  // Base off the last entry of same category for realism
  const siblings = baseEntries.filter((e) => e.category === category);
  const lastVal  = siblings.length
    ? siblings[siblings.length - 1].numericValue
    : CATEGORY_DEFAULTS[category] ?? 1_000_000_000;

  // Random drift ±8% for stability
  const drift  = 1 + (Math.random() * 0.16 - 0.08);
  const newVal = lastVal * drift;

  let displayValue, valueSuffix;

  if (category === 'Employment') {
    // Headcount — integer, no dollar sign
    const rounded = Math.round(newVal / 1000) * 1000;
    displayValue = rounded.toLocaleString('en-US');
    valueSuffix  = '';
  } else if (category === 'GDP' || category === 'Rates') {
    displayValue = `${newVal.toFixed(2)}%`;
    valueSuffix  = '%';
  } else if (newVal >= 1e9) {
    displayValue = `$${(newVal / 1e9).toFixed(2)}B`;
    valueSuffix  = 'B';
  } else {
    displayValue = `$${(newVal / 1e6).toFixed(2)}M`;
    valueSuffix  = 'M';
  }

  const now = new Date();
  return {
    id: nextId++,
    source,
    category,
    rawValue: displayValue,
    numericValue: newVal,
    displayValue,
    valueSuffix,
    normalizedDate: now,
    dateISO: now.toISOString(),
    dateDisplay: now.toLocaleString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    pctChange: null,
    isAlert: false,
    signal: 'neutral',
    isNew: true,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFeedData()
 *
 * Returns:
 *  - data:        full enriched array (sorted, normalized)
 *  - lastUpdated: Date of last tick
 *  - tickCount:   number of live updates received
 */
export function useFeedData() {
  const [data, setData]               = useState(SEED_DATA);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tickCount, setTickCount]     = useState(0);
  const dataRef = useRef(SEED_DATA);

  const tick = useCallback(() => {
    const newEntry = generateLiveEntry(dataRef.current);

    // Append at tail, keep last 80 entries to avoid memory bloat
    const updated = [...dataRef.current, newEntry].slice(-80);

    // Re-run delta computation only on Inflation entries
    const enriched = enrichWithSignals(computeInflationDeltas(updated));

    dataRef.current = enriched;

    setData(enriched);
    setLastUpdated(new Date());
    setTickCount((n) => n + 1);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(tick, 2000);
    return () => clearInterval(intervalId);
  }, [tick]);

  return { data, lastUpdated, tickCount };
}
