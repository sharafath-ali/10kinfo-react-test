/**
 * inflationAlert.js
 * ─────────────────────────────────────────────────────────────
 * Computes % change between consecutive Inflation entries
 * and annotates each entry with pctChange and isAlert flag.
 */

/**
 * For each Inflation entry, find the prior Inflation entry
 * in the sorted list and compute the % change in numericValue.
 * Attaches { pctChange, isAlert } to every entry (non-Inflation = null).
 *
 * @param {Array} normalizedData - output from normalizeData(), sorted by date
 * @param {number} threshold - alert if pctChange exceeds this value (default 5)
 * @returns {Array} - same array with pctChange and isAlert populated
 */
export function computeInflationDeltas(normalizedData, threshold = 5) {
  let lastInflationValue = null;

  return normalizedData.map((entry) => {
    if (entry.category !== 'Inflation') {
      return { ...entry, pctChange: null, isAlert: false };
    }

    let pctChange = null;
    let isAlert = false;

    if (lastInflationValue !== null && lastInflationValue !== 0) {
      pctChange =
        ((entry.numericValue - lastInflationValue) / Math.abs(lastInflationValue)) * 100;
      isAlert = pctChange > threshold;
    }

    lastInflationValue = entry.numericValue;

    return { ...entry, pctChange, isAlert };
  });
}

/**
 * Determines the "Good / Bad / Neutral" signal for a data point.
 *
 * Rules (from a retail investor perspective):
 *  - Inflation ↑  → Bad   |  Inflation ↓  → Good
 *  - Employment ↑ → Good  |  Employment ↓ → Bad
 *  - GDP ↑        → Good  |  GDP ↓        → Bad
 *  - Rates ↑      → Bad   |  Rates ↓      → Good
 *
 * @param {object} entry - normalized entry with pctChange
 * @param {object|null} prevSameCategory - previous entry of same category
 * @returns {'good'|'bad'|'neutral'}
 */
export function getSignal(entry, prevSameCategory) {
  if (!prevSameCategory) return 'neutral';

  const delta = entry.numericValue - prevSameCategory.numericValue;
  if (delta === 0) return 'neutral';

  const up = delta > 0;

  switch (entry.category) {
    case 'Inflation': return up ? 'bad' : 'good';
    case 'Employment': return up ? 'good' : 'bad';
    case 'GDP': return up ? 'good' : 'bad';
    case 'Rates': return up ? 'bad' : 'good';
    default: return 'neutral';
  }
}

/**
 * Enriches normalized data with per-category signal values.
 *
 * @param {Array} data
 * @returns {Array}
 */
export function enrichWithSignals(data) {
  const lastByCategory = {};

  return data.map((entry) => {
    const prev = lastByCategory[entry.category] ?? null;
    const signal = getSignal(entry, prev);
    lastByCategory[entry.category] = entry;
    return { ...entry, signal };
  });
}
