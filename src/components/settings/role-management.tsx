'use client';

import { useAuth } from '@/contexts/auth-context';
import {
  CheckCircle,
  Crown,
  GraduationCap,
  Users,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RoleSwitcher } from '@/components/common/role-switcher';

export default function RoleManagement() {
  const {
    userRoles,
    activeRole,
    hasTeacherRole,
    hasStudentRole,
    switchRole,
    refreshUserProfile,
    isLoading,
  } = useAuth();

  const handleRefreshRoles = async () => {
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error('Failed to refresh roles:', error);
    }
  };

  const getRoleIcon = (role: 'TEACHER' | 'STUDENT') => {
    return role === 'TEACHER' ? (
      <Users className="h-5 w-5" />
    ) : (
      <GraduationCap className="h-5 w-5" />
    );
  };

  const getRoleColor = (role: 'TEACHER' | 'STUDENT') => {
    return role === 'TEACHER'
      ? 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800'
      : 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
  };

  const getRoleDescription = (role: 'TEACHER' | 'STUDENT') => {
    return role === 'TEACHER'
      ? 'Create and manage services, conduct lessons, track student progress'
      : 'Book lessons, practice with AI tutors, track learning progress';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <CardTitle>Role Management</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshRoles}
            disabled={isLoading}
          >
            Refresh Roles
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Active Role */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Current Active Role
          </h4>
          {activeRole ? (
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${getRoleColor(activeRole)}`}
            >
              <div className="flex items-center gap-3">
                {getRoleIcon(activeRole)}
                <div>
                  <div className="font-medium">
                    {activeRole === 'TEACHER' ? 'Consultant' : 'Student'}
                  </div>
                  <div className="text-sm opacity-80">
                    {getRoleDescription(activeRole)}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/50">
                Active
              </Badge>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>No active role selected</span>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Available Roles */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Available Roles ({userRoles.length})
          </h4>
          <div className="space-y-3">
            {/* Student Role */}
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                hasStudentRole
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap
                  className={`h-5 w-5 ${
                    hasStudentRole
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400'
                  }`}
                />
                <div>
                  <div
                    className={`font-medium ${
                      hasStudentRole
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-500'
                    }`}
                  >
                    Student
                  </div>
                  <div
                    className={`text-sm ${
                      hasStudentRole
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                    }`}
                  >
                    Learn languages with AI tutors and human consultants
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasStudentRole ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Consultant Role */}
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                hasTeacherRole
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users
                  className={`h-5 w-5 ${
                    hasTeacherRole
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400'
                  }`}
                />
                <div>
                  <div
                    className={`font-medium ${
                      hasTeacherRole
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-500'
                    }`}
                  >
                    Consultant
                  </div>
                  <div
                    className={`text-sm ${
                      hasTeacherRole
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400'
                    }`}
                  >
                    Teach students and manage language learning services
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasTeacherRole ? (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role Switching */}
        {userRoles.length > 1 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Switch Role
              </h4>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <p className="flex-1 text-sm text-muted-foreground">
                  You have multiple roles available. Switch between them to
                  access different features and dashboards.
                </p>
                <RoleSwitcher variant="outline" />
              </div>
            </div>
          </>
        )}

        {/* No Multiple Roles */}
        {userRoles.length <= 1 && (
          <>
            <Separator />
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                You currently have access to {userRoles.length} role
                {userRoles.length !== 1 ? 's' : ''}.
                {userRoles.length === 1 &&
                  ' Contact support to request additional roles.'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
