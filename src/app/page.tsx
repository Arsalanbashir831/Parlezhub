'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (isAuthenticated && userRole) {
      // Redirect authenticated users to their role-specific dashboard
      if (userRole === 'STUDENT') {
        router.push(ROUTES.STUDENT.DASHBOARD);
      } else if (userRole === 'TEACHER') {
        router.push(ROUTES.TEACHER.DASHBOARD);
      }
    } else {
      // Redirect unauthenticated users to the language agent page
      router.push(ROUTES.AGENT.LANGUAGE);
    }
  }, [isAuthenticated, userRole, isLoading, router]);

  // Show loading while determining redirect
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null; // This will never render as we always redirect
}
