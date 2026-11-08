'use client';

import { GraduationCap, Loader2, MessagesSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useChooseRole, type ChoosableRole } from '@/features/auth';
import { ParlezhubAuthShell } from '@/components/parlezhub/auth/auth-shell';

const ROLE_CARDS: {
  role: ChoosableRole;
  icon: typeof GraduationCap;
  description: string;
}[] = [
  {
    role: 'STUDENT',
    icon: GraduationCap,
    description: 'Practise speaking with an AI tutor and book sessions with language consultants.',
  },
  {
    role: 'TEACHER',
    icon: MessagesSquare,
    description: 'Offer conversation and language sessions, and help learners improve faster.',
  },
];

/** /parlezhub/onboarding — the first role for an account that has none. */
export default function ParlezhubOnboardingPage() {
  const { isChecking, selected, isSaving, chooseRole, roleLabels, appName } =
    useChooseRole();

  if (isChecking) {
    return (
      <ParlezhubAuthShell title="One moment…">
        <div role="status" className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          Preparing your account…
        </div>
      </ParlezhubAuthShell>
    );
  }

  return (
    <ParlezhubAuthShell
      title={`How will you use ${appName}?`}
      subtitle="Pick one to start. You can add the other later from your account menu."
    >
      <div className="grid gap-3">
        {ROLE_CARDS.map(({ role, icon: Icon, description }) => {
          const isSelected = selected === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => chooseRole(role)}
              disabled={isSaving}
              aria-pressed={isSelected}
              className={cn(
                'group flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/60',
                isSaving && !isSelected && 'opacity-50'
              )}
            >
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                )}
              >
                {isSaving && isSelected ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
              <span>
                <span className="block text-base font-bold text-foreground">
                  I&apos;m a {roleLabels[role]}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {isSaving && (
        <p role="status" className="mt-4 text-center text-sm text-muted-foreground">
          Setting up your account…
        </p>
      )}
    </ParlezhubAuthShell>
  );
}
