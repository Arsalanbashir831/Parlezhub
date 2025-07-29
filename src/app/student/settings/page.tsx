'use client';

import { useAuth } from '@/contexts/auth-context';

import {
  AccountStatus,
  NotificationSettings,
  ProfileSettings,
  SecuritySettings,
  SettingsHeader,
} from '@/components/settings';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    profileData,
    notifications,
    security,
    isLoading,
    showPassword,
    isEditMode,
    setProfileData,
    setNotifications,
    setSecurity,
    handleSaveProfile,
    handleSaveNotifications,
    handleSaveSecurity,
    togglePasswordVisibility,
    toggleEditMode,
  } = useSettings('student', user); // Pass role as "student"

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
          <ProfileSettings
            profileData={profileData}
            onProfileChange={setProfileData}
            onSave={handleSaveProfile}
            isLoading={isLoading}
            isEditMode={isEditMode}
            onToggleEditMode={toggleEditMode}
            userAvatar={user?.avatar}
            userName={profileData.username.trim()}
            userRole="student"
          />

          {/* Security Settings */}
          <SecuritySettings
            securityData={security}
            onSecurityChange={setSecurity}
            onSave={handleSaveSecurity}
            isLoading={isLoading}
            showPassword={showPassword}
            onTogglePasswordVisibility={togglePasswordVisibility}
          />
        </div>

        {/* Right Column - Account Status & Notifications */}
        <div className="space-y-8">
          {/* Account Status */}
          <AccountStatus
            memberSince="March 2023"
            accountType="Student"
            verificationStatus="verified"
          />

          {/* Notification Settings */}
          <NotificationSettings
            notificationData={notifications}
            onNotificationChange={setNotifications}
            onSave={handleSaveNotifications}
            isLoading={isLoading}
            userRole="student"
          />
        </div>
      </div>
    </div>
  );
}
