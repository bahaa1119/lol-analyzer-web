import { Suspense } from 'react';
import { LoginPageClient } from './LoginPageClient';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 440, margin: '80px auto', color: '#738096', textAlign: 'center' }}>Loading sign-in...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
