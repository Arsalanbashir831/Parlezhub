'use client';

import { memo } from 'react';
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
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="font-serif text-2xl font-bold text-primary-500">
              Security
            </CardTitle>
          </div>
          <CardDescription className="ml-13 font-medium text-primary-100/60">
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8 pt-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
              >
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
                  className="h-12 rounded-xl border-primary-500/10 bg-white/5 pr-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg p-0 text-primary-500/40 hover:bg-white/5 hover:text-primary-500"
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.newPassword}
                    onChange={(e) =>
                      handleFieldChange('newPassword', e.target.value)
                    }
                    placeholder="Enter new password"
                    className="h-12 rounded-xl border-primary-500/10 bg-white/5 pr-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg p-0 text-primary-500/40 hover:bg-white/5 hover:text-primary-500"
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
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      handleFieldChange('confirmPassword', e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="h-12 rounded-xl border-primary-500/10 bg-white/5 pr-12 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg p-0 text-primary-500/40 hover:bg-white/5 hover:text-primary-500"
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
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={onSave}
              disabled={isLoading}
              className="h-12 rounded-2xl bg-primary-500 px-12 text-[10px] font-bold uppercase tracking-widest text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
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
