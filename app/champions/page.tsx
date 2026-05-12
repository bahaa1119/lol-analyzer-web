import { api } from '@/lib/api';
import { championIconUrl, tierColor, pct, ROLE_LABELS } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Champions – Builds, Tier & Stats',
  description: 'Browse all League of Legends champions. Click any champion to see builds, runes, counters and tier placement from high-elo match data.',
};

export default async function ChampionsPage() {
  const tierList = await api.getTierList({ scope: 'patch' }).catch(() => null);

  if (!tierList) {
    return <div className="panel text-center py-16 text-[#738096]">Champions unavailable. Try again later.</div>;
  }

  const byChampion = new Map<string, typeof tierList.entries[0]>();
  for (const entry of tierList.entries) {
    if (!byChampion.has(entry.championId)) byChampion.set(entry.championId, entry);
  }
  const champions = Array.from(byChampion.values()).sort((a, b) =>
    a.championName.localeCompare(b.championName),
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-[#C8AA6E] text-xs font-bold tracking-widest uppercase mb-2">Champions</p>
        <h1 className="text-3xl font-extrabold tracking-tight">All Champions</h1>
        <p className="text-[#738096] text-sm mt-1">{champions.length} champions · Patch {tierList.patch}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {champions.map(c => {
          const color = tierColor(c.tier);
          return (
            <Link
              key={c.championId}
              href={`/champions/${c.championId}`}
              className="panel p-3 flex flex-col items-center gap-2 hover:border-[#C8AA6E]/40 transition-colors text-center"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--border-2)]">
                <Image
                  src={championIconUrl(c.championId)}
                  alt={c.championName}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="font-bold text-sm text-[#F3F4F6] leading-tight">{c.championName}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold" style={{ color }}>{c.tier}</span>
                <span className="text-xs text-[#738096]">{pct(c.winRate)} WR</span>
              </div>
              <p className="text-xs text-[#738096]">{ROLE_LABELS[c.role] ?? c.role}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
