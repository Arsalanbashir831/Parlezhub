'use client';

import React, { memo } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SecurityData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettingsProps {
  securityData: SecurityData;
  onSecurityChange: (data: SecurityData) => void;
  onSave: () => void;
  isLoading: boolean;
  showPassword: boolean;
  onTogglePasswordVisibility: () => void;
}

const SecuritySettings = memo(
  ({
    securityData,
    onSecurityChange,
    onSave,
    isLoading,
    showPassword,
    onTogglePasswordVisibility,
  }: SecuritySettingsProps) => {
    const handleFieldChange = (
      field: keyof SecurityData,
      value: string | boolean
    ) => {
      onSecurityChange({
        ...securityData,
        [field]: value,
      });
    };

    return (
      <Card className="dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <CardTitle className="dark:text-gray-100">Security</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="dark:text-gray-200">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={securityData.currentPassword}
                  onChange={(e) =>
                    handleFieldChange('currentPassword', e.target.value)
                  }
                  placeholder="Enter current password"
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={onTogglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="dark:text-gray-200">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) =>
                    handleFieldChange('newPassword', e.target.value)
                  }
                  placeholder="Enter new password"
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-200">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    handleFieldChange('confirmPassword', e.target.value)
                  }
                  placeholder="Confirm new password"
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSave}
              disabled={isLoading}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {isLoading ? 'Saving...' : 'Update Security'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

SecuritySettings.displayName = 'SecuritySettings';

export default SecuritySettings;
export type { SecurityData };
