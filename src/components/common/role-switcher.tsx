'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  Check,
  ChevronDown,
  GraduationCap,
  Loader2,
  Plus,
  Users,
} from 'lucide-react';

import { UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ConfirmationDialog } from './confirmation-dialog';

type SwitchableRole = 'TEACHER' | 'STUDENT';

interface RoleSwitcherProps {
  className?: string;
  showLabel?: boolean;
  showCount?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const ROLE_COPY: Record<
  SwitchableRole,
  {
    label: string;
    icon: typeof Users;
    addLabel: string;
    addHint: string;
    confirmTitle: string;
    confirmBody: string;
    confirmText: string;
  }
> = {
  TEACHER: {
    label: 'Consultant',
    icon: Users,
    addLabel: 'Become a consultant',
    addHint: 'Offer readings and publish gigs',
    confirmTitle: 'Add a consultant profile?',
    confirmBody:
      'Your end-user account stays exactly as it is. We will add a consultant profile to the same login and switch you to it, so you can publish gigs and take bookings. You can switch back at any time from this menu.',
    confirmText: 'Create consultant profile',
  },
  STUDENT: {
    label: 'End User',
    icon: GraduationCap,
    addLabel: 'Become an end user',
    addHint: 'Hire astrologers and book sessions',
    confirmTitle: 'Add an end-user profile?',
    confirmBody:
      'Your consultant account stays exactly as it is. We will add an end-user profile to the same login and switch you to it, so you can hire astrologers and book sessions. You can switch back at any time from this menu.',
    confirmText: 'Create end-user profile',
  },
};

const ROLE_ORDER: SwitchableRole[] = ['STUDENT', 'TEACHER'];

/**
 * Switches between the account types a user holds and, for the one they do not
 * hold yet, offers to add it — the same login can be an end user and a
 * consultant. Adding asks for confirmation first, since it creates a profile.
 */
export function RoleSwitcher({
  className = '',
  showLabel = true,
  showCount = true,
  variant = 'outline',
  size = 'default',
}: RoleSwitcherProps) {
  const {
    userRoles,
    activeRole,
    switchRole,
    becomeConsultant,
    becomeStudent,
    hasTeacherRole,
    hasStudentRole,
    isLoading,
    isRoleSwitching,
  } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<SwitchableRole | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Nothing to switch from until the session has resolved an account type.
  if (!activeRole || userRoles.length === 0) {
    return null;
  }

  const owned = ROLE_ORDER.filter((role) =>
    role === 'TEACHER' ? hasTeacherRole : hasStudentRole
  );
  const addable = ROLE_ORDER.filter((role) => !owned.includes(role));

  const handleRoleSwitch = async (role: SwitchableRole) => {
    if (role === activeRole || isSwitching) return;

    setIsSwitching(true);
    try {
      await switchRole(role);
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleAddRole = async () => {
    if (!roleToAdd || isAdding) return;

    setIsAdding(true);
    try {
      await (roleToAdd === 'TEACHER' ? becomeConsultant() : becomeStudent());
      setRoleToAdd(null);
    } catch (error) {
      // The auth context has already told the user why; keep the dialog open
      // so they can retry or cancel.
      console.error('Failed to add role:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === 'BOTH') {
      return (
        <div className="flex -space-x-1">
          <Users className="h-3 w-3" />
          <GraduationCap className="h-3 w-3" />
        </div>
      );
    }
    return role === 'TEACHER' ? (
      <Users className="h-4 w-4" />
    ) : (
      <GraduationCap className="h-4 w-4" />
    );
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'BOTH') return 'Dual Role';
    return role === 'TEACHER' ? 'Consultant' : 'End User';
  };

  const getRoleColor = (role: UserRole) => {
    if (role === 'BOTH') {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
    return role === 'TEACHER'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 text-green-200';
  };

  const pendingCopy = roleToAdd ? ROLE_COPY[roleToAdd] : null;

  return (
    <>
      {/* Non-modal so closing the menu and opening the confirmation in the
          same tick cannot leave the page with pointer events disabled. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`gap-2 ${className}`}
            disabled={isLoading || isSwitching || isRoleSwitching}
            aria-label="Switch or add account type"
          >
            {isRoleSwitching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getRoleIcon(activeRole)
            )}
            {showLabel && (
              <span className="hidden sm:inline">
                {getRoleLabel(activeRole)}
              </span>
            )}
            {showCount && (
              <Badge
                variant="secondary"
                className={`ml-1 px-1.5 py-0.5 text-xs ${getRoleColor(activeRole)}`}
              >
                {userRoles.length}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            {owned.length > 1 ? 'Switch account type' : 'Your account type'}
          </DropdownMenuLabel>
          {owned.map((role) => {
            const { label, icon: Icon } = ROLE_COPY[role];
            return (
              <DropdownMenuItem
                key={role}
                onSelect={() => handleRoleSwitch(role)}
                disabled={isSwitching}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {activeRole === role && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}

          {addable.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Add an account type
              </DropdownMenuLabel>
              {addable.map((role) => {
                const { addLabel, addHint } = ROLE_COPY[role];
                return (
                  <DropdownMenuItem
                    key={role}
                    onSelect={() => setRoleToAdd(role)}
                    className="items-start gap-2"
                  >
                    <Plus className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="flex flex-col">
                      <span>{addLabel}</span>
                      <span className="text-xs text-muted-foreground">
                        {addHint}
                      </span>
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={!!roleToAdd}
        onClose={() => {
          if (!isAdding) setRoleToAdd(null);
        }}
        onConfirm={handleAddRole}
        title={pendingCopy?.confirmTitle ?? ''}
        description={pendingCopy?.confirmBody ?? ''}
        confirmText={pendingCopy?.confirmText}
        variant="default"
        isLoading={isAdding}
      />
    </>
  );
}
