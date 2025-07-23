"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/hooks/useSettings";
import {
	SettingsHeader,
	ProfileSettings,
	SecuritySettings,
	NotificationSettings,
	AccountStatus,
} from "@/components/settings";

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
	} = useSettings("student", user); // Pass role as "student"

	return (
		<div className="space-y-8">
			{/* Header */}
			<SettingsHeader
				title="Settings"
				description="Manage your account settings and preferences"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Profile Settings */}
				<div className="lg:col-span-2 space-y-8">
					{/* Profile Information */}
					<ProfileSettings
						profileData={profileData}
						onProfileChange={setProfileData}
						onSave={handleSaveProfile}
						isLoading={isLoading}
						isEditMode={isEditMode}
						onToggleEditMode={toggleEditMode}
						userAvatar={user?.avatar}
						userName={`${profileData.firstName} ${profileData.lastName}`.trim()}
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
