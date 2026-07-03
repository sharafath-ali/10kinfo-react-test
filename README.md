# Fed-Watch Dashboard

A high-end, responsive financial web application built with React and Vite. It consumes economic data from the Federal Reserve mock feed, normalizes inconsistent timestamps and values, computes inflation deltas, and presents real-time signals for retail investors with a professional blue & white terminal-style interface.

## Features

- **Data Normalization**: Cleans and normalizes messy JSON inputs, resolving:
  - 7+ different timestamp formats (Unix timestamps, ISO strings, natural dates, slash/dash formats)
  - String values like `"$1.2B"`, `"950M"`, `"2.4%"` into clean numeric values and standardized displays
- **Calculations & Alerts**:
  - Highlights inflation entries that increase by more than 5% compared to the previous inflation data point.
  - Generates retail-investor-oriented Good/Bad/Neutral market signals based on data trends.
- **Search & Filtering**:
  - Case-insensitive search by source (e.g., FED, BLS, BEA).
  - Category dropdown filtering.
- **Performance & Anti-Flicker**:
  - Live mock updates every 2 seconds.
  - Zero unnecessary re-renders or layout flickering using React memoization (`React.memo`) and stable keys.
- **Professional UI**:
  - Styled with custom raw CSS using a professional blue & white financial dashboard palette.
  - Fully responsive layout with summary cards, live feed indicator, and summary banner.

## Data Flow Architecture

```text
┌─────────────────────────────────────────────────────────┐
│              Everything is 100% local                   │
│                                                         │
│  Sample-data.json  ──import──►  normalizeData()         │
│       (50 entries, read at build time)                  │
│                          │                              │
│                          ▼                              │
│              SEED_DATA (in-memory array)                │
│                          │                              │
│                          ▼                              │
│         setInterval(tick, 2000ms)                       │
│           │                                             │
│           └─► generateLiveEntry()  ← pure math/random   │
│                   no fetch()                            │
│                   no axios                              │
│                   no WebSocket / webhook                │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack
- React (v18+)
- Vite (v8+)
- Tailwind CSS v3
- Radix UI Primitives (Slot, Switch, Select, Label)
- Lucide React (Icons)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Design Decisions

### Chronological Timestamp Sorting
The initial seed dataset (`Sample-data.json`) contains dates in multiple format variants and is out of order. To correctly calculate percentage changes ($\Delta$ Change) and market signals for consecutive items in the feed (especially for the inflation alert engine), the utility function `normalizeData` sorts the feed entries chronologically by timestamp before feeding them to the components. This guarantees that all calculated changes and signal indicators remain chronologically consistent.

