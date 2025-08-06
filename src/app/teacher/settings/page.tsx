'use client';

import { useUser } from '@/contexts/user-context';

import {
  AccountStatus,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
  SettingsHeader,
} from '@/components/settings';

export default function TeacherSettingsPage() {
  const { user } = useUser();

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
          <ProfileSettings userRole="teacher" />

          {/* Security Settings */}
          <SecuritySettings
            securityData={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            onSecurityChange={() => {}}
            onSave={async () => {}}
            isLoading={false}
            showPassword={false}
            onTogglePasswordVisibility={() => {}}
          />
        </div>

        {/* Right Column - Account Status & Notifications */}
        <div className="space-y-8">
          {/* Account Status */}
          <AccountStatus
            memberSince={user?.created_at || ''}
            accountType={(user?.role as 'TEACHER' | 'STUDENT') || 'TEACHER'}
            verificationStatus="verified"
          />

          {/* Notification Settings */}
          <NotificationSettings
            notificationData={{
              emailNotifications: true,
              pushNotifications: true,
              sessionReminders: false,
              weeklyReports: false,
              marketingEmails: false,
              teacherMessages: false,
              studentMessages: false,
            }}
            onNotificationChange={() => {}}
            onSave={async () => {}}
            isLoading={false}
            userRole="teacher"
          />
        </div>
      </div>
    </div>
  );
}
