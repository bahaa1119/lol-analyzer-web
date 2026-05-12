import { StateCard } from '@/components/ui/StateCard';
import { StatusTag } from '@/components/ui/StatusTag';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { api } from '@/lib/api';
import Link from 'next/link';
import type { RankReadinessResponse } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/utils';

interface Props {
  searchParams: Promise<{ puuid?: string; platform?: string; window?: string }>;
}

function statusColor(status: string): string {
  switch (status) {
    case 'Rank Ready':
      return '#4FBF8F';
    case 'On Track':
      return '#C8AA6E';
    case 'Needs Work':
      return '#E06767';
    default:
      return '#738096';
  }
}

export default async function RankReadinessPage({ searchParams }: Props) {
  const { puuid, platform, window: win } = await searchParams;
  const windowNum = win === '50' ? 50 : 20;

  if (!puuid || !platform) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#738096' }}>
        <p>Missing summoner info.</p>
        <Link href="/" style={{ color: '#C8AA6E', textDecoration: 'none', fontWeight: 600 }}>← Home</Link>
      </div>
    );
  }

  let data: RankReadinessResponse | null = null;
  let error = '';

  try {
    data = await api.getRankReadiness(puuid, platform, windowNum);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'Failed to load rank readiness.';
  }

  if (error || !data) {
    return (
      <div>
        <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block', marginBottom: 20 }}>← Home</Link>
        <StateCard title="Rank readiness unavailable" copy={error || 'No data available.'} tone="error" style={{ marginTop: 0 }} />
      </div>
    );
  }

  const sColor = statusColor(data.status);
  const roleLabel = ROLE_LABELS[data.role?.toUpperCase()] ?? data.role;
  const comparisonRows = data.comparisonRows ?? [];

  return (
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        .readiness-window-switch {
          display: flex;
          gap: 6px;
        }
        .readiness-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .readiness-pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
        }
        .readiness-comparison-grid {
          display: grid;
          gap: 10px;
        }
        @media (max-width: 720px) {
          .readiness-window-switch {
            width: 100%;
          }
          .readiness-window-switch > * {
            flex: 1 1 0;
            text-align: center;
          }
          .readiness-summary-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem' }}>← Home</Link>
        <div className="readiness-window-switch" style={{ marginLeft: 'auto' }}>
          {([20, 50] as const).map(w => (
            <Link
              key={w}
              href={`/rank-readiness?puuid=${puuid}&platform=${platform}&window=${w}`}
              className={w === windowNum ? 'btn btn-active' : 'btn'}
              style={{ textDecoration: 'none', justifyContent: 'center' }}
            >
              Last {w}
            </Link>
          ))}
        </div>
      </div>

      <SurfaceCard style={{ border: `1px solid ${sColor}66`, padding: 20 }}>
        <p className="section-eyebrow" style={{ marginBottom: 4 }}>RANK READINESS</p>
        {data.performanceTier && (
          <>
            <p style={{ color: '#738096', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>You&apos;re playing like</p>
            <p style={{ color: sColor, fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: 16 }}>
              {data.performanceTier}
            </p>
          </>
        )}
        <p style={{ color: '#F3F4F6', fontSize: '1rem', lineHeight: 1.6 }}>{data.summary}</p>
        <p style={{ color: '#738096', fontSize: '0.75rem', marginTop: 10 }}>
          Last {data.window} games · {data.gamesAnalyzed} analyzed · {roleLabel}
        </p>
      </SurfaceCard>

      {(data.rankReadinessScore != null || data.recentRecord) && (
        <div className="readiness-summary-grid" style={{ gridTemplateColumns: data.rankReadinessScore != null ? undefined : 'minmax(0, 1fr)' }}>
          {data.rankReadinessScore != null && (
            <SurfaceCard style={{ padding: '16px 20px', textAlign: 'center' }}>
              <p style={{ color: sColor, fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{Math.round(data.rankReadinessScore)}</p>
              <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', marginTop: 4 }}>READINESS SCORE</p>
            </SurfaceCard>
          )}
          {data.recentRecord && (
            <SurfaceCard style={{ padding: '16px 20px' }}>
              <p className="section-eyebrow" style={{ marginBottom: 8 }}>RECENT RECORD</p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ color: '#5FA8FF', fontSize: '1.4rem', fontWeight: 900 }}>{data.recentRecord.wins}W</span>
                <span style={{ color: '#E06767', fontSize: '1.4rem', fontWeight: 900 }}>{data.recentRecord.losses}L</span>
                <span style={{ color: data.recentRecord.winRate >= 50 ? '#4FBF8F' : '#E06767', fontSize: '1rem', fontWeight: 700 }}>
                  {data.recentRecord.winRate}%
                </span>
              </div>
              {data.trend && (
                <p style={{ color: '#738096', fontSize: '0.75rem', marginTop: 8 }}>{data.trend.summary}</p>
              )}
            </SurfaceCard>
          )}
        </div>
      )}

      {(data.pillars?.length ?? 0) > 0 && (
        <SurfaceCard style={{ padding: '16px 20px' }}>
          <p className="section-eyebrow" style={{ marginBottom: 12 }}>PERFORMANCE PILLARS</p>
          <div className="readiness-pillars-grid">
            {data.pillars.map(p => {
              const pc = p.score == null ? '#738096' : p.score >= 75 ? '#4FBF8F' : p.score >= 50 ? '#C8AA6E' : '#E06767';
              return (
                <div key={p.key} style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B4BECC' }}>{p.label}</p>
                    {p.score != null && <p style={{ fontSize: '1rem', fontWeight: 900, color: pc }}>{Math.round(p.score)}</p>}
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-4)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(p.score ?? 0, 100)}%`, background: pc, borderRadius: 999 }} />
                  </div>
                  {p.summary && <p style={{ fontSize: '0.7rem', color: '#738096', marginTop: 6, lineHeight: 1.4 }}>{p.summary}</p>}
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      )}

      {comparisonRows.length > 0 && (
        <SurfaceCard style={{ padding: '16px 20px' }}>
          <p className="section-eyebrow" style={{ marginBottom: 8 }}>METRIC COMPARISON</p>
          <h2 className="section-heading" style={{ fontSize: '1rem', marginBottom: 12 }}>How your recent play compares</h2>
          <div className="readiness-comparison-grid">
            {comparisonRows.map(row => {
              const accent =
                row.status === 'above benchmark'
                  ? '#4FBF8F'
                  : row.status === 'below benchmark'
                    ? '#E06767'
                    : '#C8AA6E';
              const userValue = row.userValue == null ? '—' : formatMetricValue(row.userValue, row.unit);
              const benchmarkValue = row.benchmarkValue == null ? '—' : formatMetricValue(row.benchmarkValue, row.unit);
              const diffValue =
                row.difference == null
                  ? null
                  : `${row.difference > 0 ? '+' : ''}${formatMetricValue(row.difference, row.unit)}`;

              return (
                <div key={row.key} style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '0.9rem' }}>{row.label}</p>
                      <p style={{ color: '#738096', fontSize: '0.74rem', marginTop: 2 }}>
                        {userValue} vs {row.benchmarkLabel || 'benchmark'} {benchmarkValue}
                      </p>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: `${accent}1A`,
                        border: `1px solid ${accent}4D`,
                        color: accent,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ height: 5, borderRadius: 999, background: 'var(--surface-4)', overflow: 'hidden', flex: 1 }}>
                      <div style={{ height: '100%', width: `${comparisonStrength(row.status)}%`, background: accent, borderRadius: 999 }} />
                    </div>
                    {diffValue && (
                      <span style={{ color: accent, fontSize: '0.8rem', fontWeight: 800, minWidth: 'fit-content' }}>
                        {diffValue}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      )}

      <SurfaceCard style={{ padding: '16px 20px' }}>
        <p className="section-eyebrow" style={{ marginBottom: 8 }}>FINAL RESULT</p>
        <p style={{ color: '#F3F4F6', fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>
          {data.performanceTier ? `Overall ${data.performanceTier} average` : data.status}
        </p>
        <p style={{ color: '#B4BECC', fontSize: '0.86rem', lineHeight: 1.6 }}>{data.summary}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <StatusTag text={data.status} color={sColor} />
          <StatusTag text={`${data.confidence} confidence`} color="#738096" />
          <StatusTag text={roleLabel} color="#5FA8FF" />
        </div>
      </SurfaceCard>

      {data.disclaimer && (
        <p style={{ color: '#738096', fontSize: '0.72rem', lineHeight: 1.5, textAlign: 'center' }}>{data.disclaimer}</p>
      )}
    </div>
  );
}

function formatMetricValue(value: number, unit: string) {
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

function comparisonStrength(status: string) {
  switch (status) {
    case 'above benchmark':
      return 86;
    case 'below benchmark':
      return 38;
    default:
      return 62;
  }
}
