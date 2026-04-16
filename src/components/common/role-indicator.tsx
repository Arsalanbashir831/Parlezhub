'use client';

import { useAuth } from '@/contexts/auth-context';
import { GraduationCap, Users } from 'lucide-react';

import { RoleSwitcher } from './role-switcher';

interface RoleIndicatorProps {
  className?: string;
  showSwitcher?: boolean;
  compact?: boolean;
}

export function RoleIndicator({
  className = '',
  showSwitcher = true,
  compact = false,
}: RoleIndicatorProps) {
  const { userRoles, activeRole, hasTeacherRole, hasStudentRole } = useAuth();

  if (!activeRole) {
    return null;
  }

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
      ? 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
      : 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${getRoleColor(activeRole)}`}
        >
          {getRoleIcon(activeRole)}
          <span>{getRoleLabel(activeRole)}</span>
        </div>
        {showSwitcher && userRoles.length > 1 && (
          <RoleSwitcher variant="ghost" size="sm" showLabel={false} />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${getRoleColor(activeRole)}`}
        >
          {getRoleIcon(activeRole)}
          <span className="font-medium">{getRoleLabel(activeRole)} Mode</span>
        </div>
        {hasTeacherRole && hasStudentRole && (
          <div className="text-xs text-muted-foreground">
            {userRoles.length} role{userRoles.length > 1 ? 's' : ''} available
          </div>
        )}
      </div>
      {showSwitcher && userRoles.length > 1 && <RoleSwitcher />}
    </div>
  );
}
