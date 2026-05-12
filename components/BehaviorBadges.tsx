'use client';

import { useState } from 'react';

export interface BehaviorBadge {
  label: string;
  tooltip: string;
  color: string;
}

export function BehaviorBadges({ badges }: { badges: BehaviorBadge[] }) {
  if (!badges.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
      {badges.map(badge => (
        <BadgeChip key={badge.label} badge={badge} />
      ))}
    </div>
  );
}

function BadgeChip({ badge }: { badge: BehaviorBadge }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const { label, tooltip, color } = badge;

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    setRect((e.currentTarget as HTMLDivElement).getBoundingClientRect());
  }

  const tooltipLeft = rect ? rect.left + rect.width / 2 : 0;
  const tooltipBottom = rect ? window.innerHeight - rect.top + 10 : 0;

  return (
    <>
      <div
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setRect(null)}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 999,
            background: `${color}22`,
            border: `1px solid ${color}55`,
            color,
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'default',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </div>

      {rect && (
        <div
          style={{
            position: 'fixed',
            left: tooltipLeft,
            bottom: tooltipBottom,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'var(--surface-2)',
            border: `1px solid ${color}55`,
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            width: 220,
            whiteSpace: 'normal',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <span style={{ color, fontWeight: 700, display: 'block', marginBottom: 4, fontSize: '0.78rem' }}>
            {label}
          </span>
          {tooltip}
          {/* downward arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${color}55`,
            }}
          />
        </div>
      )}
    </>
  );
}
