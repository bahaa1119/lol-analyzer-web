import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | LoL Analyzer',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gap: 16 }}>
      <Link href="/" style={{ color: '#738096', textDecoration: 'none', fontSize: '0.82rem' }}>← Home</Link>

      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 20, padding: 24 }}>
        <p style={{ color: '#738096', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          LEGAL
        </p>
        <h1 style={{ color: '#F3F4F6', fontSize: '1.7rem', fontWeight: 900, marginBottom: 4 }}>Terms of Service</h1>
        <p style={{ color: '#738096', fontSize: '0.78rem', marginBottom: 24 }}>Last updated: May 15, 2026</p>

        <div style={{ display: 'grid', gap: 22, color: '#B4BECC', lineHeight: 1.65, fontSize: '0.92rem' }}>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using LoL Analyzer ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the Service. We reserve the right to update these terms at any time.
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>2. Description of Service</h2>
            <p>
              LoL Analyzer is a free tool that provides League of Legends statistics, tier lists, champion builds,
              counter picks, and match analysis using data sourced from the Riot Games API. The Service is intended
              for informational and entertainment purposes only.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>3. Riot Games Disclaimer</h2>
            <p>
              LoL Analyzer is not affiliated with, endorsed by, or sponsored by Riot Games, Inc.
              League of Legends® is a registered trademark of Riot Games, Inc. All game data is retrieved
              via the official Riot Games API in accordance with the{' '}
              <a href="https://developer.riotgames.com/policies/general" target="_blank" rel="noopener noreferrer" style={{ color: '#5FA8FF' }}>
                Riot Games API Terms of Use
              </a>.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>4. User Accounts</h2>
            <p>
              You may create an account using your email address. You are responsible for maintaining the
              confidentiality of your account credentials. You agree to provide accurate information and to
              notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20, display: 'grid', gap: 4 }}>
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, copy, or redistribute our data or API responses</li>
              <li>Attempt to reverse engineer, hack, or disrupt the Service</li>
              <li>Use automated tools to mass-query or abuse the Service</li>
              <li>Misrepresent affiliation with Riot Games or LoL Analyzer</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>6. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy-policy" style={{ color: '#5FA8FF' }}>Privacy Policy</Link>,
              which is incorporated into these Terms by reference.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy,
              completeness, or availability of any data or statistics shown. Tier lists and champion recommendations
              are based on aggregated data and are not guarantees of in-game performance.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, LoL Analyzer and its operators shall not be liable for
              any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, with or
              without notice, for conduct that we believe violates these Terms or is harmful to other users,
              us, or third parties.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#F3F4F6', fontSize: '1.02rem', fontWeight: 800, marginBottom: 8 }}>10. Contact</h2>
            <p>
              For any questions regarding these Terms, contact us at:{' '}
              <a href="mailto:bahaa9taha@gmail.com" style={{ color: '#5FA8FF' }}>bahaa9taha@gmail.com</a>
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border-1)', paddingTop: 16 }}>
            <p style={{ fontSize: '0.78rem', color: '#738096' }}>
              LoL Analyzer is not endorsed by Riot Games. League of Legends is a trademark of Riot Games, Inc.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
