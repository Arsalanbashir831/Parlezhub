'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

import { setCookie } from '@/lib/cookie-utils';

/**
 * Generic Supabase callback page.
 *
 * Supabase redirects here after:
 *  - Email verification  (type=signup)
 *  - Magic-link login    (type=magiclink)
 *  - Password recovery   (type=recovery)
 *
 * Tokens arrive in the URL **hash** fragment, e.g.
 *   /auth/callback#access_token=...&refresh_token=...&type=signup
 *
 * The hash is NEVER sent to the server, so we must read it client-side
 * before doing anything else.  The middleware already treats /auth/callback
 * as a public route, so we land here safely.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading '#'
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type = params.get('type'); // 'signup' | 'magiclink' | 'recovery'

    if (!accessToken || !refreshToken) {
      setStatus('error');
      setErrorMsg(
        'Verification link is invalid or has already been used. Please request a new one.'
      );
      setTimeout(() => router.replace(ROUTES.AUTH.LOGIN), 4000);
      return;
    }

    // Persist tokens exactly as the rest of the app expects them
    setCookie('access_token', accessToken);
    setCookie('refresh_token', refreshToken);

    // Clean the tokens out of the browser history
    window.history.replaceState(null, '', window.location.pathname);

    if (type === 'recovery') {
      // Password-reset flow — go to the reset-password page
      router.replace(ROUTES.AUTH.RESET_PASSWORD);
      return;
    }

    // signup / magiclink — go to root; the auth context will fetch the
    // profile, set the role cookies, and redirect to the right dashboard.
    toast.success('Email verified successfully! Welcome aboard 🎉');
    router.replace('/');
  }, [router]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold text-red-600">
            Verification Failed
          </h1>
          <p className="text-sm text-gray-600">{errorMsg}</p>
          <p className="text-xs text-gray-400">Redirecting to sign-in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Verifying your email…
          </h1>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your account.
          </p>
        </div>
      </div>
    </div>
  );
}
