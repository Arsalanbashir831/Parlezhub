'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('STUDENT' | 'TEACHER')[];
  fallbackPath?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath,
}: RoleGuardProps) {
  const { isAuthenticated, userRoles, activeRole, isLoading, canAccessRole } =
    useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(ROUTES.AUTH.LOGIN);
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

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check if user has any allowed role for rendering
  const hasAllowedRole = allowedRoles.some((role) => canAccessRole(role));

  // Don't render children if not authenticated or doesn't have allowed roles
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
    <RoleGuard allowedRoles={['STUDENT']} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}

export function TeacherGuard({
  children,
  fallbackPath,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['TEACHER']} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}
