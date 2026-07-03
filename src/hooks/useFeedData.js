/**
 * useFeedData.js — improved realistic data generation
 * Keeps 2-second live update tick, improves drift to be gradual & realistic.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import rawData from '@/data/Sample-data.json';
import { normalizeData } from '@/utils/normalizeData';
import { computeInflationDeltas, enrichWithSignals } from '@/utils/inflationAlert';

// ── Normalize seed data once ─────────────────────────────────────────────────
const SEED_DATA = enrichWithSignals(computeInflationDeltas(normalizeData(rawData)));

// ── Category-specific realistic ranges ──────────────────────────────────────

/**
 * Realistic per-tick drift configuration.
 * The economy moves slowly — each 2s tick simulates a small intraday move.
 *
 * maxDriftPct: max % change per tick (very small = realistic)
 * minVal / maxVal: hard bounds so values never go absurd
 * formatFn: how to display the value
 */
const CATEGORY_CONFIG = {
  Inflation: {
    // CPI moves ~0.1-0.4% per month; per tick we simulate tiny intraday moves
    maxDriftPct: 0.0008,        // 0.08% per tick max
    minVal: 800_000_000,        // $0.8B floor
    maxVal: 6_000_000_000,      // $6B ceiling
    format: (v) => {
      if (v >= 1e9) return { display: `$${(v / 1e9).toFixed(2)}B`, suffix: 'B' };
      return { display: `$${(v / 1e6).toFixed(0)}M`, suffix: 'M' };
    },
  },
  Employment: {
    // NFP typically ±50k–200k per month; micro moves per tick
    maxDriftPct: 0.003,         // 0.3% per tick
    minVal: 100_000,            // 100k floor
    maxVal: 700_000,            // 700k ceiling
    format: (v) => {
      const rounded = Math.round(v / 1000) * 1000;
      return { display: rounded.toLocaleString('en-US'), suffix: '' };
    },
  },
  GDP: {
    // GDP growth rate: realistic 1–5% annualized; tiny moves per tick
    maxDriftPct: 0.002,         // 0.2% per tick
    minVal: 0.5,                // 0.5% floor
    maxVal: 6.0,                // 6% ceiling
    format: (v) => ({ display: `${v.toFixed(2)}%`, suffix: '%' }),
  },
  Rates: {
    // Fed only moves in 0.25% increments; very slow drift simulation
    maxDriftPct: 0.001,         // 0.1% per tick
    minVal: 0.25,               // 0.25% floor
    maxVal: 9.0,                // 9% ceiling
    format: (v) => ({ display: `${v.toFixed(2)}%`, suffix: '%' }),
  },
};

const SOURCES    = ['FED', 'BLS', 'BEA', 'TREASURY'];
const CATEGORIES = ['Inflation', 'Employment', 'GDP', 'Rates'];

// Momentum state: slight trend continuation
const momentum = { Inflation: 0, Employment: 0, GDP: 0, Rates: 0 };

let nextId = SEED_DATA.length + 1;

function generateLiveEntry(baseEntries) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const source   = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  const config   = CATEGORY_CONFIG[category];

  // Base value: last known for this category
  const siblings = baseEntries.filter((e) => e.category === category);
  const lastVal  = siblings.length
    ? siblings[siblings.length - 1].numericValue
    : SEED_DATA.filter((e) => e.category === category).slice(-1)[0]?.numericValue ?? 1_000_000;

  // Momentum: 30% carry from previous tick direction, 70% new random
  const newRandom  = (Math.random() - 0.5) * 2;             // -1 to +1
  momentum[category] = 0.3 * momentum[category] + 0.7 * newRandom;

  // Apply drift
  const drift  = 1 + momentum[category] * config.maxDriftPct;
  let newVal   = lastVal * drift;

  // Clamp to realistic bounds
  newVal = Math.max(config.minVal, Math.min(config.maxVal, newVal));

  const { display, suffix } = config.format(newVal);
  const now = new Date();

  return {
    id: nextId++,
    source,
    category,
    rawValue: display,
    numericValue: newVal,
    displayValue: display,
    valueSuffix: suffix,
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

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useFeedData() {
  const [data, setData]               = useState(SEED_DATA);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tickCount, setTickCount]     = useState(0);
  const dataRef = useRef(SEED_DATA);

  const tick = useCallback(() => {
    const newEntry = generateLiveEntry(dataRef.current);
    const updated  = [...dataRef.current, newEntry].slice(-1000);
    const enriched = enrichWithSignals(computeInflationDeltas(updated));

    dataRef.current = enriched;
    setData(enriched);
    setLastUpdated(new Date());
    setTickCount((n) => n + 1);
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tick]);

  return { data, lastUpdated, tickCount };
}
