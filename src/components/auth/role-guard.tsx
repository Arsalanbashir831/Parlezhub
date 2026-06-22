'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('STUDENT' | 'TEACHER' | 'BOTH')[];
  fallbackPath?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath,
}: RoleGuardProps) {
  const { isAuthenticated, userRoles, activeRole, isLoading, canAccessRole } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const params = searchParams.toString();
      const currentPath = pathname + (params ? `?${params}` : '');
      router.push(`${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check if user has any of the allowed roles (multi-role support)
    const hasAllowedRole = allowedRoles.some((role) => canAccessRole(role));

    if (!hasAllowedRole) {
      // Redirect to appropriate dashboard if user doesn't have any allowed roles
      if (fallbackPath) {
        router.push(fallbackPath);
      } else {
        // Redirect based on user's active role or first available role
        if (activeRole === 'STUDENT') {
          router.push(ROUTES.STUDENT.DASHBOARD);
        } else if (activeRole === 'TEACHER') {
          router.push(ROUTES.TEACHER.DASHBOARD);
        } else if (userRoles.length > 0) {
          // Use first available role if no active role set
          const firstRole = userRoles[0];
          if (firstRole === 'STUDENT') {
            router.push(ROUTES.STUDENT.DASHBOARD);
          } else {
            router.push(ROUTES.TEACHER.DASHBOARD);
          }
        } else {
          router.push(ROUTES.AUTH.LOGIN);
        }
      }
      return;
    }
  }, [
    isAuthenticated,
    userRoles,
    activeRole,
    isLoading,
    allowedRoles,
    fallbackPath,
    router,
    canAccessRole,
  ]);

  const hasAllowedRole = allowedRoles.some((role) => canAccessRole(role));

  // Keep spinner visible while: explicitly loading, or authenticated but roles haven't
  // resolved yet (e.g. background profile fetch still in-flight after cookie miss).
  if (isLoading || (isAuthenticated && !hasAllowedRole && userRoles.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAllowedRole) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function StudentGuard({
  children,
  fallbackPath,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['STUDENT', "BOTH"]} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}

export function ConsultantGuard({
  children,
  fallbackPath,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['TEACHER', "BOTH"]} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}
