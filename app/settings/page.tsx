'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { StateCard } from '@/components/ui/StateCard';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { api } from '@/lib/api';
import type { ConnectedProfile } from '@/lib/types';

const RIOT_REGIONS = [
  { label: 'NA', platformCode: 'NA1' },
  { label: 'BR', platformCode: 'BR1' },
  { label: 'LAN', platformCode: 'LA1' },
  { label: 'LAS', platformCode: 'LA2' },
  { label: 'EUW', platformCode: 'EUW1' },
  { label: 'EUNE', platformCode: 'EUN1' },
  { label: 'ME', platformCode: 'ME1' },
  { label: 'RU', platformCode: 'RU' },
  { label: 'TR', platformCode: 'TR1' },
  { label: 'KR', platformCode: 'KR' },
  { label: 'JP', platformCode: 'JP1' },
  { label: 'OCE', platformCode: 'OC1' },
  { label: 'PH', platformCode: 'PH2' },
  { label: 'SG', platformCode: 'SG2' },
  { label: 'TH', platformCode: 'TH2' },
  { label: 'TW', platformCode: 'TW2' },
  { label: 'VN', platformCode: 'VN2' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { loading: authLoading, user, accessToken, signOut } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [profile, setProfile] = useState<ConnectedProfile | null>(null);
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('EUW1');
  const [savingProfile, setSavingProfile] = useState(false);
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [lastRefreshLabel, setLastRefreshLabel] = useState('Not refreshed this session');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !accessToken) {
      router.replace('/login?redirect=/settings');
      return;
    }

    const token = accessToken;
    let cancelled = false;

    async function loadProfile() {
      setPageLoading(true);
      setError(null);
      try {
        const response = await api.getMyProfile(token);
        if (cancelled) return;
        const connectedProfile = response.profile ?? null;
        setProfile(connectedProfile);
        setGameName(connectedProfile?.riotId.gameName ?? '');
        setTagLine(connectedProfile?.riotId.tagLine ?? '');
        setRegion(connectedProfile?.platformCode ?? 'EUW1');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load your settings right now.');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [accessToken, authLoading, router, user]);

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setSavingProfile(true);
    setError(null);
    setNotice(null);
    try {
      const response = await api.connectRiotProfile(accessToken, {
        gameName: gameName.trim(),
        tagLine: tagLine.trim(),
        platformCode: region,
      });
      setProfile(response.profile ?? null);
      setNotice(response.profile ? 'Riot profile saved.' : 'Riot profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that Riot profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRefreshMatches() {
    if (!accessToken || refreshingMatches || !profile) return;
    setRefreshingMatches(true);
    setError(null);
    setNotice(null);
    try {
      await api.getRecentMatches(accessToken, { forceRefresh: true });
      setLastRefreshLabel('Just now');
      setNotice('Match history refreshed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh recent matches.');
    } finally {
      setRefreshingMatches(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (authLoading || pageLoading) {
    return <StateCard title="Loading settings" copy="Checking your account and Riot profile." />;
  }

  if (error && !user) {
    return <StateCard title="Settings unavailable" copy={error} tone="error" />;
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem' }}>← Home</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/rank-readiness" style={ghostButtonStyle}>
            Rank Readiness
          </Link>
        </div>
      </div>

      {error && (
        <Banner tone="error">{error}</Banner>
      )}
      {notice && (
        <Banner tone="success">{notice}</Banner>
      )}

      <SettingsSection eyebrow="ACCOUNT" title={user?.email ?? 'Signed In'}>
        <InfoRow label="Email" value={user?.email ?? '—'} />
        <div style={{ marginTop: 14 }}>
          <button onClick={handleSignOut} disabled={signingOut} style={outlinedGoldButtonStyle}>
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection eyebrow="RIOT PROFILE" title={profile ? `${profile.riotId.gameName}#${profile.riotId.tagLine}` : 'No profile connected'}>
        <InfoRow label="Region" value={profile?.regionLabel ?? 'Not connected'} />
        <InfoRow label="Platform" value={profile?.platformCode ?? '—'} />
        <InfoRow label="PUUID" value={profile ? `${profile.puuid.slice(0, 8)}…` : '—'} />

        <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <LabeledInput label="Game Name" value={gameName} onChange={setGameName} placeholder="Dark9" />
          <LabeledInput label="Tag Line" value={tagLine} onChange={setTagLine} placeholder="99990" />

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#B4BECC', fontSize: '0.85rem', fontWeight: 700 }}>Region</span>
            <select value={region} onChange={event => setRegion(event.target.value)} style={fieldStyle}>
              {RIOT_REGIONS.map(option => (
                <option key={option.platformCode} value={option.platformCode}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <button type="submit" disabled={savingProfile} style={filledGoldButtonStyle}>
              {savingProfile ? 'Saving...' : profile ? 'Change Riot Profile' : 'Connect Riot Profile'}
            </button>
            {profile && (
              <Link
                href={`/summoner?name=${encodeURIComponent(profile.riotId.gameName)}&tag=${encodeURIComponent(profile.riotId.tagLine)}&region=${profile.platformCode}`}
                style={ghostButtonStyle}
              >
                View Summoner
              </Link>
            )}
          </div>
        </form>
      </SettingsSection>

      <SettingsSection eyebrow="MATCH DATA" title="Refresh Controls">
        <InfoRow label="Last refresh" value={lastRefreshLabel} />
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            onClick={handleRefreshMatches}
            disabled={!profile || refreshingMatches}
            style={filledBlueButtonStyle(!profile || refreshingMatches)}
          >
            {refreshingMatches ? 'Refreshing…' : 'Refresh Recent Matches'}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection eyebrow="LEGAL" title="Privacy & Terms">
        <Link href="/privacy-policy" style={ghostButtonStyle}>
          Privacy Policy
        </Link>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SurfaceCard eyebrow={eyebrow} title={title} style={{ borderRadius: 20, padding: 20 }}>
      {children}
    </SurfaceCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, paddingBottom: 10 }}>
      <span style={{ color: '#738096', fontSize: '0.78rem' }}>{label}</span>
      <span style={{ color: '#F3F4F6', fontSize: '0.84rem' }}>{value}</span>
    </div>
  );
}

function Banner({ children, tone }: { children: React.ReactNode; tone: 'error' | 'success' }) {
  const color = tone === 'error' ? '#E06767' : '#4FBF8F';
  return (
    <SurfaceCard style={{ border: `1px solid ${color}55`, borderRadius: 16, padding: '14px 16px', color }}>
      {children}
    </SurfaceCard>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: '#B4BECC', fontSize: '0.85rem', fontWeight: 700 }}>{label}</span>
      <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} required style={fieldStyle} />
    </label>
  );
}

const fieldStyle: CSSProperties = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border-1)',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: '0.95rem',
  color: '#F3F4F6',
  outline: 'none',
};

const ghostButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid var(--border-1)',
  background: 'var(--surface-3)',
  color: '#F3F4F6',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '0.84rem',
};

const outlinedGoldButtonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #C8AA6E',
  background: 'transparent',
  color: '#C8AA6E',
  fontWeight: 700,
  cursor: 'pointer',
};

const filledGoldButtonStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  background: '#C8AA6E',
  color: '#09101a',
  fontWeight: 800,
  cursor: 'pointer',
};

function filledBlueButtonStyle(disabled: boolean): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: disabled ? 'var(--surface-3)' : '#5FA8FF',
    color: disabled ? '#738096' : '#09101a',
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
