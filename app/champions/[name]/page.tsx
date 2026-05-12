import { api } from '@/lib/api';
import { championSplashUrl, championIconUrl, ROLE_LABELS, getLatestDDragonVersion, tierColor } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import ChampionDetailClient from '@/components/ChampionDetailClient';

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ role?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const champion = decodeURIComponent(name);
  return {
    title: `${champion} Build, Runes & Counters`,
    description: `Best ${champion} builds, runes, counters and tier placement from Challenger and Grandmaster match data. Updated every patch.`,
  };
}

export default async function ChampionDetailPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { role } = await searchParams;
  const championId = decodeURIComponent(name);

  const [champion, tierList] = await Promise.all([
    api.getChampionDetail(championId).catch(() => null),
    api.getTierList({ scope: 'patch' }).catch(() => null),
  ]);

  const roleOrder = ['TOP', 'JUNGLE', 'MID', 'MIDDLE', 'BOTTOM', 'ADC', 'SUPPORT', 'UTILITY'];
  const availableRoles = Array.from(new Set(
    (tierList?.entries ?? [])
      .filter(entry => entry.championId === championId)
      .map(entry => entry.role),
  )).sort((a, b) => {
    const ia = roleOrder.indexOf(a.toUpperCase());
    const ib = roleOrder.indexOf(b.toUpperCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const selectedRole = role && availableRoles.includes(role)
    ? role
    : (champion?.primaryRole && availableRoles.includes(champion.primaryRole)
        ? champion.primaryRole
        : availableRoles[0] ?? role ?? undefined);

  const filters = {
    queue: 'RANKED_SOLO',
    region: 'GLOBAL',
    patch: 'current',
    ...(selectedRole ? { role: selectedRole } : {}),
  };

  const [builds, counters, synergiesRes, ddVersion] = await Promise.all([
    api.getBuilds(championId, filters).catch(() => null),
    api.getCounters(championId, filters).catch(() => null),
    api.getSynergies(championId, filters).catch(() => null),
    getLatestDDragonVersion(),
  ]);

  const synergies = synergiesRes?.synergies ?? [];
  const tierEntry = tierList?.entries.find(
    entry => entry.championId === championId && (!selectedRole || entry.role === selectedRole),
  ) ?? null;
  const sameRoleEntries = tierList?.entries
    .filter(entry => !selectedRole || entry.role === selectedRole)
    .sort((a, b) => b.winRate - a.winRate) ?? [];
  const rank = tierEntry
    ? sameRoleEntries.findIndex(entry => entry.championId === championId) + 1
    : undefined;

  const displayName = champion?.name ?? championId;
  const title = champion?.title ?? '';
  const tags = champion?.tags ?? [];


  return (
    <div className="page-stack">
      <style>{`
        .champion-detail-hero {
          position: relative;
          min-height: 270px;
          overflow: hidden;
          border: 1px solid var(--border-2);
          border-radius: 24px;
          background: #0B111A;
        }
        .champion-splash-image {
          object-fit: cover;
          object-position: 58% 34%;
          transform: scale(1.03);
          opacity: 0.95;
        }
        .champion-detail-hero-inner {
          position: relative;
          z-index: 1;
          min-height: 270px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
          padding: 24px 32px;
        }
        .champion-detail-main {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(340px, 0.72fr);
          gap: 28px;
          align-items: start;
        }
        .champion-title-row {
          display: flex;
          gap: 22px;
          align-items: center;
          min-width: 0;
        }
        .champion-portrait {
          width: 92px;
          height: 92px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(200,170,110,0.65);
          box-shadow: 0 22px 52px rgba(0,0,0,0.48);
          flex-shrink: 0;
        }
        .champion-hero-stats {
          position: absolute;
          right: 32px;
          bottom: 34px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          background: rgba(13,21,32,0.74);
          border: 1px solid rgba(41,53,72,0.78);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(8px);
          width: min(100%, 442px);
        }
        .champion-role-filter {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .champion-role-filter .btn {
          min-width: 92px;
          justify-content: center;
          background: rgba(13,21,32,0.78);
        }
        .champion-content-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
          gap: 16px;
          align-items: start;
        }
        .champion-ad-space {
          min-height: 280px;
          border-radius: 18px;
          color: #738096;
          font-size: 0.78rem;
        }
        @media (max-width: 1050px) {
          .champion-content-layout {
            grid-template-columns: minmax(0, 1fr);
          }
          .champion-ad-space {
            min-height: 120px;
          }
        }
        @media (max-width: 920px) {
          .champion-detail-main {
            grid-template-columns: minmax(0, 1fr);
          }
          .champion-hero-stats {
            position: static;
            margin-top: 10px;
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .champion-detail-hero,
          .champion-detail-hero-inner {
            min-height: 240px;
          }
          .champion-splash-image {
            object-position: 60% 32%;
          }
          .champion-detail-hero-inner {
            padding: 18px;
          }
          .champion-title-row {
            align-items: flex-start;
            gap: 14px;
          }
          .champion-portrait {
            width: 78px;
            height: 78px;
            border-radius: 18px;
          }
          .champion-hero-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: 8px;
            width: 100%;
          }
          .champion-role-filter .btn {
            min-width: 0;
            flex: 1 1 calc(50% - 4px);
          }
        }
      `}</style>

      <section className="champion-detail-hero">
        <Image
          src={championSplashUrl(championId)}
          alt=""
          fill
          className="champion-splash-image"
          unoptimized
          priority
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090F]/95 via-[#06090F]/42 to-[#06090F]/86" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-transparent to-[#06090F]/40" />

        <div className="champion-detail-hero-inner">
          <div>
            <Link href="/champions" style={{ color: '#C8AA6E', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Champions
            </Link>
            <span style={{ color: '#738096', margin: '0 10px', fontSize: '0.72rem' }}>›</span>
            <span style={{ color: '#B4BECC', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {displayName}
            </span>
          </div>

          <div className="champion-detail-main">
            <div className="champion-title-row">
              <div className="champion-portrait">
                <Image
                  src={championIconUrl(championId)}
                  alt={displayName}
                  width={116}
                  height={116}
                  unoptimized
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ color: '#F3F4F6', fontSize: 'clamp(2.4rem, 6vw, 4.6rem)', fontWeight: 950, lineHeight: 0.95, letterSpacing: '-0.04em', textShadow: '0 2px 14px rgba(0,0,0,0.58)' }}>
                  {displayName}
                </h1>
                {title && (
                  <p style={{ color: '#C8AA6E', fontSize: 'clamp(1rem, 2vw, 1.4rem)', marginTop: 12 }}>{title}</p>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  {selectedRole && (
                    <span className="pill" style={{ color: '#5FA8FF', borderColor: 'rgba(95,168,255,0.48)', background: 'rgba(95,168,255,0.13)' }}>
                      {ROLE_LABELS[selectedRole] ?? selectedRole}
                    </span>
                  )}
                  {tags.map(tag => (
                    <span key={tag} className="pill" style={{ color: '#C8AA6E', borderColor: 'rgba(200,170,110,0.42)', background: 'rgba(200,170,110,0.10)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {tierEntry && (
              <div className="champion-hero-stats">
                {[
                  { label: 'Tier', value: tierEntry.tier, color: tierColor(tierEntry.tier) },
                  { label: 'Win Rate', value: `${tierEntry.winRate.toFixed(1)}%`, color: tierEntry.winRate >= 52 ? '#4FBF8F' : tierEntry.winRate < 48 ? '#E06767' : '#B4BECC' },
                  { label: 'Pick Rate', value: `${tierEntry.pickRate.toFixed(1)}%`, color: '#B4BECC' },
                  { label: 'Matches', value: tierEntry.matchCount.toLocaleString('en-US'), color: '#F3F4F6' },
                ].map((cell, index, arr) => (
                  <div key={cell.label} style={{ padding: '16px 12px', textAlign: 'center', borderRight: index < arr.length - 1 ? '1px solid rgba(115,128,150,0.25)' : 'none' }}>
                    <div style={{ color: cell.color, fontSize: 'clamp(1.2rem, 2.4vw, 1.75rem)', fontWeight: 950 }}>{cell.value}</div>
                    <div style={{ color: '#9AA4B2', fontSize: '0.68rem', marginTop: 5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cell.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {availableRoles.length > 1 && (
            <div className="champion-role-filter">
              {availableRoles.map(availableRole => (
                <Link
                  key={availableRole}
                  href={`/champions/${championId}?role=${availableRole}`}
                  className={selectedRole === availableRole ? 'btn btn-active' : 'btn'}
                  style={{ textDecoration: 'none', borderColor: selectedRole === availableRole ? '#5FA8FF' : 'var(--border-2)' }}
                >
                  {ROLE_LABELS[availableRole] ?? availableRole}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {rank && tierEntry && (
        <p style={{ color: '#738096', fontSize: '0.75rem', marginTop: -4 }}>
          {displayName} is ranked #{rank} for {selectedRole ? ROLE_LABELS[selectedRole] ?? selectedRole : 'this role'} in the current ranked solo dataset.
        </p>
      )}

      <div className="champion-content-layout">
        <div style={{ minWidth: 0 }}>
          {champion ? (
            <ChampionDetailClient
              champion={champion}
              builds={builds}
              counters={counters}
              synergies={synergies}
              championId={championId}
              ddVersion={ddVersion}
              selectedRole={selectedRole}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#B0B0B0', fontSize: 14 }}>
              Champion data unavailable. Please try again later.
            </div>
          )}
        </div>
        <aside className="page-shell champion-ad-space">
          Ad space
        </aside>
      </div>
    </div>
  );
}
