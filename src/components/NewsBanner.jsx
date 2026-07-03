/**
 * NewsBanner.jsx
 * ─────────────────────────────────────────────────────────────
 * Good / Bad / Neutral summary banner based on overall filtered data.
 * Counts signals and determines majority sentiment.
 */

import React, { memo, useMemo } from 'react';

function NewsBanner({ data }) {
  const { sentiment, good, bad } = useMemo(() => {
    let good = 0, bad = 0;
    data.forEach((e) => {
      if (e.signal === 'good') good++;
      else if (e.signal === 'bad') bad++;
    });
    const sentiment = good > bad ? 'good' : bad > good ? 'bad' : 'neutral';
    return { sentiment, good, bad };
  }, [data]);

  const config = {
    good:    { icon: '✅', label: 'GOOD NEWS', desc: `${good} positive signals outpacing ${bad} negative — conditions improving.` },
    bad:     { icon: '🔴', label: 'BAD NEWS',  desc: `${bad} negative signals outpacing ${good} positive — conditions deteriorating.` },
    neutral: { icon: '⚪', label: 'MIXED',      desc: `${good} positive and ${bad} negative signals — market is mixed.` },
  };

  const { icon, label, desc } = config[sentiment];

  return (
    <div className={`news-banner ${sentiment}`} role="alert" aria-live="polite">
      <span className="news-banner-icon">{icon}</span>
      <strong>{label}:</strong>
      <span>{desc}</span>
    </div>
  );
}

export default memo(NewsBanner);
