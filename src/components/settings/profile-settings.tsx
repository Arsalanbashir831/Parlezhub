"use client";

import React, { memo } from "react";
import { User, Edit2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ProfileData {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	bio: string;
	city: string;
	country: string;
}

interface ProfileSettingsProps {
	profileData: ProfileData;
	onProfileChange: (data: ProfileData) => void;
	onSave: () => void;
	isLoading: boolean;
	isEditMode: boolean;
	onToggleEditMode: () => void;
	userAvatar?: string;
	userName?: string;
}

const ProfileSettings = memo(
	({
		profileData,
		onProfileChange,
		onSave,
		isLoading,
		isEditMode,
		onToggleEditMode,
		userAvatar,
		userName,
	}: ProfileSettingsProps) => {
		const handleFieldChange = (field: keyof ProfileData, value: string) => {
			onProfileChange({
				...profileData,
				[field]: value,
			});
		};

		const handleSave = () => {
			onSave();
			onToggleEditMode(); // Exit edit mode after saving
		};

		return (
			<Card className="dark:bg-gray-800 dark:border-gray-700">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<User className="h-5 w-5 text-primary-600" />
							<CardTitle className="dark:text-gray-100">
								Profile Information
							</CardTitle>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={onToggleEditMode}
							className="flex items-center gap-2">
							<Edit2 className="h-4 w-4" />
							{isEditMode ? "Cancel" : "Edit"}
						</Button>
					</div>
					<CardDescription className="dark:text-gray-400">
						{isEditMode
							? "Update your personal information and profile details"
							: "View your profile information"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Avatar Upload */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<Avatar className="h-20 w-20">
							<AvatarImage src={userAvatar || "/placeholder.svg"} />
							<AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 text-2xl">
								{userName?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>

						<div className="space-y-2">
							<Button variant="outline" size="sm">
								Change Avatar
							</Button>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								JPG, PNG or GIF. Max size 2MB.
							</p>
						</div>
					</div>

					<Separator className="dark:bg-gray-700" />

					{/* Form Fields */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName" className="dark:text-gray-200">
								First Name
							</Label>

							<Input
								id="firstName"
								value={profileData.firstName}
								onChange={(e) => handleFieldChange("firstName", e.target.value)}
								disabled={!isEditMode}
								placeholder="Enter your first name"
								className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName" className="dark:text-gray-200">
								Last Name
							</Label>

							<Input
								id="lastName"
								value={profileData.lastName}
								onChange={(e) => handleFieldChange("lastName", e.target.value)}
								disabled={!isEditMode}
								placeholder="Enter your last name"
								className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="dark:text-gray-200">
								Email Address
							</Label>
							<Input
								id="email"
								value={profileData.email}
								onChange={(e) => handleFieldChange("email", e.target.value)}
								disabled={true}
								placeholder="Enter your email address"
								className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Email cannot be changed
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phoneNumber" className="dark:text-gray-200">
								Phone Number
							</Label>

							<Input
								id="phoneNumber"
								type="tel"
								value={profileData.phoneNumber}
								onChange={(e) =>
									handleFieldChange("phoneNumber", e.target.value)
								}
								disabled={!isEditMode}
								placeholder="Enter your phone number"
								className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bio" className="dark:text-gray-200">
							Bio
						</Label>
						<Textarea
							id="bio"
							value={profileData.bio}
							onChange={(e) => handleFieldChange("bio", e.target.value)}
							placeholder="Tell us about yourself..."
							rows={3}
							disabled={!isEditMode}
							className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="city" className="dark:text-gray-200">
								City
							</Label>
							<Input
								id="city"
								value={profileData.city}
								onChange={(e) => handleFieldChange("city", e.target.value)}
								disabled={!isEditMode}
								placeholder="Your city"
								className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="country" className="dark:text-gray-200">
								Country
							</Label>
							<Input
								id="country"
								value={profileData.country}
								onChange={(e) => handleFieldChange("country", e.target.value)}
								disabled={!isEditMode}
								placeholder="Your country"
								className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>
					</div>

					{isEditMode && (
						<div className="flex justify-end gap-2">
							<Button
								onClick={onToggleEditMode}
								variant="outline"
								disabled={isLoading}>
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								disabled={isLoading}
								className="bg-primary-500 hover:bg-primary-600">
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}
);

ProfileSettings.displayName = "ProfileSettings";

export default ProfileSettings;
export type { ProfileData };
