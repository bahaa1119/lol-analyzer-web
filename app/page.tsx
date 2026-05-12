import { api } from '@/lib/api';
import { TierListClient } from '@/components/TierListClient';
import { SearchHero } from '@/components/SearchHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LoL Analyzer - Tier List, Builds & Summoner Stats',
  description: 'League of Legends tier list, champion builds and summoner lookup powered by Challenger and Grandmaster match data. Updated every patch.',
};

export default async function HomePage() {
  const [tierList, meta] = await Promise.all([
    api.getTierList({ scope: 'patch' }).catch(() => null),
    api.getMetaContext().catch(() => null),
  ]);

  return (
    <div>
      <SearchHero champions={tierList?.entries ?? []} />

      {tierList ? (
        <TierListClient initialData={tierList} meta={meta} />
      ) : (
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 22, padding: 40, textAlign: 'center', color: 'var(--text-subtle)' }}>
          Tier list unavailable. Please try again later.
        </div>
      )}
    </div>
  );
}
