'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MatchSummaryDto, PublicChampionStat } from '@/lib/types';
import { championIconUrl } from '@/lib/utils';

const FILTERS = ['All', 'Solo/Duo', 'Flex'] as const;
type Filter = typeof FILTERS[number];

function applyQueueFilter(matches: MatchSummaryDto[], filter: Filter) {
  switch (filter) {
    case 'Solo/Duo':
      return matches.filter(match => match.queueLabel.toLowerCase().includes('solo'));
    case 'Flex':
      return matches.filter(match => match.queueLabel.toLowerCase().includes('flex'));
    default:
      return matches;
  }
}

function aggregateChampionStats(matches: MatchSummaryDto[]): PublicChampionStat[] {
  const buckets = new Map<
    string,
    { championName: string; games: number; wins: number; losses: number; kills: number; deaths: number; assists: number; carryTotal: number; carryCount: number }
  >();

  for (const match of matches) {
    const bucket = buckets.get(match.championName) ?? {
      championName: match.championName,
      games: 0,
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      carryTotal: 0,
      carryCount: 0,
    };

    bucket.games += 1;
    bucket.wins += match.result ? 1 : 0;
    bucket.losses += match.result ? 0 : 1;
    bucket.kills += match.kills;
    bucket.deaths += match.deaths;
    bucket.assists += match.assists;

    if (match.carryScore != null) {
      bucket.carryTotal += match.carryScore;
      bucket.carryCount += 1;
    }

    buckets.set(match.championName, bucket);
  }

  return [...buckets.values()]
    .map(bucket => ({
      championName: bucket.championName,
      games: bucket.games,
      wins: bucket.wins,
      losses: bucket.losses,
      winRate: bucket.games === 0 ? 0 : Math.round((bucket.wins / bucket.games) * 100),
      avgKda: (bucket.kills + bucket.assists) / Math.max(bucket.deaths, 1),
      avgCarry: bucket.carryCount === 0 ? null : Math.round(bucket.carryTotal / bucket.carryCount),
    }))
    .sort((left, right) => {
      if (right.games !== left.games) return right.games - left.games;
      if (right.winRate !== left.winRate) return right.winRate - left.winRate;
      return (right.avgCarry ?? -1) - (left.avgCarry ?? -1);
    });
}

function encodeChampionName(name: string) {
  return name.replace(/ /g, '').replace(/'/g, '').replace(/\./g, '');
}

export function SummonerChampionSection({
  seasonStats,
  matches,
}: {
  seasonStats: PublicChampionStat[];
  matches: MatchSummaryDto[];
}) {
  const [filter, setFilter] = useState<Filter>('All');

  const stats = useMemo(() => {
    if (filter === 'All') return seasonStats;
    return aggregateChampionStats(applyQueueFilter(matches, filter));
  }, [filter, matches, seasonStats]);

  const totalGames = stats.reduce((sum, champion) => sum + champion.games, 0);
  const shouldScroll = stats.length > 6;

  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderRadius: 22, overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 2 }}>CHAMPIONS</p>
            <h2 className="section-heading">Most Played Champions</h2>
          </div>
          <span style={{ background: 'rgba(95,168,255,0.15)', border: '1px solid rgba(95,168,255,0.3)', borderRadius: 999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, color: '#5FA8FF', whiteSpace: 'nowrap' }}>
            {totalGames} games
          </span>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 12, padding: 3, display: 'flex', gap: 2, marginBottom: 10 }}>
          {FILTERS.map(entry => (
            <button
              key={entry}
              type="button"
              onClick={() => setFilter(entry)}
              style={{
                flex: 1,
                padding: '7px 9px',
                borderRadius: 8,
                fontSize: '0.625rem',
                fontWeight: 700,
                border: `1px solid ${entry === filter ? 'rgba(200,170,110,0.35)' : 'var(--border-2)'}`,
                background: entry === filter ? 'rgba(200,170,110,0.14)' : 'transparent',
                color: entry === filter ? '#C8AA6E' : '#B4BECC',
                cursor: 'pointer',
                transition: 'all 100ms',
                textAlign: 'center',
              }}
            >
              {entry}
            </button>
          ))}
        </div>

        {stats.length === 0 ? (
          <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ color: '#B4BECC', fontSize: '0.75rem' }}>
              {filter === 'All' ? 'No champion stats available yet.' : `No ${filter} champion sample available yet.`}
            </p>
          </div>
        ) : (
          <>
            {shouldScroll && (
              <p style={{ color: '#738096', fontSize: '0.7rem', fontWeight: 600, marginBottom: 6 }}>
                Scroll to view all {stats.length} champions.
              </p>
            )}
            <div className="summoner-champion-grid" style={{ padding: '8px 6px 8px 20px', borderBottom: '1px solid var(--border-2)' }}>
              {['Champion', 'Games', 'WR', 'KDA', 'Carry', 'W-L'].map(header => (
                <p
                  key={header}
                  className={header === 'Carry' || header === 'W-L' ? 'summoner-champion-hide-mobile' : undefined}
                  style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#738096', textAlign: header === 'Champion' ? 'left' : 'right' }}
                >
                  {header}
                </p>
              ))}
            </div>
            <div style={{ maxHeight: shouldScroll ? 404 : 'none', overflowY: shouldScroll ? 'auto' : 'visible', paddingRight: shouldScroll ? 4 : 0 }}>
              {stats.map((cs, index) => (
                <Link
                  key={`${filter}-${cs.championName}`}
                  href={`/champions/${encodeChampionName(cs.championName)}`}
                  className="champ-row summoner-champion-grid"
                  style={{
                    gap: 8,
                    padding: '10px 20px',
                    alignItems: 'center',
                    borderBottom: index < stats.length - 1 ? '1px solid rgba(41,53,72,0.5)' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-2)', flexShrink: 0 }}>
                      <Image src={championIconUrl(cs.championName)} alt={cs.championName} width={34} height={34} unoptimized />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F3F4F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cs.championName}
                    </span>
                  </div>
                  <p style={{ textAlign: 'right', color: '#B4BECC', fontSize: '0.85rem' }}>{cs.games}</p>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: cs.winRate >= 50 ? '#4FBF8F' : '#E06767' }}>{cs.winRate}%</p>
                    <p style={{ fontSize: '0.68rem', color: '#738096' }}>WR</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', color: '#B4BECC' }}>{cs.avgKda.toFixed(1)}</p>
                    <p style={{ fontSize: '0.68rem', color: '#738096' }}>KDA</p>
                  </div>
                  <div className="summoner-champion-hide-mobile" style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', color: '#5FA8FF' }}>{cs.avgCarry ?? '-'}</p>
                    <p style={{ fontSize: '0.68rem', color: '#738096' }}>Carry</p>
                  </div>
                  <p className="summoner-champion-hide-mobile" style={{ textAlign: 'right', fontSize: '0.82rem', color: '#738096' }}>
                    {cs.wins}-{cs.losses}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
