'use client';

import { useChooseRole } from '@/features/auth';

/**
 * /astrology/onboarding — the first role for an account that has none (new
 * Google / One Tap users, or a sign-up Django has not assigned yet).
 */
export default function ChooseRolePage() {
  const { isChecking, selected, isSaving, chooseRole, roleLabels, appName } =
    useChooseRole();

  if (isChecking) {
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
            Welcome to {appName}!
          </h1>
          <p className="text-muted-foreground">
            Choose how you’d like to join {appName}.
          </p>
        </div>

        <div className="grid gap-4">
          {/* Astrologer */}
          <button
            onClick={() => chooseRole('TEACHER')}
            disabled={isSaving}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all
              ${selected === 'TEACHER'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
              disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="text-4xl">🏫</span>
            <div>
              <p className="text-lg font-semibold">Join as {roleLabels.TEACHER}</p>
              <p className="text-sm text-muted-foreground">
                Create your profile and offer astrology consultations.
              </p>
            </div>
          </button>

          {/* End User */}
          <button
            onClick={() => chooseRole('STUDENT')}
            disabled={isSaving}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-left transition-all
              ${selected === 'STUDENT'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
              disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="text-4xl">🎓</span>
            <div>
              <p className="text-lg font-semibold">Join as {roleLabels.STUDENT}</p>
              <p className="text-sm text-muted-foreground">
                Explore astrology tools and connect with astrologers.
              </p>
            </div>
          </button>
        </div>

        {isSaving && (
          <p className="text-sm text-muted-foreground">Setting up your account…</p>
        )}
      </div>
    </div>
  );
}
