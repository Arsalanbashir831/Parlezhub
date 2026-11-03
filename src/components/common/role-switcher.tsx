'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  Check,
  ChevronDown,
  GraduationCap,
  Loader2,
  Users,
} from 'lucide-react';

import { UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoleSwitcherProps {
  className?: string;
  showLabel?: boolean;
  showCount?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

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
    hasTeacherRole,
    hasStudentRole,
    isLoading,
    isRoleSwitching,
  } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

  // Don't show if user only has one role
  if (userRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = async (role: 'TEACHER' | 'STUDENT') => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          disabled={isLoading || isSwitching || isRoleSwitching}
        >
          {isRoleSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            activeRole && getRoleIcon(activeRole)
          )}
          {showLabel && activeRole && (
            <span className="hidden sm:inline">{getRoleLabel(activeRole)}</span>
          )}
          {showCount && (
            <Badge
              variant="secondary"
              className={`ml-1 px-1.5 py-0.5 text-xs ${activeRole ? getRoleColor(activeRole) : ''}`}
            >
              {userRoles.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Switch Role
        </div>
        {hasStudentRole && (
          <DropdownMenuItem
            onClick={() => handleRoleSwitch('STUDENT')}
            disabled={isSwitching}
            className="gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            <span>End User</span>
            {activeRole === 'STUDENT' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        )}
        {hasTeacherRole && (
          <DropdownMenuItem
            onClick={() => handleRoleSwitch('TEACHER')}
            disabled={isSwitching}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Consultant</span>
            {activeRole === 'TEACHER' && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
