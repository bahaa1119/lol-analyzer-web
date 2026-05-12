'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { TierListEntry, TierListResponse } from '@/lib/types';
import { championIconUrl, pct, ROLE_LABELS, tierColor } from '@/lib/utils';

interface Props {
  initialData: TierListResponse;
  meta: unknown;
}

type SortField = 'tier' | 'winRate' | 'pickRate' | 'banRate' | 'matches';
type RoleFilter = '' | 'TOP' | 'JUNGLE' | 'MID' | 'BOTTOM' | 'SUPPORT';

const TIER_ORDER = ['S+', 'S', 'A', 'B', 'C', 'D'];
const SORT_CHIPS: { field: SortField; label: string }[] = [
  { field: 'tier', label: 'Tier' },
  { field: 'winRate', label: 'Win Rate' },
  { field: 'pickRate', label: 'Pick Rate' },
  { field: 'banRate', label: 'Ban Rate' },
  { field: 'matches', label: 'Matches' },
];

const ROLE_ICON: Record<Exclude<RoleFilter, ''>, string> = {
  TOP: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  JUNGLE: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  MID: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  BOTTOM: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  SUPPORT: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
};

function normalizeRole(value: string): Exclude<RoleFilter, ''> {
  const upper = value.toUpperCase();
  if (upper === 'MIDDLE') return 'MID';
  if (upper === 'ADC') return 'BOTTOM';
  if (upper === 'UTILITY') return 'SUPPORT';
  return (upper as Exclude<RoleFilter, ''>) || 'TOP';
}

function tierScore(value: string) {
  const index = TIER_ORDER.indexOf(value);
  return index === -1 ? 99 : index;
}

function metricBarWidth(field: 'winRate' | 'pickRate' | 'banRate', value: number) {
  if (field === 'winRate') return Math.max(12, Math.min(100, (value - 45) * 12));
  if (field === 'pickRate') return Math.max(8, Math.min(100, value * 18));
  return Math.max(8, Math.min(100, value * 10));
}

