'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { championIconUrl, ROLE_LABELS } from '@/lib/utils';
import type { MatchSummaryDto } from '@/lib/types';

const FILTERS = ['All', 'Solo/Duo', 'Flex'] as const;
type Filter = typeof FILTERS[number];

const ROLE_ICON: Record<string, string> = {
  TOP:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  JUNGLE:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  MIDDLE:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  MID:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  BOTTOM:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  ADC:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  SUPPORT: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
  UTILITY: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
};

function filterMatches(matches: MatchSummaryDto[], filter: Filter): MatchSummaryDto[] {
  if (filter === 'All') return matches;
  return matches.filter(m => {
    const q = (m.queueLabel ?? '').toLowerCase();
    if (filter === 'Solo/Duo') return q.includes('solo');
    if (filter === 'Flex') return q.includes('flex');
    return true;
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function BarChartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="14" width="4" height="8" rx="1"/>
      <rect x="10" y="8" width="4" height="14" rx="1"/>
      <rect x="18" y="3" width="4" height="19" rx="1"/>
    </svg>
  );
}

export function MatchHistory({ matches, puuid, platformCode, hasMoreMatches, availableMatchCount, loadMoreHref }: {
  matches: MatchSummaryDto[];
  puuid: string;
  platformCode: string;
  hasMoreMatches: boolean;
  availableMatchCount?: number;
  loadMoreHref?: string;
}) {
  const [filter, setFilter] = useState<Filter>('All');
  const visible = filterMatches(matches, filter);

  const countLabel = hasMoreMatches
    ? `${matches.length} loaded`
    : (availableMatchCount ?? 0) > 0
    ? `${matches.length}/${availableMatchCount} loaded`
    : `${visible.length} recent`;

  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderRadius: 22, overflow: 'hidden', padding: 0 }}>
      <style>{`
        .match-history-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .match-history-filter {
          background: var(--surface-2);
          border: 1px solid var(--border-2);
          border-radius: 12px;
          padding: 3px;
          display: flex;
          gap: 2px;
          margin-bottom: 10px;
        }
        .match-history-head {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (max-width: 820px) {
          .match-history-row {
            padding: 10px 10px 10px 18px !important;
          }
          .match-history-head {
            flex-wrap: wrap;
            align-items: flex-start;
          }
          .match-history-right {
            width: 100%;
            justify-content: space-between;
          }
        }
        @media (max-width: 620px) {
          .match-history-filter {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
      {/* Panel header */}
      <div className="match-history-top" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ flex: 1 }}>
          <p className="section-eyebrow" style={{ marginBottom: 2 }}>MATCHES</p>
          <h2 className="section-heading" style={{ fontSize: '1.05rem' }}>Match History</h2>
        </div>
        <span style={{ background: 'rgba(95,168,255,0.15)', border: '1px solid rgba(95,168,255,0.3)', borderRadius: 999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#5FA8FF', whiteSpace: 'nowrap' }}>
          {countLabel}
        </span>
      </div>

      <div style={{ padding: 14 }}>
        {/* Filter tabs — segmented pill row matching Flutter's _MatchHistoryFilterRow */}
        <div className="match-history-filter">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1, padding: '7px 9px', borderRadius: 8, fontSize: '0.625rem', fontWeight: 700,
                border: `1px solid ${f === filter ? 'rgba(200,170,110,0.35)' : 'var(--border-2)'}`,
                background: f === filter ? 'rgba(200,170,110,0.14)' : 'transparent',
                color: f === filter ? '#C8AA6E' : '#B4BECC',
                cursor: 'pointer', transition: 'all 100ms', textAlign: 'center' as const,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Rows or empty state */}
        {visible.length === 0 ? (
          <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ color: '#B4BECC', fontSize: '0.75rem' }}>No matches in this filter yet.</p>
          </div>
        ) : (
          <>
            {visible.length > 6 && (
              <p style={{ color: '#738096', fontSize: '0.7rem', fontWeight: 600, marginBottom: 6 }}>
                Scroll to view all {visible.length} matches.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: visible.length > 6 ? 640 : 'none', overflowY: visible.length > 6 ? 'auto' : 'visible', paddingRight: visible.length > 6 ? 4 : 0 }}>
              {visible.map(match => (
                <MatchRow key={match.matchId} match={match} puuid={puuid} platformCode={platformCode} />
              ))}
            </div>
          </>
        )}

        {hasMoreMatches && (
          loadMoreHref ? (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Link
                href={loadMoreHref}
                style={{
                  display: 'inline-block', padding: '7px 20px', borderRadius: 10,
                  border: '1px solid var(--border-2)', background: 'var(--surface-2)',
                  color: '#B4BECC', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                Show more
              </Link>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#738096', fontSize: '0.72rem', marginTop: 10 }}>
              Showing {matches.length} most recent matches.
            </p>
          )
        )}
      </div>
    </div>
  );
}

function MatchRow({ match, puuid, platformCode }: { match: MatchSummaryDto; puuid: string; platformCode: string }) {
  const durationMins = Math.floor(match.durationSeconds / 60);
  const isRemake = match.isRemake || durationMins <= 5;
  const win = match.result;
  const resultColor = isRemake ? '#738096' : win ? '#5FA8FF' : '#E06767';
  const bgTint = isRemake ? '#252B36' : win ? '#0E2D5C' : '#4A1520';
  const roleKey = match.role?.toUpperCase();
  const roleIcon = ROLE_ICON[roleKey];
  const roleLabel = ROLE_LABELS[roleKey] ?? match.role;
  const carryLabel = match.carryScore != null ? String(match.carryScore) : '-';
  const matchUrl = `/match/${match.matchId}?puuid=${puuid}&platform=${platformCode}`;
  const kda = `${match.kills}/${match.deaths}/${match.assists}`;

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden', position: 'relative', flexShrink: 0,
      background: `linear-gradient(to right, ${bgTint}, var(--surface-3) 60%)`,
      border: `1px solid ${resultColor}59`,
    }}>
      {/* Left accent stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 5,
        background: isRemake ? `${resultColor}99` : resultColor,
      }} />

      <div className="match-history-row" style={{ padding: '9px 10px 9px 20px' }}>
        <div className="match-history-head" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Champion icon */}
          <Link href={matchUrl} style={{ display: 'flex', flexShrink: 0, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', border: `1px solid ${resultColor}66` }}>
              <Image src={championIconUrl(match.championName)} alt={match.championName} width={38} height={38} unoptimized />
            </div>
          </Link>

          {/* Name + meta chips */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ color: '#F3F4F6', fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {match.championName}
              </span>
              {match.isMvp && <Badge label="MVP" color="#C8AA6E" />}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <MetaChip label={match.queueLabel} />
              <MetaChip label={roleLabel} iconSrc={roleIcon} iconAlt={match.role} />
              <MetaChip label={`${durationMins}m`} />
              <MetaChip label={timeAgo(match.matchDate)} />
            </div>
          </div>

          {/* Stat pills box */}
          <div className="match-history-right" style={{
            display: 'flex', gap: 6, alignItems: 'center',
            background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12,
            padding: '8px 10px', flexShrink: 0,
          }}>
            <StatPill label="KDA" value={kda} color="#F3F4F6" />
            <StatPill label="Carry" value={carryLabel} color="#5FA8FF" />
            {match.score != null && (
              <StatPill label="Score" value={String(match.score)} color="#C8AA6E" />
            )}
          </div>

          {/* Analyze button */}
          <Link
            href={matchUrl}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 10px', borderRadius: 8, flexShrink: 0,
              border: '1px solid rgba(200,170,110,0.7)', textDecoration: 'none',
              color: '#C8AA6E', fontSize: '0.6875rem', fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Analyze <BarChartIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetaChip({ label, iconSrc, iconAlt }: { label: string; iconSrc?: string; iconAlt?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 999,
      padding: '4px 7px', fontSize: '0.625rem', color: '#B4BECC', fontWeight: 600,
    }}>
      {iconSrc && <Image src={iconSrc} alt={iconAlt ?? ''} width={16} height={16} unoptimized style={{ opacity: 0.7 }} />}
      {label}
    </span>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 999,
      padding: '5px 7px', fontSize: '0.625rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span style={{ color: '#738096' }}>{label} </span>
      <span style={{ color }}>{value}</span>
    </span>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      background: color + '24', border: `1px solid ${color}59`,
      borderRadius: 999, padding: '3px 6px',
      fontSize: '0.5625rem', fontWeight: 800, color, letterSpacing: '0.03em',
    }}>
      {label}
    </span>
  );
}
