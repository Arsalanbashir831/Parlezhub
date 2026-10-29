'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { landingPathFor } from '@/lib/guard-rules';
import { authApi } from '@/services/auth';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Fallback landing page for the Google redirect. The PKCE exchange, the Django
 * sync and the role cookies all happen in /auth/callback on the server, so this
 * page only asks the server what session it ended up with — it never parses
 * tokens out of the URL.
 */
export function GoogleOAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-execution (React Strict Mode, hot reload, etc.)
    if (hasRun.current) return;
    hasRun.current = true;

    const redirectTo = searchParams.get('redirect');

    authApi
      .session()
      .then((snapshot) => {
        if (!snapshot.isAuthenticated) {
          throw new Error('Invalid OAuth callback. Please sign in again.');
        }

        if (snapshot.rolesUnknown) {
          // Roles haven't resolved; middleware and the guard will settle them
          // rather than offering the picker to somebody who may already have one.
          return router.push(redirectTo || '/');
        }

        router.push(landingPathFor(snapshot, redirectTo));
      })
      .catch((err: unknown) => {
        console.error('OAuth callback error:', err);
        const errorMessage = getErrorMessage(err, 'google-oauth');
        setError(errorMessage);
        toast.error('Authentication failed', { description: errorMessage });
        setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 3000);
      });
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-primary-500/50 bg-white/5">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-primary-200">{error}</p>
            <p className="text-center text-xs text-primary-200">
              Redirecting to sign-in page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-primary-500/50 bg-white/5">
        <CardHeader className="text-center text-primary-600">
          <CardTitle>Completing Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
          </div>
          <p className="text-center text-sm text-primary-200">
            Processing your Google authentication...
          </p>
          <p className="text-center text-xs text-primary-200">
            Please wait while we complete the setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
