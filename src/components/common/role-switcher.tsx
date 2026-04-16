'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Check, ChevronDown, GraduationCap, Users } from 'lucide-react';

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
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function RoleSwitcher({
  className = '',
  showLabel = true,
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

  const getRoleIcon = (role: 'TEACHER' | 'STUDENT') => {
    return role === 'TEACHER' ? (
      <Users className="h-4 w-4" />
    ) : (
      <GraduationCap className="h-4 w-4" />
    );
  };

  const getRoleLabel = (role: 'TEACHER' | 'STUDENT') => {
    return role === 'TEACHER' ? 'Consultant' : 'Student';
  };

  const getRoleColor = (role: 'TEACHER' | 'STUDENT') => {
    return role === 'TEACHER'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          disabled={isLoading || isSwitching}
        >
          {activeRole && getRoleIcon(activeRole)}
          {showLabel && activeRole && (
            <span className="hidden sm:inline">{getRoleLabel(activeRole)}</span>
          )}
          <Badge
            variant="secondary"
            className={`ml-1 px-1.5 py-0.5 text-xs ${activeRole ? getRoleColor(activeRole) : ''}`}
          >
            {userRoles.length}
          </Badge>
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
            <span>Student</span>
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
