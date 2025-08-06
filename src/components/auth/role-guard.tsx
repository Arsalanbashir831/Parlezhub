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
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard if role is not allowed
      if (fallbackPath) {
        router.push(fallbackPath);
      } else {
        if (userRole === 'STUDENT') {
          router.push(ROUTES.STUDENT.DASHBOARD);
        } else if (userRole === 'TEACHER') {
          router.push(ROUTES.TEACHER.DASHBOARD);
        } else {
          router.push(ROUTES.AUTH.LOGIN);
        }
      }
      return;
    }
  }, [
    isAuthenticated,
    userRole,
    isLoading,
    allowedRoles,
    fallbackPath,
    router,
  ]);

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or role not allowed
  if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
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
