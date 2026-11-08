'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/auth-context';
import { landingPathFor } from '@/lib/guard-rules';
import { authApi } from '@/services/auth';

import { useCurrentApp } from './use-current-app';

export type ChoosableRole = 'STUDENT' | 'TEACHER';

/**
 * Onboarding: the first role for an account that has none (new Google /
 * One Tap users, or a sign-up Django has not assigned yet). Records the role
 * in Django, makes it active, and lands the user on this app's home. The role
 * belongs to the account, so it holds in every app.
 */
export function useChooseRole() {
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [selected, setSelected] = useState<ChoosableRole | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile, userRoles, activeRole } = useAuth();
  const { app, definition } = useCurrentApp();

  // Middleware can only bounce an already-roled user if the role cookies had
  // arrived. The session fetch may resolve them after this page mounts, so
  // leave as soon as they are known instead of waiting for a manual refresh.
  useEffect(() => {
    if (userRoles.length === 0) return;
    router.replace(
      landingPathFor(
        { isAuthenticated: true, userRoles, activeRole },
        searchParams?.get('redirect'),
        app
      )
    );
  }, [userRoles, activeRole, router, searchParams, app]);

  // Ask the server one more time before showing the picker: roles can lag the
  // profile row right after sign-in, and a stale empty answer would otherwise
  // offer the choice to somebody who already made it.
  useEffect(() => {
    let cancelled = false;

    refreshUserProfile()
      .catch((err: unknown) => console.error('Role check failed:', err))
      .finally(() => {
        if (!cancelled) setIsCheckingRole(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshUserProfile]);

  const chooseRole = async (role: ChoosableRole) => {
    setSelected(role);
    setIsSaving(true);

    try {
      // Django records the role, then the server rewrites its own role cookies.
      await authApi.setRole(role);
      const snapshot = await authApi.setActiveRole(role);
      await refreshUserProfile();

      toast.success(`Welcome! You're set up as ${withArticle(definition.roleLabels[role])}.`);

      router.push(landingPathFor(snapshot, searchParams.get('redirect'), app));
    } catch (err) {
      console.error('Role selection failed:', err);
      toast.error('Failed to set your role. Please try again.');
      setSelected(null);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    /** Roles are still being confirmed, or have arrived and are carrying the
     *  user away: hold the screen rather than flashing the picker. */
    isChecking: isCheckingRole || userRoles.length > 0,
    selected,
    isSaving,
    chooseRole,
    roleLabels: definition.roleLabels,
    appName: definition.name,
  };
}

const withArticle = (label: string) =>
  `${/^[aeiou]/i.test(label) ? 'an' : 'a'} ${label}`;
