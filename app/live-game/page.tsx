import { api } from '@/lib/api';
import { championIconUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { PreGameOverview, PreGameParticipant } from '@/lib/types';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ puuid?: string; platform?: string }>;
}

export const metadata: Metadata = { title: 'Live Game | LoL Analyzer' };

export default async function LiveGamePage({ searchParams }: Props) {
  const { puuid, platform } = await searchParams;

  if (!puuid || !platform) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#738096' }}>
        <Link href="/" style={{ color: '#C8AA6E', textDecoration: 'none', fontWeight: 600 }}>← Search for a summoner first</Link>
      </div>
    );
  }

  let data: PreGameOverview | null = null;
  let error = '';

  try {
    data = await api.getLiveGame(puuid, platform);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'Could not load live game.';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem', display: 'inline-block', marginBottom: 4 }}>← Home</Link>

      {error && (
        <div style={{ background: 'var(--surface-1)', border: '1px solid rgba(224,103,103,0.35)', borderRadius: 22, padding: 32, textAlign: 'center', color: '#E06767' }}>
          {error}
        </div>
      )}

      {data && !data.inGame && (
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 22, padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: 12 }}>🎮</p>
          <h2 style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Not in a game</h2>
          <p style={{ color: '#738096', fontSize: '0.875rem' }}>Start a match and return here for all 10 players, bans, and pregame notes.</p>
        </div>
      )}

      {data && data.inGame && <GameBody data={data} />}
    </div>
  );
}

function GameBody({ data }: { data: PreGameOverview }) {
  return (
    <>
      {/* Lobby info */}
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 22, padding: '16px 20px' }}>
        <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>LOBBY</p>
        <h2 style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>{data.queueLabel ?? 'Current Game'}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.region && (
            <span style={{ background: 'rgba(95,168,255,0.15)', border: '1px solid rgba(95,168,255,0.3)', borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: '#5FA8FF', fontWeight: 700 }}>
              {data.region}
            </span>
          )}
          {data.patch && (
            <span style={{ background: 'rgba(200,170,110,0.12)', border: '1px solid rgba(200,170,110,0.3)', borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: '#C8AA6E', fontWeight: 700 }}>
              Patch {data.patch}
            </span>
          )}
          {data.gameLength != null && (
            <span style={{ background: 'rgba(79,191,143,0.12)', border: '1px solid rgba(79,191,143,0.3)', borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: '#4FBF8F', fontWeight: 700 }}>
              {Math.floor(data.gameLength / 60)}:{String(data.gameLength % 60).padStart(2, '0')} elapsed
            </span>
          )}
        </div>
      </div>

      {/* Bans */}
      {data.bannedChampions.length > 0 && (
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 22, padding: '16px 20px' }}>
          <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>BANS</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.bannedChampions.map((ban, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: `1px solid ${ban.teamId === 100 ? 'rgba(95,168,255,0.4)' : 'rgba(224,103,103,0.4)'}`, position: 'relative', filter: 'grayscale(60%)' }}>
                  <Image src={championIconUrl(ban.championName)} alt={ban.championName} width={36} height={36} unoptimized />
                </div>
                <span style={{ fontSize: '0.6rem', color: '#738096' }}>{ban.championName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pregame notes */}
      {data.preGameNotes.length > 0 && (
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 22, padding: '16px 20px' }}>
          <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>NOTES</p>
          <h2 style={{ color: '#F3F4F6', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Pregame Readout</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.preGameNotes.map((note, i) => (
              <p key={i} style={{ color: '#B4BECC', fontSize: '0.85rem', lineHeight: 1.5, paddingLeft: 14, borderLeft: '2px solid #C8AA6E' }}>{note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <TeamPanel label="Blue Side" team={data.blueTeam} accent="#5FA8FF" />
        <TeamPanel label="Red Side" team={data.redTeam} accent="#E06767" />
      </div>
    </>
  );
}

function TeamPanel({ label, team, accent }: { label: string; team: PreGameParticipant[]; accent: string }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 22, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>TEAM</p>
          <h3 style={{ color: accent, fontWeight: 700, fontSize: '1rem' }}>{label}</h3>
        </div>
        <span style={{ background: accent + '20', border: `1px solid ${accent}50`, borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', color: accent, fontWeight: 700 }}>
          {team.length} players
        </span>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {team.map((player) => (
          <PlayerRow key={player.puuid || player.summonerName} player={player} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function PlayerRow({ player, accent }: { player: PreGameParticipant; accent: string }) {
  const wr = player.soloWinRate;
  const wrColor = wr == null ? '#738096' : wr >= 55 ? '#4FBF8F' : wr < 45 ? '#E06767' : '#B4BECC';
  const matchupColor = player.matchupWr == null ? '#738096'
    : player.matchupWr >= 52 ? '#4FBF8F'
    : player.matchupWr <= 48 ? '#E06767'
    : '#738096';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: player.isYou ? accent + '14' : 'var(--surface-3)',
      border: `1px solid ${player.isYou ? accent + '66' : 'var(--border-1)'}`,
      borderRadius: 14, padding: '10px 12px',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-2)', flexShrink: 0 }}>
        <Image src={championIconUrl(player.championId || player.championName)} alt={player.championName} width={42} height={42} unoptimized />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: player.isYou ? accent : '#F3F4F6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.summonerName || player.championName}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#738096', marginTop: 2 }}>
          {player.soloRank ?? 'Unranked'} · {player.recentGames} recent games
        </p>
        {!player.isYou && player.matchupWr != null && (
          <p style={{ fontSize: '0.68rem', color: matchupColor, marginTop: 2, fontWeight: 700 }}>
            ⇄ Matchup: {player.matchupWr.toFixed(1)}% WR
          </p>
        )}
      </div>
      {wr != null && (
        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: wrColor, flexShrink: 0 }}>{wr}%</p>
      )}
    </div>
  );
}
