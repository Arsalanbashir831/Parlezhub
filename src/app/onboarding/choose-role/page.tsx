'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { authApi } from '@/services/auth';
import { createClient } from '@/utils/supabase/client';
import { setActiveRole, setUserRoles } from '@/lib/cookie-utils';
import { ROUTES } from '@/constants/routes';

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
  const [selected, setSelected] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSelectRole = async (role: 'STUDENT' | 'TEACHER') => {
    setSelected(role);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Please sign in again.');
        router.push(ROUTES.AUTH.LOGIN);
        return;
      }

      await authApi.setRole(role);

      // Update local role cookies so middleware/context picks them up
      const roles: ('STUDENT' | 'TEACHER')[] = [role];
      setUserRoles(roles);
      setActiveRole(role);

      toast.success(`Welcome! You're set up as a ${role.toLowerCase()}.`);

      router.push(
        role === 'TEACHER' ? ROUTES.TEACHER.DASHBOARD : ROUTES.STUDENT.DASHBOARD
      );
    } catch (err) {
      console.error('Role selection failed:', err);
      toast.error('Failed to set your role. Please try again.');
      setSelected(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to ParlezHub!
          </h1>
          <p className="text-muted-foreground">
            How would you like to use ParlezHub?
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
