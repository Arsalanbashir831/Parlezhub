'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { authApi } from '@/services/auth';
import { useAuth } from '@/contexts/auth-context';
import { landingPathFor } from '@/lib/guard-rules';

/**
 * /onboarding/choose-role
 *
 * Shown to new Google/One-Tap users after their first sign-in,
 * when their Django user record has `role = null`.
 *
 * Calls Django POST /api/auth/set-role/ to finalize the profile.
 */
export default function ChooseRolePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [selected, setSelected] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile, userRoles, activeRole } = useAuth();

  // Middleware can only bounce an already-roled user if the role cookies had
  // arrived. The session fetch may resolve them after this page mounts, so
  // leave as soon as they are known instead of waiting for a manual refresh.
  useEffect(() => {
    if (userRoles.length === 0) return;
    router.replace(landingPathFor({ isAuthenticated: true, userRoles, activeRole }, searchParams?.get('redirect')));
  }, [userRoles, activeRole, router, searchParams]);

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

  const handleSelectRole = async (role: 'STUDENT' | 'TEACHER') => {
    setSelected(role);
    setIsLoading(true);

    try {
      // Django records the role, then the server rewrites its own role cookies.
      await authApi.setRole(role);
      const snapshot = await authApi.setActiveRole(role);
      await refreshUserProfile();

      toast.success(`Welcome! You're set up as a ${role.toLowerCase()}.`);

      router.push(landingPathFor(snapshot, searchParams.get('redirect')));
    } catch (err) {
      console.error('Role selection failed:', err);
      toast.error('Failed to set your role. Please try again.');
      setSelected(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Roles are still being confirmed, or have just arrived and are carrying the
  // user away: hold the screen rather than flashing the picker.
  if (isCheckingRole || userRoles.length > 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4">
        <div
          role="status"
          aria-label="Checking your role"
          className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          Preparing your account…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Shakti Wheel!
          </h1>
          <p className="text-muted-foreground">
            How would you like to use Shakti Wheel?
          </p>
        </div>

        <div className="grid gap-4">
          {/* Student */}
          <button
            onClick={() => handleSelectRole('STUDENT')}
            disabled={isLoading}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all
              ${selected === 'STUDENT'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
              disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="text-4xl">🎓</span>
            <div>
              <p className="text-lg font-semibold">I want to Learn</p>
              <p className="text-sm text-muted-foreground">
                Book sessions with expert teachers and language consultants.
              </p>
            </div>
          </button>

          {/* Teacher */}
          <button
            onClick={() => handleSelectRole('TEACHER')}
            disabled={isLoading}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all
              ${selected === 'TEACHER'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
              disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="text-4xl">🏫</span>
            <div>
              <p className="text-lg font-semibold">I want to Teach</p>
              <p className="text-sm text-muted-foreground">
                Create your profile, offer sessions, and earn as a consultant.
              </p>
            </div>
          </button>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Setting up your account…</p>
        )}
      </div>
    </div>
  );
}
