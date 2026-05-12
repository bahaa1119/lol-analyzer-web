import { api } from '@/lib/api';
import { championSplashUrl, formatLeagueRank } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { PublicAccountResponse, PublicRankCard, RankReadinessResponse } from '@/lib/types';
import { MatchHistory } from '@/components/MatchHistory';
import { SummonerChampionSection } from '@/components/SummonerChampionSection';
import { BehaviorBadges } from '@/components/BehaviorBadges';
import type { BehaviorBadge } from '@/components/BehaviorBadges';

interface Props {
  searchParams: Promise<{ name?: string; tag?: string; region?: string; count?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { name, tag } = await searchParams;
  if (name) return { title: `${name}${tag ? '#' + tag : ''} - Summoner Stats | LoL Analyzer` };
  return { title: 'Summoner Search | LoL Analyzer' };
}

export default async function SummonerPage({ searchParams }: Props) {
  const { name, tag, region = 'EUW1', count: countParam } = await searchParams;
  const count = Math.min(Math.max(parseInt(countParam ?? '10', 10) || 10, 10), 100);

  let data: PublicAccountResponse | null = null;
  let readiness: RankReadinessResponse | null = null;
  let error = '';

  if (name && tag) {
    try {
      data = await api.searchAccount(name, tag, region, count);
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Summoner not found.';
    }
  }

  if (!name) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#738096' }}>
        <Link href="/" style={{ color: '#C8AA6E', textDecoration: 'none', fontWeight: 600 }}>
          Back to Home Search
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-stack">
        <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block', marginBottom: 20 }}>
          Back
        </Link>
        <div style={{ background: 'var(--surface-1)', border: '1px solid rgba(224,103,103,0.35)', borderRadius: 22, padding: 32, textAlign: 'center', color: '#E06767' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  try {
    readiness = await api.getRankReadiness(data.account.puuid, data.account.platformCode, 20);
  } catch {
    readiness = null;
  }

  const { account, rankedSolo, rankedFlex, championStats, matches, hasMoreMatches } = data;
  const firstMatch = matches[0] ?? null;
  const totalMatches = matches.length;
  const recentWins = matches.filter(match => match.result).length;
  const recentLosses = totalMatches - recentWins;
  const recentWinRate = totalMatches > 0 ? Math.round((recentWins / totalMatches) * 100) : 0;
  const mainChampion = championStats[0] ?? null;
  const heroChampion = mainChampion?.championName ?? firstMatch?.championName ?? null;

  // Derive behavior badges — one-word labels, tooltip can be a sentence or two
  const behaviorBadges: BehaviorBadge[] = [];

  // MVP
  const mvpCount = matches.filter(m => m.isMvp).length;
  if (mvpCount > 0) {
    behaviorBadges.push({
      label: mvpCount > 1 ? `MVP ×${mvpCount}` : 'MVP',
      tooltip: `You earned MVP in ${mvpCount} of your last ${matches.length} tracked matches. That means you were the best performer on your team.`,
      color: '#C8AA6E',
    });
  }

  // Win streak — count consecutive wins from most recent
  let winStreak = 0;
  for (const m of matches) {
    if (m.result && !m.isRemake) winStreak++;
    else break;
  }
  if (winStreak >= 3) {
    behaviorBadges.push({
      label: `${winStreak}W Streak`,
      tooltip: `You've won ${winStreak} games in a row. You're clearly in good form right now — keep it up!`,
      color: '#4FBF8F',
    });
  }

  // Carry — avg carry score over matches that have one
  const carryScores = matches.filter(m => m.carryScore != null).map(m => m.carryScore!);
  if (carryScores.length >= 3) {
    const avgCarry = Math.round(carryScores.reduce((a, b) => a + b, 0) / carryScores.length);
    if (avgCarry >= 65) {
      behaviorBadges.push({
        label: 'Carry',
        tooltip: `Your average carry score is ${avgCarry}/100 over ${carryScores.length} recent games. That puts you above most players in terms of impact.`,
        color: '#5FA8FF',
      });
    }
  }

  // Consistent — avg performance score over analyzed games
  const perfScores = matches.filter(m => m.score != null).map(m => m.score!);
  if (perfScores.length >= 5) {
    const avgScore = Math.round(perfScores.reduce((a, b) => a + b, 0) / perfScores.length);
    if (avgScore >= 68) {
      behaviorBadges.push({
        label: 'Consistent',
        tooltip: `Your average performance score is ${avgScore}/100 across ${perfScores.length} analyzed games. Consistency is a key trait of improving players.`,
        color: '#9B8BFF',
      });
    }
  }

  // Top rank readiness pillars (score >= 70), up to 2 more
  if (readiness?.pillars && behaviorBadges.length < 5) {
    const topPillars = [...readiness.pillars]
      .filter(p => p.score != null && p.score >= 70)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 2);
    for (const p of topPillars) {
      if (behaviorBadges.length >= 5) break;
      const firstSentence = (p.summary ?? '').split(/\.\s*/)[0].trim();
      behaviorBadges.push({
        label: p.label,
        tooltip: `${firstSentence || `Strong ${p.label.toLowerCase()} performance`}. Pillar score: ${Math.round(p.score!)}/${readiness.window} games analyzed.`,
        color: (p.score ?? 0) >= 85 ? '#4FBF8F' : '#5FA8FF',
      });
    }
  }

  return (
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        .summoner-overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(290px, 0.95fr);
          gap: 14px;
        }
        .summoner-header-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0;
        }
        .summoner-champion-grid {
          display: grid;
          grid-template-columns: 1fr 60px 60px 60px 60px 60px;
          gap: 8px;
        }
        @media (max-width: 1040px) {
          .summoner-overview-grid {
            grid-template-columns: 1fr 1fr;
          }
          .summoner-overview-grid > :last-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 780px) {
          .summoner-header-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .summoner-overview-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .summoner-champion-grid {
            grid-template-columns: 1fr 56px 56px 56px;
          }
          .summoner-champion-hide-mobile {
            display: none;
          }
        }
        @media (max-width: 720px) {
          .summoner-hero-row {
            padding: 0 18px !important;
          }
          .summoner-hero-name {
            font-size: 1.55rem !important;
          }
        }
      `}</style>

      <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem', display: 'inline-block', marginBottom: 4 }}>
        Back
      </Link>

      <div className="page-shell" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 184, borderBottom: '1px solid var(--border-2)' }}>
          {heroChampion && (
            <>
              <Image
                src={championSplashUrl(heroChampion)}
                alt=""
                fill
                unoptimized
                priority
                aria-hidden
                style={{ objectFit: 'cover', objectPosition: '68% 24%', opacity: 0.28, filter: 'blur(8px) scale(1.05)' }}
              />
              <Image
                src={championSplashUrl(heroChampion)}
                alt={heroChampion}
                fill
                unoptimized
                priority
                style={{ objectFit: 'cover', objectPosition: '68% 18%' }}
              />
            </>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #06090F 28%, rgba(6,9,15,0.8) 54%, rgba(6,9,15,0.96) 100%)' }} />
          <div className="summoner-hero-row" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
            {account.profileIconId && (
              <div style={{ width: 72, height: 72, borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(95,168,255,0.45)', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.32)' }}>
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/profileicon/${account.profileIconId}.png`}
                  alt="Profile icon"
                  width={72}
                  height={72}
                  unoptimized
                />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p className="section-eyebrow" style={{ marginBottom: 6 }}>SUMMONER PROFILE</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="summoner-hero-name" style={{ color: '#F3F4F6', fontSize: '1.95rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {account.gameName}
                </h1>
                <span style={{ color: '#738096', fontWeight: 500, fontSize: '1.05rem' }}>#{account.tagLine}</span>
                {account.summonerLevel && (
                  <span style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 8, padding: '3px 9px', fontSize: '0.75rem', color: '#B4BECC', fontWeight: 700 }}>
                    Level {account.summonerLevel}
                  </span>
                )}
              </div>
              <p className="subtle-copy" style={{ marginTop: 8, maxWidth: 520 }}>
                Review recent games, open match details, and track current form.
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ background: 'rgba(95,168,255,0.15)', border: '1px solid rgba(95,168,255,0.3)', borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: '#5FA8FF', fontWeight: 700 }}>
                  {account.regionLabel}
                </span>
                <Link
                  href={`/live-game?puuid=${account.puuid}&platform=${account.platformCode}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(224,103,103,0.08)', border: '1px solid rgba(224,103,103,0.4)', borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: '#E06767', fontWeight: 700, textDecoration: 'none' }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E06767', display: 'inline-block' }} />
                  Live Game
                </Link>
              </div>
              <BehaviorBadges badges={behaviorBadges} />
            </div>
          </div>
        </div>

        <div className="summoner-header-stats" style={{ background: 'var(--surface-2)' }}>
          <HeaderStat label="Recent Record" value={`${recentWins}W ${recentLosses}L`} color="#F3F4F6" />
          <HeaderStat label="Recent Win Rate" value={`${recentWinRate}%`} color={recentWinRate >= 50 ? '#4FBF8F' : '#E06767'} />
          <HeaderStat label="Top Champion" value={mainChampion?.championName ?? '-'} color="#C8AA6E" />
          <HeaderStat label="Tracked Matches" value={String(totalMatches)} color="#5FA8FF" last />
        </div>
      </div>

      <div className="summoner-overview-grid">
        <RankCard rank={rankedSolo} label="Ranked Solo" accent="#5FA8FF" />
        <RankCard rank={rankedFlex} label="Ranked Flex" accent="#9B8BFF" />
        <RankReadinessTeaser puuid={account.puuid} platformCode={account.platformCode} readiness={readiness} />
      </div>

      {championStats.length > 0 && <SummonerChampionSection seasonStats={championStats} matches={matches} />}

      {matches.length > 0 && (
        <MatchHistory
          matches={matches}
          puuid={account.puuid}
          platformCode={account.platformCode}
          hasMoreMatches={hasMoreMatches}
          loadMoreHref={hasMoreMatches && name && tag && count < 100
            ? `/summoner?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}&region=${encodeURIComponent(region)}&count=${count + 10}`
            : undefined}
        />
      )}
    </div>
  );
}

const TIER_COLORS: Record<string, string> = {
  IRON: '#8a7a6e',
  BRONZE: '#a0715e',
  SILVER: '#9aa4af',
  GOLD: '#C8AA6E',
  PLATINUM: '#4fbf8f',
  EMERALD: '#56b87e',
  DIAMOND: '#5FA8FF',
  MASTER: '#C8AA6E',
  GRANDMASTER: '#e06767',
  CHALLENGER: '#5FA8FF',
};

function rankEmblemUrl(tier: string): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-${tier.toLowerCase()}.png`;
}

