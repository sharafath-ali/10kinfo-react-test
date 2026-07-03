/**
 * normalizeData.js
 * ─────────────────────────────────────────────────────────────
 * Cleans the "dirty" Federal Reserve JSON feed before it hits the UI.
 * Handles 7+ timestamp formats and mixed value representations.
 */

// ─── Timestamp Parser ───────────────────────────────────────────────────────

/**
 * Parses ANY of the messy timestamp formats found in the feed:
 *  - Unix integer (seconds):         1777624200
 *  - ISO 8601:                       "2026-05-01T08:30:00Z"
 *  - Slash-delimited:                "2026/05/01 09:15:00", "05/02/2026 10:00:00"
 *  - Space-delimited:                "2026-05-02 09:00:00"
 *  - Natural language:               "May 1 2026 10:00 AM"
 *  - RFC 2822 / HTTP-date:           "Sat, 03 May 2026 10:00:00 GMT"
 *  - Dash-delimited (US):            "05-06-2026 10:00:00"
 *  - Slash AM/PM:                    "2026/05/04 09:00 AM"
 *
 * @param {string|number} ts - raw timestamp value
 * @returns {Date} - normalized Date object
 */
export function parseTimestamp(ts) {
  if (ts === null || ts === undefined) return new Date(0);

  // Unix timestamp (number, or numeric string without separators)
  if (typeof ts === 'number') {
    // If less than ~2e10 it's seconds, else milliseconds
    return new Date(ts < 1e11 ? ts * 1000 : ts);
  }

  const s = String(ts).trim();

  // Numeric string → Unix seconds
  if (/^\d{9,10}$/.test(s)) {
    return new Date(parseInt(s, 10) * 1000);
  }

  // ISO 8601 / "YYYY-MM-DD HH:MM:SS" / "YYYY-MM-DDTHH:MM:SSZ"
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const normalized = s.replace(' ', 'T');
    const d = new Date(normalized);
    if (!isNaN(d)) return d;
  }

  // Slash formats: "YYYY/MM/DD" or "MM/DD/YYYY"
  if (/^\d{4}\/\d{2}\/\d{2}/.test(s)) {
    // YYYY/MM/DD HH:MM[:SS] [AM/PM]
    const normalized = s.replace(/\//g, '-').replace(' ', 'T');
    const d = new Date(normalized);
    if (!isNaN(d)) return d;
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    // MM/DD/YYYY HH:MM:SS
    const [datePart, ...rest] = s.split(' ');
    const [mm, dd, yyyy] = datePart.split('/');
    const rebuilt = `${yyyy}-${mm}-${dd}T${rest.join(' ')}`;
    const d = new Date(rebuilt);
    if (!isNaN(d)) return d;
  }

  // Dash US format: "MM-DD-YYYY HH:MM:SS"
  if (/^\d{2}-\d{2}-\d{4}/.test(s)) {
    const [datePart, ...rest] = s.split(' ');
    const [mm, dd, yyyy] = datePart.split('-');
    const rebuilt = `${yyyy}-${mm}-${dd}T${rest.join(' ')}`;
    const d = new Date(rebuilt);
    if (!isNaN(d)) return d;
  }

  // RFC 2822: "Sat, 03 May 2026 10:00:00 GMT"
  // Natural language: "May 1 2026 10:00 AM"
  // Both parse natively in modern engines
  const fallback = new Date(s);
  if (!isNaN(fallback)) return fallback;

  console.warn(`[normalizeData] Could not parse timestamp: "${ts}"`);
  return new Date(0);
}

// ─── Value Parser ───────────────────────────────────────────────────────────

/**
 * Converts messy value fields into a numeric float and a clean display string.
 *
 * Handles:
 *  "$1.2B"  → { numeric: 1_200_000_000, display: "$1.20B",  suffix: "B" }
 *  "950M"   → { numeric:   950_000_000, display: "$950.00M", suffix: "M" }
 *  "2.4%"   → { numeric:           2.4, display: "2.40%",    suffix: "%" }
 *  420000   → { numeric:        420000, display: "420,000",  suffix: ""  }
 *  "5.5"    → { numeric:           5.5, display: "5.50",     suffix: ""  }
 *
 * @param {string|number} val
 * @returns {{ numeric: number, display: string, suffix: string }}
 */
export function parseValue(val) {
  if (val === null || val === undefined) {
    return { numeric: 0, display: 'N/A', suffix: '' };
  }

  if (typeof val === 'number') {
    return {
      numeric: val,
      display: val.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      suffix: '',
    };
  }

  const s = String(val).trim();

  // Detect suffix
  const hasDollar = s.startsWith('$');
  const upperS = s.toUpperCase();
  const hasBillion = upperS.endsWith('B');
  const hasMillion = upperS.endsWith('M');
  const hasPercent = s.endsWith('%');

  // Strip all symbols
  let cleaned = s.replace(/[$,%]/g, '').replace(/[BbMm]$/g, '').trim();
  const rawNum = parseFloat(cleaned);

  if (isNaN(rawNum)) {
    return { numeric: 0, display: s, suffix: '' };
  }

  let numeric = rawNum;
  let display = s;
  let suffix = '';

  if (hasBillion) {
    numeric = rawNum * 1e9;
    display = `$${rawNum.toFixed(2)}B`;
    suffix = 'B';
  } else if (hasMillion) {
    numeric = rawNum * 1e6;
    display = `$${rawNum.toFixed(2)}M`;
    suffix = 'M';
  } else if (hasPercent) {
    numeric = rawNum;
    display = `${rawNum.toFixed(2)}%`;
    suffix = '%';
  } else {
    numeric = rawNum;
    display = hasDollar
      ? `$${rawNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : rawNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
    suffix = '';
  }

  return { numeric, display, suffix };
}

// ─── Entry Normalizer ────────────────────────────────────────────────────────

/**
 * Normalizes a single raw feed entry.
 *
 * @param {object} entry - raw entry from JSON
 * @returns {object} - clean, normalized entry
 */
export function normalizeEntry(entry) {
  const parsedValue = parseValue(entry.value);
  const normalizedDate = parseTimestamp(entry.timestamp);

  return {
    id: entry.id,
    source: String(entry.source).toUpperCase(),
    category: entry.category,
    rawValue: entry.value,
    numericValue: parsedValue.numeric,
    displayValue: parsedValue.display,
    valueSuffix: parsedValue.suffix,
    normalizedDate,
    dateISO: normalizedDate.toISOString(),
    dateDisplay: normalizedDate.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    pctChange: null,   // filled by computeInflationDeltas
    isAlert: false,    // filled by computeInflationDeltas
  };
}

/**
 * Normalizes the full raw array: cleans each entry, sorts by date ascending.
 *
 * @param {Array} rawArray
 * @returns {Array} sorted, normalized entries
 */
export function normalizeData(rawArray) {
  if (!Array.isArray(rawArray)) return [];
  return rawArray
    .map(normalizeEntry)
    .sort((a, b) => a.normalizedDate - b.normalizedDate);
}
