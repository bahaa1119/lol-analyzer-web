'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user, signOut } = useAuth();

  const emailLabel = user?.email?.split('@')[0] ?? 'Account';

  async function handleSignOut() {
    await signOut();
    router.refresh();
    if (pathname !== '/') {
      router.push('/');
    }
  }

  return (
    <nav
      style={{
        borderBottom: '1px solid var(--border-1)',
        background: 'rgba(2,5,10,0.96)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              flexShrink: 0,
              border: '1px solid var(--border-1)',
              background: 'linear-gradient(180deg,#142134,#070B12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Image src="/logo.png" alt="LoL Analyzer" width={68} height={68} style={{ objectFit: 'contain' }} />
          </div>
          <div className="hidden sm:block" style={{ minWidth: 0 }}>
            <p style={{ color: '#F3F4F6', fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>LoL Analyzer</p>
            <p
              style={{
                color: '#738096',
                fontSize: 12,
                fontWeight: 500,
                marginTop: 3,
                maxWidth: 280,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Search accounts, browse matches, analyze your own games
            </p>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              borderRadius: 999,
              border: '1px solid var(--border-1)',
              background: 'rgba(255,255,255,0.02)',
              color: '#F3F4F6',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>

          {loading ? (
            <span style={{ color: '#738096', fontSize: '0.85rem', fontWeight: 600, padding: '9px 12px' }}>
              Checking session...
            </span>
          ) : user ? (
            <>
              <Link
                href="/settings"
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  color: '#F3F4F6',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Settings
              </Link>
              <div
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  border: '1px solid var(--border-1)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#B4BECC',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {emailLabel}
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '9px 18px',
                  borderRadius: 999,
                  background: '#C8AA6E',
                  color: '#09101a',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  color: '#F3F4F6',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=signup"
                style={{
                  padding: '9px 18px',
                  borderRadius: 999,
                  background: '#C8AA6E',
                  color: '#09101a',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          style={{ padding: 8, color: '#738096', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-1)',
            background: 'var(--bg-body)',
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Link
            href="/"
            style={{ color: '#B4BECC', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          {loading ? (
            <div style={{ color: '#738096', padding: '8px 12px', fontWeight: 600 }}>Checking session...</div>
          ) : user ? (
            <>
              <Link
                href="/settings"
                style={{ color: '#B4BECC', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <div style={{ color: '#B4BECC', padding: '8px 12px', fontWeight: 600 }}>{emailLabel}</div>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await handleSignOut();
                }}
                style={{
                  color: '#C8AA6E',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{ color: '#B4BECC', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