function HeaderStat({ label, value, color, last = false }: { label: string; value: string; color: string; last?: boolean }) {
  return (
    <div style={{ padding: '12px 14px', borderRight: last ? 'none' : '1px solid var(--border-2)', minWidth: 0 }}>
      <p style={{ color, fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</p>
      <p style={{ color: '#738096', fontSize: '0.68rem', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function RankCard({ rank, label, accent }: { rank: PublicRankCard; label: string; accent: string }) {
  const total = rank.wins + rank.losses;
  const tierKey = rank.tier.toUpperCase();
  const tierColor = TIER_COLORS[tierKey] ?? '#B4BECC';
  const wrColor = rank.winRate >= 55 ? '#4FBF8F' : rank.winRate < 48 ? '#E06767' : '#C8AA6E';
  const displayRank = !rank.isRanked ? 'Unranked' : formatLeagueRank(rank.tier, rank.rank);
  const emblemTier = rank.isRanked ? rank.tier : 'Unranked';

  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderColor: total > 0 ? `${accent}66` : 'var(--border-1)', borderRadius: 20, padding: 16, overflow: 'hidden' }}>
      <div style={{ display: 'inline-block', padding: '3px 8px', background: `${accent}20`, borderRadius: 5, marginBottom: 8 }}>
        <span style={{ color: accent, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      </div>

      <div style={{ height: 260, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rankEmblemUrl(emblemTier)}
          alt={emblemTier}
          style={{
            width: 900,
            height: 900,
            objectFit: 'contain',
            maxWidth: 'none',
            maxHeight: 'none',
            flexShrink: 0,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, gap: 10 }}>
        <span style={{ color: tierColor, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{displayRank}</span>
        <span style={{ color: '#738096', fontSize: '0.68rem' }}>{rank.label}</span>
        {total > 0 && <span style={{ color: '#738096', fontSize: '0.68rem' }}>{total} G</span>}
      </div>

      {total > 0 && (
        <>
          <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 8, display: 'flex', marginBottom: 10 }}>
            {[
              { label: 'LP', value: rank.isRanked ? String(rank.leaguePoints) : '-', color: accent },
              { label: 'WR', value: `${rank.winRate}%`, color: wrColor },
              { label: 'W-L', value: `${rank.wins}-${rank.losses}`, color: '#F3F4F6' },
            ].map((cell, index) => (
              <div key={cell.label} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', borderLeft: index > 0 ? '1px solid var(--border-2)' : 'none' }}>
                <p style={{ color: cell.color, fontSize: '0.9rem', fontWeight: 800 }}>{cell.value}</p>
                <p style={{ color: '#738096', fontSize: '0.6rem', marginTop: 2 }}>{cell.label}</p>
              </div>
            ))}
          </div>
          <div style={{ height: 5, borderRadius: 4, display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: rank.wins, background: '#5FA8FF' }} />
            <div style={{ flex: rank.losses, background: 'rgba(224,103,103,0.7)' }} />
          </div>
        </>
      )}
    </div>
  );
}

function RankReadinessTeaser({
  puuid,
  platformCode,
  readiness,
}: {
  puuid: string;
  platformCode: string;
  readiness: RankReadinessResponse | null;
}) {
  const status = readiness?.status ?? 'Rank Readiness';
  const summary = 'Open your full rank readiness report.';
  const statusColor =
    readiness?.status === 'Rank Ready'
      ? '#4FBF8F'
      : readiness?.status === 'On Track'
        ? '#C8AA6E'
        : readiness?.status === 'Needs Work'
          ? '#E06767'
          : '#738096';

  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderRadius: 22, padding: 20 }}>
      <p className="section-eyebrow" style={{ marginBottom: 4 }}>RANK READINESS</p>
      <div
        style={{
          marginTop: 10,
          background: 'var(--surface-3)',
          border: `1px solid ${statusColor}40`,
          borderRadius: 18,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <h2 style={{ color: '#F3F4F6', fontWeight: 800, fontSize: '1.08rem' }}>Open Rank Readiness</h2>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: 999,
              background: `${statusColor}1A`,
              border: `1px solid ${statusColor}4D`,
              color: statusColor,
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {status}
          </span>
        </div>

        <p style={{ color: '#B4BECC', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 14 }}>{summary}</p>

        <Link
          href={`/rank-readiness?puuid=${puuid}&platform=${platformCode}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: '#C8AA6E',
            color: '#09101a',
            borderRadius: 999,
            padding: '8px 18px',
            fontSize: '0.875rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Open Rank Readiness
        </Link>
      </div>
    </div>
  );
}
