"use client";

import { useState, useCallback } from "react";

interface ProfileData {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	bio: string;
	city: string;
	country: string;
	// Teacher-specific fields (optional for students)
	teachingExperience?: string;
	hourlyRate?: number;
	education?: string;
	languages?: string[];
	specialties?: string[];
}

interface NotificationData {
	emailNotifications: boolean;
	pushNotifications: boolean;
	sessionReminders: boolean;
	weeklyReports: boolean;
	teacherMessages?: boolean; // For students
	studentMessages?: boolean; // For teachers
	marketingEmails: boolean;
}

interface SecurityData {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export const useSettings = (
	userRole: "student" | "teacher" = "student",
	user?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		phoneNumber?: string;
		city?: string;
		country?: string;
		// Teacher-specific initial data
		teachingExperience?: string;
		hourlyRate?: number;
		education?: string;
		languages?: string[];
		specialties?: string[];
	} | null
) => {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

	// Profile Settings
	const [profileData, setProfileData] = useState<ProfileData>({
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		email: user?.email || "",
		phoneNumber: user?.phoneNumber || "",
		bio: "",
		city: user?.city || "",
		country: user?.country || "",
		// Teacher-specific fields
		...(userRole === "teacher" && {
			teachingExperience: user?.teachingExperience || "",
			hourlyRate: user?.hourlyRate || 0,
			education: user?.education || "",
			languages: user?.languages || [],
			specialties: user?.specialties || [],
		}),
	});

	// Role-based notification settings
	const getInitialNotifications = (): NotificationData => {
		const baseNotifications = {
			emailNotifications: true,
			pushNotifications: true,
			sessionReminders: true,
			weeklyReports: true,
			marketingEmails: false,
		};

		if (userRole === "teacher") {
			return {
				...baseNotifications,
				studentMessages: true,
			};
		} else {
			return {
				...baseNotifications,
				teacherMessages: true,
			};
		}
	};

	// Notification Settings
	const [notifications, setNotifications] = useState<NotificationData>(
		getInitialNotifications()
	);

	// Security Settings
	const [security, setSecurity] = useState<SecurityData>({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleSaveProfile = useCallback(async () => {
		setIsLoading(true);
		try {
			// API call to update profile
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Profile updated:", profileData);
		} catch (error) {
			console.error("Failed to update profile:", error);
		} finally {
			setIsLoading(false);
		}
	}, [profileData]);

	const handleSaveNotifications = useCallback(async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Notifications updated:", notifications);
		} catch (error) {
			console.error("Failed to update notifications:", error);
		} finally {
			setIsLoading(false);
		}
	}, [notifications]);

	const handleSaveSecurity = useCallback(async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Security updated:", security);
		} catch (error) {
			console.error("Failed to update security:", error);
		} finally {
			setIsLoading(false);
		}
	}, [security]);

	const togglePasswordVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	const toggleEditMode = useCallback(() => {
		setIsEditMode((prev) => !prev);
	}, []);

	return {
		// State
		profileData,
		notifications,
		security,
		isLoading,
		showPassword,
		isEditMode,

		// Actions
		setProfileData,
		setNotifications,
		setSecurity,
		handleSaveProfile,
		handleSaveNotifications,
		handleSaveSecurity,
		togglePasswordVisibility,
		toggleEditMode,
	};
};

export type { ProfileData, NotificationData, SecurityData };
