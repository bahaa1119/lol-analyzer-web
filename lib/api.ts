import type {
  TierListResponse,
  MetaContext,
  PublicAccountResponse,
  MetaFilters,
  RankReadinessResponse,
  MatchDetailsResponse,
  MatchAnalysisResponse,
  PreGameOverview,
  PublicChampionDetail,
  PublicBuildsResponse,
  PublicCountersResponse,
  PublicSynergiesResponse,
  PublicChampionOverviewResponse,
  ConnectRiotProfileResponse,
  MatchSummaryDto,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://lol-analyzer-backend-production.up.railway.app';

type RequestOptions = {
  params?: Record<string, string>;
  token?: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  revalidate?: number | false;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, token, method = 'GET', body, revalidate = 300 } = options;
  let url = `${BASE}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    url += '?' + new URLSearchParams(params).toString();
  }

  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: revalidate === false ? 'no-store' : undefined,
    next: revalidate === false ? undefined : { revalidate },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

async function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  return request<T>(endpoint, { params });
}

function filtersToParams(filters: MetaFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.role)   params.role   = filters.role;
  if (filters.patch)  params.patch  = filters.patch;
  if (filters.scope)  params.scope  = filters.scope;
  if (filters.queue)  params.queue  = filters.queue;
  if (filters.region) params.region = filters.region;
  return params;
}

function mapItem(raw: Record<string, unknown>): PublicBuildsResponse['startingItems'][number] {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    imageId: String(raw.imageId ?? ''),
    goldTotal: typeof raw.goldTotal === 'number' ? raw.goldTotal : 0,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    games: typeof raw.games === 'number' ? raw.games : 0,
    wins: typeof raw.wins === 'number' ? raw.wins : 0,
    winRate: typeof raw.winRate === 'number' ? raw.winRate : 0,
    pickRate: typeof raw.pickRate === 'number' ? raw.pickRate : 0,
  };
}

function mapRunePages(raw: unknown): PublicBuildsResponse['runePages'] {
  return Array.isArray(raw) ? (raw as PublicBuildsResponse['runePages']) : [];
}

function mapSkillOrders(raw: unknown): PublicBuildsResponse['skillOrders'] {
  return Array.isArray(raw) ? (raw as PublicBuildsResponse['skillOrders']) : [];
}

function mapItemCombo(raw: unknown): PublicBuildsResponse['startingCombo'] {
  // Flat array: each element is an ItemDto with its own winRate/pickRate
  if (Array.isArray(raw)) {
    return {
      items: raw.map(entry => mapItem(entry as Record<string, unknown>)),
      winRate: 0,
      games: 0,
    };
  }
  const combo = (raw as Record<string, unknown> | undefined) ?? {};
  return {
    items: Array.isArray(combo.items)
      ? combo.items.map(entry => mapItem(entry as Record<string, unknown>))
      : [],
    winRate: typeof combo.winRate === 'number' ? combo.winRate : 0,
    games: typeof combo.games === 'number' ? combo.games : 0,
  };
}

function mapItemSlots(raw: unknown): PublicBuildsResponse['itemSlots'] {
  const slots = Array.isArray(raw) ? raw : [];
  return slots.map(slot => {
    const entry = slot as Record<string, unknown>;
    return {
      slot: typeof entry.slot === 'number' ? entry.slot : 0,
      label: String(entry.label ?? ''),
      items: Array.isArray(entry.items)
        ? entry.items.map(item => mapItem(item as Record<string, unknown>))
        : [],
    };
  });
}

function mapStyle(raw: Record<string, unknown>): PublicBuildsResponse['styles'][number] {
  const defaultBuild = (raw.defaultBuild as Record<string, unknown> | undefined) ?? raw;
  const startingCombo = mapItemCombo(raw.startingCombo ?? defaultBuild.startingCombo ?? raw.startingItems ?? defaultBuild.startingItems);
  const coreCombo = mapItemCombo(raw.coreCombo ?? defaultBuild.coreCombo ?? raw.coreItems ?? defaultBuild.coreItems);
  const itemSlots = mapItemSlots(raw.itemSlots ?? defaultBuild.itemSlots);
  const runePages = mapRunePages(raw.runePages ?? defaultBuild.runePages);
  const skillOrders = mapSkillOrders(raw.skillOrders ?? defaultBuild.skillOrders);

  return {
    keystoneId: typeof raw.keystoneId === 'number' ? raw.keystoneId : 0,
    keystoneName: String(raw.keystoneName ?? ''),
    games: typeof raw.games === 'number' ? raw.games : 0,
    wins: typeof raw.wins === 'number' ? raw.wins : 0,
    winRate: typeof raw.winRate === 'number' ? raw.winRate : 0,
    pickRate: typeof raw.pickRate === 'number' ? raw.pickRate : 0,
    startingCombo,
    coreCombo,
    startingItems: startingCombo.items,
    coreItems: coreCombo.items,
    boots: Array.isArray(raw.boots) ? raw.boots.map(entry => mapItem(entry as Record<string, unknown>)) : [],
    situationalItems: Array.isArray(raw.situationalItems)
      ? raw.situationalItems.map(entry => mapItem(entry as Record<string, unknown>))
      : [],
    itemSlots,
    runePages,
    skillOrders,
  };
}

async function getBuilds(id: string, filters: MetaFilters = {}): Promise<PublicBuildsResponse> {
  const params = filtersToParams(filters);
  const d = await request<Record<string, unknown>>(`/public/champions/${id}/builds`, { params });
  const defaultBuild = (d.defaultBuild as Record<string, unknown> | undefined) ?? d;
  const sample = (d.sample as Record<string, unknown> | undefined) ?? {};
  const startingCombo = mapItemCombo(defaultBuild.startingCombo ?? defaultBuild.startingItems);
  const coreCombo = mapItemCombo(defaultBuild.coreCombo ?? defaultBuild.coreItems);
  const itemSlots = mapItemSlots(d.itemSlots ?? defaultBuild.itemSlots);
  const runePages = mapRunePages(d.runePages ?? defaultBuild.runePages);
  const skillOrders = mapSkillOrders(d.skillOrders ?? defaultBuild.skillOrders);

  return {
    championId: (d.championId as string | undefined) ?? '',
    championName: (d.championName as string | undefined) ?? '',
    role: ((d.filters as { role?: string } | undefined)?.role ?? (d.role as string | undefined) ?? 'all'),
    note: (d.note as string | undefined) ?? '',
    fallbackPatch: (d.fallbackPatch as string | undefined) ?? '',
    sampleSize: (sample.matchCount as number | undefined) ?? (d.sampleSize as number | undefined) ?? 0,
    suppressed: (sample.suppressed as boolean | undefined) ?? false,
    suppressionReason: sample.suppressionReason as string | undefined,
    startingCombo,
    coreCombo,
    startingItems: startingCombo.items,
    coreItems: coreCombo.items,
    boots: Array.isArray(defaultBuild.boots)
      ? defaultBuild.boots.map(entry => mapItem(entry as Record<string, unknown>))
      : [],
    situationalItems: Array.isArray(defaultBuild.situationalItems)
      ? defaultBuild.situationalItems.map(entry => mapItem(entry as Record<string, unknown>))
      : [],
    itemSlots,
    runePages,
    skillOrders,
    styles: Array.isArray(d.styles)
      ? d.styles.map(entry => mapStyle(entry as Record<string, unknown>))
      : [],
  };
}

async function getChampionOverview(id: string, filters: MetaFilters = {}): Promise<PublicChampionOverviewResponse> {
  const d = await request<Record<string, unknown>>(`/public/champions/${id}/overview`, { params: filtersToParams(filters) });
  const stats = (d.stats as Record<string, unknown> | undefined) ?? {};
  return {
    championId: (d.championId as string | undefined) ?? '',
    championName: (d.championName as string | undefined) ?? '',
    winRate: typeof stats.winRate === 'number' ? stats.winRate : 0,
    pickRate: typeof stats.pickRate === 'number' ? stats.pickRate : 0,
    roles: (d.roles as PublicChampionOverviewResponse['roles'] | undefined) ?? [],
    note: (d.note as string | undefined) ?? '',
  };
}

export async function getAuthed<T>(
  endpoint: string,
  token: string,
  params?: Record<string, string>,
): Promise<T> {
  return request<T>(endpoint, {
    params,
    token,
    revalidate: false,
  });
}

export async function postAuthed<T>(
  endpoint: string,
  token: string,
  body: Record<string, unknown>,
): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    token,
    body,
    revalidate: false,
  });
}

export const api = {
  getTierList:         (filters: MetaFilters = {}) => get<TierListResponse>('/public/tier-list', filtersToParams(filters)),
  getMetaContext:      ()                           => get<MetaContext>('/public/meta/context'),
  getChampionDetail:   (id: string)                 => get<PublicChampionDetail>(`/public/champions/${id}`),
  getChampionOverview,
  getBuilds:           (id: string, filters: MetaFilters = {}) => getBuilds(id, filters),
  getCounters:         (id: string, filters: MetaFilters = {}) => get<PublicCountersResponse>(`/public/champions/${id}/counters`, filtersToParams(filters)),
  getSynergies:        (id: string, filters: MetaFilters = {}) => get<PublicSynergiesResponse>(`/public/champions/${id}/synergies`, filtersToParams(filters)),

  searchAccount: (gameName: string, tagLine: string, platformCode: string, count = 10) =>
    get<PublicAccountResponse>('/public/account/search', { gameName, tagLine, platformCode, count: String(count) }),

  getRankReadiness: (puuid: string, platformCode: string, window = 20) =>
    get<RankReadinessResponse>('/public/account/rank-readiness', { puuid, platformCode, window: String(window) }),

  getMatchDetails: (matchId: string, puuid: string, platformCode: string) =>
    get<MatchDetailsResponse>(`/public/account/matches/${matchId}`, { puuid, platformCode }),

  getMatchAnalysis: (matchId: string, puuid: string, platformCode: string) =>
    get<MatchAnalysisResponse>(`/public/account/matches/${matchId}/analysis`, { puuid, platformCode }),

  getLiveGame: (puuid: string, platformCode: string) =>
    get<PreGameOverview>('/public/account/live-game', { puuid, platformCode }),

  getMyProfile: (token: string) =>
    getAuthed<ConnectRiotProfileResponse>('/profile/me', token),

  connectRiotProfile: (
    token: string,
    body: { gameName: string; tagLine: string; platformCode: string },
  ) => postAuthed<ConnectRiotProfileResponse>('/riot-profile/connect', token, body),

  getRecentMatches: async (token: string, options?: { forceRefresh?: boolean }) => {
    const data = await getAuthed<{ success: boolean; matches: MatchSummaryDto[]; timestamp: string }>(
      '/matches/recent',
      token,
      options?.forceRefresh ? { force: 'true' } : undefined,
    );
    return data.matches ?? [];
  },
};
