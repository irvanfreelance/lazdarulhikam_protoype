import React from 'react';

// Single-hue horizontal ranking bar — one series (a single metric ranked
// across categories), so identity comes from the label, not the color.
export const HBarList = ({ data, valueFormatter = (v) => v, color = 'var(--primary-color)', maxItems, emptyLabel = 'Belum ada data' }) => {
  const items = maxItems ? data.slice(0, maxItems) : data;
  const max = Math.max(1, ...items.map(d => d.value));
  if (items.length === 0) {
    return <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.85rem' }}>{emptyLabel}</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '150px', flexShrink: 0, fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={d.label}>{d.label}</div>
          <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: '100%', background: color, borderRadius: '5px', transition: 'width 0.3s' }} />
          </div>
          <div style={{ width: '100px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>{valueFormatter(d.value)}</div>
        </div>
      ))}
    </div>
  );
};

// Single-series vertical column/trend chart (e.g. nominal per month).
export const TrendBars = ({ data, valueFormatter = (v) => v, color = 'var(--primary-color)', height = 160, emptyLabel = 'Belum ada data' }) => {
  const max = Math.max(1, ...data.map(d => d.value));
  if (data.length === 0) {
    return <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.85rem' }}>{emptyLabel}</div>;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${height}px`, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{d.value > 0 ? valueFormatter(d.value) : ''}</div>
          <div
            title={`${d.label}: ${valueFormatter(d.value)}`}
            style={{
              width: '100%', maxWidth: '28px',
              height: `${(d.value / max) * (height - 40)}px`,
              minHeight: d.value > 0 ? '2px' : '0',
              background: color, borderRadius: '4px 4px 0 0'
            }}
          />
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// Two-series grouped column chart (e.g. Himpun vs Salur per month) — a
// legend is always shown since >= 2 series are on screen at once.
export const GroupedTrendBars = ({ data, seriesA, seriesB, valueFormatter = (v) => v, colorA = 'var(--primary-color)', colorB = '#eb6834', height = 200 }) => {
  const max = Math.max(1, ...data.flatMap(d => [d[seriesA.key], d[seriesB.key]]));
  return (
    <div>
      <div style={{ display: 'flex', gap: '18px', marginBottom: '12px', fontSize: '0.78rem', color: '#475569' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: colorA, display: 'inline-block' }} />{seriesA.label}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: colorB, display: 'inline-block' }} />{seriesB.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: `${height}px`, padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${height - 30}px` }}>
              <div title={`${seriesA.label}: ${valueFormatter(d[seriesA.key])}`} style={{ width: '14px', height: `${(d[seriesA.key] / max) * (height - 30)}px`, minHeight: d[seriesA.key] > 0 ? '2px' : '0', background: colorA, borderRadius: '3px 3px 0 0' }} />
              <div title={`${seriesB.label}: ${valueFormatter(d[seriesB.key])}`} style={{ width: '14px', height: `${(d[seriesB.key] / max) * (height - 30)}px`, minHeight: d[seriesB.key] > 0 ? '2px' : '0', background: colorB, borderRadius: '3px 3px 0 0' }} />
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Descending-width funnel — each stage narrower than the last, with %
// retained from the previous stage shown alongside the raw count.
export const FunnelChart = ({ stages, valueFormatter = (v) => v, color = 'var(--primary-color)' }) => {
  const max = Math.max(1, ...stages.map(s => s.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
      {stages.map((s, i) => {
        const widthPct = Math.max(6, (s.value / max) * 100);
        const pctOfPrev = i === 0 ? 100 : (stages[i - 1].value > 0 ? (s.value / stages[i - 1].value) * 100 : 0);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '170px', flexShrink: 0, fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>{s.label}</div>
            <div style={{ flex: 1 }}>
              <div style={{ width: `${widthPct}%`, minWidth: '40px', background: color, opacity: 1 - i * 0.12, borderRadius: '8px', padding: '10px 14px', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                {valueFormatter(s.value)}
              </div>
            </div>
            <div style={{ width: '90px', flexShrink: 0, textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
              {i === 0 ? '' : `${pctOfPrev.toFixed(0)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
};
