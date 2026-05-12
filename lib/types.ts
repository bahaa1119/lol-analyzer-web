export interface TierListEntry {
  championId: string;
  championName: string;
  tier: string;
  role: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  matchCount: number;
  patch: string;
}

export interface TierListResponse {
  entries: TierListEntry[];
  patch: string;
  scope: string;
  note: string;
  lastUpdatedAt: string;
}

export interface MetaContext {
  currentPatch: string;
  patches: string[];
  roles: string[];
  scopes: string[];
}

export interface ItemSlot {
  itemId: string;
  itemName: string;
  winRate: number;
  games: number;
}

export interface RunePage {
  primaryPath: string;
  primaryKeystone: string;
  secondaryPath: string;
  perks: string[];
  winRate: number;
  games: number;
}

export interface BuildData {
  startingItems: ItemSlot[];
  boots: ItemSlot[];
  coreItems: ItemSlot[];
  situationalItems: ItemSlot[];
  runes: RunePage[];
}

export interface ChampionOverview {
  championId: string;
  championName: string;
  role: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  matches: number;
  tier: string;
  patch: string;
}

export interface CounterEntry {
  championId: string;
  championName: string;
  winRate: number;
  games: number;
  advantage: number;
}

export interface CountersData {
  strongAgainst: CounterEntry[];
  weakAgainst: CounterEntry[];
}

export interface SynergyEntry {
  championId: string;
  championName: string;
  winRate: number;
  games: number;
}

export interface ChampionDetail {
  championId: string;
  championName: string;
  roles: string[];
}

// ── Account / Summoner ──────────────────────────────────────────────────────

export interface PublicAccountProfile {
  puuid: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  regionLabel: string;
  platformCode: string;
  profileIconId: number | null;
  summonerLevel: number | null;
}

export interface PublicRankCard {
  label: string;
  queueType: string;
  isRanked: boolean;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number; // integer 0-100
}

export interface PublicChampionStat {
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number; // integer 0-100
  avgKda: number;
  avgCarry: number | null;
}

export interface MatchSummaryDto {
  matchId: string;
  championName: string;
  result: boolean;   // true = win
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  durationSeconds: number;
  queueId: string;
  queueLabel: string;
  matchDate: string;
  hasAnalysis: boolean;
  score: number | null;
  carryScore: number | null;
  isMvp: boolean;
  isRemake: boolean;
}

export interface PublicAccountResponse {
  account: PublicAccountProfile;
  rankedSolo: PublicRankCard;
  rankedFlex: PublicRankCard;
  championStats: PublicChampionStat[];
  matches: MatchSummaryDto[];
  availableMatchCount: number;
  returnedMatchCount: number;
  hasMoreMatches: boolean;
  timestamp: string;
}

export type MetaFilters = {
  role?: string;
  patch?: string;
  scope?: string;
  queue?: string;
  region?: string;
};

export interface RiotId {
  gameName: string;
  tagLine: string;
}

export interface ConnectedProfile {
  puuid: string;
  riotId: RiotId;
  regionLabel: string;
  platformCode: string;
  lastUpdated: string;
}

export interface ConnectRiotProfileResponse {
  success: boolean;
  profile?: ConnectedProfile;
  error?: string;
  timestamp: string;
}

// ── Match Details ────────────────────────────────────────────────────────────

export interface Participant {
  puuid?: string;
  summonerName: string;
  championName: string;
  role?: string;
  teamId?: number;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt?: number;
  damageDealt?: number;
  goldEarned?: number;
  gold?: number;
  visionScore?: number;
  cs?: number;
  win?: boolean;
  isBlueTeam?: boolean;
  isCurrentPlayer?: boolean;
  isLaneOpponent?: boolean;
}

export interface MatchDetailsResponse {
  matchId: string;
  championName: string;
  result: boolean;
  role: string;
  queueLabel: string;
  durationSeconds: number;
  matchDate: string;
  matchDateLabel: string;
  kills: number;
  deaths: number;
  assists: number;
  csPerMin: number;
  visionScore: number;
  damageDealt: number;
  goldEarned: number;
  laneOpponentName: string;
  laneOpponentChampionName: string | null;
  laneOpponentKills: number;
  laneOpponentDeaths: number;
  laneVerdict: string;
  analysisScore: number;
  analysisGrade: string;
  strengths: string[];
  mistakes: string[];
  tips: string[];
  hasAnalysis: boolean;
  participants: Participant[];
}

