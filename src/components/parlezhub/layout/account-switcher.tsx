'use client';

import { useState } from 'react';
import {
  Briefcase,
  Check,
  ChevronsUpDown,
  GraduationCap,
  LogOut,
  Plus,
} from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { APPS } from '@/lib/apps';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';

type Profile = 'STUDENT' | 'TEACHER';

const LABELS = APPS.parlezhub.roleLabels;

const PROFILE_COPY: Record<
  Profile,
  {
    icon: typeof GraduationCap;
    hint: string;
    addLabel: string;
    confirmTitle: string;
    confirmBody: string;
    confirmText: string;
  }
> = {
  STUDENT: {
    icon: GraduationCap,
    hint: 'Practise with the AI tutor and book consultants',
    addLabel: `Open a ${LABELS.STUDENT} profile`,
    confirmTitle: `Open a ${LABELS.STUDENT} profile?`,
    confirmBody:
      'Your consultant profile stays exactly as it is. We will add a learner profile to the same login and switch you to it, so you can book language consultants. You can switch back any time from this menu.',
    confirmText: 'Open learner profile',
  },
  TEACHER: {
    icon: Briefcase,
    hint: 'Publish language gigs and teach learners',
    addLabel: `Open a ${LABELS.TEACHER} profile`,
    confirmTitle: `Open a ${LABELS.TEACHER} profile?`,
    confirmBody:
      'Your learner profile stays exactly as it is. We will add a consultant profile to the same login and switch you to it, so you can publish language gigs and take bookings. You can switch back any time from this menu.',
    confirmText: 'Open consultant profile',
  },
};

const ORDER: Profile[] = ['STUDENT', 'TEACHER'];

/**
 * Who is signed in and as which profile. One login can hold a learner and a
 * consultant profile: this switches between them, offers to open the one that
 * is missing (after a confirmation, since it creates a profile), and signs out.
 */
export function AccountSwitcher({ className }: { className?: string }) {
  const {
    activeRole,
    hasStudentRole,
    hasTeacherRole,
    switchRole,
    becomeConsultant,
    becomeStudent,
    logout,
    isRoleSwitching,
  } = useAuth();
  const { user } = useUser();
  const [adding, setAdding] = useState<Profile | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const current: Profile = activeRole === 'TEACHER' ? 'TEACHER' : 'STUDENT';
  const owned = ORDER.filter((role) => (role === 'TEACHER' ? hasTeacherRole : hasStudentRole));
  const missing = ORDER.filter((role) => !owned.includes(role));

  const name =
    user?.full_name?.trim() ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.email ||
    'Your account';
  const initial = name.charAt(0).toUpperCase();

  const switchTo = async (role: Profile) => {
    if (role === current || isRoleSwitching) return;
    try {
      await switchRole(role);
    } catch (error) {
      console.error('Failed to switch profile:', error);
    }
  };

  const confirmAdd = async () => {
    if (!adding || isAdding) return;
    setIsAdding(true);
    try {
      await (adding === 'TEACHER' ? becomeConsultant() : becomeStudent());
      setAdding(null);
    } catch (error) {
      // The auth context has already shown why; keep the dialog for a retry.
      console.error('Failed to open profile:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const pending = adding ? PROFILE_COPY[adding] : null;

  return (
    <>
      {/* Non-modal, so closing the menu and opening the confirmation in the
          same tick cannot leave the page with pointer events disabled. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          disabled={isRoleSwitching}
          aria-label="Account and profile"
          className={cn(
            'flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-60',
            className
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.profile_picture || undefined} alt="" className="object-cover" />
            <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-foreground">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">{LABELS[current]}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-64 rounded-xl p-1.5">
          <DropdownMenuLabel className="px-2 text-xs font-semibold text-muted-foreground">
            {owned.length > 1 ? 'Switch profile' : 'Your profile'}
          </DropdownMenuLabel>
          {owned.map((role) => {
            const Icon = PROFILE_COPY[role].icon;
            return (
              <DropdownMenuItem
                key={role}
                onSelect={() => void switchTo(role)}
                className="gap-3 rounded-lg px-2 py-2"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="flex-1 font-semibold">{LABELS[role]}</span>
                {role === current && <Check className="h-4 w-4 text-primary" aria-label="Current profile" />}
              </DropdownMenuItem>
            );
          })}

          {missing.map((role) => (
            <DropdownMenuItem
              key={role}
              onSelect={() => setAdding(role)}
              className="items-start gap-3 rounded-lg px-2 py-2"
            >
              <Plus className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <span className="flex flex-col">
                <span className="font-semibold">{PROFILE_COPY[role].addLabel}</span>
                <span className="text-xs text-muted-foreground">{PROFILE_COPY[role].hint}</span>
              </span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void logout()} className="gap-3 rounded-lg px-2 py-2">
            <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={Boolean(adding)}
        onClose={() => {
          if (!isAdding) setAdding(null);
        }}
        onConfirm={confirmAdd}
        title={pending?.confirmTitle ?? ''}
        description={pending?.confirmBody ?? ''}
        confirmText={pending?.confirmText}
        variant="default"
        isLoading={isAdding}
      />
    </>
  );
}
