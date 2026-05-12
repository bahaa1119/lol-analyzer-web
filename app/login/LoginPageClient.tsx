'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, supabaseConfigured } from '@/lib/supabase';

export function LoginPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirect') ?? '/';
  const startSignUp = params.get('mode') === 'signup';
  const confirmed = params.get('confirmed') === 'true';

  const [isSignUp, setIsSignUp] = useState(startSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(
    confirmed ? { text: 'Email confirmed. Sign in to continue.', success: true } : null,
  );

  if (!supabaseConfigured) {
    return (
      <div style={{ maxWidth: 440, margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface-1)', border: '1px solid rgba(224,103,103,0.3)', borderRadius: 20, padding: 32 }}>
          <p style={{ color: '#E06767', fontWeight: 700, marginBottom: 8 }}>Auth not configured</p>
          <p style={{ color: '#738096', fontSize: '0.875rem' }}>
            Add <code style={{ color: '#C8AA6E' }}>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code style={{ color: '#C8AA6E' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code style={{ color: '#C8AA6E' }}>.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  function parseError(err: unknown): string {
    const msg = (err as { message?: string })?.message?.toLowerCase() ?? '';
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) return 'Incorrect email or password.';
    if (msg.includes('email not confirmed')) return 'Please confirm your email before signing in.';
    if (msg.includes('already registered')) return 'An account with this email already exists. Try signing in.';
    if (msg.includes('password')) return 'Password must be at least 6 characters.';
    return 'Something went wrong. Please try again.';
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (isSignUp && password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', success: false });
      return;
    }
    if (isSignUp && password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', success: false });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Check your email to confirm your account.', success: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
      }
    } catch (err) {
      setMessage({ text: parseError(err), success: false });
    } finally {
      setLoading(false);
    }
  }

  const input = (val: string, set: (v: string) => void, placeholder: string, type = 'text') => (
    <input
      type={type}
      value={val}
      onChange={e => set(e.target.value)}
      placeholder={placeholder}
      required
      style={{
        width: '100%',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-1)',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: '0.95rem',
        color: '#F3F4F6',
        outline: 'none',
      }}
      onFocus={e => (e.target.style.borderColor = '#C8AA6E')}
      onBlur={e => (e.target.style.borderColor = 'var(--border-2)')}
    />
  );

  return (
    <div style={{ maxWidth: 440, margin: '60px auto 0', padding: '0 16px' }}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 24, padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 20, marginBottom: 12, border: '1px solid rgba(200,170,110,0.25)', background: 'rgba(200,170,110,0.10)' }}>
            <span style={{ color: '#C8AA6E', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em' }}>LOL ANALYZER</span>
          </div>
          <h1 style={{ color: '#F3F4F6', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p style={{ color: '#738096', fontSize: '0.88rem', marginTop: 6 }}>
            {isSignUp ? 'Sign up to track your matches and rank progress.' : 'Sign in to access your settings and analysis.'}
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              borderRadius: 12,
              background: message.success ? 'rgba(79,191,143,0.1)' : 'rgba(224,103,103,0.1)',
              border: `1px solid ${message.success ? 'rgba(79,191,143,0.3)' : 'rgba(224,103,103,0.3)'}`,
              color: message.success ? '#4FBF8F' : '#E06767',
              fontSize: '0.875rem',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {input(email, setEmail, 'Email address', 'email')}
          {input(password, setPassword, 'Password', 'password')}
          {isSignUp && input(confirmPassword, setConfirmPassword, 'Confirm password', 'password')}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--surface-3)' : '#C8AA6E',
              color: loading ? '#738096' : '#09101a',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#738096', fontSize: '0.875rem' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignUp(v => !v);
              setMessage(null);
            }}
            style={{ background: 'none', border: 'none', color: '#C8AA6E', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: '#738096' }}>
        By continuing you agree to our{' '}
        <Link href="/privacy-policy" style={{ color: '#C8AA6E', textDecoration: 'none' }}>Privacy Policy</Link>
      </p>
    </div>
  );
}
