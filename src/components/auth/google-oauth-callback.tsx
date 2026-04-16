'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/services/auth';
import { toast } from 'sonner';

import { setCookie } from '@/lib/cookie-utils';
import { getErrorMessage } from '@/lib/error-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      requires_role_selection?: boolean;
      error?: string;
      message?: string;
    };
  };
}

export function GoogleOAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | ''>(
    ''
  );
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [storedTokens, setStoredTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);
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
          // If tokens are missing, redirect to sign-in without processing
          setError('Invalid OAuth callback. Please sign in again.');

          // Clear the URL hash to remove any partial tokens from the URL
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          setTimeout(() => {
            router.push(ROUTES.AUTH.LOGIN);
          }, 3000);
          return; // Exit early without processing
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
          // Don't process tokens or set cookies - this prevents the issue where
          // tokens get saved even when the OAuth flow is incomplete
          setError(
            'OAuth session expired. This usually happens when you refresh the page during sign-in. Please try signing in again.'
          );

          // Show toast notification
          toast.error('OAuth session expired', {
            description:
              'Please try signing in again. Do not refresh the page during sign-in.',
          });

          // Clear the URL hash to remove tokens from the URL
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          // Clear any existing tokens and redirect after delay
          setTimeout(() => {
            router.push(ROUTES.AUTH.LOGIN);
          }, 3000);
          return; // Exit early without processing tokens
        }

        // Prepare callback request
        const callbackData = {
          access_token: accessToken,
          refresh_token: refreshToken,
          ...(oauthMode === 'signup' && oauthRole ? { role: oauthRole } : {}),
        };

        try {
          // Call the backend callback endpoint
          const response = await authApi.googleCallback(callbackData);

          // Only set cookies if we have a successful response with user role
          setCookie('access_token', response.access_token!);
          setCookie('refresh_token', response.refresh_token!);
          setCookie('user_role', response.user!.role!);

          // Update auth context
          setIsAuthenticated(true);
          setUserRole(response.user!.role!);

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
            if (response.user!.role === 'STUDENT') {
              router.push(ROUTES.STUDENT.DASHBOARD);
            } else if (response.user!.role === 'TEACHER') {
              router.push(ROUTES.TEACHER.DASHBOARD);
            }
          }
        } catch (apiError: unknown) {
          // Check if this is a 400 error with role selection required
          if (
            apiError &&
            typeof apiError === 'object' &&
            'response' in apiError
          ) {
            const axiosError = apiError as AxiosError;
            if (
              axiosError.response?.status === 400 &&
              axiosError.response?.data
            ) {
              const errorData = axiosError.response.data;

              if (errorData.requires_role_selection) {
                // Store tokens for later use - DON'T set cookies yet!
                setStoredTokens({ accessToken, refreshToken });

                // Clean up sessionStorage
                sessionStorage.removeItem('oauth_mode');
                sessionStorage.removeItem('oauth_role');

                // Show role selection UI
                setShowRoleSelection(true);
                return;
              }
            }
          }

          // For other errors, throw to be caught by outer catch
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

  const handleRoleSubmit = async () => {
    if (!selectedRole || !storedTokens) {
      toast.error('Please select a role to continue');
      return;
    }

    setIsCompletingProfile(true);

    try {
      // Call the SAME callback API again, but now WITH the role
      const callbackData = {
        access_token: storedTokens.accessToken,
        refresh_token: storedTokens.refreshToken,
        role: selectedRole, // This time we include the role
      };

      const response = await authApi.googleCallback(callbackData);

      if (response.success) {
        // NOW we can store tokens and user info after successful role completion
        setCookie('access_token', response.access_token!);
        setCookie('refresh_token', response.refresh_token!);
        setCookie('user_role', response.user!.role!);

        // Update auth context
        setIsAuthenticated(true);
        setUserRole(response.user!.role!);

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
          window.location.href = redirectTo;
        } else {
          if (response.user!.role === 'STUDENT') {
            window.location.href = ROUTES.STUDENT.DASHBOARD;
          } else if (response.user!.role === 'TEACHER') {
            window.location.href = ROUTES.TEACHER.DASHBOARD;
          }
        }
      } else {
        throw new Error(
          response.error || response.message || 'OAuth callback failed'
        );
      }
    } catch (error) {
      console.error('Role completion error:', error);
      const errorMessage = getErrorMessage(error, 'oauth-callback');
      setError(errorMessage);
      toast.error('Authentication failed', {
        description: errorMessage,
      });
    } finally {
      setIsCompletingProfile(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-primary-500/50 bg-white/5">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Complete Your Profile
            </CardTitle>
            <p className="text-sm text-primary-600">
              Please select your role to continue using ParlezHub
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">I am a:</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => {
                  setSelectedRole(value as 'STUDENT' | 'TEACHER');
                }}
                className="space-y-3"
              >
                <Label
                  htmlFor="student"
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border border-primary-500/50 p-4 hover:bg-primary-500/5"
                >
                  <RadioGroupItem value="STUDENT" id="student" />
                  <div className="flex-1">
                    <div className="font-medium">Student</div>
                    <p className="text-sm text-primary-600">
                      I want to learn languages and book sessions with consultants
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="consultant"
                  className="flex cursor-pointer items-center space-x-3 rounded-lg border border-primary-500/50 p-4 hover:bg-primary-500/5"
                >
                  <RadioGroupItem value="TEACHER" id="consultant" />
                  <div className="flex-1">
                    <div className="font-medium">Consultant</div>
                    <p className="text-sm text-primary-600">
                      I want to teach languages and offer sessions to students
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            <Button
              onClick={handleRoleSubmit}
              className="w-full"
              disabled={!selectedRole || isCompletingProfile}
            >
              {isCompletingProfile
                ? 'Completing Profile...'
                : 'Complete Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
