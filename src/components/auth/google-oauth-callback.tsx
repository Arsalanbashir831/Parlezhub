'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/services/auth';
import { toast } from 'sonner';

import { setCookie } from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GoogleOAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsAuthenticated, setUserRole } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the tokens from URL hash (Supabase OAuth returns them in the hash)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          throw new Error('Missing OAuth tokens in callback');
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
          throw new Error('OAuth mode not found. Please try again.');
        }

        // Prepare callback request
        const callbackData = {
          access_token: accessToken,
          refresh_token: refreshToken,
          ...(oauthMode === 'signup' && oauthRole ? { role: oauthRole } : {}),
        };

        // Call the backend callback endpoint
        const response = await authApi.googleCallback(callbackData);

        if (!response.success) {
          throw new Error(response.message || 'OAuth callback failed');
        }

        // Store tokens and user info
        setCookie('access_token', response.access_token);
        setCookie('refresh_token', response.refresh_token);
        setCookie('user_role', response.user.role);

        // Update auth context
        setIsAuthenticated(true);
        setUserRole(response.user.role);

        // Clean up sessionStorage
        sessionStorage.removeItem('oauth_mode');
        sessionStorage.removeItem('oauth_role');

        // Show success message
        const isNewUser = response.flow_type === 'signup' || response.created;
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
          if (response.user.role === 'STUDENT') {
            router.push(ROUTES.STUDENT.DASHBOARD);
          } else if (response.user.role === 'TEACHER') {
            router.push(ROUTES.TEACHER.DASHBOARD);
          }
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
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [router, searchParams, setIsAuthenticated, setUserRole]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-gray-600">{error}</p>
            <p className="text-center text-xs text-gray-500">
              Redirecting to sign-in page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Completing Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-sm text-gray-600">
            Processing your Google authentication...
          </p>
          <p className="text-center text-xs text-gray-500">
            Please wait while we complete the setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
