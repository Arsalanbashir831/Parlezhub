'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { toast } from 'sonner';

import { userApi } from '@/services/user';

import {
  AccountStatus,
  ProfileSettings,
  SecuritySettings,
  SettingsHeader,
} from '@/components/settings';

const DEFAULT_SECURITY = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function SettingsPage() {
  const { user } = useUser();
  const { logout } = useAuth();
  const [securityData, setSecurityData] = useState(DEFAULT_SECURITY);
  const [showPassword, setShowPassword] = useState(false);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  const handleSecuritySave = async () => {
    const { currentPassword, newPassword, confirmPassword } = securityData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsSecurityLoading(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully. Please log in again.');
      logout();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      const message =
        axiosError?.response?.data?.error ??
        (err instanceof Error ? err.message : 'Failed to update password. Please try again.');
      toast.error(message);
    } finally {
      setIsSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <SettingsHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="space-y-8 lg:col-span-2">
          {/* Profile Information */}
          <ProfileSettings userRole="student" />

          {/* Security Settings */}
          <SecuritySettings
            securityData={securityData}
            onSecurityChange={setSecurityData}
            onSave={handleSecuritySave}
            isLoading={isSecurityLoading}
            showPassword={showPassword}
            onTogglePasswordVisibility={() => setShowPassword((v) => !v)}
          />
        </div>

        {/* Right Column - Account Status & Notifications */}
        <div className="space-y-8">
          {/* Account Status */}
          <AccountStatus
            memberSince={user?.created_at || ''}
            accountType={(user?.role as 'TEACHER' | 'STUDENT') || 'STUDENT'}
            verificationStatus="verified"
          />

          {/* Notification Settings */}
          {/* <NotificationSettings
            notificationData={{
              emailNotifications: true,
              pushNotifications: true,
              sessionReminders: false,
              weeklyReports: false,
              marketingEmails: false,
              consultantMessages: false,
              studentMessages: false,
            }}
            onNotificationChange={() => {}}
            onSave={async () => {}}
            isLoading={false}
            userRole="student"
          /> */}
        </div>
      </div>
    </div>
  );
}
