'use client';

import { LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { APPS } from '@/lib/apps';
import RoleGuard from '@/components/auth/role-guard';
import { ParlezhubLogo } from '@/components/parlezhub/brand/logo';

/**
 * The signed-in Parlezhub app. Any role may enter (both share one workspace,
 * like the observatory); the guard sends a signed-out visitor to Parlezhub's
 * sign-in and a roleless account to its onboarding.
 */
export default function ParlezhubAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['STUDENT', 'TEACHER', 'BOTH']}>
      <div className="flex min-h-screen flex-col">
        <ParlezhubHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

function ParlezhubHeader() {
  const { activeRole, logout } = useAuth();
  const { user } = useUser();
  const roleLabel =
    activeRole === 'TEACHER'
      ? APPS.parlezhub.roleLabels.TEACHER
      : APPS.parlezhub.roleLabels.STUDENT;
  const initial = (user?.first_name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <ParlezhubLogo href={APPS.parlezhub.home} />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground sm:inline">
            {roleLabel}
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {initial}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Sign out"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
