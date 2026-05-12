import type { CSSProperties } from 'react';
import { SurfaceCard } from './SurfaceCard';

type StateCardProps = {
  title: string;
  copy: string;
  tone?: 'default' | 'error' | 'success';
  style?: CSSProperties;
};

export function StateCard({ title, copy, tone = 'default', style }: StateCardProps) {
  const accent = tone === 'error' ? '#E06767' : tone === 'success' ? '#4FBF8F' : '#C8AA6E';

  return (
    <div style={{ maxWidth: 720, margin: '64px auto 0', padding: '0 16px' }}>
      <SurfaceCard
        style={{
          border: `1px solid ${accent}55`,
          textAlign: 'center',
          padding: 28,
          ...style,
        }}
      >
        <h1 style={{ color: '#F3F4F6', fontSize: '1.4rem', fontWeight: 900, marginBottom: 10 }}>{title}</h1>
        <p className="subtle-copy">{copy}</p>
      </SurfaceCard>
    </div>
  );
}
