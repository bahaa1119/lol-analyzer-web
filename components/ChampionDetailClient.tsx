'use client';

import { useEffect, useMemo, useState, createContext, useContext, type ReactNode } from 'react';

const DDragonCtx = createContext(process.env.NEXT_PUBLIC_DDRAGON_VERSION ?? '15.14.1');
import Image from 'next/image';
import Link from 'next/link';
import type {
  PublicChampionDetail,
  PublicBuildsResponse,
  PublicCountersResponse,
  SynergyDto,
  BuildStyleDto,
  RunePageDto,
  SkillPathDto,
  ItemDto,
  ItemSlotDto,
  MatchupDto,
} from '@/lib/types';
import { championIconUrl, resolveRuneIconUrl, getRuneTrees, abilityIconUrl, itemIconUrl, ROLE_LABELS, type RuneTreeDto } from '@/lib/utils';

// ── Color constants ──────────────────────────────────────────────────────────
const C = {
  card:       'var(--surface-1)',
  surface:    'var(--surface-2)',
  surfaceAlt: 'var(--surface-3)',
  border:     'var(--border-1)',
  muted:      'var(--text-muted)',
  dim:        'var(--text-subtle)',
  gold:       '#C8AA6E',
  green:      '#4FBF8F',
  red:        '#E06767',
  blue:       '#5FA8FF',
} as const;

function wrColor(wr: number): string {
  if (wr >= 52) return C.green;
  if (wr < 48)  return C.red;
  return C.gold;
}

