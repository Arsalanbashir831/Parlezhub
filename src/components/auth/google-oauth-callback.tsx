'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/services/auth';
import { toast } from 'sonner';

import { setCookie } from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GoogleOAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsAuthenticated, setUserRole } = useAuth();

  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-execution (React Strict Mode, hot reload, etc.)
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        // Get the tokens from URL hash (Supabase OAuth returns them in the hash)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        // Clear the URL hash ASAP to remove tokens from browser history
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        if (!accessToken || !refreshToken) {
          // Delay error to avoid flash on first render before hash is parsed
          setTimeout(() => {
            setError('Invalid OAuth callback. Please sign in again.');
            setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 3000);
          }, 300);
          return;
        }

        // Get stored OAuth mode and role from sessionStorage
        const oauthMode = sessionStorage.getItem('oauth_mode') as
          | 'login'
          | 'signup'
          | null;
        const oauthRole = sessionStorage.getItem('oauth_role') as
          | 'TEACHER'
          | 'STUDENT'
          | null;

        if (!oauthMode) {
          // If oauth_mode is missing (e.g., page refresh), redirect to sign-in
          toast.error('OAuth session expired', {
            description:
              'Please try signing in again. Do not refresh the page during sign-in.',
          });

          setError(
            'OAuth session expired. This usually happens when you refresh the page during sign-in. Please try signing in again.'
          );

          setTimeout(() => {
            router.push(ROUTES.AUTH.LOGIN);
          }, 3000);
          return;
        }

        try {
          // Call the backend callback endpoint
          const response = await authApi.syncUser(accessToken, oauthRole || undefined);

          // Set user roles based on the response
          const roles: ('STUDENT' | 'TEACHER')[] = [];
          if (response.user!.role === 'BOTH') {
            roles.push('STUDENT', 'TEACHER');
          } else if (response.user!.role) {
            roles.push(response.user!.role as 'STUDENT' | 'TEACHER');
          }

          if (roles.length > 0) {
            setCookie('user_roles', JSON.stringify(roles));
            setCookie('active_role', roles[0]);

            // Update auth context
            setIsAuthenticated(true);
            setUserRole(roles[0]);
          } else {
            // No role assigned yet — this will trigger onboarding
            setIsAuthenticated(true);
          }

          // Clean up sessionStorage
          sessionStorage.removeItem('oauth_mode');
          sessionStorage.removeItem('oauth_role');

          // Show success message
          const isNewUser = false; // SyncUser doesn't explicitly return created status
          toast.success(
            isNewUser ? 'Account created successfully!' : 'Welcome back!',
            {
              description: isNewUser
                ? 'Your Google account has been linked successfully.'
                : 'You have been logged in successfully.',
            }
          );

          // Redirect based on role
          const redirectTo = searchParams.get('redirect');
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            if (response.user!.role === 'STUDENT') {
              router.push(ROUTES.STUDENT.DASHBOARD);
            } else if (response.user!.role === 'TEACHER') {
              router.push(ROUTES.TEACHER.DASHBOARD);
            } else {
              // No role - go to onboarding
              router.push(ROUTES.ONBOARDING.CHOOSE_ROLE);
            }
          }
        } catch (apiError: unknown) {
          // No longer handling role selection required (400) here
          throw apiError;
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        const errorMessage = getErrorMessage(error, 'google-oauth');
        setError(errorMessage);
        toast.error('Authentication failed', {
          description: errorMessage,
        });

        // Clean up sessionStorage on error
        sessionStorage.removeItem('oauth_mode');
        sessionStorage.removeItem('oauth_role');

        // Redirect to sign-in page after a delay
        setTimeout(() => {
          router.push(ROUTES.AUTH.LOGIN);
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams, setIsAuthenticated, setUserRole]);


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
