import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AdBanner } from '@/components/AdBanner';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: { default: 'LoL Analyzer', template: '%s | LoL Analyzer' },
  description: 'League of Legends champion builds, tier lists, counters and win rates from Challenger and Grandmaster match data. Updated every patch.',
  keywords: ['league of legends builds', 'lol tier list', 'champion counters', 'lol win rate', 'best champions lol', 'lol runes'],
  openGraph: {
    type: 'website',
    siteName: 'LoL Analyzer',
    title: 'LoL Analyzer – Champion Builds & Tier List',
    description: 'Real LoL champion builds, tier lists and counter picks from Challenger and Grandmaster match data.',
  },
  twitter: { card: 'summary', title: 'LoL Analyzer – Champion Builds & Tier List' },
  other: { 'google-adsense-account': 'ca-pub-4876417033951890' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4876417033951890"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-[#02050A] text-[#F3F4F6] min-h-screen font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="max-w-[1360px] mx-auto px-5 py-6">
            <AdBanner slot="2512934142" className="mb-6" />
            {children}
            <AdBanner slot="2512934142" className="mt-8" />
          </main>
          <footer className="border-t border-[var(--border-1)] mt-12 py-6 text-center text-[var(--text-subtle)] text-xs">
            <p>LoL Analyzer is not endorsed by Riot Games. League of Legends is a trademark of Riot Games, Inc.</p>
            <p className="mt-2 flex items-center justify-center gap-4">
              <a href="/privacy-policy" className="hover:text-[#F3F4F6] transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="/terms" className="hover:text-[#F3F4F6] transition-colors">Terms of Service</a>
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
