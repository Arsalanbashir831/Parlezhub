'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/auth-context';
import { evaluateRoleGuard, type GuardInput } from '@/lib/guard-rules';
import type { UserRole } from '@/types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/** A session whose roles never arrive must not strand the user on a spinner. */
const ROLE_RECHECK_AFTER_MS = 4000;
const ROLE_RECHECK_ATTEMPTS = 2;

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath,
}: RoleGuardProps) {
  const {
    isAuthenticated,
    userRoles,
    activeRole,
    isLoading,
    canAccessRole,
    rolesUnknown,
    refreshUserProfile,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rechecks, setRechecks] = useState(0);
  const rechecking = useRef(false);

  const query = searchParams?.toString() ?? '';

  const guard: GuardInput = {
    isLoading,
    isAuthenticated,
    userRoles,
    activeRole,
    allowedRoles,
    fallbackPath,
    canAccessRole,
    rolesUnknown,
    pathname,
    search: query ? `?${query}` : '',
  };

  const baseDecision = evaluateRoleGuard(guard);
  const gaveUpWaiting =
    baseDecision.pending && rechecks >= ROLE_RECHECK_ATTEMPTS;

  // Out of patience: hand off to the role picker, which re-reads the server
  // answer and bounces anybody who does have a role straight to their dashboard.
  const decision = gaveUpWaiting
    ? {
        pending: false,
        redirect: ROUTES.ONBOARDING.CHOOSE_ROLE,
        render: false,
      }
    : baseDecision;

  const redirect = decision.redirect;

  useEffect(() => {
    if (redirect) router.push(redirect);
  }, [redirect, router]);

  useEffect(() => {
    if (!baseDecision.pending || isLoading || rechecking.current) return;
    if (rechecks >= ROLE_RECHECK_ATTEMPTS) return;

    const id = setTimeout(() => {
      rechecking.current = true;
      void refreshUserProfile()
        .catch(() => undefined)
        .finally(() => {
          rechecking.current = false;
          setRechecks((count) => count + 1);
        });
    }, ROLE_RECHECK_AFTER_MS);

    return () => clearTimeout(id);
  }, [baseDecision.pending, isLoading, rechecks, refreshUserProfile]);

  // Session arrives from /api/auth/session, so the first paint is identical on
  // server and client — no hydration mismatch, no cookie peeking. While the
  // guard is deciding or redirecting it shows the loader rather than nothing,
  // so an in-flight navigation never renders an empty black screen.
  if (!decision.render) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
        <div
          role="status"
          aria-live="polite"
          className="h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          {decision.pending
            ? 'Checking your access…'
            : 'Taking you where you belong…'}
        </p>
      </div>
    );
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
