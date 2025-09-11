'use client';

import { useState } from 'react';
import { authApi } from '@/services/auth';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface GoogleOAuthButtonProps {
  mode: 'login' | 'signup';
  role?: 'TEACHER' | 'STUDENT'; // Required for signup
  disabled?: boolean;
  className?: string;
}

export function GoogleOAuthButton({
  mode,
  role,
  disabled = false,
  className,
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (mode === 'signup' && !role) {
      toast.error('Please select a role before continuing with Google signup');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Initiate Google OAuth
      const initiateResponse = await authApi.googleInitiate();

      if (!initiateResponse.success) {
        throw new Error(
          initiateResponse.message || 'Failed to initiate Google OAuth'
        );
      }

      // Store the mode and role in sessionStorage for the callback
      sessionStorage.setItem('oauth_mode', mode);
      if (role) {
        sessionStorage.setItem('oauth_role', role);
      }

      // Step 2: Redirect to Google OAuth URL with our callback URL
      const callbackUrl = `${window.location.origin}/auth/callback/google`;
      const oauthUrl = new URL(initiateResponse.oauth_url);
      oauthUrl.searchParams.set('redirect_to', callbackUrl);

      window.location.href = oauthUrl.toString();
    } catch (error) {
      console.error('Google OAuth initiation failed:', error);
      toast.error('Failed to start Google authentication', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={disabled || isLoading}
      className={className}
    >
      <svg
        className="mr-2 h-4 w-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
        />
      </svg>
      {isLoading ? 'Connecting...' : `Continue with Google`}
    </Button>
  );
}
