import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | LoL Analyzer',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gap: 16 }}>
      <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem' }}>← Home</Link>

      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 20, padding: 24 }}>
        <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          LEGAL
        </p>
        <h1 style={{ color: '#F3F4F6', fontSize: '1.7rem', fontWeight: 900, marginBottom: 16 }}>Privacy Policy</h1>

        <div style={{ display: 'grid', gap: 18, color: '#B4BECC', lineHeight: 1.65, fontSize: '0.92rem' }}>
          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>What we use</h2>
            <p>LoL Analyzer uses Supabase for authentication and a Railway backend to fetch Riot-powered match data and analysis.</p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>What account data is stored</h2>
            <p>
              If you connect a Riot profile, we store the Riot ID, platform code, and linked PUUID needed to fetch your private match history and analysis data.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>What the site does with it</h2>
            <p>
              Your linked profile is used to load recent matches, match analysis, and rank readiness from the same backend used by the app.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>Ads and third parties</h2>
            <p>
              The website may use AdSense and public Riot/CommunityDragon assets for display. Riot data remains governed by Riot’s own platform policies.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>Signing out</h2>
            <p>
              You can sign out at any time from the settings page. That ends your local session on this web client.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