// ── Match Analysis ────────────────────────────────────────────────────────────

export interface AnalysisBehaviorTag {
  code: string;
  label: string;
  category: string;
  severity: string;
  confidence: number;
  summary: string;
}

export interface AnalysisDecisionWindow {
  id: string;
  phase: string;
  title: string;
  timestampLabel: string | null;
  evaluation: string;
  confidence: number;
  state: string;
  intent: string;
  decision: string;
  outcome: string;
  betterOption: string;
  behaviorCode: string | null;
}

export interface AnalysisSection {
  score: number;
  phase: string;
  summary: string;
  keyEvents: string[];
}

export interface MatchAnalysisMetrics {
  csPerMin: number;
  cs10: number | null;
  firstItemTimingMin: number | null;
  kda: number;
  killParticipation: number;
  visionScore: number;
  damageShare: number;
  damageRank: number;
  objectiveScore: number;
  objectiveParticipation: number;
  laneGoldDiff10: number | null;
  laneCsDiff10: number | null;
  laneXpDiff10: number | null;
  laneSoloKills: number;
  laneSoloDeaths: number;
  earlyDeaths: number;
  lateDeaths: number;
  throwDeaths: number;
  objectivePunishDeaths: number;
  gankedDeaths: number;
}

export interface MatchAnalysisResponse {
  matchId: string;
  championName: string;
  role: string;
  archetype: string | null;
  laneOpponentName: string;
  laneOpponentChampionName: string | null;
  laneVerdict: string;
  overallScore: number;
  overallGrade: string;
  confidenceScore: number | null;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  roleInsights: string[];
  archetypeInsights: string[];
  laneInsights: string[];
  objectiveInsights: string[];
  deathInsights: string[];
  improvementFocus: string[];
  nextGameFocus: string | null;
  behaviorTags: AnalysisBehaviorTag[];
  decisionWindows: AnalysisDecisionWindow[];
  metrics: MatchAnalysisMetrics;
  early: AnalysisSection;
  mid: AnalysisSection;
  late: AnalysisSection;
}

// ── Rank Readiness ──────────────────────────────────────────────────────────

export interface RankReadinessPillar {
  key: string;
  label: string;
  benchmarkBracket: string | null;
  summary: string;
  score: number | null;
}

export interface RankReadinessRecord {
  wins: number;
  losses: number;
  winRate: number;
}

export interface RankReadinessTrend {
  trend: string;
  summary: string;
}

export interface RankReadinessChampionStat {
  championName: string;
  games: number;
  wins: number;
  winRate: number;
  avgKda: number;
}

export interface RankReadinessMetricRow {
  key: string;
  label: string;
  unit: string;
  userValue: number | null;
  benchmarkValue: number | null;
  difference: number | null;
  status: string;
  benchmarkLabel: string;
}

// ── Live Game (Pregame) ──────────────────────────────────────────────────────

export interface BannedChampion {
  teamId: number;
  championName: string;
}

export interface PreGameParticipant {
  puuid: string;
  summonerName: string;
  teamId: number;
  championId: string;
  championName: string;
  spell1Name: string;
  spell2Name: string;
  soloRank: string | null;
  soloLp: number | null;
  soloWins: number;
  soloLosses: number;
  soloWinRate: number | null;
  tierRank: number;
  recentGames: number;
  recentWinRate: number | null;
  recentKda: string | null;
  metaWinRate: number | null;
  metaSampleSize: number;
  matchupWr: number | null;
  isYou: boolean;
}

export interface PreGameOverview {
  inGame: boolean;
  gameId: number | null;
  queueId: number | null;
  queueLabel: string | null;
  gameLength: number | null;
  region: string | null;
  patch: string | null;
  blueTeam: PreGameParticipant[];
  redTeam: PreGameParticipant[];
  bannedChampions: BannedChampion[];
  preGameNotes: string[];
}

export interface RankReadinessResponse {
  window: number;
  gamesAnalyzed: number;
  rankReadinessScore: number | null;
  status: string;
  performanceTier: string | null;
  confidence: string;
  summary: string;
  role: string;
  bestRole: string | null;
  bestChampion: string | null;
  nextImprovementFocus: string | null;
  biggestGap: string | null;
  strengths: string[];
  weaknesses: string[];
  pillars: RankReadinessPillar[];
  comparisonRows: RankReadinessMetricRow[];
  recentRecord: RankReadinessRecord;
  trend: RankReadinessTrend;
  bestChampions: RankReadinessChampionStat[];
  worstChampions: RankReadinessChampionStat[];
  disclaimer: string;
}

