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
        <h1 style={{ color: '#F3F4F6', fontSize: '1.7rem', fontWeight: 900, marginBottom: 4 }}>Privacy Policy</h1>
        <p style={{ color: '#738096', fontSize: '0.78rem', marginBottom: 24 }}>Last updated: May 15, 2026</p>

        <div style={{ display: 'grid', gap: 22, color: '#B4BECC', lineHeight: 1.65, fontSize: '0.92rem' }}>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>1. Overview</h2>
            <p>
              LoL Analyzer ("we", "us", or "our") is a free tool that displays League of Legends statistics,
              tier lists, champion builds, counter picks, and match analysis. This policy explains what data
              we collect, how we use it, and your rights. LoL Analyzer is not affiliated with or endorsed by
              Riot Games, Inc.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>2. Riot Games API Data</h2>
            <p>
              LoL Analyzer uses the Riot Games API to retrieve publicly available League of Legends game data,
              including match history, summoner profiles, champion statistics, and ranked information.
              This data is provided by Riot Games and is subject to the{' '}
              <a href="https://developer.riotgames.com/policies/general" target="_blank" rel="noopener noreferrer" style={{ color: '#5FA8FF' }}>
                Riot Games API Terms of Use
              </a>.
            </p>
            <p style={{ marginTop: 8 }}>
              We collect match data from high-elo (Challenger and Grandmaster) players to compute aggregated
              statistics such as champion win rates, pick rates, and build frequencies. This data is used
              solely to power the tier list and champion analysis features. <strong style={{ color: '#F3F4F6' }}>
              We do not sell, rent, or share Riot Games API data with any third party.</strong>
            </p>
            <p style={{ marginTop: 8 }}>
              Aggregated match data is retained only for the current game patch and is automatically deleted
              when a new patch is released. Raw match data is not stored permanently.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>3. Account Data</h2>
            <p>
              If you create an account or connect a Riot profile, we store:
            </p>
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'grid', gap: 4 }}>
              <li>Your email address (for authentication via Supabase)</li>
              <li>Your Riot Game Name and Tag (e.g. Player#EUW)</li>
              <li>Your platform region code (e.g. EUW1)</li>
              <li>Your Riot PUUID (a unique identifier used to fetch your match history)</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              This information is used exclusively to load your personal match history, rank data, and match
              analysis. It is never shared with third parties.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>4. Cookies and Advertising</h2>
            <p>
              This website uses Google AdSense to display advertisements. AdSense may use cookies and similar
              tracking technologies to serve personalised ads based on your interests. You can opt out of
              personalised advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#5FA8FF' }}>
                Google Ads Settings
              </a>.
            </p>
            <p style={{ marginTop: 8 }}>
              We do not use any additional tracking cookies beyond those set by Google AdSense and Supabase
              authentication.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>5. Data Retention</h2>
            <ul style={{ paddingLeft: 20, display: 'grid', gap: 4 }}>
              <li>Aggregated champion statistics: retained for the current patch only, deleted on each new patch</li>
              <li>Raw match data: deleted automatically after aggregation</li>
              <li>Account data (email, Riot profile): retained until you delete your account</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>6. Your Rights</h2>
            <p>
              You may request deletion of your account and all associated personal data at any time by
              contacting us at the email below. You can also disconnect your Riot profile from the settings
              page, which removes your stored Riot ID and PUUID.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>7. Third-Party Services</h2>
            <ul style={{ paddingLeft: 20, display: 'grid', gap: 4 }}>
              <li><strong style={{ color: '#F3F4F6' }}>Riot Games API</strong> — game data source, subject to Riot's own policies</li>
              <li><strong style={{ color: '#F3F4F6' }}>Supabase</strong> — authentication and database hosting</li>
              <li><strong style={{ color: '#F3F4F6' }}>Railway</strong> — backend server hosting</li>
              <li><strong style={{ color: '#F3F4F6' }}>Google AdSense</strong> — advertising</li>
              <li><strong style={{ color: '#F3F4F6' }}>CommunityDragon</strong> — champion and item images</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>8. Contact</h2>
            <p>
              For any privacy-related questions or data deletion requests, contact us at:{' '}
              <a href="mailto:bahaa9taha@gmail.com" style={{ color: '#5FA8FF' }}>bahaa9taha@gmail.com</a>
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border-1)', paddingTop: 16 }}>
            <p style={{ fontSize: '0.78rem', color: '#738096' }}>
              LoL Analyzer is not endorsed by Riot Games. League of Legends is a trademark of Riot Games, Inc.
              All game data is used in accordance with the{' '}
              <a href="https://developer.riotgames.com/policies/general" target="_blank" rel="noopener noreferrer" style={{ color: '#5FA8FF' }}>
                Riot Games API Terms of Use
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
