'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface GoogleOAuthButtonProps {
  disabled?: boolean;
  className?: string;
}

export function GoogleOAuthButton({
  disabled = false,
  className,
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();

      // We don't set isLoading(false) here because the page will redirect to Google
    } catch (error) {
      console.error('Google OAuth initiation failed:', error);
      toast.error('Failed to start Google authentication', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      });
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
