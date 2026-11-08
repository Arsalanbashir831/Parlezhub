'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_APP, authRoutes } from '@/lib/apps';
import { useAuth } from '@/contexts/auth-context';

/** "/" belongs to the default app (Shakti Wheel); the proxy usually redirects
 *  before this renders, and this covers a client-side visit. */
const routes = authRoutes(DEFAULT_APP);

export default function HomePage() {
  const { isAuthenticated, userRoles, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (isAuthenticated && userRoles.length > 0) {
      router.replace(routes.home);
    } else if (isAuthenticated) {
      // Live session, no role yet: the picker owns the next step.
      router.replace(routes.onboarding);
    } else {
      router.replace(routes.login);
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