function fmtGames(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function nonEmptyItems(items: ItemDto[] | undefined | null): ItemDto[] {
  return Array.isArray(items)
    ? items.filter(item => Boolean(item?.id) && Boolean(item?.name))
    : [];
}

function shortRuneTabLabel(page: RunePageDto, index: number): string {
  if (index === 0) return 'Recommended';
  return page.keystoneName || page.primaryStyleName || `Page ${index + 1}`;
}

function resolveBuildStyle(
  builds: PublicBuildsResponse,
  selectedStyleIndex: number,
): {
  sortedStyles: BuildStyleDto[];
  hasStyles: boolean;
  styleIdx: number;
  activeStyle: BuildStyleDto | null;
} {
  const sortedStyles = [...(builds.styles ?? [])].sort((a, b) => b.games - a.games);
  const hasStyles = sortedStyles.length >= 2;
  const styleIdx = selectedStyleIndex >= sortedStyles.length ? -1 : selectedStyleIndex;
  const activeStyle: BuildStyleDto | null = styleIdx >= 0 ? sortedStyles[styleIdx] : null;
  return { sortedStyles, hasStyles, styleIdx, activeStyle };
}

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  champion: PublicChampionDetail;
  builds: PublicBuildsResponse | null;
  counters: PublicCountersResponse | null;
  synergies: SynergyDto[];
  championId: string;
  ddVersion: string;
  selectedRole?: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChampionDetailClient({
  champion,
  builds,
  counters,
  synergies,
  ddVersion,
  selectedRole,
}: Props) {
  const [tab, setTab] = useState<'runes' | 'build' | 'counters' | 'synergies'>('runes');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(-1);

  const tabs: { key: 'runes' | 'build' | 'counters' | 'synergies'; label: string }[] = [
    { key: 'runes',    label: 'Runes' },
    { key: 'build',    label: 'Build' },
    { key: 'counters', label: 'Counters' },
    { key: 'synergies', label: 'Synergies' },
  ];

  return (
    <DDragonCtx.Provider value={ddVersion}>
    <div className="page-stack">
      <style>{`
        .detail-tab-shell {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .detail-content-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rune-tree-layout {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
          gap: 8px;
          align-items: start;
        }
        .rune-page-body {
          display: block;
        }
        @media (max-width: 520px) {
          .detail-tab-shell > * {
            flex: 1 1 calc(50% - 4px);
          }
        }
        @media (max-width: 720px) {
          .rune-tree-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
      {/* Tab bar */}
      <div className="page-shell" style={{ padding: 8, borderRadius: 18 }}>
        <div className="detail-tab-shell">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn btn-active' : 'btn'}
            style={{
              minWidth: 96,
              justifyContent: 'center',
              padding: '7px 14px',
            }}
          >
            {t.label}
          </button>
        ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'runes' && (
        <RunesTab
          builds={builds}
          selectedStyleIndex={selectedStyleIndex}
          onStyleSelect={setSelectedStyleIndex}
        />
      )}
      {tab === 'build' && (
        <BuildTab
          champion={champion}
          builds={builds}
          selectedStyleIndex={selectedStyleIndex}
          onStyleSelect={setSelectedStyleIndex}
        />
      )}
      {tab === 'counters' && (
        <CountersTab counters={counters} />
      )}
      {tab === 'synergies' && (
        <SynergiesTab synergies={synergies} championRole={selectedRole} />
      )}
    </div>
    </DDragonCtx.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BUILD TAB
// ═══════════════════════════════════════════════════════════════════

function RunesTab({
  builds,
  selectedStyleIndex,
  onStyleSelect,
}: {
  builds: PublicBuildsResponse | null;
  selectedStyleIndex: number;
  onStyleSelect: (i: number) => void;
}) {
  if (!builds) {
    return <EmptyState text="No rune data available for this champion." />;
  }

  const { sortedStyles, hasStyles, styleIdx, activeStyle } = resolveBuildStyle(builds, selectedStyleIndex);
  const suppressed = builds.suppressed ?? false;
  const rawRunePages = activeStyle != null
    ? ((activeStyle.runePages ?? []).length > 0 ? activeStyle.runePages.slice(0, 1) : [])
    : (builds.runePages ?? []);

  return (
    <div className="detail-content-stack">
      {builds.fallbackPatch && builds.note && (
        <FallbackBanner patch={builds.fallbackPatch} note={builds.note} />
      )}

      {hasStyles && (
        <div>
          <StyleTabBar
            styles={sortedStyles}
            selectedIndex={styleIdx}
            onSelect={onStyleSelect}
          />
          {activeStyle && <StyleInfoStrip style={activeStyle} />}
        </div>
      )}

      <PanelCard title="Runes">
        {suppressed ? (
          <SmallNote text={builds.suppressionReason ?? builds.note ?? 'Not enough data.'} />
        ) : rawRunePages.length === 0 ? (
          <SmallNote text="No rune page is publishable for this scope yet." />
        ) : (
          <RunePagesSwitcher pages={rawRunePages} switchKey={`${selectedStyleIndex}-${activeStyle?.keystoneId ?? 'all'}`} />
        )}
      </PanelCard>
    </div>
  );
}

function RunePagesSwitcher({
  pages,
  switchKey,
}: {
  pages: RunePageDto[];
  switchKey: string;
}) {
  const sortedRunePages = useMemo(
    () => [...pages].sort((a, b) => {
      if (b.sampleSize !== a.sampleSize) return b.sampleSize - a.sampleSize;
      if (b.pickRate !== a.pickRate) return b.pickRate - a.pickRate;
      return b.winRate - a.winRate;
    }),
    [pages],
  );

  const visibleRunePages = useMemo(() => {
    if (sortedRunePages.length <= 1) return sortedRunePages;
    const totalSample = sortedRunePages.reduce((sum, page) => sum + Math.max(page.sampleSize, 0), 0);
    const topPage = sortedRunePages[0];
    const dominanceShare = totalSample > 0 ? topPage.sampleSize / totalSample : 0;
    if (dominanceShare >= 0.8 || topPage.pickRate >= 80) {
      return [topPage];
    }
    return sortedRunePages;
  }, [sortedRunePages]);

  const [selectedRunePageIndex, setSelectedRunePageIndex] = useState(0);
  const safeIndex = selectedRunePageIndex >= visibleRunePages.length ? 0 : selectedRunePageIndex;
  const activeRunePage = visibleRunePages[safeIndex] ?? null;

  return (
    <div key={switchKey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {visibleRunePages.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {visibleRunePages.map((page, index) => {
            const active = index === safeIndex;
            return (
              <button
                key={`${page.keystoneId}-${page.primaryStyleId}-${page.secondaryStyleId}-${index}`}
                type="button"
                onClick={() => setSelectedRunePageIndex(index)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 0,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: active ? `${C.gold}18` : C.surfaceAlt,
                  border: `1px solid ${active ? C.gold : C.border}`,
                  cursor: 'pointer',
                }}
              >
                <RuneImg id={page.keystoneId} size={18} />
                <span style={{ color: active ? '#F3F4F6' : C.muted, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {shortRuneTabLabel(page, index)}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {activeRunePage && <RunePageRow page={activeRunePage} />}
    </div>
  );
}

function BuildTab({
  champion,
  builds,
  selectedStyleIndex,
  onStyleSelect,
}: {
  champion: PublicChampionDetail;
  builds: PublicBuildsResponse | null;
  selectedStyleIndex: number;
  onStyleSelect: (i: number) => void;
}) {
  if (!builds) {
    return <EmptyState text="No build data available for this champion." />;
  }

  const sortedStyles = [...(builds.styles ?? [])].sort((a, b) => b.games - a.games);
  const hasStyles = sortedStyles.length >= 2;
  const styleIdx = selectedStyleIndex >= sortedStyles.length ? -1 : selectedStyleIndex;
  const activeStyle: BuildStyleDto | null = styleIdx >= 0 ? sortedStyles[styleIdx] : null;

  const startingCombo = activeStyle?.startingCombo?.items?.length
    ? activeStyle.startingCombo
    : builds.startingCombo ?? null;
  const startingItems = nonEmptyItems(startingCombo?.items ?? activeStyle?.startingItems ?? builds.startingItems);
  const startingComboWinRate = (startingCombo?.winRate ?? 0);
  const startingComboGames   = (startingCombo?.games   ?? 0);
  const coreItems =
    activeStyle?.coreCombo?.items?.length
      ? nonEmptyItems(activeStyle.coreCombo.items)
      : nonEmptyItems(builds.coreCombo?.items ?? activeStyle?.coreItems ?? builds.coreItems);
  const boots         = nonEmptyItems(activeStyle?.boots?.length ? activeStyle.boots : builds.boots);
  const itemSlots     = (activeStyle?.itemSlots?.length ? activeStyle.itemSlots : builds.itemSlots ?? [])
    .filter(slot => Array.isArray(slot.items) && slot.items.some(item => Boolean(item?.id)));
  const skillOrders   = activeStyle?.skillOrders?.length
    ? activeStyle.skillOrders
    : (builds.skillOrders ?? []);

  const suppressed = builds.suppressed ?? false;

  return (
    <div className="detail-content-stack">
      {/* Fallback patch banner */}
      {builds.fallbackPatch && builds.note && (
        <FallbackBanner patch={builds.fallbackPatch} note={builds.note} />
      )}

      {/* Style tab bar */}
      {hasStyles && (
        <div style={{ marginTop: 12, marginBottom: 0 }}>
          <StyleTabBar
            styles={sortedStyles}
            selectedIndex={styleIdx}
            onSelect={onStyleSelect}
          />
          {activeStyle && (
            <StyleInfoStrip style={activeStyle} />
          )}
        </div>
      )}

      {/* Build panel */}
      <PanelCard title="Build">
        {suppressed ? (
          <SmallNote text={builds.suppressionReason ?? builds.note ?? 'Not enough data.'} />
        ) : (
          <BuildStageGrid
            startingItems={startingItems}
            startingComboWinRate={startingComboWinRate}
            startingComboGames={startingComboGames}
            coreItems={coreItems}
            boots={boots}
            itemSlots={itemSlots}
          />
        )}
      </PanelCard>

      {/* Skill Orders panel */}
      <PanelCard title="Skill Orders">
        {suppressed ? (
          <SmallNote text={builds.suppressionReason ?? builds.note ?? 'Not enough data.'} />
        ) : skillOrders.length === 0 ? (
          <SkillOrderUnavailable champion={champion} />
        ) : (
          <div>
            {skillOrders.map((order, i) => (
              <SkillOrderCard key={i} champion={champion} order={order} />
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ── Fallback patch banner ─────────────────────────────────────────────────────
function FallbackBanner({ patch, note }: { patch: string; note: string }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginBottom: 0,
    }}>
      <span style={{ fontSize: 16, color: C.gold, flexShrink: 0 }}>⏱</span>
      <div>
        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
          Showing fallback patch {patch}
        </div>
        <div style={{ color: C.dim, fontSize: 11, marginTop: 4, lineHeight: 1.45 }}>{note}</div>
      </div>
    </div>
  );
}

// ── Style tab bar ─────────────────────────────────────────────────────────────
function StyleTabBar({
  styles,
  selectedIndex,
  onSelect,
}: {
  styles: BuildStyleDto[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
      {/* All chip */}
      <button
        onClick={() => onSelect(-1)}
        style={{
          flexShrink: 0,
          background: selectedIndex === -1 ? `${C.gold}26` : C.card,
          border: `1px solid ${selectedIndex === -1 ? C.gold : C.border}`,
          borderRadius: 20,
          padding: '7px 14px',
          cursor: 'pointer',
          color: selectedIndex === -1 ? C.gold : C.muted,
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        All
      </button>

      {styles.map((style, i) => {
        const active = selectedIndex === i;
        const lowData = style.games < 30;
        const wr = wrColor(style.winRate);
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0,
              background: active ? `${C.gold}26` : C.card,
              border: `1px solid ${active ? C.gold : C.border}`,
              borderRadius: 20,
              padding: '7px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RuneImg id={style.keystoneId} size={22} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: active ? C.gold : '#fff', fontSize: 11, fontWeight: 700 }}>
                  {style.keystoneName}
                </span>
                {lowData && (
                  <span style={{
                    background: `${C.dim}26`,
                    color: C.dim,
                    fontSize: 8,
                    fontWeight: 600,
                    padding: '1px 4px',
                    borderRadius: 4,
                  }}>low</span>
                )}
              </div>
              <div style={{ fontSize: 9 }}>
                <span style={{ color: wr, fontWeight: 600 }}>{style.winRate.toFixed(1)}% WR</span>
                <span style={{ color: C.dim }}> · {fmtGames(style.games)} games</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Style info strip ──────────────────────────────────────────────────────────
function StyleInfoStrip({ style }: { style: BuildStyleDto }) {
  const wrc = wrColor(style.winRate);
  return (
    <div style={{
      marginTop: 8,
      padding: '7px 12px',
      background: `${wrc}0F`,
      border: `1px solid ${wrc}33`,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <RuneImg id={style.keystoneId} size={18} />
      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{style.keystoneName}</span>
      <span style={{ color: wrc, fontSize: 11, fontWeight: 700 }}>{style.winRate.toFixed(1)}% WR</span>
      <span style={{ color: C.dim, fontSize: 10 }}>
        · {fmtGames(style.games)} games · {style.pickRate.toFixed(1)}% pick
      </span>
    </div>
  );
}

// ── Build stage grid ──────────────────────────────────────────────────────────
function BuildStageGrid({
  startingItems,
  startingComboWinRate,
  startingComboGames,
  coreItems,
  boots,
  itemSlots,
}: {
  startingItems: ItemDto[];
  startingComboWinRate: number;
  startingComboGames: number;
  coreItems: ItemDto[];
  boots: ItemDto[];
  itemSlots: ItemSlotDto[];
}) {
  const topBoot = boots[0] ?? null;
  const hasBuildData = startingItems.length > 0 || coreItems.length > 0 || topBoot !== null || itemSlots.length > 0;

  if (!hasBuildData) {
    return <SmallNote text="No item build data available for this scope yet." />;
  }

  return (
    <BuildPathTable
      startingItems={startingItems}
      startingComboWinRate={startingComboWinRate}
      startingComboGames={startingComboGames}
      coreItems={coreItems}
      boots={topBoot ? [topBoot] : []}
      itemSlots={itemSlots}
    />
  );
}

// Kept temporarily while the new row-based build path settles.
// eslint-disable-next-line @typescript-eslint/no-unused-vars


// ── Rune page row ─────────────────────────────────────────────────────────────
function BuildPathTable({
  startingItems,
  startingComboWinRate,
  startingComboGames,
  coreItems,
  boots,
  itemSlots,
}: {
  startingItems: ItemDto[];
  startingComboWinRate: number;
  startingComboGames: number;
  coreItems: ItemDto[];
  boots: ItemDto[];
  itemSlots: ItemSlotDto[];
}) {
  const topBoot = boots[0] ?? null;

  return (
    <div>
      <style>{`
        .build-path-card {
          background: linear-gradient(135deg, rgba(22,27,35,0.98), rgba(13,21,32,0.96));
          border: 1px solid ${C.border};
          border-radius: 12px;
          overflow: hidden;
        }
        .build-path-row {
          display: grid;
          grid-template-columns: 170px minmax(0, 1fr);
          align-items: center;
          gap: 14px;
          min-height: 64px;
          padding: 10px 18px;
          border-bottom: 1px solid rgba(61,74,90,0.58);
        }
        .build-path-row:last-child {
          border-bottom: 0;
        }
        .build-path-label {
          color: #9EB1C9;
          font-size: 0.68rem;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .build-path-items {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .build-path-group {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          flex-wrap: wrap;
        }
        .build-path-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 48px;
        }
        .build-path-item-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          line-height: 1.1;
          white-space: nowrap;
        }
        .build-path-spacer {
          min-width: 52px;
        }
        .build-path-separator {
          color: ${C.gold};
          font-size: 1.45rem;
          line-height: 1;
        }
        .build-path-or {
          color: ${C.gold};
          font-size: 0.68rem;
          font-weight: 850;
        }
        @media (max-width: 760px) {
          .build-path-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 8px;
            padding: 12px;
          }
          .build-path-items {
            gap: 8px;
          }
          .build-path-spacer {
            min-width: 0;
          }
        }
      `}</style>
      <div className="build-path-card">
        {(startingItems.length > 0 || topBoot) && (
          <BuildPathRow label="Starting Items">
            <BuildItemSequence items={startingItems} />
            {startingComboWinRate > 0 && (
              <div className="build-path-item-meta" style={{ marginLeft: 2 }}>
                <span style={{ color: wrColor(startingComboWinRate), fontSize: 10, fontWeight: 800 }}>
                  {startingComboWinRate.toFixed(1)}%
                </span>
                {startingComboGames > 0 && (
                  <span style={{ color: C.dim, fontSize: 9 }}>
                    {fmtGames(startingComboGames)}
                  </span>
                )}
              </div>
            )}
            {topBoot && (
              <>
                <span className="build-path-spacer" />
                <span className="build-path-label">Boots</span>
                <span className="build-path-separator">&gt;</span>
                <BuildPathItem item={topBoot} />
              </>
            )}
          </BuildPathRow>
        )}

        {coreItems.length > 0 && (
          <BuildPathRow label="Core Build">
            <BuildItemSequence items={coreItems.slice(0, 5)} />
          </BuildPathRow>
        )}

        {itemSlots.map((slot, index) => (
          <BuildPathRow key={`${slot.label}-${index}`} label={slot.label}>
            <BuildItemOptions items={slot.items} />
          </BuildPathRow>
        ))}
      </div>
    </div>
  );
}

function BuildPathRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="build-path-row">
      <div className="build-path-label">{label}</div>
      <div className="build-path-items">{children}</div>
    </div>
  );
}

function BuildItemSequence({ items }: { items: ItemDto[] }) {
  if (items.length === 0) {
    return <span style={{ color: C.muted, fontSize: 12 }}>No data yet.</span>;
  }

  return (
    <div className="build-path-group">
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <BuildPathItem item={item} />
          {index < items.length - 1 && <span className="build-path-separator">&gt;</span>}
        </div>
      ))}
    </div>
  );
}

function BuildItemOptions({ items }: { items: ItemDto[] }) {
  const shownItems = items.slice(0, 8);

  if (shownItems.length === 0) {
    return <span style={{ color: C.muted, fontSize: 12 }}>No data yet.</span>;
  }

  return (
    <div className="build-path-group">
      {shownItems.map((item, index) => (
        <div key={`${item.id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {index > 0 && <span className="build-path-or">OR</span>}
          <BuildPathItem item={item} />
        </div>
      ))}
    </div>
  );
}

