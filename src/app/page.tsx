'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { HOME_PATH } from '@/lib/guard-rules';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const { isAuthenticated, userRoles, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (isAuthenticated && userRoles.length > 0) {
      router.replace(HOME_PATH);
    } else if (isAuthenticated) {
      // Live session, no role yet: the picker owns the next step.
      router.replace(ROUTES.ONBOARDING.CHOOSE_ROLE);
    } else {
      // Redirect unauthenticated users to the language agent page
      router.replace(ROUTES.AGENT.LANGUAGE);
    }
  }, [isAuthenticated, userRoles, isLoading, router]);

  // Show loading while determining redirect
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div role="status" aria-label="Loading, redirecting to your workspace" className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return null; // This will never render as we always redirect
}
