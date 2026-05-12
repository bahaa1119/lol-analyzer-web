import { api } from '@/lib/api';
import { championIconUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type {
  MatchDetailsResponse,
  MatchAnalysisResponse,
  AnalysisBehaviorTag,
  AnalysisDecisionWindow,
  AnalysisSection,
  Participant,
} from '@/lib/types';

interface Props {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ puuid?: string; platform?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params;
  return { title: `Match Analysis - ${matchId.slice(-6)} | LoL Analyzer` };
}

function gradeColor(grade: string): string {
  if (grade.startsWith('S')) return '#4FBF8F';
  if (grade === 'A') return '#5FA8FF';
  if (grade === 'B') return '#C8AA6E';
  if (grade === 'C') return '#738096';
  return '#E06767';
}

function tagColor(severity: string): string {
  if (severity === 'critical') return '#E06767';
  if (severity === 'major') return '#C8AA6E';
  if (severity === 'positive') return '#4FBF8F';
  return '#5FA8FF';
}

function evalColor(evaluation: string): string {
  if (evaluation === 'critical' || evaluation === 'bad') return '#E06767';
  if (evaluation === 'avoidable_risk') return '#C8AA6E';
  if (evaluation === 'acceptable_risk') return '#5FA8FF';
  return '#4FBF8F';
}

function evalLabel(evaluation: string): string {
  if (evaluation === 'critical') return 'Critical';
  if (evaluation === 'bad') return 'Bad';
  if (evaluation === 'avoidable_risk') return 'Avoidable Risk';
  if (evaluation === 'acceptable_risk') return 'Acceptable Risk';
  return 'Good';
}

function laneColor(verdict: string): string {
  if (verdict === 'Won lane') return '#4FBF8F';
  if (verdict === 'Lost lane') return '#E06767';
  return '#738096';
}

function compactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export default async function MatchPage({ params, searchParams }: Props) {
  const { matchId } = await params;
  const { puuid = '', platform = '' } = await searchParams;

  if (!puuid || !platform) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#738096' }}>
        <p style={{ marginBottom: 16 }}>Missing puuid or platform.</p>
        <Link href="/" style={{ color: '#C8AA6E', textDecoration: 'none', fontWeight: 600 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const [details, analysis] = await Promise.all([
    api.getMatchDetails(matchId, puuid, platform).catch(() => null),
    api.getMatchAnalysis(matchId, puuid, platform).catch(() => null),
  ]);

  if (!details) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: '#E06767', marginBottom: 16 }}>Match not found or unavailable.</p>
        <Link href="/" style={{ color: '#C8AA6E', textDecoration: 'none', fontWeight: 600 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .match-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .match-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 8px;
        }
        .match-phase-grid,
        .match-insight-grid,
        .scoreboard-team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }
        .scoreboard-row {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) auto auto auto;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 760px) {
          .scoreboard-row {
            grid-template-columns: 38px minmax(0, 1fr) auto auto;
          }
          .scoreboard-row-damage {
            display: none;
          }
        }
      `}</style>

      <div className="match-topbar">
        <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem' }}>
          Back to Home
        </Link>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/settings" className="btn" style={{ textDecoration: 'none' }}>
            Settings
          </Link>
        </div>
      </div>

      {analysis ? (
        <AnalysisBody analysis={analysis} details={details} puuid={puuid} />
      ) : (
        <DetailsOnly details={details} puuid={puuid} />
      )}
    </div>
  );
}

function AnalysisBody({
  analysis,
  details,
  puuid,
}: {
  analysis: MatchAnalysisResponse;
  details: MatchDetailsResponse;
  puuid: string;
}) {
  const m = analysis.metrics;
  const grade = gradeColor(analysis.overallGrade);

  const insightCards: { title: string; items: string[]; color: string }[] = [
    { title: 'Role Focus', items: analysis.roleInsights, color: '#5FA8FF' },
    ...(analysis.archetypeInsights.length > 0
      ? [{ title: `Archetype: ${analysis.archetype ?? 'Champion'}`, items: analysis.archetypeInsights, color: '#C8AA6E' }]
      : []),
    { title: 'Lane Matchup', items: analysis.laneInsights, color: '#C8AA6E' },
    { title: 'Objective Impact', items: analysis.objectiveInsights, color: '#4FBF8F' },
    { title: 'Death Patterns', items: analysis.deathInsights, color: '#E06767' },
    { title: 'Strengths', items: analysis.strengths, color: '#4FBF8F' },
    { title: 'Mistakes', items: analysis.weaknesses, color: '#E06767' },
    { title: 'Tips', items: analysis.tips, color: '#C8AA6E' },
    { title: 'Improvement Focus', items: analysis.improvementFocus, color: '#5FA8FF' },
  ].filter(card => card.items.length > 0);

  return (
    <>
      <Panel eyebrow="MATCH" title={analysis.championName} trailing={<Pill label={`${analysis.overallScore}/100 - ${analysis.overallGrade}`} color={grade} />}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill label={details.queueLabel} color="#738096" />
            <Pill label={details.matchDateLabel} color="#5FA8FF" />
            <Pill label={`${Math.floor(details.durationSeconds / 60)}m`} color="#C8AA6E" />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 82, height: 82, borderRadius: 16, overflow: 'hidden', border: `2px solid ${grade}`, flexShrink: 0 }}>
              <Image src={championIconUrl(analysis.championName)} alt={analysis.championName} width={82} height={82} unoptimized />
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <Pill label={analysis.role} color="#5FA8FF" />
                {analysis.archetype && <Pill label={analysis.archetype} color="#C8AA6E" />}
                <Pill label={analysis.laneVerdict} color={laneColor(analysis.laneVerdict)} />
                {analysis.laneOpponentName && <Pill label={`vs ${analysis.laneOpponentName}`} color="#738096" />}
                {analysis.confidenceScore != null && (
                  <Pill
                    label={`${analysis.confidenceScore}% confidence`}
                    color={analysis.confidenceScore >= 80 ? '#4FBF8F' : analysis.confidenceScore >= 55 ? '#C8AA6E' : '#738096'}
                  />
                )}
              </div>

              <div className="match-metrics-grid" style={{ marginBottom: analysis.behaviorTags.length > 0 ? 14 : 0 }}>
                <MetricBox label="KDA" value={m.kda.toFixed(1)} color="#F3F4F6" />
                <MetricBox label="KP" value={`${m.killParticipation.toFixed(1)}%`} color="#5FA8FF" />
                <MetricBox label="CS/min" value={m.csPerMin.toFixed(1)} color="#C8AA6E" />
                {m.cs10 != null && <MetricBox label="CS@10" value={String(m.cs10)} color={m.cs10 >= 75 ? '#4FBF8F' : m.cs10 < 60 ? '#E06767' : '#C8AA6E'} />}
                {m.firstItemTimingMin != null && <MetricBox label="1st Item" value={`${m.firstItemTimingMin.toFixed(1)}m`} color={m.firstItemTimingMin <= 15 ? '#4FBF8F' : m.firstItemTimingMin >= 20 ? '#E06767' : '#C8AA6E'} />}
                <MetricBox label="Vision" value={String(m.visionScore)} color="#4FBF8F" />
                <MetricBox label="Objective" value={String(m.objectiveScore)} color="#4FBF8F" />
                <MetricBox label="Dmg Share" value={`${m.damageShare.toFixed(1)}%`} color="#E06767" />
                {m.gankedDeaths > 0 && <MetricBox label="Ganked" value={`${m.gankedDeaths}x`} color={m.gankedDeaths >= 2 ? '#E06767' : '#738096'} />}
              </div>

              {analysis.behaviorTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.behaviorTags.map(tag => (
                    <Pill key={tag.code} label={tag.label} color={tagColor(tag.severity)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <div className="match-phase-grid">
        <PhaseCard section={analysis.early} accent="#5FA8FF" />
        <PhaseCard section={analysis.mid} accent="#C8AA6E" />
        <PhaseCard section={analysis.late} accent="#4FBF8F" />
      </div>

      {analysis.nextGameFocus && (
        <Panel eyebrow="NEXT GAME" title="Focus">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: '#C8AA6E', fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>◎</span>
            <p style={{ color: '#B4BECC', fontSize: '0.875rem', lineHeight: 1.6 }}>{analysis.nextGameFocus}</p>
          </div>
        </Panel>
      )}

      {analysis.behaviorTags.length > 0 && (
        <Panel eyebrow="BEHAVIOR" title="Behavior Fingerprint">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {analysis.behaviorTags.map(tag => (
              <BehaviorRow key={tag.code} tag={tag} />
            ))}
          </div>
        </Panel>
      )}

      {analysis.decisionWindows.length > 0 && (
        <Panel eyebrow="DECISIONS" title="Decision Windows">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis.decisionWindows.map(window => (
              <DecisionWindowCard key={window.id} window={window} />
            ))}
          </div>
        </Panel>
      )}

      {insightCards.length > 0 && (
        <div className="match-insight-grid">
          {insightCards.map(card => (
            <InsightCard key={card.title} title={card.title} items={card.items} color={card.color} />
          ))}
        </div>
      )}

      <Scoreboard details={details} puuid={puuid} />
    </>
  );
}

function DetailsOnly({ details, puuid }: { details: MatchDetailsResponse; puuid: string }) {
  const win = details.result;
  return (
    <>
      <Panel eyebrow="MATCH" title={details.championName} trailing={<Pill label={win ? 'Victory' : 'Defeat'} color={win ? '#4FBF8F' : '#E06767'} />}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill label={details.queueLabel} color="#738096" />
            <Pill label={details.matchDateLabel} color="#5FA8FF" />
            <Pill label={details.laneVerdict} color={laneColor(details.laneVerdict)} />
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', border: `2px solid ${win ? '#4FBF8F' : '#E06767'}`, flexShrink: 0 }}>
              <Image src={championIconUrl(details.championName)} alt={details.championName} width={64} height={64} unoptimized />
            </div>
            <div className="match-metrics-grid" style={{ flex: 1 }}>
              <MetricBox label="KDA" value={`${details.kills}/${details.deaths}/${details.assists}`} color="#F3F4F6" />
              <MetricBox label="CS/min" value={details.csPerMin.toFixed(1)} color="#C8AA6E" />
              <MetricBox label="Vision" value={String(details.visionScore)} color="#4FBF8F" />
              <MetricBox label="Duration" value={`${Math.floor(details.durationSeconds / 60)}m`} color="#738096" />
              <MetricBox label="Score" value={`${details.analysisScore}/100`} color="#C8AA6E" />
              <MetricBox label="Grade" value={details.analysisGrade} color={gradeColor(details.analysisGrade)} />
            </div>
          </div>

          <p style={{ color: '#738096', fontSize: '0.82rem' }}>
            {details.laneOpponentName
              ? `Lane opponent: ${details.laneOpponentName}`
              : 'Lane opponent data not available for this match.'}
          </p>
          <p style={{ color: '#738096', fontSize: '0.82rem' }}>Analysis not available for this match yet.</p>
        </div>
      </Panel>

      <Scoreboard details={details} puuid={puuid} />
    </>
  );
}

function Scoreboard({ details, puuid }: { details: MatchDetailsResponse; puuid: string }) {
  if (!details.participants?.length) return null;

  const blueTeam = details.participants.filter(p => (p.teamId != null ? p.teamId === 100 : p.isBlueTeam === true));
  const redTeam = details.participants.filter(p => (p.teamId != null ? p.teamId === 200 : p.isBlueTeam === false));

  return (
    <Panel eyebrow="SCOREBOARD" title="All 10 Players">
      <div className="scoreboard-team-grid">
        {[
          { id: 100, label: 'Blue', players: blueTeam },
          { id: 200, label: 'Red', players: redTeam },
        ].map(team => (
          <TeamCard key={team.id} team={team.label} participants={team.players} puuid={puuid} currentPlayerWon={details.result} />
        ))}
      </div>
    </Panel>
  );
}

function TeamCard({
  team,
  participants,
  puuid,
  currentPlayerWon,
}: {
  team: string;
  participants: Participant[];
  puuid: string;
  currentPlayerWon: boolean;
}) {
  const containsCurrent = participants.some(p => p.isCurrentPlayer || p.puuid === puuid);
  const won = containsCurrent ? currentPlayerWon : !currentPlayerWon;
  const teamKills = participants.reduce((acc, p) => acc + p.kills, 0);
  const teamDeaths = participants.reduce((acc, p) => acc + p.deaths, 0);
  const teamAssists = participants.reduce((acc, p) => acc + p.assists, 0);
  const teamGold = participants.reduce((acc, p) => acc + (p.goldEarned ?? p.gold ?? 0), 0);
  const teamDamage = participants.reduce((acc, p) => acc + (p.totalDamageDealt ?? p.damageDealt ?? 0), 0);

  return (
    <div style={{ background: 'var(--surface-2)', border: `1px solid ${won ? 'rgba(79,191,143,0.24)' : 'rgba(224,103,103,0.24)'}`, borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-2)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p style={{ color: won ? '#4FBF8F' : '#E06767', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 4 }}>
            {won ? 'VICTORY' : 'DEFEAT'} - {team} Team
          </p>
          <p style={{ color: '#B4BECC', fontSize: '0.78rem' }}>
            {teamKills}/{teamDeaths}/{teamAssists} team KDA
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Pill label={`${compactNumber(teamGold)} gold`} color="#C8AA6E" />
          <Pill label={`${compactNumber(teamDamage)} damage`} color="#5FA8FF" />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 10 }}>
        {participants.map((player, index) => {
          const isCurrentPlayer = player.isCurrentPlayer || player.puuid === puuid;
          const gold = player.goldEarned ?? player.gold ?? 0;
          const damage = player.totalDamageDealt ?? player.damageDealt ?? 0;
          const playerKey = player.puuid ?? `${player.summonerName}-${player.championName}-${index}`;

          return (
            <div
              key={playerKey}
              className="scoreboard-row"
              style={{
                padding: '8px 10px',
                background: isCurrentPlayer ? (won ? 'rgba(79,191,143,0.08)' : 'rgba(224,103,103,0.06)') : 'var(--surface-3)',
                border: `1px solid ${isCurrentPlayer ? (won ? 'rgba(79,191,143,0.3)' : 'rgba(224,103,103,0.3)') : 'var(--border-1)'}`,
                borderRadius: 12,
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                <Image src={championIconUrl(player.championName)} alt={player.championName} width={34} height={34} unoptimized />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: isCurrentPlayer ? 800 : 600, color: isCurrentPlayer ? '#F3F4F6' : '#B4BECC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {player.summonerName || player.championName}
                </p>
                <p style={{ fontSize: '0.65rem', color: '#738096' }}>
                  {player.championName}{player.role ? ` - ${player.role}` : ''}
                </p>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#F3F4F6', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {player.kills}/{player.deaths}/{player.assists}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#738096', whiteSpace: 'nowrap' }}>
                {compactNumber(gold)} g
              </p>
              <p className="scoreboard-row-damage" style={{ fontSize: '0.72rem', color: '#B4BECC', whiteSpace: 'nowrap' }}>
                {compactNumber(damage)} dmg
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  trailing,
  children,
}: {
  eyebrow: string;
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderRadius: 20, overflow: 'hidden', padding: 0 }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, rgba(95,168,255,0.14) 0%, rgba(200,170,110,0.35) 50%, rgba(95,168,255,0.14) 100%)' }} />
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#738096', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{eyebrow}</p>
          <h2 style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '1.05rem' }}>{title}</h2>
        </div>
        {trailing}
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 999,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        fontSize: '0.75rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '8px 12px', background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 14, minWidth: 70 }}>
      <p style={{ color: '#738096', fontSize: '0.65rem', marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontSize: '0.9rem', fontWeight: 700 }}>{value}</p>
    </div>
  );
}

function PhaseCard({ section, accent }: { section: AnalysisSection; accent: string }) {
  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderRadius: 20, overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#738096', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>PHASE</p>
          <p style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '0.95rem' }}>{section.phase}</p>
        </div>
        <Pill label={String(section.score)} color={accent} />
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ color: '#B4BECC', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: section.keyEvents.length > 0 ? 12 : 0 }}>{section.summary}</p>
        {section.keyEvents.map((event, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ color: accent, fontSize: '0.9rem', flexShrink: 0, lineHeight: 1.5 }}>•</span>
            <p style={{ color: '#B4BECC', fontSize: '0.78rem', lineHeight: 1.5 }}>{event}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BehaviorRow({ tag }: { tag: AnalysisBehaviorTag }) {
  const color = tagColor(tag.severity);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(41,53,72,0.5)' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <p style={{ color: '#F3F4F6', fontSize: '0.875rem', fontWeight: 700 }}>{tag.label}</p>
          <Pill label={`${tag.confidence}% confidence`} color={color} />
        </div>
        <p style={{ color: '#B4BECC', fontSize: '0.78rem', lineHeight: 1.5 }}>{tag.summary}</p>
      </div>
    </div>
  );
}

function DecisionWindowCard({ window }: { window: AnalysisDecisionWindow }) {
  const color = evalColor(window.evaluation);
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-1)', borderRadius: 16, padding: '14px 16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: '#F3F4F6', fontSize: '0.9rem', fontWeight: 700, marginRight: 4 }}>{window.title}</p>
        <Pill label={evalLabel(window.evaluation)} color={color} />
        <Pill label={window.phase} color="#738096" />
        {window.timestampLabel && <Pill label={window.timestampLabel} color="#5FA8FF" />}
        <Pill label={`${window.confidence}% confidence`} color="#C8AA6E" />
      </div>
      <WindowLine label="State" value={window.state} />
      <WindowLine label="Intent" value={window.intent} />
      <WindowLine label="Decision" value={window.decision} />
      <WindowLine label="Outcome" value={window.outcome} />
      <WindowLine label="Better play" value={window.betterOption} />
    </div>
  );
}

function WindowLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p style={{ fontSize: '0.8rem', lineHeight: 1.6, marginBottom: 6, color: '#B4BECC' }}>
      <span style={{ color: '#F3F4F6', fontWeight: 700 }}>{label}: </span>
      {value}
    </p>
  );
}

function InsightCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items.length) return null;
  return (
    <div className="page-shell" style={{ background: 'var(--surface-1)', borderRadius: 20, overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-2)' }}>
        <p style={{ color: '#738096', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>INSIGHT</p>
        <p style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '0.95rem' }}>{title}</p>
      </div>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingBottom: 10 }}>
            <span style={{ color, fontSize: '0.9rem', flexShrink: 0, lineHeight: 1.5 }}>•</span>
            <p style={{ color: '#B4BECC', fontSize: '0.82rem', lineHeight: 1.5 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
