'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/auth-context';

/** Starts Google sign-in for the current app; each app renders its own button. */
export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  const start = async () => {
    setIsLoading(true);
    try {
      const redirectTo = searchParams.get('redirect') || undefined;
      await signInWithGoogle(redirectTo);
      // Loading stays on: the page is about to navigate to Google.
    } catch (error) {
      console.error('Google OAuth initiation failed:', error);
      toast.error('Failed to start Google authentication', {
        description:
          error instanceof Error ? error.message : 'Please try again later',
      });
      setIsLoading(false);
    }
  };

  return { start, isLoading };
}