export function TierListClient({ initialData }: Props) {
  const [role, setRole] = useState<RoleFilter>('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('tier');
  const [sortDesc, setSortDesc] = useState(true);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDesc(desc => !desc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  }

  const entries = useMemo(() => {
    let list = [...initialData.entries];
    if (role) list = list.filter(entry => normalizeRole(entry.role) === role);
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter(entry => entry.championName.toLowerCase().includes(query));
    }

    list.sort((left, right) => {
      let diff = 0;
      if (sortField === 'tier') diff = tierScore(left.tier) - tierScore(right.tier);
      else if (sortField === 'winRate') diff = left.winRate - right.winRate;
      else if (sortField === 'pickRate') diff = left.pickRate - right.pickRate;
      else if (sortField === 'banRate') diff = left.banRate - right.banRate;
      else if (sortField === 'matches') diff = left.matchCount - right.matchCount;
      return sortDesc ? diff : -diff;
    });

    return list;
  }, [initialData.entries, role, search, sortField, sortDesc]);

  return (
    <div
      className="page-shell"
      style={{
        padding: 22,
        borderColor: 'rgba(200,170,110,0.2)',
        background:
          'radial-gradient(circle at top center, rgba(95,168,255,0.035), transparent 24%), radial-gradient(circle at top left, rgba(200,170,110,0.03), transparent 20%), var(--surface-1)',
      }}
    >
      <style>{`
        .tier-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .tier-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .tier-role-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: flex-end;
        }
        .tier-search-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          margin-bottom: 14px;
        }
        .tier-table-head {
          display: grid;
          grid-template-columns: 42px 58px minmax(220px, 1fr) 92px 132px 132px 132px 90px 18px;
          gap: 10px;
          padding: 0 12px 8px;
          border-bottom: 1px solid var(--border-1);
        }
        .tier-row {
          display: grid;
          grid-template-columns: 42px 58px minmax(220px, 1fr) 92px 132px 132px 132px 90px 18px;
          gap: 10px;
          align-items: center;
          padding: 9px 12px;
          border: 1px solid var(--border-1);
          border-radius: 16px;
          background: var(--surface-2);
          text-decoration: none;
          transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
        }
        .tier-row:hover {
          transform: translateY(-1px);
          border-color: rgba(200,170,110,0.38);
          background: var(--surface-3);
        }
        .tier-mobile-meta {
          display: none;
        }
        @media (max-width: 1180px) {
          .tier-table-head,
          .tier-row {
            grid-template-columns: 34px 44px minmax(180px, 1fr) 82px 108px 108px 108px 72px 18px;
          }
        }
        @media (max-width: 920px) {
          .tier-search-row {
            grid-template-columns: 1fr;
          }
          .tier-table-head {
            display: none;
          }
          .tier-row {
            grid-template-columns: 30px 42px minmax(0, 1fr) 70px 18px;
            gap: 12px;
          }
          .tier-desktop-metric {
            display: none;
          }
          .tier-mobile-meta {
            display: grid;
            grid-column: 3 / 5;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            margin-top: 4px;
          }
        }
      `}</style>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '1px solid rgba(200,170,110,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
              fontSize: 10,
            }}
          >
            L
          </div>
          <p className="section-eyebrow" style={{ color: 'var(--gold)' }}>CURRENT TIER LIST</p>
        </div>
        <h2
          style={{
            color: 'var(--text-main)',
            fontSize: 'clamp(1.5rem, 3vw, 1.95rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
          }}
        >
          Best Champions
        </h2>
      </div>

      <div className="tier-toolbar">
        <div className="tier-chip-row">
          <span style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', fontWeight: 600, marginRight: 2 }}>Sort by</span>
          {SORT_CHIPS.map(({ field, label }) => {
            const active = sortField === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => handleSort(field)}
                className={active ? 'btn btn-active' : 'btn'}
                style={active ? { background: 'var(--gold)', color: 'var(--bg-body)', borderColor: 'var(--gold)' } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="tier-role-row">
          <span style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', fontWeight: 600, marginRight: 2 }}>Filter by Role</span>
          <button
            type="button"
            onClick={() => setRole('')}
            className={role === '' ? 'btn btn-active' : 'btn'}
            style={role === '' ? { background: 'var(--gold)', color: 'var(--bg-body)', borderColor: 'var(--gold)' } : undefined}
          >
            All Roles
          </button>
          {(Object.keys(ROLE_ICON) as Exclude<RoleFilter, ''>[]).map(entry => {
            const active = role === entry;
            return (
              <button
                key={entry}
                type="button"
                onClick={() => setRole(active ? '' : entry)}
                title={ROLE_LABELS[entry] ?? entry}
                style={{
                  width: 46,
                  height: 36,
                  borderRadius: 11,
                  border: active ? '1px solid var(--gold)' : '1px solid var(--border-1)',
                  background: active ? 'rgba(200,170,110,0.08)' : 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Image
                  src={ROLE_ICON[entry]}
                  alt={entry}
                  width={20}
                  height={20}
                  unoptimized
                  style={{ opacity: active ? 1 : 0.72, filter: active ? 'brightness(1.2)' : 'none' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="tier-search-row">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-body)',
            border: '1px solid var(--border-1)',
            borderRadius: 14,
            padding: '10px 13px',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="var(--text-subtle)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search champion in tier list..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          {initialData.patch && (
            <span
              style={{
                padding: '7px 12px',
                borderRadius: 11,
                background: 'rgba(95,168,255,0.08)',
                border: '1px solid rgba(95,168,255,0.3)',
                color: 'var(--blue)',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              Patch {initialData.patch}
            </span>
          )}
        </div>
      </div>

      <div className="tier-table-head">
        {[
          { label: '#', align: 'left' },
          { label: 'Role', align: 'center' },
          { label: 'Champion', align: 'left' },
          { label: 'Tier', align: 'center' },
          { label: 'Win Rate', align: 'left' },
          { label: 'Pick Rate', align: 'left' },
          { label: 'Ban Rate', align: 'left' },
          { label: 'Matches', align: 'right' },
          { label: '', align: 'right' },
        ].map((column, index) => (
          <div
            key={`${column.label || 'empty'}-${index}`}
            style={{
              color: 'var(--text-subtle)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: column.align as 'left' | 'center' | 'right',
            }}
          >
            {column.label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {entries.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-subtle)' }}>No champions found.</div>
        ) : (
          entries.map((entry, index) => <TierRow key={`${entry.championId}-${entry.role}`} entry={entry} rank={index + 1} />)
        )}
      </div>

      {initialData.note && <p style={{ color: 'var(--text-subtle)', fontSize: '0.74rem', marginTop: 14, lineHeight: 1.5 }}>{initialData.note}</p>}
    </div>
  );
}

function MetricCell({
  value,
  barColor,
  field,
  textColor = 'var(--text-main)',
}: {
  value: string;
  barColor: string;
  field: 'winRate' | 'pickRate' | 'banRate';
  textColor?: string;
}) {
  const numeric = Number.parseFloat(value);
  const width = Number.isFinite(numeric) ? metricBarWidth(field, numeric) : 12;

  return (
    <div className="tier-desktop-metric" style={{ display: 'grid', gap: 6 }}>
      <span style={{ color: textColor, fontWeight: 700, fontSize: '0.92rem' }}>{value}%</span>
      <div style={{ height: 5, borderRadius: 999, background: 'var(--surface-4)', overflow: 'hidden' }}>
        <div style={{ width: `${width}%`, height: '100%', background: barColor, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function TierRow({ entry, rank }: { entry: TierListEntry; rank: number }) {
  const color = tierColor(entry.tier);
  const roleKey = normalizeRole(entry.role);
  const roleIcon = ROLE_ICON[roleKey] ?? ROLE_ICON.TOP;

  return (
    <Link href={`/champions/${entry.championId}`} className="tier-row">
      <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 700 }}>{rank}</span>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 11,
            background: 'var(--bg-body)',
            border: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image src={roleIcon} alt={entry.role} width={18} height={18} unoptimized style={{ opacity: 0.86 }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, overflow: 'hidden', border: '1px solid var(--border-1)', flexShrink: 0 }}>
          <Image src={championIconUrl(entry.championId)} alt={entry.championName} width={40} height={40} unoptimized />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: 'var(--text-main)', fontSize: '0.94rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.championName}
          </p>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.68rem', marginTop: 1 }}>
            {ROLE_LABELS[entry.role] ?? entry.role}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span
          style={{
            minWidth: 46,
            textAlign: 'center',
            padding: '4px 10px',
            borderRadius: 11,
            border: `1px solid ${color}4A`,
            background: `${color}16`,
            color,
            fontSize: '0.88rem',
            fontWeight: 800,
          }}
        >
          {entry.tier}
        </span>
      </div>

      <MetricCell value={entry.winRate.toFixed(1)} barColor="#4FBF8F" field="winRate" textColor="#4FBF8F" />
      <MetricCell value={entry.pickRate.toFixed(1)} barColor="#5FA8FF" field="pickRate" />
      <MetricCell value={entry.banRate.toFixed(1)} barColor="#E06767" field="banRate" textColor={entry.banRate > 10 ? '#E06767' : 'var(--text-main)'} />

      <p style={{ textAlign: 'right', color: 'var(--text-main)', fontSize: '0.96rem', fontWeight: 600 }}>{entry.matchCount.toLocaleString('en-US')}</p>
      <span style={{ textAlign: 'right', color: 'var(--text-subtle)', fontSize: '1.05rem' }}>{'>'}</span>

      <div className="tier-mobile-meta">
        <div>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Win Rate</p>
          <p style={{ color: '#4FBF8F', fontWeight: 700, marginTop: 3 }}>{pct(entry.winRate)}</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pick Rate</p>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: 3 }}>{pct(entry.pickRate)}</p>
        </div>
        <div>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ban Rate</p>
          <p style={{ color: entry.banRate > 10 ? '#E06767' : 'var(--text-muted)', fontWeight: 700, marginTop: 3 }}>{pct(entry.banRate)}</p>
        </div>
      </div>
    </Link>
  );
}
