const DDRAGON_FALLBACK = process.env.NEXT_PUBLIC_DDRAGON_VERSION ?? '16.9.1';
let _cachedVersion: string | null = null;

export async function getLatestDDragonVersion(): Promise<string> {
  if (_cachedVersion) return _cachedVersion;
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
      next: { revalidate: 86400 },
    });
    const versions = (await res.json()) as string[];
    _cachedVersion = versions[0] ?? DDRAGON_FALLBACK;
    return _cachedVersion;
  } catch {
    return DDRAGON_FALLBACK;
  }
}

const DDRAGON_VERSION = DDRAGON_FALLBACK;

export function tierColor(tier: string): string {
  switch (tier) {
    case 'S+': return '#e8c86e';
    case 'S':  return '#c8aa6e';
    case 'A':  return '#4fbf8f';
    case 'B':  return '#5fa8ff';
    case 'C':  return '#b4becc';
    case 'D':  return '#e06767';
    default:   return '#738096';
  }
}

export function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

const CHAMPION_ASSET_ID_OVERRIDES: Record<string, string> = {
  aurelionsol: 'AurelionSol',
  belveth: 'Belveth',
  chogath: 'Chogath',
  drmundo: 'DrMundo',
  fiddlesticks: 'Fiddlesticks',
  jarvaniv: 'JarvanIV',
  kaisa: 'Kaisa',
  khazix: 'Khazix',
  kogmaw: 'KogMaw',
  ksante: 'KSante',
  leblanc: 'Leblanc',
  leesin: 'LeeSin',
  masteryi: 'MasterYi',
  missfortune: 'MissFortune',
  monkeyking: 'MonkeyKing',
  nunu: 'Nunu',
  nunuwillump: 'Nunu',
  reksai: 'RekSai',
  renata: 'Renata',
  renataglasc: 'Renata',
  tahmkench: 'TahmKench',
  twistedfate: 'TwistedFate',
  velkoz: 'Velkoz',
  wukong: 'MonkeyKing',
  xinzhao: 'XinZhao',
};

function encodeChampionId(id?: string | null): string {
  const raw = (id ?? '').trim();
  if (!raw) return 'Aatrox';
  const compact = raw.replace(/\s*&\s*/g, '').replace(/ /g, '').replace(/'/g, '').replace(/\./g, '');
  const key = compact.toLowerCase();
  return CHAMPION_ASSET_ID_OVERRIDES[key] ?? compact;
}

export function championSplashUrl(id?: string | null): string {
  const encoded = encodeChampionId(id);
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${encoded}_0.jpg`;
}

export function championIconUrl(id?: string | null): string {
  const encoded = encodeChampionId(id);
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${encoded}.png`;
}

export function itemIconUrl(itemId: string, version = DDRAGON_VERSION): string {
  const normalized = itemId.endsWith('.png') ? itemId : `${itemId}.png`;
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${normalized}`;
}

function normalizeImageName(imageId: string): string {
  return imageId.endsWith('.png') ? imageId : `${imageId}.png`;
}

export function abilityIconUrl(imageId: string, version = DDRAGON_VERSION): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${normalizeImageName(imageId)}`;
}

export function passiveIconUrl(imageId: string, version = DDRAGON_VERSION): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${normalizeImageName(imageId)}`;
}

export type RuneTreeDto = {
  id: number;
  key?: string;
  name: string;
  icon?: string;
  slots: Array<{
    runes: Array<{
      id: number;
      name?: string;
      icon: string;
    }>;
  }>;
};

let runeIconMapPromise: Promise<Map<number, string>> | null = null;
let runeTreePromise: Promise<RuneTreeDto[]> | null = null;

export async function getRuneTrees(): Promise<RuneTreeDto[]> {
  if (!runeTreePromise) {
    runeTreePromise = getLatestDDragonVersion().then(version =>
      fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`,
        { next: { revalidate: 86400 } },
      )
        .then(res => res.json() as Promise<RuneTreeDto[]>)
        .catch(() => []),
    );
  }

  return runeTreePromise;
}

export async function resolveRuneIconUrl(runeId: number): Promise<string | null> {
  if (!runeIconMapPromise) {
    runeIconMapPromise = getRuneTrees()
      .then(trees => {
        const map = new Map<number, string>();
        for (const tree of trees) {
          if (tree.icon) {
            map.set(tree.id, `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`);
          }
          for (const slot of tree.slots) {
            for (const rune of slot.runes) {
              map.set(rune.id, `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`);
            }
          }
        }
        return map;
      })
      .catch(() => new Map<number, string>());
  }

  const iconMap = await runeIconMapPromise;
  return iconMap.get(runeId) ?? null;
}

export const ROLES = ['TOP', 'JUNGLE', 'MID', 'BOTTOM', 'SUPPORT'];

export const ROLE_LABELS: Record<string, string> = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MID: 'Mid',
  MIDDLE: 'Mid',
  BOTTOM: 'ADC',
  ADC: 'ADC',
  SUPPORT: 'Support',
  UTILITY: 'Support',
};

export function formatLeagueRank(tier?: string | null, rank?: string | null): string {
  const normalizedTier = (tier ?? '').trim();
  const normalizedRank = (rank ?? '').trim();

  if (!normalizedTier) return 'Unranked';
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(normalizedTier.toUpperCase())) {
    return normalizedTier;
  }
  if (!normalizedRank) return normalizedTier;
  return `${normalizedTier} ${normalizedRank}`;
}
