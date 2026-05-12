'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TierListEntry } from '@/lib/types';
import { championIconUrl, ROLE_LABELS } from '@/lib/utils';

type ChampionSuggestion = Pick<TierListEntry, 'championId' | 'championName' | 'role' | 'tier' | 'winRate' | 'matchCount'>;

const PLATFORMS = [
  { code: 'EUW1', label: 'EUW' },
  { code: 'NA1', label: 'NA' },
  { code: 'KR', label: 'KR' },
  { code: 'EUN1', label: 'EUNE' },
  { code: 'TR1', label: 'TR' },
  { code: 'BR1', label: 'BR' },
  { code: 'LA1', label: 'LAN' },
  { code: 'LA2', label: 'LAS' },
  { code: 'OC1', label: 'OCE' },
  { code: 'JP1', label: 'JP' },
  { code: 'RU', label: 'RU' },
];

export function SearchHero({ champions = [] }: { champions?: ChampionSuggestion[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('EUW1');
  const [focused, setFocused] = useState(false);

  const championSuggestions = useMemo(() => {
    const unique = new Map<string, ChampionSuggestion>();
    for (const champion of champions) {
      const current = unique.get(champion.championId);
      if (!current || champion.matchCount > current.matchCount) {
        unique.set(champion.championId, champion);
      }
    }
    return Array.from(unique.values()).sort((a, b) => a.championName.localeCompare(b.championName));
  }, [champions]);

  const visibleSuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase().replace(/^\/+/, '');
    if (normalized.length < 1 || normalized.includes('#')) return [];
    const startsWithMatches: ChampionSuggestion[] = [];
    const includesMatches: ChampionSuggestion[] = [];
    for (const champion of championSuggestions) {
      const name = champion.championName.toLowerCase();
      if (name.startsWith(normalized)) {
        startsWithMatches.push(champion);
      } else if (name.includes(normalized)) {
        includesMatches.push(champion);
      }
      if (startsWithMatches.length >= 6) break;
    }
    return [...startsWithMatches, ...includesMatches].slice(0, 6);
  }, [championSuggestions, query]);

  const showSuggestions = focused && visibleSuggestions.length > 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const championMatch = championSuggestions.find(champion => champion.championName.toLowerCase() === trimmed.toLowerCase());
    if (championMatch) {
      openChampion(championMatch);
      return;
    }
    const hashIndex = trimmed.indexOf('#');
    const gameName = hashIndex !== -1 ? trimmed.slice(0, hashIndex) : trimmed;
    const tagLine = hashIndex !== -1 ? trimmed.slice(hashIndex + 1) : platform.replace(/\d/g, '');
    router.push(`/summoner?name=${encodeURIComponent(gameName.trim())}&tag=${encodeURIComponent(tagLine.trim())}&region=${platform}`);
  }

  function openChampion(champion: ChampionSuggestion) {
    setQuery(champion.championName);
    setFocused(false);
    router.push(`/champions/${encodeURIComponent(champion.championId)}`);
  }

  return (
    <div
      className="page-shell"
      style={{
        position: 'relative',
        zIndex: 10,
        overflow: 'visible',
        padding: 0,
        marginBottom: 22,
        borderColor: 'rgba(200,170,110,0.35)',
        minHeight: 314,
      }}
    >
      <style>{`
        .hero-shell {
          position: relative;
          min-height: 314px;
          display: flex;
          align-items: center;
          border-radius: inherit;
        }
        .hero-art {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
        }
        .hero-copy {
          position: relative;
          z-index: 3;
          display: grid;
          gap: 14px;
          max-width: 660px;
          padding: 30px 48px;
        }
        .hero-form {
          display: grid;
          grid-template-columns: minmax(360px, 1.9fr) 170px 160px;
          gap: 14px;
          align-items: end;
        }
        .hero-search-field {
          position: relative;
        }
        .hero-suggestions {
          position: absolute;
          z-index: 20;
          left: 0;
          right: 0;
          top: calc(100% + 8px);
          display: grid;
          gap: 6px;
          padding: 8px;
          border-radius: 16px;
          border: 1px solid var(--border-1);
          background: rgba(3,7,13,0.98);
          box-shadow: 0 18px 38px rgba(0,0,0,0.34);
        }
        .hero-suggestion {
          width: 100%;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: #F3F4F6;
          text-align: left;
          cursor: pointer;
        }
        .hero-suggestion:hover,
        .hero-suggestion:focus-visible {
          border-color: rgba(200,170,110,0.34);
          background: rgba(255,255,255,0.04);
          outline: none;
        }
        @media (max-width: 980px) {
          .hero-shell {
            min-height: 338px;
          }
          .hero-copy {
            max-width: 100%;
            padding: 26px 24px;
          }
          .hero-form {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 640px) {
          .hero-shell {
            min-height: 372px;
            align-items: stretch;
          }
          .hero-copy {
            padding: 24px 20px;
            gap: 12px;
          }
        }
      `}</style>

      <div className="hero-shell">
        <div className="hero-art" aria-hidden>
          <Image
            src="/home-hero-map.png"
            alt=""
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: '78% center' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(5,10,18,0.985) 0%, rgba(5,10,18,0.93) 30%, rgba(5,10,18,0.58) 56%, rgba(5,10,18,0.18) 78%, rgba(5,10,18,0.08) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(5,10,18,0.28) 0%, rgba(5,10,18,0.06) 24%, rgba(5,10,18,0.08) 78%, rgba(5,10,18,0.3) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 66% 48%, rgba(95,168,255,0.14), transparent 24%)',
            }}
          />
        </div>

        <div className="hero-copy">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid rgba(200,170,110,0.3)',
              background: 'rgba(8,12,20,0.46)',
              width: 'fit-content',
            }}
          >
            <span style={{ color: '#C8AA6E', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em' }}>
              LIVE META · MATCH ANALYSIS · RANK TRACKING
            </span>
          </div>

          <div>
            <h1
              style={{
                color: '#F3F4F6',
                fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 1.04,
                maxWidth: 560,
              }}
            >
              Analyze the meta.
              <br />
              <span style={{ color: '#C8AA6E' }}>Dominate the Rift.</span>
            </h1>
            <p className="subtle-copy" style={{ maxWidth: 560, fontSize: '0.98rem', marginTop: 6 }}>
              Search any summoner to explore live stats, tier rankings, and match insights powered by real-time data.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="hero-form">
            <label className="hero-search-field" style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: '#738096', fontSize: '0.78rem', fontWeight: 700 }}>Summoner / Champion</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(13,21,32,0.92)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 16,
                  padding: '14px 18px',
                }}
              >
                <svg width="18" height="18" fill="none" stroke="#738096" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => window.setTimeout(() => setFocused(false), 120)}
                  placeholder="Dark9#EUW"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#F3F4F6',
                    fontSize: '1rem',
                  }}
                />
              </div>
              {showSuggestions && (
                <div className="hero-suggestions">
                  {visibleSuggestions.map(champion => (
                    <button
                      key={champion.championId}
                      type="button"
                      className="hero-suggestion"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => openChampion(champion)}
                    >
                      <Image
                        src={championIconUrl(champion.championId)}
                        alt=""
                        width={34}
                        height={34}
                        unoptimized
                        style={{ borderRadius: 9, border: '1px solid var(--border-1)' }}
                      />
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {champion.championName}
                        </span>
                        <span style={{ display: 'block', color: '#738096', fontSize: '0.72rem', marginTop: 1 }}>
                          {ROLE_LABELS[champion.role] ?? champion.role}
                        </span>
                      </span>
                      <span style={{ color: '#C8AA6E', fontSize: '0.78rem', fontWeight: 800 }}>
                        {champion.tier}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: '#738096', fontSize: '0.78rem', fontWeight: 700 }}>Region</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(13,21,32,0.92)',
                    border: '1px solid var(--border-2)',
                    borderRadius: 16,
                    padding: '14px 42px 14px 16px',
                    fontSize: '1rem',
                    color: '#F3F4F6',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {PLATFORMS.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: '#B4BECC', pointerEvents: 'none' }}>
                  ▼
                </span>
              </div>
            </label>

            <button
              type="submit"
              style={{
                height: 52,
                alignSelf: 'end',
                background: '#C8AA6E',
                color: '#09101a',
                border: 'none',
                borderRadius: 16,
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 12px 28px rgba(200,170,110,0.18)',
              }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