function BuildPathItem({ item }: { item: ItemDto }) {
  const hasWinRate = item.winRate != null && item.winRate > 0;
  const hasGames = item.games != null && item.games > 0;
  const color = hasWinRate ? wrColor(item.winRate!) : C.muted;

  return (
    <div className="build-path-item">
      <ItemImg item={item} size={44} />
      {(hasWinRate || hasGames) && (
        <div className="build-path-item-meta">
          {hasWinRate && (
            <span style={{ color, fontSize: 10, fontWeight: 800 }}>
              {item.winRate!.toFixed(1)}%
            </span>
          )}
          {hasGames && (
            <span style={{ color: C.dim, fontSize: 9 }}>
              {fmtGames(item.games!)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function RunePageRow({ page }: { page: RunePageDto }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${C.card} 0%, ${C.surface} 100%)`,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      display: 'inline-block',
      width: 'fit-content',
      maxWidth: '100%',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: 'rgba(10,14,22,0.92)',
          border: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <RuneImg id={page.keystoneId} size={34} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1.15 }}>{page.keystoneName}</div>
          <div style={{ color: C.dim, fontSize: 10, marginTop: 3 }}>
            {page.primaryStyleName} + {page.secondaryStyleName}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: wrColor(page.winRate), fontSize: 14, fontWeight: 900, lineHeight: 1 }}>
            {page.winRate.toFixed(1)}% WR
          </div>
          <div style={{ color: '#F3F4F6', fontSize: 10, fontWeight: 800, marginTop: 3 }}>
            ({page.sampleSize.toLocaleString('en-US')} matches)
          </div>
        </div>
      </div>

      <div className="rune-page-body">
        <div style={{ width: '100%', minWidth: 0 }}>
          <RuneTreeVisual page={page} />
        </div>
      </div>
    </div>
  );
}

function RuneTreeVisual({ page }: { page: RunePageDto }) {
  const [trees, setTrees] = useState<RuneTreeDto[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRuneTrees().then(data => {
      if (!cancelled) setTrees(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!page.perks.length || !trees || trees.length === 0) {
    return (
      <div className="rune-tree-layout">
        <RunePathCard label="Primary" runeId={page.primaryStyleId} runeName={page.primaryStyleName} />
        <RunePathCard label="Secondary" runeId={page.secondaryStyleId} runeName={page.secondaryStyleName} />
      </div>
    );
  }

  const primaryTree = trees.find(tree => tree.id === page.primaryStyleId);
  const secondaryTree = trees.find(tree => tree.id === page.secondaryStyleId);

  if (!primaryTree) {
    return (
      <div className="rune-tree-layout">
        <RunePathCard label="Primary" runeId={page.primaryStyleId} runeName={page.primaryStyleName} />
        <RunePathCard label="Secondary" runeId={page.secondaryStyleId} runeName={page.secondaryStyleName} />
      </div>
    );
  }

  const selectedPrimary = page.perks.slice(0, 4);
  const selectedSecondary = page.perks.slice(4, 6);

  return (
    <div className="rune-tree-layout">
      <RunePathColumn tree={primaryTree} selectedIds={selectedPrimary} label="Primary" isPrimary />
      {secondaryTree ? (
        <RunePathColumn tree={secondaryTree} selectedIds={selectedSecondary} label="Secondary" />
      ) : (
        <RunePathCard label="Secondary" runeId={page.secondaryStyleId} runeName={page.secondaryStyleName} />
      )}
    </div>
  );
}

function RunePathColumn({
  tree,
  selectedIds,
  label,
  isPrimary = false,
}: {
  tree: RuneTreeDto;
  selectedIds: number[];
  label: string;
  isPrimary?: boolean;
}) {
  const slotsToShow = isPrimary
    ? tree.slots
    : tree.slots.filter(slot => slot.runes.some(rune => selectedIds.includes(rune.id)));

  return (
    <div
      className="rune-path-column"
      style={{
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 10,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: '8px 10px',
        background: 'rgba(10,14,22,0.76)',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
      }}>
        <RuneImg id={tree.id} size={18} />
        <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>{tree.name}</span>
        <span style={{ color: C.dim, fontSize: 9, marginLeft: 'auto' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isPrimary ? 8 : 10 }}>
        {slotsToShow.map((slot, slotIndex) => {
          const isKeystone = isPrimary && slotIndex === 0;
          const size = isKeystone ? 34 : 24;
          return (
            <div
              key={slotIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: '10px minmax(0, 1fr)',
                alignItems: 'center',
                gap: 6,
                paddingTop: slotIndex > 0 ? 8 : 0,
                borderTop: slotIndex > 0 ? `1px solid rgba(115,128,150,0.18)` : 'none',
              }}
            >
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                marginLeft: 2,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              {slot.runes.map(rune => {
                const selected = selectedIds.includes(rune.id);
                return (
                  <div
                    key={rune.id}
                    style={{
                      opacity: selected ? 1 : 0.22,
                      transition: 'opacity 120ms ease, transform 120ms ease',
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      transform: selected ? 'scale(1)' : 'scale(0.94)',
                    }}
                    title={rune.name ?? `Rune ${rune.id}`}
                  >
                    <div style={{
                      width: size + (selected ? 6 : 2),
                      height: size + (selected ? 6 : 2),
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: selected ? '2px solid #2D73FF' : '1px solid transparent',
                      background: selected ? 'rgba(45,115,255,0.12)' : 'transparent',
                      boxShadow: selected ? '0 0 0 1px rgba(200,170,110,0.55) inset' : 'none',
                    }}>
                      <RuneImg id={rune.id} size={size} />
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RunePathCard({ label, runeId, runeName }: { label: string; runeId: number; runeName: string }) {
  return (
    <div style={{
      background: C.surfaceAlt,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 12,
    }}>
      <div style={{
        color: C.dim,
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #2D73FF',
          background: 'rgba(45,115,255,0.12)',
          boxShadow: '0 0 0 1px rgba(200,170,110,0.55) inset',
        }}>
          <RuneImg id={runeId} size={30} />
        </div>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{runeName}</span>
      </div>
    </div>
  );
}

// ── Skill order card ──────────────────────────────────────────────────────────
const ABILITY_COLORS: Record<string, string> = {
  Q: '#5FA8FF',
  W: '#50C878',
  E: '#AA88FF',
  R: '#C89B3C',
};

function deriveDisplayOrder(path: string[]): string {
  const firstSeen: Record<string, number> = {};
  path.forEach((letter, idx) => {
    const l = letter.toUpperCase();
    if (!(l in firstSeen)) firstSeen[l] = idx;
  });
  const order = Object.entries(firstSeen)
    .filter(([l]) => l !== 'R')
    .sort((a, b) => a[1] - b[1])
    .map(([l]) => l);
  return order.join('>');
}

function SkillOrderCard({ champion, order }: { champion: PublicChampionDetail; order: SkillPathDto }) {
  if (champion.spells.length < 4) return null;

  const levels = (order.path ?? order.sequence ?? []).slice(0, 18);
  if (levels.length === 0) {
    return <SmallNote text="Skill order data is still collecting for this build." />;
  }
  const levelAbility: Record<number, string> = {};
  levels.forEach((l, i) => { levelAbility[i + 1] = l.toUpperCase(); });

  // Skill priority
  const counts: Record<string, number> = { Q: 0, W: 0, E: 0 };
  levels.forEach(l => {
    const ul = l.toUpperCase();
    if (ul in counts) counts[ul]++;
  });
  const priority = ['Q', 'W', 'E'].sort((a, b) => counts[b] - counts[a]);

  const displayOrder = order.displayOrder?.trim() || deriveDisplayOrder(levels);
  const letterToSpell: Record<string, typeof champion.spells[0]> = {
    Q: champion.spells[0],
    W: champion.spells[1],
    E: champion.spells[2],
    R: champion.spells[3],
  };

  const wrc = wrColor(order.winRate);

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, color: '#fff', fontSize: 13, fontWeight: 700 }}>{displayOrder}</span>
        <StatBadge text={`${order.winRate.toFixed(1)}% WR`} color={wrc} />
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
        {order.games} matches · {order.pickRate.toFixed(1)}% pick
      </div>

      {/* Skill priority */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span style={{ color: C.dim, fontSize: 10 }}>Skill Priority</span>
        {priority.map((letter, i) => (
          <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <PriorityChip letter={letter} spell={letterToSpell[letter]} />
            {i < priority.length - 1 && (
              <span style={{ color: C.dim, fontSize: 11 }}>›</span>
            )}
          </div>
        ))}
      </div>

      {/* Level grid */}
      <div style={{ marginTop: 10 }}>
        <LevelGrid levelAbility={levelAbility} letterToSpell={letterToSpell} />
      </div>
    </div>
  );
}

function PriorityChip({ letter, spell }: { letter: string; spell?: { imageId: string; name: string } }) {
  const color = ABILITY_COLORS[letter] ?? '#fff';
  const ver = useContext(DDragonCtx);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      background: `${color}1F`,
      border: `1px solid ${color}59`,
      borderRadius: 6,
    }}>
      {spell && (
        <Image
          src={abilityIconUrl(spell.imageId, ver)}
          alt={spell.name}
          width={16}
          height={16}
          unoptimized
          style={{ borderRadius: 3 }}
        />
      )}
      <span style={{ color, fontSize: 11, fontWeight: 800 }}>{letter}</span>
    </div>
  );
}

function LevelGrid({
  levelAbility,
  letterToSpell,
}: {
  levelAbility: Record<number, string>;
  letterToSpell: Record<string, { imageId: string; name: string }>;
}) {
  const rows = ['Q', 'W', 'E', 'R'];
  const ver = useContext(DDragonCtx);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map(letter => {
        const spell = letterToSpell[letter];
        const color = ABILITY_COLORS[letter] ?? '#fff';
        return (
          <div key={letter} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Label */}
            <div style={{ width: 58, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              {spell && (
                <Image
                  src={abilityIconUrl(spell.imageId, ver)}
                  alt={spell.name}
                  width={22}
                  height={22}
                  unoptimized
                  style={{ borderRadius: 4 }}
                />
              )}
              <span style={{ color, fontSize: 11, fontWeight: 800 }}>{letter}</span>
            </div>
            {/* 18 cells */}
            <div style={{ display: 'flex', flex: 1, gap: 1 }}>
              {Array.from({ length: 18 }, (_, i) => {
                const level = i + 1;
                const active = levelAbility[level] === letter;
                return (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 22,
                      background: active ? `${color}38` : C.card,
                      border: `1px solid ${active ? `${color}99` : `${C.border}66`}`,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 8,
                      fontWeight: 700,
                      color: active ? color : 'transparent',
                    }}
                  >
                    {active ? level : ''}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillOrderUnavailable({ champion }: { champion: PublicChampionDetail }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 14,
    }}>
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        Real public skill-order data is not available yet.
      </div>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>
        The current pipeline tracks match stats, items, runes, counters, and synergies, but it does not
        ingest timeline skill-level-up events yet.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {champion.spells.map((spell, i) => {
          const hotkey = ['Q', 'W', 'E', 'R'][Math.min(i, 3)];
          return (
            <div key={i} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Image
                src={abilityIconUrl(spell.imageId)}
                alt={spell.name}
                width={28}
                height={28}
                unoptimized
                style={{ borderRadius: 6 }}
              />
              <span style={{ color: C.gold, fontSize: 11, fontWeight: 800 }}>{hotkey}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COUNTERS TAB
// ═══════════════════════════════════════════════════════════════════

const CANONICAL_ROLES = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

function normalizeRole(role?: string): string | undefined {
  if (!role) return undefined;
  const r = role.toUpperCase();
  if (r === 'MID') return 'MIDDLE';
  if (r === 'ADC') return 'BOTTOM';
  if (r === 'UTILITY') return 'SUPPORT';
  return r;
}

function CountersTab({
  counters,
}: {
  counters: PublicCountersResponse | null;
}) {
  const minGames = 1;
  const gamesOf = (e: MatchupDto) => e.matchCount ?? e.games ?? 0;
  const sortedCounters = [...(counters?.counters ?? [])]
    .filter(e => gamesOf(e) >= minGames)
    .sort((a, b) => a.winRate - b.winRate);
  const sortedFavorable = [...(counters?.favorable ?? [])]
    .filter(e => gamesOf(e) >= minGames)
    .sort((a, b) => b.winRate - a.winRate);
  const allMatchups = [...(counters?.counters ?? []), ...(counters?.favorable ?? [])];
  const goldSorted = allMatchups
    .filter(e => e.avgGoldDiff15 !== 0 && gamesOf(e) >= minGames)
    .sort((a, b) => a.avgGoldDiff15 - b.avgGoldDiff15);

  return (
    <div className="detail-content-stack">
      {/* Note strip */}
      {counters?.note && (
        <div style={{
          padding: '8px 12px',
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          color: C.dim,
          fontSize: 11,
          lineHeight: 1.4,
        }}>
          {counters.note}
        </div>
      )}

      {/* Responsive 3-col layout */}
      <CountersPanels
        counters={sortedCounters}
        favorable={sortedFavorable}
        goldSorted={goldSorted}
        championName={counters?.championName ?? ''}
      />

    </div>
  );
}

function SynergiesTab({
  synergies,
  championRole,
}: {
  synergies: SynergyDto[];
  championRole?: string;
}) {
  const normalizedChampionRole = normalizeRole(championRole);
  const allyRoles = CANONICAL_ROLES.filter(r => r !== normalizedChampionRole);
  const [allyRoleFilter, setAllyRoleFilter] = useState<string | null>(null);
  const visibleSynergies = allyRoleFilter
    ? synergies.filter(s => s.allyRole?.toUpperCase() === allyRoleFilter)
    : synergies;

  return (
    <div className="detail-content-stack">
      <PanelCard title="Best Synergies">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            onClick={() => setAllyRoleFilter(null)}
            style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${!allyRoleFilter ? C.gold : C.border}`,
              background: !allyRoleFilter ? `${C.gold}20` : 'transparent',
              color: !allyRoleFilter ? C.gold : C.muted,
            }}
          >All</button>
          {allyRoles.map(role => (
            <button
              key={role}
              onClick={() => setAllyRoleFilter(role === allyRoleFilter ? null : role)}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${allyRoleFilter === role ? C.gold : C.border}`,
                background: allyRoleFilter === role ? `${C.gold}20` : 'transparent',
                color: allyRoleFilter === role ? C.gold : C.muted,
              }}
            >
              {ROLE_LABELS[role] ?? role}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleSynergies.length === 0 ? (
            <span style={{ color: C.muted, fontSize: 12 }}>No synergy data for this role yet.</span>
          ) : (
            visibleSynergies.map((s, i) => (
              <SynergyRow key={i} synergy={s} />
            ))
          )}
        </div>
      </PanelCard>
    </div>
  );
}

function CountersPanels({
  counters,
  favorable,
  goldSorted,
  championName,
}: {
  counters: MatchupDto[];
  favorable: MatchupDto[];
  goldSorted: MatchupDto[];
  championName: string;
}) {
  const bestPicksPanel = (
    <CounterPanel
      title={`Best Picks vs ${championName}`}
      subtitle={`Champions that beat ${championName} — highest win rate.`}
      accentColor={C.green}
      entries={counters.slice(0, 15)}
      emptyText="No counter data yet."
      trailingLabel={e => `${(100 - e.winRate).toFixed(1)}% WR`}
      trailingColor={e => {
        const wr = 100 - e.winRate;
        return wr >= 55 ? C.green : wr >= 52 ? C.gold : C.muted;
      }}
      progress={e => (100 - e.winRate) / 100}
    />
  );

  const worstPicksPanel = (
    <CounterPanel
      title={`Worst Picks vs ${championName}`}
      subtitle={`Champions ${championName} beats — lowest win rate.`}
      accentColor={C.red}
      entries={favorable.slice(0, 15)}
      emptyText="No favorable matchup data yet."
      trailingLabel={e => `${(100 - e.winRate).toFixed(1)}% WR`}
      trailingColor={e => {
        const wr = 100 - e.winRate;
        return wr <= 45 ? C.red : wr <= 48 ? C.gold : C.muted;
      }}
      progress={e => (100 - e.winRate) / 100}
    />
  );

  const lanePanel = (
    <CounterPanel
      title={`Best Lane Counters vs ${championName}`}
      subtitle={`Highest gold lead at 15 min against ${championName}.`}
      accentColor={C.gold}
      entries={goldSorted.slice(0, 15)}
      emptyText="No gold diff data yet."
      trailingLabel={e => {
        const gd = -e.avgGoldDiff15;
        return `${gd >= 0 ? '+' : ''}${gd} GD15`;
      }}
      trailingColor={e => {
        const gd = -e.avgGoldDiff15;
        return gd > 0 ? C.green : gd < 0 ? C.red : C.muted;
      }}
    />
  );

  return (
    <div className="counters-layout" style={{ display: 'flex', gap: 12 }}>
      <style>{`
        @media (min-width: 900px) { .counters-layout { flex-wrap: nowrap !important; } .counters-col { flex: 1 !important; } }
        @media (min-width: 580px) and (max-width: 899px) { .counters-layout { flex-wrap: wrap !important; } .counters-col { flex: 1 1 calc(50% - 6px) !important; } }
        @media (max-width: 579px) { .counters-layout { flex-direction: column !important; } .counters-col { flex: none !important; width: 100% !important; } }
      `}</style>
      <div className="counters-col">{bestPicksPanel}</div>
      <div className="counters-col">{worstPicksPanel}</div>
      <div className="counters-col">{lanePanel}</div>
    </div>
  );
}

function CounterPanel({
  title,
  subtitle,
  accentColor,
  entries,
  emptyText,
  trailingLabel,
  trailingColor,
  progress,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  entries: MatchupDto[];
  emptyText: string;
  trailingLabel: (e: MatchupDto) => string;
  trailingColor: (e: MatchupDto) => string;
  progress?: (e: MatchupDto) => number;
}) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ color: accentColor, fontSize: 14 }}>●</span>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ color: C.dim, fontSize: 10, lineHeight: 1.4, marginBottom: 10 }}>{subtitle}</div>

      {entries.length === 0 ? (
        <span style={{ color: C.muted, fontSize: 11 }}>{emptyText}</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((e, i) => {
            const tc = trailingColor(e);
            const prog = progress?.(e);
            const championId = e.enemyChampionId ?? e.championName ?? e.enemyChampionName ?? '';
            const championName = e.enemyChampionName ?? e.championName ?? championId;
            const games = e.matchCount ?? e.games ?? 0;
            return (
              <Link
                key={i}
                href={`/champions/${championId}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image
                      src={championIconUrl(championId)}
                      alt={championName}
                      width={36}
                      height={36}
                      unoptimized
                      style={{ borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{championName}</div>
                      <div style={{ color: C.dim, fontSize: 10 }}>{games} games</div>
                    </div>
                    <div style={{ color: tc, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {trailingLabel(e)}
                    </div>
                  </div>
                  {prog !== undefined && (
                    <div style={{
                      height: 3,
                      background: C.border,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(Math.max(prog * 100, 0), 100)}%`,
                        background: tc,
                        borderRadius: 2,
                      }} />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SynergyRow({ synergy }: { synergy: SynergyDto }) {
  const roleLabel = ROLE_LABELS[synergy.allyRole] ?? synergy.allyRole;
  const championId = synergy.allyChampionId ?? synergy.allyChampionName ?? synergy.championName ?? '';
  const championName = synergy.allyChampionName ?? synergy.championName ?? championId;
  const games = synergy.matchCount ?? synergy.games ?? 0;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
    }}>
      <Image
        src={championIconUrl(championId)}
        alt={championName}
        width={34}
        height={34}
        unoptimized
        style={{ borderRadius: 8, border: `1px solid ${C.border}` }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{championName}</div>
        <div style={{ color: C.dim, fontSize: 10 }}>{roleLabel} | {games} games</div>
      </div>
      <div style={{ color: wrColor(synergy.winRate), fontSize: 12, fontWeight: 800 }}>
        {synergy.winRate.toFixed(1)}% WR
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STATS TAB
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${C.card} 0%, ${C.surface} 100%)`,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 14,
    }}>
      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function StatBadge({ text, color }: { text: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      padding: '4px 8px',
      background: `${color}1F`,
      border: `1px solid ${color}4D`,
      borderRadius: 6,
      color,
      fontSize: 10,
      fontWeight: 700,
    }}>
      {text}
    </div>
  );
}

function SmallNote({ text }: { text: string }) {
  return (
    <div style={{
      background: C.surfaceAlt,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 12,
      color: C.muted,
      fontSize: 11,
      lineHeight: 1.5,
    }}>
      {text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>{text}</div>
  );
}

function ItemImg({ item, size }: { item: ItemDto; size: number }) {
  const ver = useContext(DDragonCtx);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} title={item.name}>
      <Image
        src={itemIconUrl(item.imageId, ver)}
        alt={item.name}
        width={size}
        height={size}
        unoptimized
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, display: 'block' }}
      />
    </div>
  );
}

function RuneImg({ id, size }: { id: number; size: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveRuneIconUrl(id).then(url => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          border: `1px solid ${C.border}`,
          background: C.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.dim,
          fontSize: Math.max(9, Math.floor(size * 0.28)),
          fontWeight: 700,
        }}
      >
        ?
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`rune-${id}`}
      width={size}
      height={size}
      unoptimized
      style={{ borderRadius: 4, display: 'block' }}
    />
  );
}