// ── Champion detail ──────────────────────────────────────────────────────────

export interface ChampionStats {
  hp: number;
  mp: number;
  moveSpeed: number;
  armor: number;
  spellBlock: number;
  attackRange: number;
  attackDamage: number;
  attackSpeed: number;
}

export interface ChampionPassive {
  name: string;
  description: string;
  imageId: string;
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  maxRank: number;
  imageId: string;
}

export interface PublicChampionDetail {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  partype: string;
  imageId: string;
  blurb: string;
  lore: string;
  stats: ChampionStats;
  passive: ChampionPassive;
  spells: ChampionSpell[];
  primaryRole: string | null;
}

// ── Build ────────────────────────────────────────────────────────────────────

export interface ItemDto {
  id: string;
  name: string;
  imageId: string;
  goldTotal?: number;
  tags?: string[];
  games?: number;
  wins?: number;
  winRate?: number;
  pickRate?: number;
}

export interface ItemComboDto {
  items: ItemDto[];
  winRate: number;
  games: number;
}

export interface ItemSlotDto {
  slot: number;
  label: string;
  items: ItemDto[];
}

export interface RunePageDto {
  keystoneId: number;
  keystoneName: string;
  primaryStyleId: number;
  primaryStyleName: string;
  secondaryStyleId: number;
  secondaryStyleName: string;
  perks: number[];
  perkNames: string[];
  sampleSize: number;
  wins: number;
  winRate: number;
  pickRate: number;
}

export interface SkillPathDto {
  path?: string[];
  sequence?: string[];
  displayOrder?: string;
  games?: number;
  wins?: number;
  sampleSize?: number;
  winRate: number;
  pickRate: number;
}

export interface BuildStyleDto {
  keystoneId: number;
  keystoneName: string;
  games: number;
  wins: number;
  winRate: number;
  pickRate: number;
  startingCombo: ItemComboDto;
  coreCombo: ItemComboDto;
  startingItems: ItemDto[];
  coreItems: ItemDto[];
  boots: ItemDto[];
  situationalItems: ItemDto[];
  itemSlots: ItemSlotDto[];
  runePages: RunePageDto[];
  skillOrders: SkillPathDto[];
}

export interface PublicBuildsResponse {
  championId: string;
  championName?: string;
  role: string;
  note: string;
  fallbackPatch?: string;
  sampleSize: number;
  suppressed?: boolean;
  suppressionReason?: string;
  startingCombo: ItemComboDto;
  coreCombo: ItemComboDto;
  startingItems: ItemDto[];
  coreItems: ItemDto[];
  boots: ItemDto[];
  situationalItems: ItemDto[];
  itemSlots: ItemSlotDto[];
  runePages: RunePageDto[];
  skillOrders: SkillPathDto[];
  styles: BuildStyleDto[];
}

// ── Counters ─────────────────────────────────────────────────────────────────

export interface MatchupDto {
  enemyChampionId: string;
  enemyChampionName?: string;
  championName?: string;
  matchCount?: number;
  games?: number;
  wins: number;
  losses?: number;
  winRate: number;
  deltaVsChampionAverage?: number;
  avgGoldDiff15: number;
}

export interface PublicCountersResponse {
  championId: string;
  championName: string;
  note: string;
  counters: MatchupDto[];
  favorable: MatchupDto[];
}

// ── Synergies ────────────────────────────────────────────────────────────────

export interface SynergyDto {
  allyChampionId?: string;
  allyChampionName?: string;
  championName?: string;
  allyRole: string;
  matchCount?: number;
  games?: number;
  wins: number;
  losses?: number;
  winRate: number;
  deltaVsChampionAverage?: number;
}

export interface PublicSynergiesResponse {
  synergies: SynergyDto[];
}

// ── Overview ─────────────────────────────────────────────────────────────────

export interface ChampionRoleData {
  role: string;
  winRate: number;
  pickRate: number;
  matchCount: number;
}

export interface PublicChampionOverviewResponse {
  championId?: string;
  championName?: string;
  winRate: number;
  pickRate: number;
  roles: ChampionRoleData[];
  note: string;
}
